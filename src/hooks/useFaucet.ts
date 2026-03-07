"use client";

import { useState, useCallback, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, usePublicClient } from "wagmi";
import { formatEther } from "viem";
import { sepolia } from "viem/chains";
import { config } from "@/config";
import { FAUCET_ABI } from "@/lib/contracts";
import { toast } from "./useToast";
import { parseError, waitForTx } from "@/lib/utils";

export function useFaucet() {
  const { address, isConnected } = useAccount();
  const [isClaiming, setIsClaiming] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [estimatedGas, setEstimatedGas] = useState<string | null>(null);

  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient({ chainId: sepolia.id });

  // Read last claim time
  const { data: lastClaimTime, refetch: refetchLastClaimTime } = useReadContract({
    address: config.contracts.faucet,
    abi: FAUCET_ABI,
    functionName: "lastClaimTime",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Read cooldown period
  const { data: cooldownPeriod } = useReadContract({
    address: config.contracts.faucet,
    abi: FAUCET_ABI,
    functionName: "cooldownPeriod",
  });

  // Read drip amount
  const { data: dripAmount } = useReadContract({
    address: config.contracts.faucet,
    abi: FAUCET_ABI,
    functionName: "dripAmount",
  });

  // Read faucet balance
  const { data: faucetBalance, refetch: refetchFaucetBalance } = useReadContract({
    address: config.contracts.faucet,
    abi: FAUCET_ABI,
    functionName: "balance",
  });

  // Read can claim
  const { data: canClaim, refetch: refetchCanClaim } = useReadContract({
    address: config.contracts.faucet,
    abi: FAUCET_ABI,
    functionName: "canClaim",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Calculate time remaining
  useEffect(() => {
    if (!lastClaimTime || !cooldownPeriod) {
      setTimeRemaining(0);
      return;
    }

    const calculateTimeRemaining = () => {
      const now = Math.floor(Date.now() / 1000);
      const cooldown = Number(cooldownPeriod);
      const lastClaim = Number(lastClaimTime);
      const nextClaimTime = lastClaim + cooldown;
      const remaining = Math.max(0, nextClaimTime - now);
      setTimeRemaining(remaining);
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [lastClaimTime, cooldownPeriod]);

  // Estimate gas for claim
  const estimateClaimGas = useCallback(async () => {
    if (!publicClient || !address) return null;
    try {
      const gasEstimate = await publicClient.estimateContractGas({
        address: config.contracts.faucet,
        abi: FAUCET_ABI,
        functionName: "claim",
        account: address,
      });
      const gasPrice = await publicClient.getGasPrice();
      const totalCost = gasEstimate * gasPrice;
      setEstimatedGas(formatEther(totalCost));
      return formatEther(totalCost);
    } catch {
      return null;
    }
  }, [publicClient, address]);

  const claim = useCallback(async () => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to continue.",
        variant: "destructive",
      });
      return;
    }

    if (!canClaim) {
      toast({
        title: "Cannot claim",
        description: "Please wait for the cooldown period to end.",
        variant: "destructive",
      });
      return;
    }

    setIsClaiming(true);
    try {
      // Estimate gas first
      const gasEst = await estimateClaimGas();

      const hash = await writeContractAsync({
        address: config.contracts.faucet,
        abi: FAUCET_ABI,
        functionName: "claim",
        chainId: sepolia.id,
      });

      toast({
        title: "Claiming...",
        description: "Processing...",
      });

      await waitForTx(publicClient, hash);

      // Wait a bit for state to settle
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Claim successful!",
        description: `You received ${config.faucet.amount} TITAN tokens.`,
        variant: "success",
      });

      // Refetch data
      await Promise.all([refetchLastClaimTime(), refetchCanClaim(), refetchFaucetBalance()]);
    } catch (error: unknown) {
      toast({
        title: "Claim failed",
        description: parseError(error),
        variant: "destructive",
      });
    } finally {
      setIsClaiming(false);
      setEstimatedGas(null);
    }
  }, [
    isConnected,
    address,
    canClaim,
    writeContractAsync,
    publicClient,
    estimateClaimGas,
    refetchLastClaimTime,
    refetchCanClaim,
    refetchFaucetBalance,
  ]);

  return {
    // State
    isClaiming,
    canClaim: canClaim ?? false,
    timeRemaining,
    estimatedGas,

    // Data
    claimAmount: dripAmount ? formatEther(dripAmount) : config.faucet.amount,
    cooldownPeriod: cooldownPeriod ? Number(cooldownPeriod) : config.faucet.cooldown,
    faucetBalance: faucetBalance ? formatEther(faucetBalance) : "0",

    // Actions
    claim,
    estimateClaimGas,
  };
}
