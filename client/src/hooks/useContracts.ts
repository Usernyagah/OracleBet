import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { FACTORY_ADDRESS, FACTORY_ABI, MARKET_ABI } from '@/config/contracts';
import { Address } from 'viem';

/**
 * Hook to interact with the PredictionFactory contract
 */
export function useFactory() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const createMarket = async (title: string, description: string, resolutionTimestamp: bigint) => {
    return writeContract({
      address: FACTORY_ADDRESS as Address,
      abi: FACTORY_ABI,
      functionName: 'createMarket',
      args: [title, description, resolutionTimestamp],
    });
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

  // Write functions
  const buyYes = async (amount: bigint) => {
    return writeContract({
      address: marketAddress,
      abi: MARKET_ABI,
      functionName: 'buyYes',
      value: amount,
    });
  };

  const buyNo = async (amount: bigint) => {
    return writeContract({
      address: marketAddress,
      abi: MARKET_ABI,
      functionName: 'buyNo',
      value: amount,
    });
  };

  const addLiquidity = async (amount: bigint) => {
    return writeContract({
      address: marketAddress,
      abi: MARKET_ABI,
      functionName: 'addLiquidity',
      value: amount,
    });
  };

  const redeem = async () => {
    return writeContract({
      address: marketAddress,
      abi: MARKET_ABI,
      functionName: 'redeem',
    });
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

