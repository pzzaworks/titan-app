"use client";

import { Clock, CheckCircle2, XCircle, Timer, User, Ban, Hourglass } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNumber, formatAddress } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface Proposal {
  id: number;
  title: string;
  description: string;
  proposer: string;
  forVotes: number;
  againstVotes: number;
  startTime: number;
  endTime: number;
  voteStart?: number; // block number
  voteEnd?: number; // block number
  status: "active" | "passed" | "failed" | "pending" | "executed" | "canceled" | "queued" | "expired";
}

interface ProposalCardProps {
  proposal: Proposal;
  currentBlock?: number;
  onClick?: () => void;
}

const statusConfig = {
  active: {
    label: "Active",
    color: "bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-[var(--color-primary)]/20",
    icon: Timer,
  },
  passed: {
    label: "Passed",
    color: "bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-[var(--color-primary)]/20",
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

export function ProposalCard({ proposal, currentBlock = 0, onClick }: ProposalCardProps) {
  const totalVotes = proposal.forVotes + proposal.againstVotes;
  const forPercentage = totalVotes > 0 ? (proposal.forVotes / totalVotes) * 100 : 50;
  const statusInfo = statusConfig[proposal.status];
  const StatusIcon = statusInfo.icon;

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
      if (currentBlock === 0) {
        return { text: "Loading...", color: "text-yellow-600" };
      }
      const blocksRemaining = proposal.voteStart - currentBlock;
      if (blocksRemaining <= 0) {
        return { text: "Starting...", color: "text-yellow-600" };
      }
      const timeStr = formatTimeRemaining(blocksRemaining * BLOCK_TIME);
      return { text: `Starts in ${timeStr}`, color: "text-yellow-600" };
    }

    // Active - show time until voting ends
    if (proposal.status === "active" && proposal.voteEnd) {
      if (currentBlock === 0) {
        return { text: "Loading...", color: "text-[var(--color-primary)]" };
      }
      const blocksRemaining = proposal.voteEnd - currentBlock;
      if (blocksRemaining <= 0) {
        return { text: "Voting ended", color: "text-[var(--color-muted-foreground)]" };
      }
      const timeStr = formatTimeRemaining(blocksRemaining * BLOCK_TIME);
      return { text: `${timeStr} left`, color: "text-[var(--color-primary)]" };
    }

    return null;
  };

  const time = timeInfo();

  return (
    <Card
      className="hover:border-[var(--color-foreground)]/20 hover:shadow-md transition-all duration-200 cursor-pointer h-full"
      onClick={onClick}
    >
      <CardContent className="p-5 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <Badge
            variant="outline"
            className={cn("flex items-center gap-1 border font-mono uppercase text-xs", statusInfo.color)}
          >
            <StatusIcon className="h-3 w-3" />
            {statusInfo.label}
          </Badge>
          <span className="text-xs text-[var(--color-muted-foreground)] font-mono">
            TIP-{proposal.id}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-[var(--color-foreground)] line-clamp-2 mb-2">
          {proposal.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-[var(--color-muted-foreground)] line-clamp-2 mb-4 flex-grow">
          {proposal.description}
        </p>

        {/* Voting Progress */}
        <div className="space-y-2 mb-3">
          <div className="relative h-2 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-[var(--color-primary)] rounded-full transition-all duration-300"
              style={{ width: `${forPercentage}%` }}
            />
            {totalVotes > 0 && forPercentage < 100 && (
              <div
                className="absolute inset-y-0 right-0 bg-red-400 rounded-full"
                style={{ width: `${100 - forPercentage}%` }}
              />
            )}
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--color-primary)] font-medium font-mono">
              {formatNumber(proposal.forVotes, { compact: true })} For
            </span>
            <span className="text-red-500 font-medium font-mono">
              {formatNumber(proposal.againstVotes, { compact: true })} Against
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-[var(--color-muted-foreground)] pt-3 border-t border-[var(--color-border)]">
          <div className="flex items-center gap-1 font-mono">
            <User className="h-3 w-3" />
            {formatAddress(proposal.proposer)}
          </div>
          {time && (
            <div className={cn("flex items-center gap-1 font-mono", time.color)}>
              <Clock className="h-3 w-3" />
              {time.text}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
