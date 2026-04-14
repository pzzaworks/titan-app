"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import {
  ThumbsUp,
  ThumbsDown,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  Timer,
  Ban,
  Hourglass,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatNumber, formatAddress } from "@/lib/format";

interface Proposal {
  id: number;
  title: string;
  description: string;
  proposer: string;
  forVotes: number;
  againstVotes: number;
  startTime: number;
  endTime: number;
  voteStart?: number;
  voteEnd?: number;
  status:
    | "active"
    | "passed"
    | "failed"
    | "pending"
    | "executed"
    | "canceled"
    | "queued"
    | "expired";
}

interface VoteReceipt {
  hasVoted: boolean;
  support: number; // 0 = Against, 1 = For, 2 = Abstain
  votes: bigint;
}

interface ProposalDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proposal: Proposal | null;
  onVote: (proposalId: number, support: boolean) => Promise<void>;
  isVoting: boolean;
  getVoteReceipt: (proposalId: number) => Promise<VoteReceipt | null>;
  votingPower: string;
  needsDelegate: boolean;
  onDelegate: (
    delegateeAddress?: `0x${string}`,
  ) => Promise<`0x${string}` | undefined>;
  isDelegating: boolean;
  onCancel: (proposalId: number) => Promise<void>;
  isCanceling: boolean;
  currentBlock?: number;
}

const statusConfig = {
  active: {
    label: "Active",
    color:
      "bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-[var(--color-primary)]/20",
    icon: Timer,
  },
  passed: {
    label: "Passed",
    color:
      "bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-[var(--color-primary)]/20",
    icon: CheckCircle2,
  },
  failed: {
    label: "Rejected",
    color: "bg-red-50 text-red-600 border-red-200",
    icon: XCircle,
  },
  pending: {
    label: "Pending",
    color: "bg-yellow-50 text-yellow-600 border-yellow-200",
    icon: Clock,
  },
  executed: {
    label: "Executed",
    color: "bg-purple-50 text-purple-600 border-purple-200",
    icon: CheckCircle2,
  },
  canceled: {
    label: "Canceled",
    color: "bg-gray-50 text-gray-600 border-gray-200",
    icon: Ban,
  },
  queued: {
    label: "Queued",
    color: "bg-blue-50 text-blue-600 border-blue-200",
    icon: Hourglass,
  },
  expired: {
    label: "Expired",
    color: "bg-gray-50 text-gray-500 border-gray-200",
    icon: Clock,
  },
};

