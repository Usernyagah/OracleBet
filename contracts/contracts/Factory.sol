// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Market.sol";

/**
 * @title Factory
 * @notice Factory contract for creating and managing Market instances
 */
contract Factory {
    /// @notice Array of all created market addresses
    address[] public markets;

    /// @notice Mapping from market address to existence flag
    mapping(address => bool) public isMarket;

    /// @notice Event emitted when a new market is created
    event MarketCreated(
        address indexed market,
        address indexed creator,
        string question,
        uint256 indexed marketId
    );

    /// @notice Total number of markets created
    uint256 public marketCount;

    /**
     * @notice Create a new market
     * @param question The question/prediction for this market
     * @param resolutionTime Unix timestamp when the market can be resolved
     * @param oracle Address that can resolve the market (placeholder for now)
     * @return market The address of the newly created market
     */
    function createMarket(
        string memory question,
        uint256 resolutionTime,
        address oracle
    ) external returns (address market) {
        Market newMarket = new Market(
            question,
            resolutionTime,
            msg.sender,
            oracle,
            marketCount
        );

        market = address(newMarket);
        markets.push(market);
        isMarket[market] = true;
        marketCount++;

        emit MarketCreated(market, msg.sender, question, marketCount - 1);
    }

    /**
     * @notice Get all market addresses
     * @return Array of all market addresses
     */
    function getAllMarkets() external view returns (address[] memory) {
        return markets;
    }

    /**
     * @notice Get market count
     * @return Number of markets created
     */
    function getMarketCount() external view returns (uint256) {
        return marketCount;
    }
}

