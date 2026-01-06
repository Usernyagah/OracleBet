# Contract Integration Guide

This document explains how the frontend is connected to the deployed smart contracts on Mantle Sepolia Testnet.

## Contract Addresses

All contract addresses are configured in `src/config/contracts.ts`:

- **Factory**: `0xBF559Fc75fa3c2070D65Cd9ccE9e81Ce926db703`
- **Market 1**: `0x0667C18576CeDa4f0a54d3614684b1271D357C9b`
- **Market 2**: `0xA24F78E64af7fb8b580862C23Cb44728F4a6468A`
- **Market 3**: `0x819d4A350A6eD4098fD57C51a3281967F57f10d0`

## Configuration Files

1. **`src/config/contracts.ts`** - Main configuration file with addresses and ABIs
2. **`src/config/wagmi.ts`** - Wagmi configuration with network settings
3. **`src/hooks/useContracts.ts`** - React hooks for contract interactions
4. **`.env`** - Environment variables (Vite uses `VITE_` prefix)

## Usage Examples

### Reading Market Data

```typescript
import { useMarket } from '@/hooks/useContracts';
import { CONTRACTS } from '@/config/contracts';

function MarketComponent() {
  const market = useMarket(CONTRACTS.MARKETS.MARKET_1 as `0x${string}`);
  
  return (
    <div>
      <h2>{market.title}</h2>
      <p>{market.description}</p>
      <p>Resolved: {market.resolved ? 'Yes' : 'No'}</p>
    </div>
  );
}
```

### Creating a New Market

```typescript
import { useFactory } from '@/hooks/useContracts';

function CreateMarketForm() {
  const { createMarket, isPending, isConfirmed } = useFactory();
  
  const handleSubmit = async () => {
    const resolutionTime = BigInt(Math.floor(Date.now() / 1000) + 90 * 24 * 60 * 60);
    await createMarket(
      "Will ETH reach $5000?",
      "This market resolves YES if ETH reaches $5000 USD",
      resolutionTime
    );
  };
  
  return (
    <button onClick={handleSubmit} disabled={isPending}>
      {isPending ? 'Creating...' : 'Create Market'}
    </button>
  );
}
```

### Trading on a Market

```typescript
import { useMarket } from '@/hooks/useContracts';
import { parseEther } from 'viem';

function TradeComponent({ marketAddress }: { marketAddress: `0x${string}` }) {
  const { buyYes, buyNo, isPending } = useMarket(marketAddress);
  
  const handleBuyYes = async () => {
    await buyYes(parseEther('1.0')); // Buy 1 MNT worth of YES shares
  };
  
  const handleBuyNo = async () => {
    await buyNo(parseEther('1.0')); // Buy 1 MNT worth of NO shares
  };
  
  return (
    <div>
      <button onClick={handleBuyYes} disabled={isPending}>
        Buy YES
      </button>
      <button onClick={handleBuyNo} disabled={isPending}>
        Buy NO
      </button>
    </div>
  );
}
```

### Getting All Markets

```typescript
import { useAllMarkets } from '@/hooks/useContracts';

function MarketsList() {
  const { markets, isLoading } = useAllMarkets();
  
  if (isLoading) return <div>Loading markets...</div>;
  
  return (
    <div>
      {markets?.map((address, index) => (
        <div key={index}>{address}</div>
      ))}
    </div>
  );
}
```

## Environment Variables

The frontend uses Vite, which requires the `VITE_` prefix for environment variables:

```env
VITE_FACTORY_ADDRESS=0xBF559Fc75fa3c2070D65Cd9ccE9e81Ce926db703
VITE_MARKET_ADDRESSES=0x0667C18576CeDa4f0a54d3614684b1271D357C9b,0xA24F78E64af7fb8b580862C23Cb44728F4a6468A,0x819d4A350A6eD4098fD57C51a3281967F57f10d0
VITE_CHAIN_ID=5003
VITE_RPC_URL=https://rpc.sepolia.mantle.xyz
VITE_EXPLORER_URL=https://explorer.sepolia.mantle.xyz
```

These are already configured in `client/.env`.

## Contract ABIs

The contract ABIs are located in `src/abis/`:
- `PredictionFactory.json`
- `PredictionMarket.json`

These are automatically imported in `src/config/contracts.ts` and exported as `FACTORY_ABI` and `MARKET_ABI`.

## Explorer Links

Use the helper functions to generate explorer links:

```typescript
import { getExplorerAddressUrl, getExplorerTxUrl } from '@/config/contracts';

const addressUrl = getExplorerAddressUrl('0x...');
const txUrl = getExplorerTxUrl('0x...');
```

