"use client";

import { useState, useCallback } from "react";
import { useAccount, useReadContract, useReadContracts, useWriteContract, usePublicClient } from "wagmi";
import { parseEther, formatEther } from "viem";
import { sepolia } from "viem/chains";
import { config } from "@/config";
import { VAULT_ABI, ERC20_ABI } from "@/lib/contracts";
import { toast } from "./useToast";
import { parseError, waitForTx } from "@/lib/utils";

export interface Position {
  collateral: bigint;
  debt: bigint;
  collateralValue: bigint;
  collateralRatio: bigint;
  maxBorrow: bigint;
}

export function useVault() {
  const { address, isConnected } = useAccount();
  const [isDepositing, setIsDepositing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isBorrowing, setIsBorrowing] = useState(false);
  const [isRepaying, setIsRepaying] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient({ chainId: sepolia.id });

  // Read user position
  const { data: positionData, refetch: refetchPosition } = useReadContract({
    address: config.contracts.vault,
    abi: VAULT_ABI,
    functionName: "getPosition",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Read global stats
  const { data: globalStats } = useReadContracts({
    contracts: [
      {
        address: config.contracts.vault,
        abi: VAULT_ABI,
        functionName: "titanPrice",
      },
      {
        address: config.contracts.vault,
        abi: VAULT_ABI,
        functionName: "totalCollateral",
      },
      {
        address: config.contracts.vault,
        abi: VAULT_ABI,
        functionName: "totalDebt",
      },
      {
        address: config.contracts.vault,
        abi: VAULT_ABI,
        functionName: "MCR",
      },
      {
        address: config.contracts.vault,
        abi: VAULT_ABI,
        functionName: "LIQUIDATION_THRESHOLD",
      },
      {
        address: config.contracts.vault,
        abi: VAULT_ABI,
        functionName: "MIN_DEBT",
      },
    ],
  });

  // Read user balances
  const { data: titanBalance, refetch: refetchTitanBalance } = useReadContract({
    address: config.contracts.titanToken,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const { data: tusdBalance, refetch: refetchTusdBalance } = useReadContract({
    address: config.contracts.titanUsd,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Read allowances
  const { data: titanAllowance, refetch: refetchTitanAllowance } = useReadContract({
    address: config.contracts.titanToken,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, config.contracts.vault] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const { data: tusdAllowance, refetch: refetchTusdAllowance } = useReadContract({
    address: config.contracts.titanUsd,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, config.contracts.vault] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const refetchAll = useCallback(async () => {
    await Promise.all([
      refetchPosition(),
      refetchTitanBalance(),
      refetchTusdBalance(),
      refetchTitanAllowance(),
      refetchTusdAllowance(),
    ]);
  }, [refetchPosition, refetchTitanBalance, refetchTusdBalance, refetchTitanAllowance, refetchTusdAllowance]);

  // Approve TITAN
  const approveTitan = useCallback(
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
        toast({
          title: "Approving TITAN...",
          description: "Please confirm in your wallet",
        });

        const hash = await writeContractAsync({
          address: config.contracts.titanToken,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [config.contracts.vault, parseEther(amount)],
          chainId: sepolia.id,
        });

        await waitForTx(publicClient, hash);
        await refetchTitanAllowance();

        toast({
          title: "Approval successful",
          description: "You can now deposit TITAN.",
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
    [isConnected, address, writeContractAsync, publicClient, refetchTitanAllowance]
  );

  // Approve tUSD
  const approveTusd = useCallback(
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
        toast({
          title: "Approving tUSD...",
          description: "Please confirm in your wallet",
        });

        const hash = await writeContractAsync({
          address: config.contracts.titanUsd,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [config.contracts.vault, parseEther(amount)],
          chainId: sepolia.id,
        });

        await waitForTx(publicClient, hash);
        await refetchTusdAllowance();

        toast({
          title: "Approval successful",
          description: "You can now repay tUSD.",
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
    [isConnected, address, writeContractAsync, publicClient, refetchTusdAllowance]
  );

  // Deposit collateral
  const depositCollateral = useCallback(
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
        toast({
          title: "Depositing collateral...",
          description: "Processing...",
        });

        const hash = await writeContractAsync({
          address: config.contracts.vault,
          abi: VAULT_ABI,
          functionName: "depositCollateral",
          args: [parseEther(amount)],
          chainId: sepolia.id,
        });

        await waitForTx(publicClient, hash);
        await refetchAll();

        toast({
          title: "Deposit successful",
          description: `Deposited ${amount} TITAN as collateral.`,
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
      }
    },
    [isConnected, address, writeContractAsync, publicClient, refetchAll]
  );

  // Withdraw collateral
  const withdrawCollateral = useCallback(
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
        toast({
          title: "Withdrawing collateral...",
          description: "Processing...",
        });

        const hash = await writeContractAsync({
          address: config.contracts.vault,
          abi: VAULT_ABI,
          functionName: "withdrawCollateral",
          args: [parseEther(amount)],
          chainId: sepolia.id,
        });

        await waitForTx(publicClient, hash);
        await refetchAll();

        toast({
          title: "Withdrawal successful",
          description: `Withdrew ${amount} TITAN.`,
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
    },
    [isConnected, address, writeContractAsync, publicClient, refetchAll]
  );

  // Borrow tUSD
  const borrow = useCallback(
    async (amount: string) => {
      if (!isConnected || !address) {
        toast({
          title: "Wallet not connected",
          description: "Please connect your wallet to continue.",
          variant: "destructive",
        });
        return;
      }

      setIsBorrowing(true);
      try {
        toast({
          title: "Borrowing tUSD...",
          description: "Processing...",
        });

        const hash = await writeContractAsync({
          address: config.contracts.vault,
          abi: VAULT_ABI,
          functionName: "borrow",
          args: [parseEther(amount)],
          chainId: sepolia.id,
        });

        await waitForTx(publicClient, hash);
        await refetchAll();

        toast({
          title: "Borrow successful",
          description: `Borrowed ${amount} tUSD.`,
          variant: "success",
        });

        return hash;
      } catch (error: unknown) {
        toast({
          title: "Borrow failed",
          description: parseError(error),
          variant: "destructive",
        });
        throw error;
      } finally {
        setIsBorrowing(false);
      }
    },
    [isConnected, address, writeContractAsync, publicClient, refetchAll]
  );

  // Repay tUSD
  const repay = useCallback(
    async (amount: string) => {
      if (!isConnected || !address) {
        toast({
          title: "Wallet not connected",
          description: "Please connect your wallet to continue.",
          variant: "destructive",
        });
        return;
      }

      setIsRepaying(true);
      try {
        toast({
          title: "Repaying debt...",
          description: "Processing...",
        });

        const hash = await writeContractAsync({
          address: config.contracts.vault,
          abi: VAULT_ABI,
          functionName: "repay",
          args: [parseEther(amount)],
          chainId: sepolia.id,
        });

        await waitForTx(publicClient, hash);
        await refetchAll();

        toast({
          title: "Repayment successful",
          description: `Repaid ${amount} tUSD.`,
          variant: "success",
        });

        return hash;
      } catch (error: unknown) {
        toast({
          title: "Repayment failed",
          description: parseError(error),
          variant: "destructive",
        });
        throw error;
      } finally {
        setIsRepaying(false);
      }
    },
    [isConnected, address, writeContractAsync, publicClient, refetchAll]
  );

  // Deposit and borrow in one tx
  const depositAndBorrow = useCallback(
    async (collateralAmount: string, borrowAmount: string) => {
      if (!isConnected || !address) {
        toast({
          title: "Wallet not connected",
          description: "Please connect your wallet to continue.",
          variant: "destructive",
        });
        return;
      }

      setIsDepositing(true);
      setIsBorrowing(true);
      try {
        toast({
          title: "Opening position...",
          description: "Processing...",
        });

        const hash = await writeContractAsync({
          address: config.contracts.vault,
          abi: VAULT_ABI,
          functionName: "depositAndBorrow",
          args: [parseEther(collateralAmount), parseEther(borrowAmount)],
          chainId: sepolia.id,
        });

        await waitForTx(publicClient, hash);
        await refetchAll();

        toast({
          title: "Position opened",
          description: `Deposited ${collateralAmount} TITAN, borrowed ${borrowAmount} tUSD.`,
          variant: "success",
        });

        return hash;
      } catch (error: unknown) {
        toast({
          title: "Transaction failed",
          description: parseError(error),
          variant: "destructive",
        });
        throw error;
      } finally {
        setIsDepositing(false);
        setIsBorrowing(false);
      }
    },
    [isConnected, address, writeContractAsync, publicClient, refetchAll]
  );

  // Close position
  const closePosition = useCallback(
    async () => {
      if (!isConnected || !address) {
        toast({
          title: "Wallet not connected",
          description: "Please connect your wallet to continue.",
          variant: "destructive",
        });
        return;
      }

      setIsClosing(true);
      try {
        toast({
          title: "Closing position...",
          description: "Processing...",
        });

        const hash = await writeContractAsync({
          address: config.contracts.vault,
          abi: VAULT_ABI,
          functionName: "closePosition",
          args: [],
          chainId: sepolia.id,
        });

        await waitForTx(publicClient, hash);
        await refetchAll();

        toast({
          title: "Position closed",
          description: "Your position has been closed.",
          variant: "success",
        });

        return hash;
      } catch (error: unknown) {
        toast({
          title: "Close failed",
          description: parseError(error),
          variant: "destructive",
        });
        throw error;
      } finally {
        setIsClosing(false);
      }
    },
    [isConnected, address, writeContractAsync, publicClient, refetchAll]
  );

  // Parse position data
  const position: Position | null = positionData
    ? {
        collateral: positionData[0],
        debt: positionData[1],
        collateralValue: positionData[2],
        collateralRatio: positionData[3],
        maxBorrow: positionData[4],
      }
    : null;

  // Parse global stats
  const titanPrice = globalStats?.[0]?.result as bigint | undefined;
  const totalCollateral = globalStats?.[1]?.result as bigint | undefined;
  const totalDebt = globalStats?.[2]?.result as bigint | undefined;
  const mcr = globalStats?.[3]?.result as bigint | undefined;
  const liquidationThreshold = globalStats?.[4]?.result as bigint | undefined;
  const minDebt = globalStats?.[5]?.result as bigint | undefined;

  return {
    // Position
    position,
    // Balances
    titanBalance: titanBalance as bigint | undefined,
    tusdBalance: tusdBalance as bigint | undefined,
    // Allowances
    titanAllowance: titanAllowance as bigint | undefined,
    tusdAllowance: tusdAllowance as bigint | undefined,
    // Global stats
    titanPrice,
    totalCollateral,
    totalDebt,
    mcr,
    liquidationThreshold,
    minDebt,
    // Loading states
    isDepositing,
    isWithdrawing,
    isBorrowing,
    isRepaying,
    isClosing,
    isApproving,
    // Actions
    approveTitan,
    approveTusd,
    depositCollateral,
    withdrawCollateral,
    borrow,
    repay,
    depositAndBorrow,
    closePosition,
    refetch: refetchAll,
  };
}
