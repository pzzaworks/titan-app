"use client";

import { useState, useCallback } from "react";
import { useAccount, useReadContract, useWriteContract, usePublicClient } from "wagmi";
import { parseEther, formatEther } from "viem";
import { sepolia } from "viem/chains";
import { config } from "@/config";
import { STAKED_TITAN_ABI, TITAN_TOKEN_ABI } from "@/lib/contracts";
import { toast } from "./useToast";
import { parseError, waitForTx } from "@/lib/utils";

export function useSTitan() {
  const { address, isConnected } = useAccount();
  const [isApproving, setIsApproving] = useState(false);
  const [isDepositing, setIsDepositing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [estimatedGas, setEstimatedGas] = useState<string | null>(null);

  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient({ chainId: sepolia.id });

  // Read sTitan balance
  const { data: sTitanBalance, refetch: refetchSTitanBalance } = useReadContract({
    address: config.contracts.stakedTitan,
    abi: STAKED_TITAN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && config.contracts.stakedTitan !== "0x0000000000000000000000000000000000000000",
          },
  });

  // Read TITAN value of sTitan holdings
  const { data: titanValue, refetch: refetchTitanValue } = useReadContract({
    address: config.contracts.stakedTitan,
    abi: STAKED_TITAN_ABI,
    functionName: "titanBalanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && config.contracts.stakedTitan !== "0x0000000000000000000000000000000000000000",
          },
  });

  // Read exchange rate
  const { data: exchangeRate, refetch: refetchExchangeRate } = useReadContract({
    address: config.contracts.stakedTitan,
    abi: STAKED_TITAN_ABI,
    functionName: "exchangeRate",
    query: {
      enabled: config.contracts.stakedTitan !== "0x0000000000000000000000000000000000000000",
          },
  });

  // Read total TITAN in contract
  const { data: totalTitan, refetch: refetchTotalTitan } = useReadContract({
    address: config.contracts.stakedTitan,
    abi: STAKED_TITAN_ABI,
    functionName: "totalTitan",
    query: {
      enabled: config.contracts.stakedTitan !== "0x0000000000000000000000000000000000000000",
          },
  });

  // Read total sTitan supply
  const { data: totalSupply, refetch: refetchTotalSupply } = useReadContract({
    address: config.contracts.stakedTitan,
    abi: STAKED_TITAN_ABI,
    functionName: "totalSupply",
    query: {
      enabled: config.contracts.stakedTitan !== "0x0000000000000000000000000000000000000000",
          },
  });

  // Read TITAN token balance
  const { data: tokenBalance, refetch: refetchTokenBalance } = useReadContract({
    address: config.contracts.titanToken,
    abi: TITAN_TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
          },
  });

  // Read allowance for sTitan contract
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: config.contracts.titanToken,
    abi: TITAN_TOKEN_ABI,
    functionName: "allowance",
    args: address ? [address, config.contracts.stakedTitan] : undefined,
    query: {
      enabled: !!address && config.contracts.stakedTitan !== "0x0000000000000000000000000000000000000000",
    },
  });

  // Preview deposit
  const { data: previewDepositResult } = useReadContract({
    address: config.contracts.stakedTitan,
    abi: STAKED_TITAN_ABI,
    functionName: "previewDeposit",
    args: [parseEther("1")],
    query: {
      enabled: config.contracts.stakedTitan !== "0x0000000000000000000000000000000000000000",
    },
  });

  // Estimate gas for deposit
  const estimateDepositGas = useCallback(
    async (amount: string) => {
      if (!publicClient || !address || !amount) return null;
      try {
        const amountWei = parseEther(amount);
        const gasEstimate = await publicClient.estimateContractGas({
          address: config.contracts.stakedTitan,
          abi: STAKED_TITAN_ABI,
          functionName: "deposit",
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

  // Estimate gas for withdraw
  const estimateWithdrawGas = useCallback(
    async (amount: string) => {
      if (!publicClient || !address || !amount) return null;
      try {
        const amountWei = parseEther(amount);
        const gasEstimate = await publicClient.estimateContractGas({
          address: config.contracts.stakedTitan,
          abi: STAKED_TITAN_ABI,
          functionName: "withdraw",
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
          args: [config.contracts.stakedTitan, parseEther(amount)],
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
          description: "You can now deposit your tokens.",
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

  const deposit = useCallback(
    async (amount: string) => {
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
        const amountWei = parseEther(amount);

        // Check allowance - need approval if undefined or less than amount
        if (allowance === undefined || allowance < amountWei) {
          await approve(amount);
        }

        // Estimate gas first
        const gasEst = await estimateDepositGas(amount);

        const hash = await writeContractAsync({
          address: config.contracts.stakedTitan,
          abi: STAKED_TITAN_ABI,
          functionName: "deposit",
          args: [amountWei],
          chainId: sepolia.id,
        });

        toast({
          title: "Depositing...",
          description: gasEst ? `Estimated gas: ${parseFloat(gasEst).toFixed(6)} ETH` : "Processing...",
        });

        await waitForTx(publicClient, hash);

        // Wait a bit for state to settle
        await new Promise(resolve => setTimeout(resolve, 1000));

        await Promise.all([
          refetchSTitanBalance(),
          refetchTitanValue(),
          refetchTokenBalance(),
          refetchTotalTitan(),
          refetchTotalSupply(),
          refetchExchangeRate(),
        ]);

        toast({
          title: "Deposit successful",
          description: `Successfully deposited ${amount} TITAN for sTITAN`,
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
    [
      isConnected,
      address,
      allowance,
      approve,
      writeContractAsync,
      publicClient,
      estimateDepositGas,
      refetchSTitanBalance,
      refetchTitanValue,
      refetchTokenBalance,
      refetchTotalTitan,
      refetchTotalSupply,
      refetchExchangeRate,
    ]
  );

  const withdraw = useCallback(
    async (amount: string) => {
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
        const gasEst = await estimateWithdrawGas(amount);

        const hash = await writeContractAsync({
          address: config.contracts.stakedTitan,
          abi: STAKED_TITAN_ABI,
          functionName: "withdraw",
          args: [parseEther(amount)],
          chainId: sepolia.id,
        });

        toast({
          title: "Withdrawing...",
          description: gasEst ? `Estimated gas: ${parseFloat(gasEst).toFixed(6)} ETH` : "Processing...",
        });

        await waitForTx(publicClient, hash);

        // Wait a bit for state to settle
        await new Promise(resolve => setTimeout(resolve, 1000));

        await Promise.all([
          refetchSTitanBalance(),
          refetchTitanValue(),
          refetchTokenBalance(),
          refetchTotalTitan(),
          refetchTotalSupply(),
          refetchExchangeRate(),
        ]);

        toast({
          title: "Withdrawal successful",
          description: `Successfully withdrew sTITAN for TITAN`,
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
    [
      isConnected,
      address,
      writeContractAsync,
      publicClient,
      estimateWithdrawGas,
      refetchSTitanBalance,
      refetchTitanValue,
      refetchTokenBalance,
      refetchTotalTitan,
      refetchTotalSupply,
      refetchExchangeRate,
    ]
  );

  const withdrawAll = useCallback(async () => {
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
      // Estimate gas
      let gasEst: string | null = null;
      if (publicClient) {
        try {
          const gasEstimate = await publicClient.estimateContractGas({
            address: config.contracts.stakedTitan,
            abi: STAKED_TITAN_ABI,
            functionName: "withdrawAll",
            account: address,
          });
          const gasPrice = await publicClient.getGasPrice();
          gasEst = formatEther(gasEstimate * gasPrice);
        } catch {
          // Ignore estimation errors
        }
      }

      const hash = await writeContractAsync({
        address: config.contracts.stakedTitan,
        abi: STAKED_TITAN_ABI,
        functionName: "withdrawAll",
        chainId: sepolia.id,
      });

      toast({
        title: "Withdrawing all...",
        description: gasEst ? `Estimated gas: ${parseFloat(gasEst).toFixed(6)} ETH` : "Processing...",
      });

      await waitForTx(publicClient, hash);

      // Wait a bit for state to settle
      await new Promise(resolve => setTimeout(resolve, 1000));

      await Promise.all([
        refetchSTitanBalance(),
        refetchTitanValue(),
        refetchTokenBalance(),
        refetchTotalTitan(),
        refetchTotalSupply(),
        refetchExchangeRate(),
      ]);

      toast({
        title: "Withdrawal successful",
        description: "Successfully withdrew all sTITAN for TITAN",
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
    }
  }, [
    isConnected,
    address,
    writeContractAsync,
    publicClient,
    refetchSTitanBalance,
    refetchTitanValue,
    refetchTokenBalance,
    refetchTotalTitan,
    refetchTotalSupply,
    refetchExchangeRate,
  ]);

  // Calculate exchange rate as a readable number
  const exchangeRateFormatted = exchangeRate
    ? (Number(exchangeRate) / 1e18).toFixed(4)
    : "1.0000";

  return {
    // State
    isApproving,
    isDepositing,
    isWithdrawing,
    estimatedGas,

    // Data
    sTitanBalance: sTitanBalance ? formatEther(sTitanBalance) : "0",
    titanValue: titanValue ? formatEther(titanValue) : "0",
    exchangeRate: exchangeRateFormatted,
    totalTitan: totalTitan ? formatEther(totalTitan) : "0",
    totalSupply: totalSupply ? formatEther(totalSupply) : "0",
    tokenBalance: tokenBalance ? formatEther(tokenBalance) : "0",
    allowance: allowance ? formatEther(allowance) : "0",

    // Actions
    approve,
    deposit,
    withdraw,
    withdrawAll,
    estimateDepositGas,
    estimateWithdrawGas,

    // Refetch
    refetch: () =>
      Promise.all([
        refetchSTitanBalance(),
        refetchTitanValue(),
        refetchTokenBalance(),
        refetchTotalTitan(),
        refetchTotalSupply(),
        refetchExchangeRate(),
        refetchAllowance(),
      ]),
  };
}
