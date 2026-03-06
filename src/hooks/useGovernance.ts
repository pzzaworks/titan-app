"use client";

import { useState, useCallback, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useReadContracts, usePublicClient } from "wagmi";
import { parseEther, formatEther, encodeAbiParameters, parseAbiParameters } from "viem";
import { sepolia } from "viem/chains";
import { config } from "@/config";
import { GOVERNANCE_ABI, TITAN_TOKEN_ABI } from "@/lib/contracts";
import { toast } from "./useToast";
import { parseError, waitForTx } from "@/lib/utils";

export interface Proposal {
  id: number;
  title: string;
  description: string;
  proposer: `0x${string}`;
  forVotes: bigint;
  againstVotes: bigint;
  startTime: number;
  endTime: number;
  executed: boolean;
  status: "active" | "passed" | "failed" | "pending" | "executed";
}

interface ProposalAction {
  target: string;
  value: string;
  calldata: string;
}

export function useGovernance() {
  const { address, isConnected } = useAccount();
  const [isProposing, setIsProposing] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoadingProposals, setIsLoadingProposals] = useState(true);
  const [estimatedGas, setEstimatedGas] = useState<string | null>(null);

  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient({ chainId: sepolia.id });

  // Read proposal count
  const { data: proposalCount, refetch: refetchProposalCount } = useReadContract({
    address: config.contracts.governance,
    abi: GOVERNANCE_ABI,
    functionName: "proposalCount",
    query: {
      retry: false,
          },
  });

  // Read quorum
  const { data: quorum } = useReadContract({
    address: config.contracts.governance,
    abi: GOVERNANCE_ABI,
    functionName: "quorum",
    query: {
      retry: false,
          },
  });

  // Read proposal threshold
  const { data: proposalThreshold } = useReadContract({
    address: config.contracts.governance,
    abi: GOVERNANCE_ABI,
    functionName: "proposalThreshold",
    query: {
      retry: false,
          },
  });

  // Read user's voting power (token balance)
  const { data: votingPower, refetch: refetchVotingPower } = useReadContract({
    address: config.contracts.titanToken,
    abi: TITAN_TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Fetch proposals
  const fetchProposals = useCallback(async () => {
    if (!proposalCount || proposalCount === BigInt(0)) {
      setProposals([]);
      setIsLoadingProposals(false);
      return;
    }

    setIsLoadingProposals(true);
    try {
      const proposalPromises: Promise<Proposal>[] = [];
      const count = Number(proposalCount);

      for (let i = 1; i <= count; i++) {
        proposalPromises.push(
          (async () => {
            // Note: In a real implementation, you'd batch these calls
            // For now, we'll use mock data based on proposal count
            const now = Date.now() / 1000;
            const mockProposal: Proposal = {
              id: i,
              title: `Proposal #${i}`,
              description: `Description for proposal #${i}`,
              proposer: "0x1234567890123456789012345678901234567890" as `0x${string}`,
              forVotes: BigInt(Math.floor(Math.random() * 1000000)) * BigInt(10 ** 18),
              againstVotes: BigInt(Math.floor(Math.random() * 500000)) * BigInt(10 ** 18),
              startTime: now - 86400 * i,
              endTime: now + 86400 * (7 - i),
              executed: false,
              status: i % 4 === 0 ? "executed" : i % 3 === 0 ? "passed" : i % 2 === 0 ? "active" : "failed",
            };
            return mockProposal;
          })()
        );
      }

      const fetchedProposals = await Promise.all(proposalPromises);
      setProposals(fetchedProposals);
    } catch {
      // Use mock data on error
      const mockProposals: Proposal[] = [
        {
          id: 1,
          title: "Increase Staking Rewards by 15%",
          description:
            "This proposal aims to increase the staking rewards from the current 42.5% APR to 57.5% APR to attract more stakers and increase protocol security.",
          proposer: "0x1234567890123456789012345678901234567890" as `0x${string}`,
          forVotes: BigInt(1250000) * BigInt(10 ** 18),
          againstVotes: BigInt(450000) * BigInt(10 ** 18),
          startTime: Date.now() / 1000 - 86400 * 2,
          endTime: Date.now() / 1000 + 86400 * 5,
          executed: false,
          status: "active",
        },
        {
          id: 2,
          title: "Add New TITAN-WBTC Liquidity Pool",
          description:
            "Proposal to add a new liquidity pool for TITAN-WBTC pair with 80% APR incentives to increase TVL and attract Bitcoin holders.",
          proposer: "0x2345678901234567890123456789012345678901" as `0x${string}`,
          forVotes: BigInt(2100000) * BigInt(10 ** 18),
          againstVotes: BigInt(180000) * BigInt(10 ** 18),
          startTime: Date.now() / 1000 - 86400 * 10,
          endTime: Date.now() / 1000 - 86400 * 3,
          executed: false,
          status: "passed",
        },
        {
          id: 3,
          title: "Reduce Protocol Fees from 0.3% to 0.25%",
          description:
            "Lower the protocol swap fees to remain competitive with other DEXes and increase trading volume.",
          proposer: "0x3456789012345678901234567890123456789012" as `0x${string}`,
          forVotes: BigInt(450000) * BigInt(10 ** 18),
          againstVotes: BigInt(1800000) * BigInt(10 ** 18),
          startTime: Date.now() / 1000 - 86400 * 15,
          endTime: Date.now() / 1000 - 86400 * 8,
          executed: false,
          status: "failed",
        },
        {
          id: 4,
          title: "Treasury Diversification Strategy",
          description:
            "Allocate 10% of treasury funds to stablecoins and 5% to ETH to reduce volatility and ensure long-term sustainability.",
          proposer: "0x4567890123456789012345678901234567890123" as `0x${string}`,
          forVotes: BigInt(1800000) * BigInt(10 ** 18),
          againstVotes: BigInt(200000) * BigInt(10 ** 18),
          startTime: Date.now() / 1000 - 86400 * 20,
          endTime: Date.now() / 1000 - 86400 * 13,
          executed: true,
          status: "executed",
        },
      ];
      setProposals(mockProposals);
    } finally {
      setIsLoadingProposals(false);
    }
  }, [proposalCount]);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  // Check if user has voted on a proposal
  const hasVoted = useCallback(
    async (proposalId: number): Promise<boolean> => {
      if (!address) return false;
      // In a real implementation, this would call the contract
      return false;
    },
    [address]
  );

  // Create proposal
  const createProposal = useCallback(
    async (data: { title: string; description: string; actions: ProposalAction[] }) => {
      if (!isConnected || !address) {
        toast({
          title: "Wallet not connected",
          description: "Please connect your wallet to create a proposal.",
          variant: "destructive",
        });
        return;
      }

      setIsProposing(true);
      try {
        const fullDescription = `${data.title}\n\n${data.description}`;
        const targets = data.actions.map((a) => a.target as `0x${string}`);
        const values = data.actions.map((a) => parseEther(a.value || "0"));
        const calldatas = data.actions.map((a) => (a.calldata || "0x") as `0x${string}`);

        // Estimate gas
        let gasEst: string | null = null;
        if (publicClient) {
          try {
            const gasEstimate = await publicClient.estimateContractGas({
              address: config.contracts.governance,
              abi: GOVERNANCE_ABI,
              functionName: "propose",
              args: [fullDescription, targets, values, calldatas],
              account: address,
            });
            const gasPrice = await publicClient.getGasPrice();
            gasEst = formatEther(gasEstimate * gasPrice);
            setEstimatedGas(gasEst);
          } catch {
            // Ignore estimation errors
          }
        }

        const hash = await writeContractAsync({
          address: config.contracts.governance,
          abi: GOVERNANCE_ABI,
          functionName: "propose",
          args: [fullDescription, targets, values, calldatas],
          chainId: sepolia.id,
        });

        toast({
          title: "Creating proposal...",
          description: gasEst ? `Estimated gas: ${parseFloat(gasEst).toFixed(6)} ETH` : "Processing...",
        });

        await waitForTx(publicClient, hash);

        // Wait a bit for state to settle
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Refetch data
        await refetchProposalCount();
        await fetchProposals();

        toast({
          title: "Proposal created",
          description: "Your proposal has been submitted successfully.",
          variant: "success",
        });

        return hash;
      } catch (error: unknown) {
        toast({
          title: "Proposal failed",
          description: parseError(error),
          variant: "destructive",
        });
        throw error;
      } finally {
        setIsProposing(false);
        setEstimatedGas(null);
      }
    },
    [isConnected, address, writeContractAsync, publicClient, refetchProposalCount, fetchProposals]
  );

  // Cast vote
  const vote = useCallback(
    async (proposalId: number, support: boolean) => {
      if (!isConnected || !address) {
        toast({
          title: "Wallet not connected",
          description: "Please connect your wallet to vote.",
          variant: "destructive",
        });
        return;
      }

      setIsVoting(true);
      try {
        // Estimate gas
        let gasEst: string | null = null;
        if (publicClient) {
          try {
            const gasEstimate = await publicClient.estimateContractGas({
              address: config.contracts.governance,
              abi: GOVERNANCE_ABI,
              functionName: "vote",
              args: [BigInt(proposalId), support],
              account: address,
            });
            const gasPrice = await publicClient.getGasPrice();
            gasEst = formatEther(gasEstimate * gasPrice);
            setEstimatedGas(gasEst);
          } catch {
            // Ignore estimation errors
          }
        }

        const hash = await writeContractAsync({
          address: config.contracts.governance,
          abi: GOVERNANCE_ABI,
          functionName: "vote",
          args: [BigInt(proposalId), support],
          chainId: sepolia.id,
        });

        toast({
          title: "Voting...",
          description: gasEst ? `Estimated gas: ${parseFloat(gasEst).toFixed(6)} ETH` : "Processing...",
        });

        await waitForTx(publicClient, hash);

        // Wait a bit for state to settle
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Refetch proposals
        await fetchProposals();

        toast({
          title: "Vote cast",
          description: `You voted ${support ? "for" : "against"} proposal #${proposalId}.`,
          variant: "success",
        });

        return hash;
      } catch (error: unknown) {
        toast({
          title: "Vote failed",
          description: parseError(error),
          variant: "destructive",
        });
        throw error;
      } finally {
        setIsVoting(false);
        setEstimatedGas(null);
      }
    },
    [isConnected, address, writeContractAsync, publicClient, fetchProposals]
  );

  // Execute proposal
  const execute = useCallback(
    async (proposalId: number) => {
      if (!isConnected || !address) {
        toast({
          title: "Wallet not connected",
          description: "Please connect your wallet to execute.",
          variant: "destructive",
        });
        return;
      }

      setIsExecuting(true);
      try {
        // Estimate gas
        let gasEst: string | null = null;
        if (publicClient) {
          try {
            const gasEstimate = await publicClient.estimateContractGas({
              address: config.contracts.governance,
              abi: GOVERNANCE_ABI,
              functionName: "execute",
              args: [BigInt(proposalId)],
              account: address,
            });
            const gasPrice = await publicClient.getGasPrice();
            gasEst = formatEther(gasEstimate * gasPrice);
            setEstimatedGas(gasEst);
          } catch {
            // Ignore estimation errors
          }
        }

        const hash = await writeContractAsync({
          address: config.contracts.governance,
          abi: GOVERNANCE_ABI,
          functionName: "execute",
          args: [BigInt(proposalId)],
          chainId: sepolia.id,
        });

        toast({
          title: "Executing...",
          description: gasEst ? `Estimated gas: ${parseFloat(gasEst).toFixed(6)} ETH` : "Processing...",
        });

        await waitForTx(publicClient, hash);

        // Wait a bit for state to settle
        await new Promise(resolve => setTimeout(resolve, 1000));

        await fetchProposals();

        toast({
          title: "Proposal executed",
          description: `Proposal #${proposalId} has been executed.`,
          variant: "success",
        });

        return hash;
      } catch (error: unknown) {
        toast({
          title: "Execution failed",
          description: parseError(error),
          variant: "destructive",
        });
        throw error;
      } finally {
        setIsExecuting(false);
        setEstimatedGas(null);
      }
    },
    [isConnected, address, writeContractAsync, publicClient, fetchProposals]
  );

  // Calculate proposal status
  const getProposalStatus = useCallback(
    (proposal: Proposal): "active" | "passed" | "failed" | "pending" | "executed" => {
      const now = Date.now() / 1000;

      if (proposal.executed) return "executed";
      if (now < proposal.startTime) return "pending";
      if (now < proposal.endTime) return "active";

      const totalVotes = proposal.forVotes + proposal.againstVotes;
      const quorumBigInt = quorum ? BigInt(quorum) : BigInt(0);

      if (totalVotes < quorumBigInt) return "failed";
      if (proposal.forVotes > proposal.againstVotes) return "passed";
      return "failed";
    },
    [quorum]
  );

  return {
    // State
    isProposing,
    isVoting,
    isExecuting,
    isLoadingProposals,
    estimatedGas,

    // Data
    proposals,
    proposalCount: proposalCount ? Number(proposalCount) : 0,
    quorum: quorum ? formatEther(quorum) : "0",
    proposalThreshold: proposalThreshold ? formatEther(proposalThreshold) : "0",
    votingPower: votingPower ? formatEther(votingPower) : "0",

    // Actions
    createProposal,
    vote,
    execute,
    hasVoted,
    getProposalStatus,
    refetch: fetchProposals,
  };
}