export function ProposalDetailModal({
  open,
  onOpenChange,
  proposal,
  onVote,
  isVoting,
  getVoteReceipt,
  votingPower,
  needsDelegate,
  onDelegate,
  isDelegating,
  onCancel,
  isCanceling,
  currentBlock = 0,
}: ProposalDetailModalProps) {
  const { isConnected, address } = useAccount();
  const { open: openWallet } = useAppKit();
  const [selectedVote, setSelectedVote] = useState<boolean | null>(null);
  const [voteReceipt, setVoteReceipt] = useState<VoteReceipt | null>(null);
  const [isLoadingReceipt, setIsLoadingReceipt] = useState(false);

  // Fetch vote receipt when modal opens
  useEffect(() => {
    if (open && proposal && isConnected) {
      setIsLoadingReceipt(true);
      getVoteReceipt(proposal.id)
        .then(setVoteReceipt)
        .finally(() => setIsLoadingReceipt(false));
    } else {
      setVoteReceipt(null);
    }
  }, [open, proposal?.id, isConnected, getVoteReceipt]);

  if (!proposal) return null;

  const totalVotes = proposal.forVotes + proposal.againstVotes;
  const forPercentage =
    totalVotes > 0 ? (proposal.forVotes / totalVotes) * 100 : 0;
  const statusInfo = statusConfig[proposal.status];
  const StatusIcon = statusInfo.icon;

  // Use contract status as the source of truth for voting availability
  const isVotingOpen = proposal.status === "active";
  const hasVoted = voteReceipt?.hasVoted ?? false;
  const userVotedFor = hasVoted && voteReceipt?.support === 1;
  const userVotedAgainst = hasVoted && voteReceipt?.support === 0;
  const hasVotingPower = parseFloat(votingPower) > 0;
  const isProposer =
    address && proposal.proposer.toLowerCase() === address.toLowerCase();
  const canCancel =
    isProposer &&
    proposal.status !== "canceled" &&
    proposal.status !== "executed";

  const formatTimeRemaining = (seconds: number) => {
    if (seconds <= 0) return null;

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `~${days}d ${hours}h`;
    if (hours > 0) return `~${hours}h ${minutes}m`;
    if (minutes > 0) return `~${minutes}m`;
    return "<1m";
  };

  const timeInfo = () => {
    const BLOCK_TIME = 12; // Sepolia ~12 seconds per block

    // Pending - show time until voting starts
    if (proposal.status === "pending" && proposal.voteStart) {
      if (currentBlock === 0) return "Loading...";
      const blocksRemaining = proposal.voteStart - currentBlock;
      if (blocksRemaining <= 0) return "Voting starting...";
      const timeStr = formatTimeRemaining(blocksRemaining * BLOCK_TIME);
      return `Voting starts in ${timeStr}`;
    }

    // Active - show time until voting ends
    if (proposal.status === "active" && proposal.voteEnd) {
      if (currentBlock === 0) return "Loading...";
      const blocksRemaining = proposal.voteEnd - currentBlock;
      if (blocksRemaining <= 0) return "Voting ended";
      const timeStr = formatTimeRemaining(blocksRemaining * BLOCK_TIME);
      return `${timeStr} remaining`;
    }

    return null;
  };

  const handleVote = async () => {
    if (!isConnected) {
      openWallet();
      return;
    }

    if (selectedVote === null) return;

    await onVote(proposal.id, selectedVote);
    setSelectedVote(null);
    // Refresh vote receipt
    const receipt = await getVoteReceipt(proposal.id);
    setVoteReceipt(receipt);
  };

  const handleDelegate = async () => {
    await onDelegate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto bg-[var(--color-background)]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge
              variant="outline"
              className={cn(
                "flex items-center gap-1 border font-mono uppercase text-xs",
                statusInfo.color,
              )}
            >
              <StatusIcon className="h-3 w-3" />
              {statusInfo.label}
            </Badge>
            <span className="text-sm text-[var(--color-muted-foreground)] font-mono">
              #{proposal.id}
            </span>
          </div>
          <DialogTitle className="font-display text-[34px] leading-[0.98] font-[300] tracking-[-0.03em] text-[var(--color-foreground)]">
            {proposal.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Proposer & Time */}
          <div className="flex items-center justify-between text-sm text-[var(--color-muted-foreground)]">
            <div className="flex items-center gap-1 font-mono">
              <User className="h-4 w-4" />
              {formatAddress(proposal.proposer)}
            </div>
            {timeInfo() && (
              <div className="flex items-center gap-1 font-mono">
                <Clock className="h-4 w-4" />
                {timeInfo()}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="text-sm text-[var(--color-muted-foreground)] whitespace-pre-wrap">
            {proposal.description}
          </div>

          {/* Vote Counts */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--color-primary)] font-medium font-mono">
                For: {formatNumber(proposal.forVotes, { compact: true })}
              </span>
              <span className="text-red-500 font-medium font-mono">
                Against:{" "}
                {formatNumber(proposal.againstVotes, { compact: true })}
              </span>
            </div>
            <div className="relative h-3 overflow-hidden rounded-xl bg-white/72">
              <div
                className="absolute inset-y-0 left-0 rounded-xl bg-[var(--color-primary)] transition-all duration-300"
                style={{ width: `${forPercentage}%` }}
              />
            </div>
            <div className="text-center text-sm text-[var(--color-muted-foreground)] font-mono">
              {formatNumber(totalVotes, { compact: true })} total votes
            </div>
          </div>

          {/* Vote Section */}
          <div className="space-y-4 border-t border-[var(--color-border)] pt-4">
            {isVotingOpen ? (
              <>
                {/* Loading state */}
                {isLoadingReceipt && isConnected && (
                  <div className="text-center py-4">
                    <p className="text-sm text-[var(--color-muted-foreground)]">
                      Loading your vote status...
                    </p>
                  </div>
                )}

                {/* Already voted */}
                {!isLoadingReceipt && hasVoted && (
                  <div className="text-center py-4 space-y-2">
                    <div
                      className={cn(
                        "inline-flex items-center gap-2 rounded-xl px-4 py-2",
                        userVotedFor
                          ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                          : "bg-[#f1d9d9] text-[#9d3f3f]",
                      )}
                    >
                      {userVotedFor ? (
                        <ThumbsUp className="h-4 w-4" />
                      ) : (
                        <ThumbsDown className="h-4 w-4" />
                      )}
                      <span className="font-medium">
                        You voted {userVotedFor ? "For" : "Against"}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--color-muted-foreground)]">
                      Your vote has been recorded
                    </p>
                  </div>
                )}

                {/* Needs to delegate */}
                {!isLoadingReceipt &&
                  !hasVoted &&
                  isConnected &&
                  needsDelegate && (
                    <div className="space-y-3">
                      <div className="flex items-start gap-2 rounded-xl bg-white/62 p-3">
                        <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--color-foreground)]" />
                        <div>
                          <p className="text-sm font-medium text-[var(--color-foreground)]">
                            Activate voting power
                          </p>
                          <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
                            You have staked TITAN (sTITAN) but need to activate
                            your voting power.
                          </p>
                        </div>
                      </div>
                      <Button
                        className="w-full cursor-pointer"
                        size="lg"
                        onClick={handleDelegate}
                        disabled={isDelegating}
                        isLoading={isDelegating}
                      >
                        {isDelegating
                          ? "Activating..."
                          : "Activate Voting Power"}
                      </Button>
                    </div>
                  )}

                {/* No voting power */}
                {!isLoadingReceipt &&
                  !hasVoted &&
                  isConnected &&
                  !needsDelegate &&
                  !hasVotingPower && (
                    <div className="text-center py-4">
                      <div className="flex items-center justify-center gap-2 text-[var(--color-muted-foreground)]">
                        <AlertCircle className="h-4 w-4" />
                        <p className="text-sm">
                          You need to stake TITAN to vote
                        </p>
                      </div>
                      <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
                        Go to Stake page and stake TITAN to get voting power
                      </p>
                    </div>
                  )}

                {/* Can vote */}
                {!isLoadingReceipt &&
                  !hasVoted &&
                  (!isConnected || (hasVotingPower && !needsDelegate)) && (
                    <>
                      <p className="text-sm font-medium text-[var(--color-foreground)]">
                        Cast Your Vote
                      </p>

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setSelectedVote(true)}
                          className={cn(
                            "relative flex cursor-pointer items-center justify-center gap-2 rounded-xl p-4 transition-all duration-200",
                            selectedVote === true
                              ? "bg-[var(--color-primary)] text-[#243025] scale-[1.02]"
                              : "bg-white/58 hover:bg-[var(--color-primary)]/5",
                          )}
                        >
                          <ThumbsUp className="h-5 w-5" />
                          <span className="font-semibold">For</span>
                          {selectedVote === true && (
                            <CheckCircle2 className="absolute top-2 right-2 h-4 w-4" />
                          )}
                        </button>

                        <button
                          onClick={() => setSelectedVote(false)}
                          className={cn(
                            "relative flex cursor-pointer items-center justify-center gap-2 rounded-xl p-4 transition-all duration-200",
                            selectedVote === false
                              ? "bg-[#b84c4c] text-white scale-[1.02]"
                              : "bg-white/58 hover:bg-[#f1d9d9]",
                          )}
                        >
                          <ThumbsDown className="h-5 w-5" />
                          <span className="font-semibold">Against</span>
                          {selectedVote === false && (
                            <XCircle className="absolute top-2 right-2 h-4 w-4" />
                          )}
                        </button>
                      </div>

                      <Button
                        className="w-full cursor-pointer"
                        size="lg"
                        variant={!isConnected ? "green" : "default"}
                        onClick={handleVote}
                        disabled={
                          isVoting || (isConnected && selectedVote === null)
                        }
                        isLoading={isVoting}
                      >
                        {!isConnected
                          ? "Connect Wallet"
                          : selectedVote === null
                            ? "Select Vote"
                            : isVoting
                              ? "Submitting..."
                              : "Submit Vote"}
                      </Button>
                    </>
                  )}
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-[var(--color-muted-foreground)]">
                  {proposal.status === "executed" &&
                    "This proposal has been executed."}
                  {proposal.status === "passed" &&
                    "This proposal has passed and is awaiting execution."}
                  {proposal.status === "failed" &&
                    "This proposal was rejected by the community."}
                  {proposal.status === "pending" &&
                    "Voting has not started yet."}
                  {proposal.status === "queued" &&
                    "This proposal is queued for execution."}
                  {proposal.status === "expired" &&
                    "This proposal has expired."}
                  {proposal.status === "canceled" &&
                    "This proposal was canceled."}
                </p>
              </div>
            )}
          </div>

          {/* Cancel Button (only for proposer) */}
          {canCancel && (
            <div className="pt-4 border-t border-[var(--color-border)]">
              <Button
                variant="outline"
                className="w-full cursor-pointer text-[#9d3f3f] hover:bg-[#f1d9d9] hover:text-[#9d3f3f]"
                onClick={() => onCancel(proposal.id)}
                disabled={isCanceling}
                isLoading={isCanceling}
              >
                {isCanceling ? "Canceling..." : "Cancel Proposal"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
