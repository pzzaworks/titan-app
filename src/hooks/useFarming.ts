"use client";

import { useState, useCallback, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, usePublicClient } from "wagmi";
import { parseEther, formatEther } from "viem";
import { sepolia } from "viem/chains";
import { config } from "@/config";
import { FARMING_ABI, ERC20_ABI, PAIR_ABI } from "@/lib/contracts";
import { toast } from "./useToast";
import { parseError, waitForTx } from "@/lib/utils";

type EstimatedGas = string | null;

export interface Pool {
  id: number;
  name: string;
  lpToken: `0x${string}`;
  token0: {
    symbol: string;
    logoUrl?: string;
  };
  token1: {
    symbol: string;
    logoUrl?: string;
  };
  apr: number;
  tvl: number;
  allocPoint: number;
  totalStaked: bigint;
  userStaked: bigint;
  pendingRewards: bigint;
  isHot?: boolean;
}

// Token info mapping
const TOKEN_INFO: Record<string, { symbol: string; logoUrl: string }> = {
  "0x45692D559B4C12BFF1362b472440bF130fE1a244": { symbol: "TITAN", logoUrl: "/logo.svg" },
  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2": { symbol: "WETH", logoUrl: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png" },
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48": { symbol: "USDC", logoUrl: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png" },
};

