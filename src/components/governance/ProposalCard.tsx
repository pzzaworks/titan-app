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
    color: "bg-[var(--color-primary)]/10 text-[var(--color-primary)]",
    icon: Timer,
  },
  passed: {
    label: "Passed",
    color: "bg-[var(--color-primary)]/10 text-[var(--color-primary)]",
    icon: CheckCircle2,
  },
  failed: {
    label: "Rejected",
    color: "bg-[#f1d9d9] text-[#9d3f3f]",
    icon: XCircle,
  },
  pending: {
    label: "Pending",
    color: "bg-[#efe6bd] text-[#8d7221]",
    icon: Clock,
  },
  executed: {
    label: "Executed",
    color: "bg-white/72 text-[var(--color-foreground)]",
    icon: CheckCircle2,
  },
  canceled: {
    label: "Canceled",
    color: "bg-white/72 text-[var(--color-muted-foreground)]",
    icon: Ban,
  },
  queued: {
    label: "Queued",
    color: "bg-white/72 text-[var(--color-foreground)]",
    icon: Hourglass,
  },
  expired: {
    label: "Expired",
    color: "bg-white/72 text-[var(--color-muted-foreground)]",
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
      className="h-full cursor-pointer transition-colors duration-200 hover:bg-white/72"
      onClick={onClick}
    >
      <CardContent className="p-5 flex flex-col h-full">
        <div className="flex items-center justify-between gap-2 mb-3">
          <Badge
            variant="outline"
            className={cn("flex items-center gap-1 font-mono uppercase text-xs", statusInfo.color)}
          >
            <StatusIcon className="h-3 w-3" />
            {statusInfo.label}
          </Badge>
          <span className="text-xs text-[var(--color-muted-foreground)] font-mono">
            TIP-{proposal.id}
          </span>
        </div>

        <h3 className="mb-2 font-display text-[30px] leading-[0.98] font-[300] tracking-[-0.03em] text-[var(--color-foreground)] line-clamp-2">
          {proposal.title}
        </h3>

        <p className="text-sm text-[var(--color-muted-foreground)] line-clamp-2 mb-4 flex-grow">
          {proposal.description}
        </p>

        <div className="space-y-2 mb-3">
          <div className="relative h-2 overflow-hidden rounded-xl bg-white/76">
            <div
              className="absolute inset-y-0 left-0 rounded-xl bg-[var(--color-primary)] transition-all duration-300"
              style={{ width: `${forPercentage}%` }}
            />
            {totalVotes > 0 && forPercentage < 100 && (
              <div
                className="absolute inset-y-0 right-0 rounded-xl bg-[#b84c4c]"
                style={{ width: `${100 - forPercentage}%` }}
              />
            )}
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--color-primary)] font-medium font-mono">
              {formatNumber(proposal.forVotes, { compact: true })} For
            </span>
            <span className="font-medium font-mono text-[#9d3f3f]">
              {formatNumber(proposal.againstVotes, { compact: true })} Against
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 text-xs text-[var(--color-muted-foreground)]">
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
