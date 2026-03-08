"use client";

import { useState, useCallback, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, usePublicClient } from "wagmi";
import { parseEther, formatEther } from "viem";
import { sepolia } from "viem/chains";
import { config } from "@/config";
import { GOVERNANCE_ABI, TITAN_TOKEN_ABI } from "@/lib/contracts";
import { toast } from "./useToast";
import { parseError, waitForTx } from "@/lib/utils";

// Proposal states from contract
enum ProposalState {
  Pending = 0,
  Active = 1,
  Canceled = 2,
  Defeated = 3,
  Succeeded = 4,
  Queued = 5,
  Expired = 6,
  Executed = 7,
}

export interface Proposal {
  id: number;
  title: string;
  description: string;
  proposer: `0x${string}`;
  forVotes: bigint;
  againstVotes: bigint;
  abstainVotes: bigint;
  voteStart: number;
  voteEnd: number;
  startTime: number;
  endTime: number;
  executed: boolean;
  canceled: boolean;
  status: "active" | "passed" | "failed" | "pending" | "executed" | "canceled" | "queued" | "expired";
}

interface ProposalAction {
  target: string;
  value: string;
  calldata: string;
}

// Map contract state to UI status
function mapStateToStatus(state: number): Proposal["status"] {
  switch (state) {
    case ProposalState.Pending:
      return "pending";
    case ProposalState.Active:
      return "active";
    case ProposalState.Canceled:
      return "canceled";
    case ProposalState.Defeated:
      return "failed";
    case ProposalState.Succeeded:
      return "passed";
    case ProposalState.Queued:
      return "queued";
    case ProposalState.Expired:
      return "expired";
    case ProposalState.Executed:
      return "executed";
    default:
      return "pending";
  }
}

// Parse title from description (first line or before \n\n)
function parseTitle(description: string): string {
  const lines = description.split("\n");
  const firstLine = lines[0] || "";
  // Remove TIP-X: prefix if present
  return firstLine.replace(/^TIP-\d+:\s*/, "").trim() || "Untitled Proposal";
}

// Parse description body
function parseDescription(description: string): string {
  const parts = description.split("\n\n");
  return parts.slice(1).join("\n\n").trim() || description;
}

