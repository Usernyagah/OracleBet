/**
 * Environment variable validation and configuration
 */

interface EnvConfig {
  VITE_FACTORY_ADDRESS: string;
  VITE_MARKET_ADDRESSES: string;
  VITE_CHAIN_ID: string;
  VITE_RPC_URL: string;
  VITE_EXPLORER_URL: string;
}

/**
 * Validates that an Ethereum address is properly formatted
 */
function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Default contract addresses (fallback for production)
 */
const DEFAULT_FACTORY_ADDRESS = '0xBF559Fc75fa3c2070D65Cd9ccE9e81Ce926db703';
const DEFAULT_MARKET_ADDRESSES = '0x0667C18576CeDa4f0a54d3614684b1271D357C9b,0xA24F78E64af7fb8b580862C23Cb44728F4a6468A,0x819d4A350A6eD4098fD57C51a3281967F57f10d0';

/**
 * Validates environment variables and returns configuration
 */
export function getEnvConfig(): EnvConfig {
  // Use environment variables or fall back to defaults (deployed addresses)
  const factoryAddress = import.meta.env.VITE_FACTORY_ADDRESS || DEFAULT_FACTORY_ADDRESS;
  const marketAddresses = import.meta.env.VITE_MARKET_ADDRESSES || DEFAULT_MARKET_ADDRESSES;
  const chainId = import.meta.env.VITE_CHAIN_ID || '5003';
  const rpcUrl = import.meta.env.VITE_RPC_URL || 'https://rpc.sepolia.mantle.xyz';
  const explorerUrl = import.meta.env.VITE_EXPLORER_URL || 'https://explorer.sepolia.mantle.xyz';

  // Validate factory address format
  if (!isValidAddress(factoryAddress)) {
    console.error(`Invalid VITE_FACTORY_ADDRESS format: ${factoryAddress}`);
    // Use default if invalid
    const validFactory = DEFAULT_FACTORY_ADDRESS;
    console.warn(`Using default factory address: ${validFactory}`);
    return {
      VITE_FACTORY_ADDRESS: validFactory,
      VITE_MARKET_ADDRESSES: marketAddresses || DEFAULT_MARKET_ADDRESSES,
      VITE_CHAIN_ID: chainId,
      VITE_RPC_URL: rpcUrl,
      VITE_EXPLORER_URL: explorerUrl,
    };
  }

  // Validate market addresses
  if (!marketAddresses) {
    console.warn('VITE_MARKET_ADDRESSES is not set. Some features may not work.');
  } else {
    const addresses = marketAddresses.split(',').map(addr => addr.trim());
    const invalidAddresses = addresses.filter(addr => !isValidAddress(addr));
    
    if (invalidAddresses.length > 0) {
      console.warn('Some market addresses are invalid:', invalidAddresses);
    }
  }

  // Validate chain ID
  const chainIdNum = parseInt(chainId, 10);
  if (isNaN(chainIdNum) || chainIdNum <= 0) {
    throw new Error(`Invalid VITE_CHAIN_ID: ${chainId}`);
  }

  // Validate URLs
  try {
    new URL(rpcUrl);
  } catch {
    throw new Error(`Invalid VITE_RPC_URL: ${rpcUrl}`);
  }

  try {
    new URL(explorerUrl);
  } catch {
    throw new Error(`Invalid VITE_EXPLORER_URL: ${explorerUrl}`);
  }

  return {
    VITE_FACTORY_ADDRESS: factoryAddress,
    VITE_MARKET_ADDRESSES: marketAddresses || '',
    VITE_CHAIN_ID: chainId,
    VITE_RPC_URL: rpcUrl,
    VITE_EXPLORER_URL: explorerUrl,
  };
}

/**
 * Get validated environment configuration
 * Throws error if validation fails
 */
export const envConfig = getEnvConfig();

