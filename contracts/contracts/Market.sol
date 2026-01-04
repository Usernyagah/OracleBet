// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Market
 * @notice Binary Yes/No prediction market with constant product AMM
 */
contract Market is ERC20, ReentrancyGuard, Ownable {
    /// @notice Market question/prediction
    string public question;

    /// @notice Unix timestamp when market can be resolved
    uint256 public resolutionTime;

    /// @notice Oracle address that can resolve the market (placeholder)
    address public oracle;

    /// @notice Chainlink price feed address (placeholder for objective resolutions)
    /// @dev Example: BTC/USD price feed for price-based markets
    address public chainlinkPriceFeed;

    /// @notice UMA Optimistic Oracle address (placeholder for subjective resolutions)
    /// @dev For markets requiring dispute resolution
    address public umaOracle;

    /// @notice Market ID from factory
    uint256 public marketId;

    /// @notice Yes shares token
    ERC20 public yesToken;

    /// @notice No shares token
    ERC20 public noToken;

    /// @notice Market resolution status
    enum ResolutionStatus {
        Unresolved,
        Yes,
        No
    }

    /// @notice Current resolution status
    ResolutionStatus public resolutionStatus;

    /// @notice AMM pool reserves
    uint256 public yesReserve;
    uint256 public noReserve;

    /// @notice Total liquidity provided
    uint256 public totalLiquidity;

    /// @notice Mapping from user to liquidity provided
    mapping(address => uint256) public liquidityProvided;

    /// @notice Fee in basis points (100 = 1%)
    uint256 public constant FEE_BPS = 30; // 0.3%
    uint256 public constant BASIS_POINTS = 10000;

    /// @notice Events
    event LiquidityAdded(
        address indexed provider,
        uint256 yesAmount,
        uint256 noAmount,
        uint256 liquidityTokens
    );

    event LiquidityRemoved(
        address indexed provider,
        uint256 yesAmount,
        uint256 noAmount,
        uint256 liquidityTokens
    );

    event SharesBought(
        address indexed buyer,
        bool isYes,
        uint256 ethAmount,
        uint256 sharesAmount
    );

    event SharesSold(
        address indexed seller,
        bool isYes,
        uint256 sharesAmount,
        uint256 ethAmount
    );

    event MarketResolved(ResolutionStatus indexed outcome);

    event SharesRedeemed(
        address indexed redeemer,
        bool isYes,
        uint256 sharesAmount,
        uint256 ethAmount
    );

    /**
     * @notice Constructor
     * @param _question Market question
     * @param _resolutionTime Unix timestamp for resolution
     * @param _creator Market creator
     * @param _oracle Oracle address (placeholder)
     * @param _marketId Market ID from factory
     */
    constructor(
        string memory _question,
        uint256 _resolutionTime,
        address _creator,
        address _oracle,
        uint256 _marketId
    ) ERC20("Market LP", "MLP") Ownable(_creator) {
        question = _question;
        resolutionTime = _resolutionTime;
        oracle = _oracle;
        marketId = _marketId;
        resolutionStatus = ResolutionStatus.Unresolved;
        // Placeholders - set via setOracleAddresses if needed
        chainlinkPriceFeed = address(0);
        umaOracle = address(0);

        // Deploy Yes and No token contracts
        yesToken = new ShareToken("Yes Share", "YES");
        noToken = new ShareToken("No Share", "NO");
    }

    /**
     * @notice Add liquidity to the AMM pool
     * @param yesAmount Amount of Yes shares to add
     * @param noAmount Amount of No shares to add
     */
    function addLiquidity(
        uint256 yesAmount,
        uint256 noAmount
    ) external payable nonReentrant {
        require(resolutionStatus == ResolutionStatus.Unresolved, "Market resolved");
        require(yesAmount > 0 && noAmount > 0, "Invalid amounts");
        require(msg.value > 0, "Must send ETH");

        // Mint Yes and No tokens for the provider
        ShareToken(address(yesToken)).mint(msg.sender, yesAmount);
        ShareToken(address(noToken)).mint(msg.sender, noAmount);

        // Update reserves
        if (totalLiquidity == 0) {
            // First liquidity provider - set initial reserves
            yesReserve = yesAmount;
            noReserve = noAmount;
            totalLiquidity = msg.value;
            liquidityProvided[msg.sender] = msg.value;
            _mint(msg.sender, msg.value);
        } else {
            // Calculate liquidity tokens to mint
            uint256 liquidityTokens = (msg.value * totalLiquidity) /
                (yesReserve + noReserve);
            require(liquidityTokens > 0, "Insufficient liquidity");

            yesReserve += yesAmount;
            noReserve += noAmount;
            totalLiquidity += msg.value;
            liquidityProvided[msg.sender] += msg.value;
            _mint(msg.sender, liquidityTokens);
        }

        emit LiquidityAdded(msg.sender, yesAmount, noAmount, balanceOf(msg.sender));
    }

    /**
     * @notice Remove liquidity from the AMM pool
     * @param liquidityTokens Amount of LP tokens to burn
     */
    function removeLiquidity(
        uint256 liquidityTokens
    ) external nonReentrant {
        require(resolutionStatus == ResolutionStatus.Unresolved, "Market resolved");
        require(liquidityTokens > 0, "Invalid amount");
        require(balanceOf(msg.sender) >= liquidityTokens, "Insufficient LP tokens");

        uint256 share = (liquidityTokens * BASIS_POINTS) / totalSupply();
        uint256 ethAmount = (totalLiquidity * share) / BASIS_POINTS;
        uint256 yesAmount = (yesReserve * share) / BASIS_POINTS;
        uint256 noAmount = (noReserve * share) / BASIS_POINTS;

        // Update reserves
        yesReserve -= yesAmount;
        noReserve -= noAmount;
        totalLiquidity -= ethAmount;
        liquidityProvided[msg.sender] -= ethAmount;

        // Burn LP tokens
        _burn(msg.sender, liquidityTokens);

        // Burn Yes and No tokens
        ShareToken(address(yesToken)).burn(msg.sender, yesAmount);
        ShareToken(address(noToken)).burn(msg.sender, noAmount);

        // Transfer ETH
        (bool success, ) = payable(msg.sender).call{value: ethAmount}("");
        require(success, "ETH transfer failed");

        emit LiquidityRemoved(msg.sender, yesAmount, noAmount, liquidityTokens);
    }

    /**
     * @notice Buy Yes shares
     * @return sharesAmount Amount of Yes shares received
     */
    function buyYes() external payable nonReentrant returns (uint256 sharesAmount) {
        require(resolutionStatus == ResolutionStatus.Unresolved, "Market resolved");
        require(msg.value > 0, "Must send ETH");

        sharesAmount = getYesSharesOutput(msg.value);
        require(sharesAmount > 0, "Insufficient output");

        // Apply fee
        uint256 fee = (msg.value * FEE_BPS) / BASIS_POINTS;
        uint256 valueAfterFee = msg.value - fee;

        // Update reserves using constant product formula
        yesReserve -= sharesAmount;
        noReserve += valueAfterFee;

        // Mint Yes tokens
        ShareToken(address(yesToken)).mint(msg.sender, sharesAmount);

        emit SharesBought(msg.sender, true, msg.value, sharesAmount);
    }

    /**
     * @notice Buy No shares
     * @return sharesAmount Amount of No shares received
     */
    function buyNo() external payable nonReentrant returns (uint256 sharesAmount) {
        require(resolutionStatus == ResolutionStatus.Unresolved, "Market resolved");
        require(msg.value > 0, "Must send ETH");

        sharesAmount = getNoSharesOutput(msg.value);
        require(sharesAmount > 0, "Insufficient output");

        // Apply fee
        uint256 fee = (msg.value * FEE_BPS) / BASIS_POINTS;
        uint256 valueAfterFee = msg.value - fee;

        // Update reserves using constant product formula
        noReserve -= sharesAmount;
        yesReserve += valueAfterFee;

        // Mint No tokens
        ShareToken(address(noToken)).mint(msg.sender, sharesAmount);

        emit SharesBought(msg.sender, false, msg.value, sharesAmount);
    }

    /**
     * @notice Sell Yes shares
     * @param sharesAmount Amount of Yes shares to sell
     * @return ethAmount Amount of ETH received
     */
    function sellYes(
        uint256 sharesAmount
    ) external nonReentrant returns (uint256 ethAmount) {
        require(resolutionStatus == ResolutionStatus.Unresolved, "Market resolved");
        require(sharesAmount > 0, "Invalid amount");
        require(yesToken.balanceOf(msg.sender) >= sharesAmount, "Insufficient shares");

        ethAmount = getYesEthOutput(sharesAmount);
        require(ethAmount > 0, "Insufficient output");

        // Apply fee
        uint256 fee = (ethAmount * FEE_BPS) / BASIS_POINTS;
        uint256 ethAfterFee = ethAmount - fee;

        // Update reserves
        yesReserve += sharesAmount;
        noReserve -= ethAfterFee;

        // Burn Yes tokens
        ShareToken(address(yesToken)).burn(msg.sender, sharesAmount);

        // Transfer ETH
        (bool success, ) = payable(msg.sender).call{value: ethAfterFee}("");
        require(success, "ETH transfer failed");

        emit SharesSold(msg.sender, true, sharesAmount, ethAfterFee);
    }

    /**
     * @notice Sell No shares
     * @param sharesAmount Amount of No shares to sell
     * @return ethAmount Amount of ETH received
     */
    function sellNo(
        uint256 sharesAmount
    ) external nonReentrant returns (uint256 ethAmount) {
        require(resolutionStatus == ResolutionStatus.Unresolved, "Market resolved");
        require(sharesAmount > 0, "Invalid amount");
        require(noToken.balanceOf(msg.sender) >= sharesAmount, "Insufficient shares");

        ethAmount = getNoEthOutput(sharesAmount);
        require(ethAmount > 0, "Insufficient output");

        // Apply fee
        uint256 fee = (ethAmount * FEE_BPS) / BASIS_POINTS;
        uint256 ethAfterFee = ethAmount - fee;

        // Update reserves
        noReserve += sharesAmount;
        yesReserve -= ethAfterFee;

        // Burn No tokens
        ShareToken(address(noToken)).burn(msg.sender, sharesAmount);

        // Transfer ETH
        (bool success, ) = payable(msg.sender).call{value: ethAfterFee}("");
        require(success, "ETH transfer failed");

        emit SharesSold(msg.sender, false, sharesAmount, ethAfterFee);
    }

    /**
     * @notice Set oracle addresses (admin only)
     * @param _chainlinkPriceFeed Chainlink price feed address (optional, use address(0) to skip)
     * @param _umaOracle UMA optimistic oracle address (optional, use address(0) to skip)
     */
    function setOracleAddresses(
        address _chainlinkPriceFeed,
        address _umaOracle
    ) external onlyOwner {
        chainlinkPriceFeed = _chainlinkPriceFeed;
        umaOracle = _umaOracle;
    }

    /**
     * @notice Resolve market (admin only)
     * @param outcome True for Yes, false for No
     * @dev For production: integrate Chainlink/UMA oracle calls here
     *      Chainlink: Use price feed to check if condition met
     *      UMA: Query optimistic oracle for resolution
     */
    function resolve(bool outcome) external onlyOwner {
        require(
            block.timestamp >= resolutionTime,
            "Resolution time not reached"
        );
        require(
            resolutionStatus == ResolutionStatus.Unresolved,
            "Already resolved"
        );

        resolutionStatus = outcome
            ? ResolutionStatus.Yes
            : ResolutionStatus.No;

        emit MarketResolved(resolutionStatus);
    }

    /**
     * @notice Resolve via Chainlink price feed (admin only, placeholder)
     * @param threshold Price threshold to compare against
     * @param shouldBeAbove True if price should be above threshold for Yes
     * @dev Placeholder - in production, would call Chainlink AggregatorV3Interface
     *      Example: if (shouldBeAbove && latestPrice > threshold) resolve(true)
     */
    function resolveWithChainlink(
        uint256 threshold,
        bool shouldBeAbove
    ) external onlyOwner {
        require(chainlinkPriceFeed != address(0), "Chainlink not set");
        require(
            block.timestamp >= resolutionTime,
            "Resolution time not reached"
        );
        require(
            resolutionStatus == ResolutionStatus.Unresolved,
            "Already resolved"
        );

        // Placeholder: In production, query Chainlink price feed
        // AggregatorV3Interface priceFeed = AggregatorV3Interface(chainlinkPriceFeed);
        // (, int256 price, , , ) = priceFeed.latestRoundData();
        // uint256 currentPrice = uint256(price) * 10**priceFeed.decimals();
        // bool outcome = shouldBeAbove ? currentPrice >= threshold : currentPrice <= threshold;

        // For now, require manual resolution
        revert("Use resolve() - Chainlink integration pending");
    }

    /**
     * @notice Resolve via UMA optimistic oracle (admin only, placeholder)
     * @dev Placeholder - in production, would query UMA OptimisticOracleV3
     *      Example: bytes32 identifier = keccak256(question);
     *               bytes memory ancillaryData = "";
     *               uint256 timestamp = block.timestamp;
     *               bool outcome = umaOracle.hasPrice(identifier, timestamp, ancillaryData);
     */
    function resolveWithUMA() external onlyOwner {
        require(umaOracle != address(0), "UMA not set");
        require(
            block.timestamp >= resolutionTime,
            "Resolution time not reached"
        );
        require(
            resolutionStatus == ResolutionStatus.Unresolved,
            "Already resolved"
        );

        // Placeholder: In production, query UMA oracle
        // OptimisticOracleV3Interface uma = OptimisticOracleV3Interface(umaOracle);
        // bytes32 identifier = keccak256(abi.encodePacked(question));
        // bool outcome = uma.hasPrice(identifier, resolutionTime, "");

        // For now, require manual resolution
        revert("Use resolve() - UMA integration pending");
    }

    /**
     * @notice Redeem winning shares after resolution
     * @param isYes True to redeem Yes shares, false for No shares
     * @param sharesAmount Amount of shares to redeem
     * @return ethAmount Amount of ETH received
     */
    function redeem(
        bool isYes,
        uint256 sharesAmount
    ) external nonReentrant returns (uint256 ethAmount) {
        require(
            resolutionStatus != ResolutionStatus.Unresolved,
            "Market not resolved"
        );
        require(sharesAmount > 0, "Invalid amount");

        bool isWinning = (isYes && resolutionStatus == ResolutionStatus.Yes) ||
            (!isYes && resolutionStatus == ResolutionStatus.No);
        require(isWinning, "Cannot redeem losing shares");

        ERC20 token = isYes ? yesToken : noToken;
        require(token.balanceOf(msg.sender) >= sharesAmount, "Insufficient shares");

        // Calculate redemption value based on reserve ratio
        uint256 reserve = isYes ? yesReserve : noReserve;
        ethAmount = (sharesAmount * reserve) /
            (isYes ? ShareToken(address(yesToken)).totalSupply() : ShareToken(address(noToken)).totalSupply());

        require(ethAmount > 0, "Insufficient redemption value");
        require(address(this).balance >= ethAmount, "Insufficient contract balance");

        // Burn shares
        ShareToken(address(token)).burn(msg.sender, sharesAmount);

        // Update reserve
        if (isYes) {
            yesReserve -= sharesAmount;
        } else {
            noReserve -= sharesAmount;
        }

        // Transfer ETH
        (bool success, ) = payable(msg.sender).call{value: ethAmount}("");
        require(success, "ETH transfer failed");

        emit SharesRedeemed(msg.sender, isYes, sharesAmount, ethAmount);
    }

    /**
     * @notice Calculate Yes shares output for ETH input (constant product AMM)
     * @param ethAmount Amount of ETH
     * @return sharesAmount Amount of Yes shares
     */
    function getYesSharesOutput(
        uint256 ethAmount
    ) public view returns (uint256 sharesAmount) {
        if (yesReserve == 0 || noReserve == 0) return 0;

        uint256 fee = (ethAmount * FEE_BPS) / BASIS_POINTS;
        uint256 ethAfterFee = ethAmount - fee;

        // Constant product: (yesReserve - sharesAmount) * (noReserve + ethAfterFee) = yesReserve * noReserve
        // sharesAmount = (yesReserve * ethAfterFee) / (noReserve + ethAfterFee)
        sharesAmount = (yesReserve * ethAfterFee) / (noReserve + ethAfterFee);
    }

    /**
     * @notice Calculate No shares output for ETH input
     * @param ethAmount Amount of ETH
     * @return sharesAmount Amount of No shares
     */
    function getNoSharesOutput(
        uint256 ethAmount
    ) public view returns (uint256 sharesAmount) {
        if (yesReserve == 0 || noReserve == 0) return 0;

        uint256 fee = (ethAmount * FEE_BPS) / BASIS_POINTS;
        uint256 ethAfterFee = ethAmount - fee;

        // Constant product: (noReserve - sharesAmount) * (yesReserve + ethAfterFee) = yesReserve * noReserve
        sharesAmount = (noReserve * ethAfterFee) / (yesReserve + ethAfterFee);
    }

    /**
     * @notice Calculate ETH output for Yes shares input
     * @param sharesAmount Amount of Yes shares
     * @return ethAmount Amount of ETH
     */
    function getYesEthOutput(
        uint256 sharesAmount
    ) public view returns (uint256 ethAmount) {
        if (yesReserve == 0 || noReserve == 0) return 0;

        // Constant product: (yesReserve + sharesAmount) * (noReserve - ethAmount) = yesReserve * noReserve
        // ethAmount = (noReserve * sharesAmount) / (yesReserve + sharesAmount)
        ethAmount = (noReserve * sharesAmount) / (yesReserve + sharesAmount);
    }

    /**
     * @notice Calculate ETH output for No shares input
     * @param sharesAmount Amount of No shares
     * @return ethAmount Amount of ETH
     */
    function getNoEthOutput(
        uint256 sharesAmount
    ) public view returns (uint256 ethAmount) {
        if (yesReserve == 0 || noReserve == 0) return 0;

        // Constant product: (noReserve + sharesAmount) * (yesReserve - ethAmount) = yesReserve * noReserve
        ethAmount = (yesReserve * sharesAmount) / (noReserve + sharesAmount);
    }

    /**
     * @notice Get current market odds (price of Yes in basis points)
     * @return odds Yes price in basis points (0-10000)
     */
    function getYesOdds() external view returns (uint256 odds) {
        if (yesReserve == 0 && noReserve == 0) return 5000; // 50% if no liquidity
        odds = (yesReserve * BASIS_POINTS) / (yesReserve + noReserve);
    }

    /**
     * @notice Receive ETH for liquidity
     */
    receive() external payable {}
}

/**
 * @title ShareToken
 * @notice ERC20 token for Yes/No shares
 */
contract ShareToken is ERC20 {
    address public market;

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        market = msg.sender;
    }

    /**
     * @notice Mint tokens (only callable by Market)
     */
    function mint(address to, uint256 amount) external {
        require(msg.sender == market, "Only market");
        _mint(to, amount);
    }

    /**
     * @notice Burn tokens (only callable by Market)
     */
    function burn(address from, uint256 amount) external {
        require(msg.sender == market, "Only market");
        _burn(from, amount);
    }
}

