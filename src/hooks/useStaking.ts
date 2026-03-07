"use client";

import { useState, useCallback } from "react";
import { useAccount, useReadContract, useWriteContract, usePublicClient } from "wagmi";
import { parseEther, formatEther, formatGwei } from "viem";
import { sepolia } from "viem/chains";
import { config } from "@/config";
import { STAKING_ABI, TITAN_TOKEN_ABI } from "@/lib/contracts";
import { toast } from "./useToast";
import { parseError, waitForTx } from "@/lib/utils";

export function useStaking() {
  const { address, isConnected } = useAccount();
  const [isApproving, setIsApproving] = useState(false);
  const [isStaking, setIsStaking] = useState(false);
  const [isUnstaking, setIsUnstaking] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [estimatedGas, setEstimatedGas] = useState<string | null>(null);

  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient({ chainId: sepolia.id });

  // Read staked balance
  const { data: stakedBalance, refetch: refetchStakedBalance } = useReadContract({
    address: config.contracts.staking,
    abi: STAKING_ABI,
    functionName: "stakedBalance",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
          },
  });

  // Read pending rewards (earned)
  const { data: pendingRewards, refetch: refetchPendingRewards } = useReadContract({
    address: config.contracts.staking,
    abi: STAKING_ABI,
    functionName: "earned",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
          },
  });

  // Read total staked
  const { data: totalStaked, refetch: refetchTotalStaked } = useReadContract({
    address: config.contracts.staking,
    abi: STAKING_ABI,
    functionName: "totalStaked",
    query: {
          },
  });

  // Read reward rate (to calculate APR)
  const { data: rewardRate } = useReadContract({
    address: config.contracts.staking,
    abi: STAKING_ABI,
    functionName: "rewardRate",
  });

  // Read token balance
  const { data: tokenBalance, refetch: refetchTokenBalance } = useReadContract({
    address: config.contracts.titanToken,
    abi: TITAN_TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
          },
  });

  // Read allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: config.contracts.titanToken,
    abi: TITAN_TOKEN_ABI,
    functionName: "allowance",
    args: address ? [address, config.contracts.staking] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Estimate gas for stake
  const estimateStakeGas = useCallback(
    async (amount: string) => {
      if (!publicClient || !address || !amount) return null;
      try {
        const amountWei = parseEther(amount);
        const gasEstimate = await publicClient.estimateContractGas({
          address: config.contracts.staking,
          abi: STAKING_ABI,
          functionName: "stake",
          args: [amountWei],
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

  // Estimate gas for unstake
  const estimateUnstakeGas = useCallback(
    async (amount: string) => {
      if (!publicClient || !address || !amount) return null;
      try {
        const amountWei = parseEther(amount);
        const gasEstimate = await publicClient.estimateContractGas({
          address: config.contracts.staking,
          abi: STAKING_ABI,
          functionName: "unstake",
          args: [amountWei],
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

  const approve = useCallback(
    async (amount: string) => {
      if (!isConnected || !address) {
        toast({
          title: "Wallet not connected",
          description: "Please connect your wallet to continue.",
          variant: "destructive",
        });
        return;
      }

      setIsApproving(true);
      try {
        const hash = await writeContractAsync({
          address: config.contracts.titanToken,
          abi: TITAN_TOKEN_ABI,
          functionName: "approve",
          args: [config.contracts.staking, parseEther(amount)],
          chainId: sepolia.id,
        });

        toast({
          title: "Approving...",
          description: "Please confirm in your wallet",
        });

        await waitForTx(publicClient, hash);

        await refetchAllowance();

        toast({
          title: "Approval successful",
          description: "You can now stake your tokens.",
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
    [isConnected, address, writeContractAsync, publicClient, refetchAllowance]
  );

  const stake = useCallback(
    async (amount: string) => {
      if (!isConnected || !address) {
        toast({
          title: "Wallet not connected",
          description: "Please connect your wallet to continue.",
          variant: "destructive",
        });
        return;
      }

      setIsStaking(true);
      try {
        const amountWei = parseEther(amount);

        // Check allowance - need approval if undefined or less than amount
        if (allowance === undefined || allowance < amountWei) {
          await approve(amount);
        }

        // Estimate gas first
        const gasEst = await estimateStakeGas(amount);

        const hash = await writeContractAsync({
          address: config.contracts.staking,
          abi: STAKING_ABI,
          functionName: "stake",
          args: [amountWei],
          chainId: sepolia.id,
        });

        toast({
          title: "Staking...",
          description: "Processing...",
        });

        await waitForTx(publicClient, hash);

        // Wait a bit for state to settle
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Refetch all data
        await Promise.all([
          refetchStakedBalance(),
          refetchTokenBalance(),
          refetchTotalStaked(),
          refetchPendingRewards(),
        ]);

        toast({
          title: "Staking successful",
          description: `Successfully staked ${amount} TITAN`,
          variant: "success",
        });

        return hash;
      } catch (error: unknown) {
        toast({
          title: "Staking failed",
          description: parseError(error),
          variant: "destructive",
        });
        throw error;
      } finally {
        setIsStaking(false);
        setEstimatedGas(null);
      }
    },
    [
      isConnected,
      address,
      allowance,
      approve,
      writeContractAsync,
      publicClient,
      estimateStakeGas,
      refetchStakedBalance,
      refetchTokenBalance,
      refetchTotalStaked,
      refetchPendingRewards,
    ]
  );

  const unstake = useCallback(
    async (amount: string) => {
      if (!isConnected || !address) {
        toast({
          title: "Wallet not connected",
          description: "Please connect your wallet to continue.",
          variant: "destructive",
        });
        return;
      }

      setIsUnstaking(true);
      try {
        // Estimate gas first
        const gasEst = await estimateUnstakeGas(amount);

        const hash = await writeContractAsync({
          address: config.contracts.staking,
          abi: STAKING_ABI,
          functionName: "unstake",
          args: [parseEther(amount)],
          chainId: sepolia.id,
        });

        toast({
          title: "Unstaking...",
          description: "Processing...",
        });

        await waitForTx(publicClient, hash);

        // Wait a bit for state to settle
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Refetch data
        await Promise.all([
          refetchStakedBalance(),
          refetchTokenBalance(),
          refetchTotalStaked(),
          refetchPendingRewards(),
        ]);

        toast({
          title: "Unstaking successful",
          description: `Successfully unstaked ${amount} TITAN`,
          variant: "success",
        });

        return hash;
      } catch (error: unknown) {
        toast({
          title: "Unstaking failed",
          description: parseError(error),
          variant: "destructive",
        });
        throw error;
      } finally {
        setIsUnstaking(false);
        setEstimatedGas(null);
      }
    },
    [
      isConnected,
      address,
      writeContractAsync,
      publicClient,
      estimateUnstakeGas,
      refetchStakedBalance,
      refetchTokenBalance,
      refetchTotalStaked,
      refetchPendingRewards,
    ]
  );

  const claimRewards = useCallback(async () => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsClaiming(true);
    try {
      // Estimate gas
      let gasEst: string | null = null;
      if (publicClient) {
        try {
          const gasEstimate = await publicClient.estimateContractGas({
            address: config.contracts.staking,
            abi: STAKING_ABI,
            functionName: "claimRewards",
            account: address,
          });
          const gasPrice = await publicClient.getGasPrice();
          gasEst = formatEther(gasEstimate * gasPrice);
        } catch {
          // Ignore estimation errors
        }
      }

      const hash = await writeContractAsync({
        address: config.contracts.staking,
        abi: STAKING_ABI,
        functionName: "claimRewards",
        chainId: sepolia.id,
      });

      toast({
        title: "Claiming...",
        description: "Processing...",
      });

      await waitForTx(publicClient, hash);

      // Wait a bit for state to settle
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Refetch data
      await Promise.all([refetchPendingRewards(), refetchTokenBalance()]);

      toast({
        title: "Claim successful",
        description: "Your rewards have been claimed!",
        variant: "success",
      });

      return hash;
    } catch (error: unknown) {
      toast({
        title: "Claim failed",
        description: parseError(error),
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsClaiming(false);
    }
  }, [
    isConnected,
    address,
    writeContractAsync,
    publicClient,
    refetchPendingRewards,
    refetchTokenBalance,
  ]);

  return {
    // State
    isApproving,
    isStaking,
    isUnstaking,
    isClaiming,
    estimatedGas,

    // Data
    stakedBalance: stakedBalance ? formatEther(stakedBalance) : "0",
    pendingRewards: pendingRewards ? formatEther(pendingRewards) : "0",
    totalStaked: totalStaked ? formatEther(totalStaked) : "0",
    apr: rewardRate && totalStaked && totalStaked > BigInt(0)
      ? Math.min((Number(rewardRate) * 31536000 / 1e18 * 100) / (Number(totalStaked) / 1e18), 999)
      : 42.5,
    tokenBalance: tokenBalance ? formatEther(tokenBalance) : "0",
    allowance: allowance ? formatEther(allowance) : "0",

    // Actions
    approve,
    stake,
    unstake,
    claimRewards,
    estimateStakeGas,
    estimateUnstakeGas,

    // Refetch
    refetch: () =>
      Promise.all([
        refetchStakedBalance(),
        refetchPendingRewards(),
        refetchTotalStaked(),
        refetchTokenBalance(),
        refetchAllowance(),
      ]),
  };
}
