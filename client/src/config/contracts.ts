// OracleBet Contract Addresses - Mantle Sepolia Testnet
// These addresses are deployed and verified on Mantle Sepolia Testnet

import PredictionFactoryABI from '@/abis/PredictionFactory.json';
import PredictionMarketABI from '@/abis/PredictionMarket.json';

// Get validated env config
// Import and validate environment variables
import { getEnvConfig } from '@/lib/env';

// Get validated env config (will throw if invalid)
const envConfig = getEnvConfig();

export const CONTRACTS = {
  // Factory contract for creating and managing prediction markets
  FACTORY: '0xBF559Fc75fa3c2070D65Cd9ccE9e81Ce926db703',
  
  // Deployed market addresses
  MARKETS: {
    // Market 1: MNT > $2 by Q1 2026?
    MARKET_1: '0x0667C18576CeDa4f0a54d3614684b1271D357C9b',
    // Market 2: Bitcoin hits $150k in 2026?
    MARKET_2: '0xA24F78E64af7fb8b580862C23Cb44728F4a6468A',
    // Market 3: Mantle TVL > $1B?
    MARKET_3: '0x819d4A350A6eD4098fD57C51a3281967F57f10d0',
  },
  
  // All market addresses as an array
  ALL_MARKETS: [
    '0x0667C18576CeDa4f0a54d3614684b1271D357C9b',
    '0xA24F78E64af7fb8b580862C23Cb44728F4a6468A',
    '0x819d4A350A6eD4098fD57C51a3281967F57f10d0',
  ],
} as const;

// Environment variable overrides (for different deployments)
// Uses validated env config which throws if invalid
export const FACTORY_ADDRESS = envConfig.VITE_FACTORY_ADDRESS || CONTRACTS.FACTORY;
export const MARKET_ADDRESSES = envConfig.VITE_MARKET_ADDRESSES 
  ? envConfig.VITE_MARKET_ADDRESSES.split(',').map(addr => addr.trim())
  : CONTRACTS.ALL_MARKETS;

// Contract ABIs
export const FACTORY_ABI = PredictionFactoryABI.abi;
export const MARKET_ABI = PredictionMarketABI.abi;

// Explorer URLs (from validated env config)
export const EXPLORER_BASE_URL = envConfig.VITE_EXPLORER_URL || 'https://explorer.sepolia.mantle.xyz';
export const getExplorerAddressUrl = (address: string) => `${EXPLORER_BASE_URL}/address/${address}`;
export const getExplorerTxUrl = (txHash: string) => `${EXPLORER_BASE_URL}/tx/${txHash}`;