export function useFarming() {
  const { address, isConnected } = useAccount();
  const [isDepositing, setIsDepositing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isHarvesting, setIsHarvesting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [pools, setPools] = useState<Pool[]>([]);
  const [isLoadingPools, setIsLoadingPools] = useState(true);
  const [estimatedGas, setEstimatedGas] = useState<EstimatedGas>(null);

  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient({ chainId: sepolia.id });

  // Read pool length
  const { data: poolLength, refetch: refetchPoolLength } = useReadContract({
    address: config.contracts.farming,
    abi: FARMING_ABI,
    functionName: "poolLength",
    query: {
          },
  });

  // Fetch pools data from contract
  const fetchPools = useCallback(async () => {
    if (!publicClient || !poolLength) {
      setIsLoadingPools(false);
      return;
    }

    setIsLoadingPools(true);
    try {
      const count = Number(poolLength);
      const fetchedPools: Pool[] = [];

      for (let i = 0; i < count; i++) {
        // Get pool info
        const poolInfoData = await publicClient.readContract({
          address: config.contracts.farming,
          abi: FARMING_ABI,
          functionName: "poolInfo",
          args: [BigInt(i)],
        }) as [string, bigint, bigint, bigint, boolean];

        const lpToken = poolInfoData[0] as `0x${string}`;
        const allocPoint = poolInfoData[1];
        const isActive = poolInfoData[4];

        // Skip inactive pools
        if (!isActive) continue;

        // Get total staked from LP token balance of farm contract
        const totalStaked = await publicClient.readContract({
          address: lpToken,
          abi: ERC20_ABI,
          functionName: "balanceOf",
          args: [config.contracts.farming],
        }) as bigint;

        // Get token0 and token1 from LP pair
        let token0Address: string;
        let token1Address: string;
        try {
          token0Address = await publicClient.readContract({
            address: lpToken,
            abi: PAIR_ABI,
            functionName: "token0",
          }) as string;
          token1Address = await publicClient.readContract({
            address: lpToken,
            abi: PAIR_ABI,
            functionName: "token1",
          }) as string;
        } catch {
          token0Address = config.contracts.titanToken;
          token1Address = config.contracts.weth;
        }

        const token0Info = TOKEN_INFO[token0Address] || { symbol: "???", logoUrl: "" };
        const token1Info = TOKEN_INFO[token1Address] || { symbol: "???", logoUrl: "" };

        // Get user info if connected
        let userStaked = BigInt(0);
        let pendingRewards = BigInt(0);

        if (address) {
          try {
            const userInfo = await publicClient.readContract({
              address: config.contracts.farming,
              abi: FARMING_ABI,
              functionName: "userInfo",
              args: [BigInt(i), address],
            }) as [bigint, bigint];
            userStaked = userInfo[0];

            pendingRewards = await publicClient.readContract({
              address: config.contracts.farming,
              abi: FARMING_ABI,
              functionName: "pendingTitan",
              args: [BigInt(i), address],
            }) as bigint;
          } catch (e) {
            console.error("Error fetching user info:", e);
          }
        }

        // Calculate TVL (simplified - assumes 1 LP = $200 for demo)
        const tvl = Number(formatEther(totalStaked)) * 200;

        // Calculate APR (simplified)
        const apr = totalStaked > BigInt(0) ? 100 : 0;

        fetchedPools.push({
          id: i,
          name: `${token0Info.symbol}-${token1Info.symbol}`,
          lpToken,
          token0: token0Info,
          token1: token1Info,
          apr,
          tvl,
          allocPoint: Number(allocPoint),
          totalStaked,
          userStaked,
          pendingRewards,
          isHot: i === 0,
        });
      }

      setPools(fetchedPools);
    } catch (error) {
      console.error("Error fetching pools:", error);
      setPools([]);
    } finally {
      setIsLoadingPools(false);
    }
  }, [publicClient, poolLength, address]);

  useEffect(() => {
    fetchPools();
  }, [fetchPools]);

  // Approve LP tokens
  const approve = useCallback(
    async (poolId: number, amount: string) => {
      if (!isConnected || !address) {
        toast({
          title: "Wallet not connected",
          description: "Please connect your wallet to continue.",
          variant: "destructive",
        });
        return;
      }

      const pool = pools.find((p) => p.id === poolId);
      if (!pool) return;

      setIsApproving(true);
      try {
        toast({
          title: "Approving...",
          description: "Please confirm in your wallet",
        });

        const hash = await writeContractAsync({
          address: pool.lpToken,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [config.contracts.farming, parseEther(amount)],
          chainId: sepolia.id,
        });

        await waitForTx(publicClient, hash);

        toast({
          title: "Approval successful",
          description: "You can now deposit your LP tokens.",
          variant: "success",
        });

        return hash;
      } catch (error: unknown) {
        toast({
          title: "Approval failed",
          description: parseError(error),
          variant: "destructive",
        });
        throw error;
      } finally {
        setIsApproving(false);
      }
    },
    [isConnected, address, pools, writeContractAsync, publicClient]
  );

  // Estimate gas for deposit
  const estimateDepositGas = useCallback(
    async (poolId: number, amount: string) => {
      if (!publicClient || !address || !amount) return null;
      try {
        const gasEstimate = await publicClient.estimateContractGas({
          address: config.contracts.farming,
          abi: FARMING_ABI,
          functionName: "deposit",
          args: [BigInt(poolId), parseEther(amount)],
          account: address,
        });
        const gasPrice = await publicClient.getGasPrice();
        const totalCost = gasEstimate * gasPrice;
        setEstimatedGas(formatEther(totalCost));
        return formatEther(totalCost);
      } catch {
        return null;
      }
    },
    [publicClient, address]
  );

  // Deposit LP tokens
  const deposit = useCallback(
    async (poolId: number, amount: string) => {
      if (!isConnected || !address) {
        toast({
          title: "Wallet not connected",
          description: "Please connect your wallet to continue.",
          variant: "destructive",
        });
        return;
      }

      setIsDepositing(true);
      try {
        // Estimate gas first
        const gasEst = await estimateDepositGas(poolId, amount);

        const hash = await writeContractAsync({
          address: config.contracts.farming,
          abi: FARMING_ABI,
          functionName: "deposit",
          args: [BigInt(poolId), parseEther(amount)],
          chainId: sepolia.id,
        });

        toast({
          title: "Depositing...",
          description: "Processing...",
        });

        await waitForTx(publicClient, hash);

        // Wait a bit for state to settle
        await new Promise(resolve => setTimeout(resolve, 1000));

        await fetchPools();

        toast({
          title: "Deposit successful",
          description: `Successfully deposited ${amount} LP tokens.`,
          variant: "success",
        });

        return hash;
      } catch (error: unknown) {
        toast({
          title: "Deposit failed",
          description: parseError(error),
          variant: "destructive",
        });
        throw error;
      } finally {
        setIsDepositing(false);
        setEstimatedGas(null);
      }
    },
    [isConnected, address, writeContractAsync, publicClient, estimateDepositGas, fetchPools]
  );

  // Estimate gas for withdraw
  const estimateWithdrawGas = useCallback(
    async (poolId: number, amount: string) => {
      if (!publicClient || !address || !amount) return null;
      try {
        const gasEstimate = await publicClient.estimateContractGas({
          address: config.contracts.farming,
          abi: FARMING_ABI,
          functionName: "withdraw",
          args: [BigInt(poolId), parseEther(amount)],
          account: address,
        });
        const gasPrice = await publicClient.getGasPrice();
        const totalCost = gasEstimate * gasPrice;
        setEstimatedGas(formatEther(totalCost));
        return formatEther(totalCost);
      } catch {
        return null;
      }
    },
    [publicClient, address]
  );

  // Withdraw LP tokens
  const withdraw = useCallback(
    async (poolId: number, amount: string) => {
      if (!isConnected || !address) {
        toast({
          title: "Wallet not connected",
          description: "Please connect your wallet to continue.",
          variant: "destructive",
        });
        return;
      }

      setIsWithdrawing(true);
      try {
        // Estimate gas first
        const gasEst = await estimateWithdrawGas(poolId, amount);

        const hash = await writeContractAsync({
          address: config.contracts.farming,
          abi: FARMING_ABI,
          functionName: "withdraw",
          args: [BigInt(poolId), parseEther(amount)],
          chainId: sepolia.id,
        });

        toast({
          title: "Withdrawing...",
          description: "Processing...",
        });

        await waitForTx(publicClient, hash);

        // Wait a bit for state to settle
        await new Promise(resolve => setTimeout(resolve, 1000));

        await fetchPools();

        toast({
          title: "Withdrawal successful",
          description: `Successfully withdrew ${amount} LP tokens.`,
          variant: "success",
        });

        return hash;
      } catch (error: unknown) {
        toast({
          title: "Withdrawal failed",
          description: parseError(error),
          variant: "destructive",
        });
        throw error;
      } finally {
        setIsWithdrawing(false);
        setEstimatedGas(null);
      }
    },
    [isConnected, address, writeContractAsync, publicClient, estimateWithdrawGas, fetchPools]
  );

  // Estimate gas for harvest
  const estimateHarvestGas = useCallback(
    async (poolId: number) => {
      if (!publicClient || !address) return null;
      try {
        const gasEstimate = await publicClient.estimateContractGas({
          address: config.contracts.farming,
          abi: FARMING_ABI,
          functionName: "harvest",
          args: [BigInt(poolId)],
          account: address,
        });
        const gasPrice = await publicClient.getGasPrice();
        const totalCost = gasEstimate * gasPrice;
        setEstimatedGas(formatEther(totalCost));
        return formatEther(totalCost);
      } catch {
        return null;
      }
    },
    [publicClient, address]
  );

  // Harvest rewards
  const harvest = useCallback(
    async (poolId: number) => {
      if (!isConnected || !address) {
        toast({
          title: "Wallet not connected",
          description: "Please connect your wallet to continue.",
          variant: "destructive",
        });
        return;
      }

      setIsHarvesting(true);
      try {
        // Estimate gas first
        const gasEst = await estimateHarvestGas(poolId);

        const hash = await writeContractAsync({
          address: config.contracts.farming,
          abi: FARMING_ABI,
          functionName: "harvest",
          args: [BigInt(poolId)],
          chainId: sepolia.id,
        });

        toast({
          title: "Harvesting...",
          description: "Processing...",
        });

        await waitForTx(publicClient, hash);

        // Wait a bit for state to settle
        await new Promise(resolve => setTimeout(resolve, 1000));

        await fetchPools();

        toast({
          title: "Harvest successful",
          description: "Your rewards have been claimed!",
          variant: "success",
        });

        return hash;
      } catch (error: unknown) {
        toast({
          title: "Harvest failed",
          description: parseError(error),
          variant: "destructive",
        });
        throw error;
      } finally {
        setIsHarvesting(false);
        setEstimatedGas(null);
      }
    },
    [isConnected, address, writeContractAsync, publicClient, estimateHarvestGas, fetchPools]
  );

  // Calculate totals
  const totalTVL = pools.reduce((acc, pool) => acc + pool.tvl, 0);
  const totalUserStaked = pools.reduce((acc, pool) => {
    return acc + Number(formatEther(pool.userStaked)) * 200;
  }, 0);
  const totalPendingRewards = pools.reduce((acc, pool) => {
    return acc + Number(formatEther(pool.pendingRewards));
  }, 0);

  return {
    isDepositing,
    isWithdrawing,
    isHarvesting,
    isApproving,
    isLoadingPools,
    estimatedGas,
    pools,
    poolCount: poolLength ? Number(poolLength) : 0,
    totalTVL,
    totalUserStaked,
    totalPendingRewards,
    approve,
    deposit,
    withdraw,
    harvest,
    estimateDepositGas,
    estimateWithdrawGas,
    estimateHarvestGas,
    refetch: fetchPools,
  };
}
