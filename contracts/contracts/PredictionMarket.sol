// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ShareToken
 * @notice ERC20 token for Yes/No shares in prediction markets
 * @dev Mintable and burnable only by the market contract
 */
contract ShareToken is ERC20 {
    address public immutable market;

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        market = msg.sender;
    }

    /**
     * @notice Mint tokens (only callable by market)
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external {
        require(msg.sender == market, "Only market can mint");
        _mint(to, amount);
    }

    /**
     * @notice Burn tokens (only callable by market)
     * @param from Address to burn tokens from
     * @param amount Amount of tokens to burn
     */
    function burn(address from, uint256 amount) external {
        require(msg.sender == market, "Only market can burn");
        _burn(from, amount);
    }
}

/**
 * @title PredictionMarket
 * @notice Binary prediction market with Yes/No shares using native MNT
 * @dev Uses constant-product AMM (simplified fixed price for Step 1)
 */
contract PredictionMarket is ReentrancyGuard, Ownable {
    // Immutable variables
    address public immutable factory;
    string public title;
    string public description;
    uint256 public immutable resolutionTimestamp;

    // Share tokens
    ShareToken public immutable yesShares;
    ShareToken public immutable noShares;

    // Market state
    bool public isResolved;
    bool public winningOutcome; // true = Yes, false = No

    // Pool state (for AMM)
    uint256 public totalMNTInPool; // Total MNT in the pool
    uint256 public constant INITIAL_K = 1e18; // Initial constant product (1 MNT * 1 MNT)

    // User tracking (for getUserPosition)
    mapping(address => uint256) public userWageredMNT;

    // Events
    event BetPlaced(
        address indexed user,
        bool yes,
        uint256 shares,
        uint256 mntIn
    );
    event LiquidityAdded(
        address indexed provider,
        uint256 yesAmount,
        uint256 noAmount,
        uint256 mntAmount
    );
    event LiquidityRemoved(
        address indexed provider,
        uint256 yesAmount,
        uint256 noAmount,
        uint256 mntAmount
    );
    event MarketResolved(bool outcome);
    event Redeemed(address indexed user, uint256 amount);

    /**
     * @notice Constructor
     * @param _factory Factory address
     * @param _owner Owner address (market creator)
     * @param _title Market title
     * @param _description Market description
     * @param _resolutionTimestamp Resolution timestamp
     */
    constructor(
        address _factory,
        address _owner,
        string memory _title,
        string memory _description,
        uint256 _resolutionTimestamp
    ) Ownable(_owner) {
        require(_factory != address(0), "Invalid factory");
        require(_owner != address(0), "Invalid owner");
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(
            _resolutionTimestamp > block.timestamp,
            "Resolution must be in the future"
        );

        factory = _factory;
        title = _title;
        description = _description;
        resolutionTimestamp = _resolutionTimestamp;

        // Deploy share tokens
        yesShares = new ShareToken("Yes Shares", "YES");
        noShares = new ShareToken("No Shares", "NO");
    }

    /**
     * @notice Buy Yes shares with MNT using constant-product AMM
     * @dev Uses simplified constant product: sharesOut = (mntIn * yesShares) / (noShares + mntIn)
     *      This maintains price discovery: more Yes demand = higher Yes price
     */
    function buyYes() external payable nonReentrant {
        require(!isResolved, "Market is resolved");
        require(msg.value > 0, "Must send MNT");

        uint256 currentYesShares = yesShares.totalSupply();
        uint256 currentNoShares = noShares.totalSupply();

        uint256 sharesToMint;
        
        if (currentYesShares == 0 && currentNoShares == 0) {
            // First trade: initialize pool with equal shares
            sharesToMint = msg.value;
        } else if (currentNoShares == 0) {
            // Only Yes shares exist
            sharesToMint = msg.value;
        } else {
            // Constant product formula: sharesOut = (mntIn * yesShares) / (noShares + mntIn)
            // This ensures price increases as more Yes shares are bought
            sharesToMint = (msg.value * currentYesShares) / (currentNoShares + msg.value);
            require(sharesToMint > 0, "Insufficient shares output");
        }

        // Update state (Checks-Effects-Interactions)
        totalMNTInPool += msg.value;
        userWageredMNT[msg.sender] += msg.value;

        // Mint shares
        yesShares.mint(msg.sender, sharesToMint);

        emit BetPlaced(msg.sender, true, sharesToMint, msg.value);
    }

    /**
     * @notice Buy No shares with MNT using constant-product AMM
     * @dev Uses simplified constant product: sharesOut = (mntIn * noShares) / (yesShares + mntIn)
     *      This maintains price discovery: more No demand = higher No price
     */
    function buyNo() external payable nonReentrant {
        require(!isResolved, "Market is resolved");
        require(msg.value > 0, "Must send MNT");

        uint256 currentYesShares = yesShares.totalSupply();
        uint256 currentNoShares = noShares.totalSupply();

        uint256 sharesToMint;
        
        if (currentYesShares == 0 && currentNoShares == 0) {
            // First trade: initialize pool with equal shares
            sharesToMint = msg.value;
        } else if (currentYesShares == 0) {
            // Only No shares exist
            sharesToMint = msg.value;
        } else {
            // Constant product formula: sharesOut = (mntIn * noShares) / (yesShares + mntIn)
            // This ensures price increases as more No shares are bought
            sharesToMint = (msg.value * currentNoShares) / (currentYesShares + msg.value);
            require(sharesToMint > 0, "Insufficient shares output");
        }

        // Update state (Checks-Effects-Interactions)
        totalMNTInPool += msg.value;
        userWageredMNT[msg.sender] += msg.value;

        // Mint shares
        noShares.mint(msg.sender, sharesToMint);

        emit BetPlaced(msg.sender, false, sharesToMint, msg.value);
    }

    /**
     * @notice Sell Yes shares using constant-product AMM
     * @param amount Amount of Yes shares to sell
     * @return mntOut Amount of MNT returned
     */
    function sellYes(uint256 amount) external nonReentrant returns (uint256 mntOut) {
        require(!isResolved, "Market is resolved");
        require(amount > 0, "Amount must be > 0");
        require(yesShares.balanceOf(msg.sender) >= amount, "Insufficient shares");

        uint256 currentYesShares = yesShares.totalSupply();
        uint256 currentNoShares = noShares.totalSupply();
        require(currentYesShares >= amount, "Insufficient Yes shares in pool");

        // Calculate MNT out using inverse of buy formula
        // If buy: shares = (mntIn * yesShares) / (noShares + mntIn)
        // Then sell: mntOut = (amount * noShares) / (yesShares - amount)
        if (currentYesShares == amount) {
            // Selling all Yes shares - return proportional MNT
            mntOut = (totalMNTInPool * amount) / (currentYesShares + currentNoShares);
        } else {
            mntOut = (amount * currentNoShares) / (currentYesShares - amount);
        }
        
        require(mntOut > 0, "Insufficient output");
        require(totalMNTInPool >= mntOut, "Insufficient pool liquidity");

        // Update state (Checks-Effects-Interactions)
        totalMNTInPool -= mntOut;
        if (userWageredMNT[msg.sender] >= mntOut) {
            userWageredMNT[msg.sender] -= mntOut;
        }

        // Burn shares
        yesShares.burn(msg.sender, amount);

        // Transfer MNT
        (bool success, ) = payable(msg.sender).call{value: mntOut}("");
        require(success, "Transfer failed");
    }

    /**
     * @notice Sell No shares using constant-product AMM
     * @param amount Amount of No shares to sell
     * @return mntOut Amount of MNT returned
     */
    function sellNo(uint256 amount) external nonReentrant returns (uint256 mntOut) {
        require(!isResolved, "Market is resolved");
        require(amount > 0, "Amount must be > 0");
        require(noShares.balanceOf(msg.sender) >= amount, "Insufficient shares");

        uint256 currentYesShares = yesShares.totalSupply();
        uint256 currentNoShares = noShares.totalSupply();
        require(currentNoShares >= amount, "Insufficient No shares in pool");

        // Calculate MNT out using inverse of buy formula
        // If buy: shares = (mntIn * noShares) / (yesShares + mntIn)
        // Then sell: mntOut = (amount * yesShares) / (noShares - amount)
        if (currentNoShares == amount) {
            // Selling all No shares - return proportional MNT
            mntOut = (totalMNTInPool * amount) / (currentYesShares + currentNoShares);
        } else {
            mntOut = (amount * currentYesShares) / (currentNoShares - amount);
        }
        
        require(mntOut > 0, "Insufficient output");
        require(totalMNTInPool >= mntOut, "Insufficient pool liquidity");

        // Update state (Checks-Effects-Interactions)
        totalMNTInPool -= mntOut;
        if (userWageredMNT[msg.sender] >= mntOut) {
            userWageredMNT[msg.sender] -= mntOut;
        }

        // Burn shares
        noShares.burn(msg.sender, amount);

        // Transfer MNT
        (bool success, ) = payable(msg.sender).call{value: mntOut}("");
        require(success, "Transfer failed");
    }

    /**
     * @notice Add liquidity to the market
     * @dev Mints proportional Yes and No shares to the provider
     *      Provider receives shares based on current pool ratio
     */
    function addLiquidity() external payable nonReentrant {
        require(!isResolved, "Market is resolved");
        require(msg.value > 0, "Must send MNT");

        uint256 currentYesShares = yesShares.totalSupply();
        uint256 currentNoShares = noShares.totalSupply();

        uint256 yesAmount;
        uint256 noAmount;

        if (currentYesShares == 0 && currentNoShares == 0) {
            // First liquidity: mint equal amounts
            yesAmount = msg.value;
            noAmount = msg.value;
        } else if (currentYesShares == 0 || currentNoShares == 0) {
            // One side empty: mint only to empty side
            if (currentYesShares == 0) {
                yesAmount = msg.value;
                noAmount = 0;
            } else {
                yesAmount = 0;
                noAmount = msg.value;
            }
        } else {
            // Calculate proportional shares based on current ratio
            // Maintain the ratio: yesAmount/noAmount = currentYesShares/currentNoShares
            // And: yesAmount + noAmount = msg.value (simplified - in reality would be more complex)
            uint256 totalShares = currentYesShares + currentNoShares;
            yesAmount = (msg.value * currentYesShares) / totalShares;
            noAmount = msg.value - yesAmount;
        }

        // Update state (Checks-Effects-Interactions)
        totalMNTInPool += msg.value;

        // Mint shares
        if (yesAmount > 0) {
            yesShares.mint(msg.sender, yesAmount);
        }
        if (noAmount > 0) {
            noShares.mint(msg.sender, noAmount);
        }

        emit LiquidityAdded(msg.sender, yesAmount, noAmount, msg.value);
    }

    /**
     * @notice Remove liquidity from the market
     * @param yesAmount Amount of Yes shares to remove
     * @param noAmount Amount of No shares to remove
     * @return mntOut Amount of MNT returned
     */
    function removeLiquidity(
        uint256 yesAmount,
        uint256 noAmount
    ) external nonReentrant returns (uint256 mntOut) {
        require(!isResolved, "Market is resolved");
        require(yesAmount > 0 || noAmount > 0, "Must remove some shares");
        
        if (yesAmount > 0) {
            require(yesShares.balanceOf(msg.sender) >= yesAmount, "Insufficient Yes shares");
        }
        if (noAmount > 0) {
            require(noShares.balanceOf(msg.sender) >= noAmount, "Insufficient No shares");
        }

        uint256 currentYesShares = yesShares.totalSupply();
        uint256 currentNoShares = noShares.totalSupply();
        require(currentYesShares > 0 || currentNoShares > 0, "Pool empty");

        // Calculate MNT out proportional to shares removed
        uint256 totalShares = currentYesShares + currentNoShares;
        uint256 sharesRemoved = yesAmount + noAmount;
        
        if (totalShares == 0) {
            mntOut = 0;
        } else {
            mntOut = (totalMNTInPool * sharesRemoved) / totalShares;
        }

        require(mntOut > 0, "Insufficient output");
        require(totalMNTInPool >= mntOut, "Insufficient pool liquidity");

        // Update state (Checks-Effects-Interactions)
        totalMNTInPool -= mntOut;

        // Burn shares
        if (yesAmount > 0) {
            yesShares.burn(msg.sender, yesAmount);
        }
        if (noAmount > 0) {
            noShares.burn(msg.sender, noAmount);
        }

        // Transfer MNT
        (bool success, ) = payable(msg.sender).call{value: mntOut}("");
        require(success, "Transfer failed");

        emit LiquidityRemoved(msg.sender, yesAmount, noAmount, mntOut);
    }

    /**
     * @notice Resolve market (only owner, after resolution timestamp)
     * @param outcome True for Yes, false for No
     */
    function resolve(bool outcome) external onlyOwner {
        require(!isResolved, "Market already resolved");
        require(
            block.timestamp >= resolutionTimestamp,
            "Resolution time not reached"
        );

        // Update state (Checks-Effects-Interactions)
        isResolved = true;
        winningOutcome = outcome;

        emit MarketResolved(outcome);
    }

    /**
     * @notice Redeem winning shares for MNT
     * @dev Winning side gets proportional share of entire pool, losing side gets 0
     * @return amount Amount of MNT redeemed
     */
    function redeem() external nonReentrant returns (uint256 amount) {
        require(isResolved, "Market not resolved");

        uint256 userYesShares = yesShares.balanceOf(msg.sender);
        uint256 userNoShares = noShares.balanceOf(msg.sender);

        if (winningOutcome) {
            // Yes won - redeem Yes shares
            require(userYesShares > 0, "No winning shares");
            require(userNoShares == 0, "Cannot redeem losing shares");

            // Calculate proportional share of pool
            uint256 totalYesShares = yesShares.totalSupply();
            require(totalYesShares > 0, "No Yes shares in pool");

            amount = (totalMNTInPool * userYesShares) / totalYesShares;

            // Update state (Checks-Effects-Interactions)
            totalMNTInPool -= amount;

            // Burn shares
            yesShares.burn(msg.sender, userYesShares);
        } else {
            // No won - redeem No shares
            require(userNoShares > 0, "No winning shares");
            require(userYesShares == 0, "Cannot redeem losing shares");

            // Calculate proportional share of pool
            uint256 totalNoShares = noShares.totalSupply();
            require(totalNoShares > 0, "No No shares in pool");

            amount = (totalMNTInPool * userNoShares) / totalNoShares;

            // Update state (Checks-Effects-Interactions)
            totalMNTInPool -= amount;

            // Burn shares
            noShares.burn(msg.sender, userNoShares);
        }

        require(amount > 0, "No amount to redeem");
        require(address(this).balance >= amount, "Insufficient contract balance");

        // Transfer MNT
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");

        emit Redeemed(msg.sender, amount);
    }

    /**
     * @notice Get user's position in the market
     * @param user User address
     * @return yes Amount of Yes shares
     * @return no Amount of No shares
     * @return wageredMNT Total MNT wagered by user
     */
    function getUserPosition(
        address user
    ) external view returns (uint256 yes, uint256 no, uint256 wageredMNT) {
        yes = yesShares.balanceOf(user);
        no = noShares.balanceOf(user);
        wageredMNT = userWageredMNT[user];
    }

    /**
     * @notice Get current price of Yes shares in MNT
     * @return Price in MNT per share (1e18 precision)
     */
    function getYesPrice() external view returns (uint256) {
        uint256 currentYesShares = yesShares.totalSupply();
        uint256 currentNoShares = noShares.totalSupply();
        
        if (currentYesShares == 0 || currentNoShares == 0 || totalMNTInPool == 0) {
            return 1e18; // Default 1 MNT per share
        }
        
        // Price based on pool ratio
        // If Yes shares are fewer, price is higher
        return (totalMNTInPool * 1e18) / (currentYesShares + currentNoShares);
    }

    /**
     * @notice Get current price of No shares in MNT
     * @return Price in MNT per share (1e18 precision)
     */
    function getNoPrice() external view returns (uint256) {
        uint256 currentYesShares = yesShares.totalSupply();
        uint256 currentNoShares = noShares.totalSupply();
        
        if (currentYesShares == 0 || currentNoShares == 0 || totalMNTInPool == 0) {
            return 1e18; // Default 1 MNT per share
        }
        
        // Price based on pool ratio
        return (totalMNTInPool * 1e18) / (currentYesShares + currentNoShares);
    }

    /**
     * @notice Receive MNT
     */
    receive() external payable {
        // Allow receiving MNT for pool
        totalMNTInPool += msg.value;
    }
}
