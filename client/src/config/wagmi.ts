import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { defineChain } from 'viem';
import { CONTRACTS, FACTORY_ADDRESS, MARKET_ADDRESSES } from './contracts';

export const mantleSepolia = defineChain({
  id: 5003,
  name: 'Mantle Sepolia Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'MNT',
    symbol: 'MNT',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.sepolia.mantle.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Mantle Sepolia Explorer',
      url: 'https://explorer.sepolia.mantle.xyz',
    },
  },
  testnet: true,
});

export const config = getDefaultConfig({
  appName: 'OracleBet',
  projectId: 'oraclebet-prediction-market',
  chains: [mantleSepolia],
  ssr: false,
});

export const EXPLORER_URL = 'https://explorer.sepolia.mantle.xyz';
export const FAUCET_URL = 'https://faucet.sepolia.mantle.xyz';

// Export contract addresses for use throughout the app
export { CONTRACTS, FACTORY_ADDRESS, MARKET_ADDRESSES };
