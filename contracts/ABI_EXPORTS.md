# OracleBet ABI Exports for Frontend

## Required ABIs

### PredictionFactory.sol

**Functions:**
- `createMarket(string memory title, string memory description, uint256 resolutionTimestamp) payable returns (address)`
- `getAllMarkets() view returns (address[])`

**Events:**
- `MarketCreated(address indexed market, address indexed creator, string title)`

### PredictionMarket.sol

**Functions:**
- `buyYes() payable` - Buy Yes shares with MNT
- `buyNo() payable` - Buy No shares with MNT
- `sellYes(uint256 amount) returns (uint256)` - Sell Yes shares
- `sellNo(uint256 amount) returns (uint256)` - Sell No shares
- `addLiquidity() payable` - Add liquidity to market
- `removeLiquidity(uint256 yesAmount, uint256 noAmount) returns (uint256)` - Remove liquidity
- `resolve(bool outcome)` - Resolve market (owner only)
- `redeem() returns (uint256)` - Redeem winning shares
- `getUserPosition(address user) view returns (uint256 yes, uint256 no, uint256 wageredMNT)` - Get user's position
- `getYesPrice() view returns (uint256)` - Get current Yes price
- `getNoPrice() view returns (uint256)` - Get current No price
- `isResolved() view returns (bool)` - Check if market is resolved
- `winningOutcome() view returns (bool)` - Get winning outcome (if resolved)

**View Properties:**
- `title() view returns (string)` - Market title
- `description() view returns (string)` - Market description
- `resolutionTimestamp() view returns (uint256)` - Resolution timestamp
- `yesShares() view returns (address)` - Yes shares token address
- `noShares() view returns (address)` - No shares token address
- `totalMNTInPool() view returns (uint256)` - Total MNT in pool

**Events:**
- `BetPlaced(address indexed user, bool yes, uint256 shares, uint256 mntIn)`
- `LiquidityAdded(address indexed provider, uint256 yesAmount, uint256 noAmount, uint256 mntAmount)`
- `LiquidityRemoved(address indexed provider, uint256 yesAmount, uint256 noAmount, uint256 mntAmount)`
- `MarketResolved(bool outcome)`
- `Redeemed(address indexed user, uint256 amount)`

### ShareToken.sol (ERC20)

**Standard ERC20 functions:**
- `balanceOf(address account) view returns (uint256)`
- `totalSupply() view returns (uint256)`
- `name() view returns (string)`
- `symbol() view returns (string)`

## Frontend Integration Example

```typescript
// Get all markets
const markets = await factory.getAllMarkets();

// Get market details
const market = await ethers.getContractAt("PredictionMarket", marketAddress);
const title = await market.title();
const isResolved = await market.isResolved();

// Get user position
const [yesShares, noShares, wageredMNT] = await market.getUserPosition(userAddress);

// Buy Yes shares
const tx = await market.buyYes({ value: ethers.parseEther("0.5") });
await tx.wait();

// Redeem winnings
const redeemTx = await market.redeem();
await redeemTx.wait();
```

## Environment Variables

After deployment, use these from `frontend.env`:
- `FACTORY_ADDRESS` - PredictionFactory contract address
- `MARKET_ADDRESSES` - Comma-separated market addresses
- `CHAIN_ID` - 5003 (Mantle Sepolia)
- `RPC_URL` - https://rpc.sepolia.mantle.xyz

