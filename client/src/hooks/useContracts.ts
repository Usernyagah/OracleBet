import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { FACTORY_ADDRESS, FACTORY_ABI, MARKET_ABI } from '@/config/contracts';
import { Address } from 'viem';
import { toast } from 'sonner';

/**
 * Hook to interact with the PredictionFactory contract
 */
export function useFactory() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const createMarket = async (title: string, description: string, resolutionTimestamp: bigint) => {
    try {
      return await writeContract({
        address: FACTORY_ADDRESS as Address,
        abi: FACTORY_ABI,
        functionName: 'createMarket',
        args: [title, description, resolutionTimestamp],
      });
    } catch (err) {
      const error = err as Error;
      toast.error('Failed to create market', {
        description: error.message || 'An unexpected error occurred',
      });
      throw err;
    }
  };

  return {
    createMarket,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

/**
 * Hook to read all markets from the factory
 */
export function useAllMarkets() {
  const { data: markets, isLoading, error } = useReadContract({
    address: FACTORY_ADDRESS as Address,
    abi: FACTORY_ABI,
    functionName: 'getAllMarkets',
  });

  return {
    markets: markets as Address[] | undefined,
    isLoading,
    error,
  };
}

/**
 * Hook to interact with a specific PredictionMarket contract
 */
export function useMarket(marketAddress: Address) {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Read market details
  const { data: title } = useReadContract({
    address: marketAddress,
    abi: MARKET_ABI,
    functionName: 'title',
  });

  const { data: description } = useReadContract({
    address: marketAddress,
    abi: MARKET_ABI,
    functionName: 'description',
  });

  const { data: resolutionTimestamp } = useReadContract({
    address: marketAddress,
    abi: MARKET_ABI,
    functionName: 'resolutionTimestamp',
  });

  const { data: resolved } = useReadContract({
    address: marketAddress,
    abi: MARKET_ABI,
    functionName: 'resolved',
  });

  const { data: outcome } = useReadContract({
    address: marketAddress,
    abi: MARKET_ABI,
    functionName: 'outcome',
  });

  // Write functions with error handling
  const buyYes = async (amount: bigint) => {
    try {
      return await writeContract({
        address: marketAddress,
        abi: MARKET_ABI,
        functionName: 'buyYes',
        value: amount,
      });
    } catch (err) {
      const error = err as Error;
      toast.error('Failed to buy YES shares', {
        description: error.message || 'Transaction failed',
      });
      throw err;
    }
  };

  const buyNo = async (amount: bigint) => {
    try {
      return await writeContract({
        address: marketAddress,
        abi: MARKET_ABI,
        functionName: 'buyNo',
        value: amount,
      });
    } catch (err) {
      const error = err as Error;
      toast.error('Failed to buy NO shares', {
        description: error.message || 'Transaction failed',
      });
      throw err;
    }
  };

  const addLiquidity = async (amount: bigint) => {
    try {
      return await writeContract({
        address: marketAddress,
        abi: MARKET_ABI,
        functionName: 'addLiquidity',
        value: amount,
      });
    } catch (err) {
      const error = err as Error;
      toast.error('Failed to add liquidity', {
        description: error.message || 'Transaction failed',
      });
      throw err;
    }
  };

  const redeem = async () => {
    try {
      return await writeContract({
        address: marketAddress,
        abi: MARKET_ABI,
        functionName: 'redeem',
      });
    } catch (err) {
      const error = err as Error;
      toast.error('Failed to redeem shares', {
        description: error.message || 'Transaction failed',
      });
      throw err;
    }
  };

  return {
    // Read data
    title: title as string | undefined,
    description: description as string | undefined,
    resolutionTimestamp: resolutionTimestamp as bigint | undefined,
    resolved: resolved as boolean | undefined,
    outcome: outcome as boolean | undefined,
    
    // Write functions
    buyYes,
    buyNo,
    addLiquidity,
    redeem,
    
    // Transaction status
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

