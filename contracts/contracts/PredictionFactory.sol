// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./PredictionMarket.sol";

/**
 * @title PredictionFactory
 * @notice Factory contract for creating prediction markets
 * @dev Deploys new PredictionMarket instances and tracks all markets
 */
contract PredictionFactory {
    /// @notice Array of all created market addresses
    address[] private _markets;

    /// @notice Event emitted when a new market is created
    event MarketCreated(
        address indexed market,
        address indexed creator,
        string title
    );

    /**
     * @notice Create a new prediction market
     * @param title The title of the prediction market
     * @param description Description of the prediction market
     * @param resolutionTimestamp Unix timestamp when the market can be resolved
     * @return market Address of the newly created market
     */
    function createMarket(
        string memory title,
        string memory description,
        uint256 resolutionTimestamp
    ) external payable returns (address market) {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");
        require(
            resolutionTimestamp > block.timestamp,
            "Resolution must be in the future"
        );

        // Deploy new prediction market
        PredictionMarket newMarket = new PredictionMarket(
            address(this),
            msg.sender,
            title,
            description,
            resolutionTimestamp
        );

        market = address(newMarket);
        _markets.push(market);

        emit MarketCreated(market, msg.sender, title);
    }

    /**
     * @notice Get all created markets
     * @return Array of all market addresses
     */
    function getAllMarkets() external view returns (address[] memory) {
        return _markets;
    }
}