export function useGovernance() {
  const { address, isConnected } = useAccount();
  const [isProposing, setIsProposing] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoadingProposals, setIsLoadingProposals] = useState(true);
  const [currentBlock, setCurrentBlock] = useState<number>(0);

  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient({ chainId: sepolia.id });

  // Read proposal count
  const { data: proposalCount, refetch: refetchProposalCount } = useReadContract({
    address: config.contracts.governance,
    abi: GOVERNANCE_ABI,
    functionName: "proposalCount",
  });

  // Read quorum percentage
  const { data: quorumPercentage } = useReadContract({
    address: config.contracts.governance,
    abi: GOVERNANCE_ABI,
    functionName: "quorumPercentage",
  });

  // Read proposal threshold
  const { data: proposalThreshold } = useReadContract({
    address: config.contracts.governance,
    abi: GOVERNANCE_ABI,
    functionName: "proposalThreshold",
  });

  // Read voting period (in blocks)
  const { data: votingPeriod } = useReadContract({
    address: config.contracts.governance,
    abi: GOVERNANCE_ABI,
    functionName: "votingPeriod",
  });

  // Read user's sTITAN balance (staked tokens = voting power source)
  const { data: sTitanBalance } = useReadContract({
    address: config.contracts.stakedTitan,
    abi: TITAN_TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Read user's actual voting power from sTITAN (auto-delegated on stake)
  const { data: votingPower, refetch: refetchVotingPower } = useReadContract({
    address: config.contracts.stakedTitan,
    abi: TITAN_TOKEN_ABI,
    functionName: "getVotes",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Check who user has delegated to (in sTITAN)
  const { data: delegatee } = useReadContract({
    address: config.contracts.stakedTitan,
    abi: TITAN_TOKEN_ABI,
    functionName: "delegates",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Fetch all proposals from contract
  const fetchProposals = useCallback(async () => {
    if (!publicClient || !proposalCount || proposalCount === BigInt(0)) {
      setProposals([]);
      setIsLoadingProposals(false);
      return;
    }

    setIsLoadingProposals(true);
    try {
      const count = Number(proposalCount);
      const fetchedProposals: Proposal[] = [];

      // Get current block once
      const fetchedCurrentBlock = await publicClient.getBlockNumber();
      const currentBlockNum = Number(fetchedCurrentBlock);
      setCurrentBlock(currentBlockNum);
      const currentTime = Math.floor(Date.now() / 1000);

      for (let i = 1; i <= count; i++) {
        try {
          // Get proposal details - proposals() returns non-array fields, getProposal() returns arrays + description
          const [proposalData, proposalDetails, stateData, votesData] = await Promise.all([
            publicClient.readContract({
              address: config.contracts.governance,
              abi: GOVERNANCE_ABI,
              functionName: "proposals",
              args: [BigInt(i)],
            }),
            publicClient.readContract({
              address: config.contracts.governance,
              abi: GOVERNANCE_ABI,
              functionName: "getProposal",
              args: [BigInt(i)],
            }),
            publicClient.readContract({
              address: config.contracts.governance,
              abi: GOVERNANCE_ABI,
              functionName: "state",
              args: [BigInt(i)],
            }),
            publicClient.readContract({
              address: config.contracts.governance,
              abi: GOVERNANCE_ABI,
              functionName: "getVotes",
              args: [BigInt(i)],
            }),
          ]);

          // proposalData: [id, proposer, voteStart, voteEnd, snapshotBlock, forVotes, againstVotes, abstainVotes, canceled, executed, eta]
          const proposal = proposalData as [bigint, `0x${string}`, bigint, bigint, bigint, bigint, bigint, bigint, boolean, boolean, bigint];
          // proposalDetails: [targets, values, calldatas, description]
          const details = proposalDetails as [string[], bigint[], string[], string];
          const state = stateData as number;
          const votes = votesData as [bigint, bigint, bigint];

          const description = details[3];
          const voteStartBlock = Number(proposal[2]);
          const voteEndBlock = Number(proposal[3]);

          // Get actual timestamps from blocks
          let startTime = 0;
          let endTime = 0;

          try {
            // For past/current blocks, get actual timestamp
            if (voteStartBlock <= currentBlockNum) {
              const startBlock = await publicClient.getBlock({ blockNumber: BigInt(voteStartBlock) });
              startTime = Number(startBlock.timestamp);
            } else {
              // Future block - estimate
              startTime = currentTime + ((voteStartBlock - currentBlockNum) * 12);
            }

            if (voteEndBlock <= currentBlockNum) {
              const endBlock = await publicClient.getBlock({ blockNumber: BigInt(voteEndBlock) });
              endTime = Number(endBlock.timestamp);
            } else {
              // Future block - estimate from start time
              endTime = startTime + ((voteEndBlock - voteStartBlock) * 12);
            }
          } catch {
            // Fallback to estimation
            startTime = currentTime + ((voteStartBlock - currentBlockNum) * 12);
            endTime = currentTime + ((voteEndBlock - currentBlockNum) * 12);
          }

          fetchedProposals.push({
            id: i,
            title: parseTitle(description),
            description: parseDescription(description),
            proposer: proposal[1],
            forVotes: votes[0],
            againstVotes: votes[1],
            abstainVotes: votes[2],
            voteStart: voteStartBlock,
            voteEnd: voteEndBlock,
            startTime,
            endTime,
            executed: proposal[9],
            canceled: proposal[8],
            status: mapStateToStatus(state),
          });
        } catch (err) {
          console.error(`Error fetching proposal ${i}:`, err);
        }
      }

      // Sort by ID descending (newest first)
      fetchedProposals.sort((a, b) => b.id - a.id);
      setProposals(fetchedProposals);
    } catch (error) {
      console.error("Error fetching proposals:", error);
      setProposals([]);
    } finally {
      setIsLoadingProposals(false);
    }
  }, [publicClient, proposalCount]);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);



  // Check if user has voted on a proposal
  const hasVoted = useCallback(
    async (proposalId: number): Promise<boolean> => {
      if (!address || !publicClient) return false;
      try {
        const receipt = await publicClient.readContract({
          address: config.contracts.governance,
          abi: GOVERNANCE_ABI,
          functionName: "getReceipt",
          args: [BigInt(proposalId), address],
        });
        return (receipt as [boolean, number, bigint])[0];
      } catch {
        return false;
      }
    },
    [address, publicClient]
  );

  // Get vote receipt details (hasVoted, support, votes)
  const getVoteReceipt = useCallback(
    async (proposalId: number): Promise<{ hasVoted: boolean; support: number; votes: bigint } | null> => {
      if (!address || !publicClient) return null;
      try {
        const receipt = await publicClient.readContract({
          address: config.contracts.governance,
          abi: GOVERNANCE_ABI,
          functionName: "getReceipt",
          args: [BigInt(proposalId), address],
        });
        const [hasVoted, support, votes] = receipt as [boolean, number, bigint];
        return { hasVoted, support, votes };
      } catch {
        return null;
      }
    },
    [address, publicClient]
  );

  // Delegate voting power to self or another address
  const [isDelegating, setIsDelegating] = useState(false);
  const delegate = useCallback(
    async (delegateeAddress?: `0x${string}`) => {
      if (!isConnected || !address) {
        toast({
          title: "Wallet not connected",
          description: "Please connect your wallet to delegate.",
          variant: "destructive",
        });
        return;
      }

      setIsDelegating(true);
      try {
        const target = delegateeAddress || address; // Default to self-delegation

        toast({
          title: "Delegating voting power...",
          description: "Please confirm in your wallet",
        });

        const hash = await writeContractAsync({
          address: config.contracts.stakedTitan,
          abi: TITAN_TOKEN_ABI,
          functionName: "delegate",
          args: [target],
          chainId: sepolia.id,
        });

        await waitForTx(publicClient, hash);
        await refetchVotingPower();

        toast({
          title: "Delegation successful",
          description: "Your voting power is now active.",
          variant: "success",
        });

        return hash;
      } catch (error: unknown) {
        toast({
          title: "Delegation failed",
          description: parseError(error),
          variant: "destructive",
        });
        throw error;
      } finally {
        setIsDelegating(false);
      }
    },
    [isConnected, address, writeContractAsync, publicClient, refetchVotingPower]
  );

  // Create proposal
  const createProposal = useCallback(
    async (data: { title: string; description: string }) => {
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
        // Signaling proposal - use Governor address as no-op target
        // Contract requires at least one action, so we call Governor with empty data
        const targets: `0x${string}`[] = [config.contracts.governance];
        const values: bigint[] = [BigInt(0)];
        const calldatas: `0x${string}`[] = ["0x"];

        toast({
          title: "Creating proposal...",
          description: "Please confirm in your wallet",
        });

        const hash = await writeContractAsync({
          address: config.contracts.governance,
          abi: GOVERNANCE_ABI,
          functionName: "propose",
          args: [targets, values, calldatas, fullDescription],
          chainId: sepolia.id,
        });

        await waitForTx(publicClient, hash);

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
      }
    },
    [isConnected, address, writeContractAsync, publicClient, refetchProposalCount, fetchProposals]
  );

  // Cast vote (support: 0 = Against, 1 = For, 2 = Abstain)
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
        toast({
          title: "Casting vote...",
          description: "Please confirm in your wallet",
        });

        // Convert boolean to uint8 (true = 1 = For, false = 0 = Against)
        const supportValue = support ? 1 : 0;

        const hash = await writeContractAsync({
          address: config.contracts.governance,
          abi: GOVERNANCE_ABI,
          functionName: "castVote",
          args: [BigInt(proposalId), supportValue],
          chainId: sepolia.id,
        });

        await waitForTx(publicClient, hash);
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
        toast({
          title: "Executing proposal...",
          description: "Please confirm in your wallet",
        });

        const hash = await writeContractAsync({
          address: config.contracts.governance,
          abi: GOVERNANCE_ABI,
          functionName: "execute",
          args: [BigInt(proposalId)],
          chainId: sepolia.id,
        });

        await waitForTx(publicClient, hash);
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
      }
    },
    [isConnected, address, writeContractAsync, publicClient, fetchProposals]
  );

  // Cancel proposal (only proposer can cancel)
  const cancel = useCallback(
    async (proposalId: number) => {
      if (!isConnected || !address) {
        toast({
          title: "Wallet not connected",
          description: "Please connect your wallet to cancel.",
          variant: "destructive",
        });
        return;
      }

      setIsCanceling(true);
      try {
        toast({
          title: "Canceling proposal...",
          description: "Please confirm in your wallet",
        });

        const hash = await writeContractAsync({
          address: config.contracts.governance,
          abi: GOVERNANCE_ABI,
          functionName: "cancel",
          args: [BigInt(proposalId)],
          chainId: sepolia.id,
        });

        await waitForTx(publicClient, hash);
        await fetchProposals();

        toast({
          title: "Proposal canceled",
          description: `Proposal #${proposalId} has been canceled.`,
          variant: "success",
        });

        return hash;
      } catch (error: unknown) {
        toast({
          title: "Cancel failed",
          description: parseError(error),
          variant: "destructive",
        });
        throw error;
      } finally {
        setIsCanceling(false);
      }
    },
    [isConnected, address, writeContractAsync, publicClient, fetchProposals]
  );

  // Check if user needs to delegate (has sTITAN but no voting power)
  // Note: With auto-delegation on deposit, this should rarely be needed
  // Only applies if sTITAN was transferred to user from another address
  const needsDelegate =
    sTitanBalance &&
    votingPower !== undefined &&
    sTitanBalance > BigInt(0) &&
    votingPower === BigInt(0);

  return {
    // State
    isProposing,
    isVoting,
    isExecuting,
    isCanceling,
    isDelegating,
    isLoadingProposals,

    // Data
    proposals,
    proposalCount: proposalCount ? Number(proposalCount) : 0,
    quorumPercentage: quorumPercentage ? Number(quorumPercentage) / 100 : 4,
    proposalThreshold: proposalThreshold ? formatEther(proposalThreshold) : "0",
    sTitanBalance: sTitanBalance ? formatEther(sTitanBalance) : "0",
    votingPower: votingPower ? formatEther(votingPower) : "0",
    votingPeriodBlocks: votingPeriod ? Number(votingPeriod) : 0,
    currentBlock,
    needsDelegate: !!needsDelegate,
    delegatee: delegatee as `0x${string}` | undefined,

    // Actions
    createProposal,
    vote,
    execute,
    cancel,
    delegate,
    hasVoted,
    getVoteReceipt,
    refetch: fetchProposals,
  };
}
