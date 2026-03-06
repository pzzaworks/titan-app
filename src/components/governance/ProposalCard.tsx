"use client";

import Link from "next/link";
import { Clock, CheckCircle2, XCircle, Timer, User } from "lucide-react";
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
  status: "active" | "passed" | "failed" | "pending" | "executed";
}

interface ProposalCardProps {
  proposal: Proposal;
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
    label: "Failed",
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
};

export function ProposalCard({ proposal }: ProposalCardProps) {
  const totalVotes = proposal.forVotes + proposal.againstVotes;
  const forPercentage = totalVotes > 0 ? (proposal.forVotes / totalVotes) * 100 : 0;
  const statusInfo = statusConfig[proposal.status];
  const StatusIcon = statusInfo.icon;

  const timeRemaining = () => {
    const now = Date.now() / 1000;
    if (proposal.status !== "active") return null;

    const remaining = proposal.endTime - now;
    if (remaining <= 0) return "Ended";

    const days = Math.floor(remaining / 86400);
    const hours = Math.floor((remaining % 86400) / 3600);

    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
  };

  return (
    <Link href={`/governance/${proposal.id}`}>
      <Card className="hover:border-[var(--color-foreground)]/20 transition-all duration-200 cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  variant="outline"
                  className={cn("flex items-center gap-1 border font-mono uppercase text-xs", statusInfo.color)}
                >
                  <StatusIcon className="h-3 w-3" />
                  {statusInfo.label}
                </Badge>
                <span className="text-sm text-[var(--color-muted-foreground)] font-mono">
                  #{proposal.id}
                </span>
              </div>
              <h3 className="text-lg font-medium text-[var(--color-foreground)] truncate mb-2">
                {proposal.title}
              </h3>
              <p className="text-sm text-[var(--color-muted-foreground)] line-clamp-2 mb-4">
                {proposal.description}
              </p>

              {/* Voting Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--color-primary)] font-medium font-mono">
                    For: {formatNumber(proposal.forVotes, { compact: true })}
                  </span>
                  <span className="text-red-500 font-medium font-mono">
                    Against: {formatNumber(proposal.againstVotes, { compact: true })}
                  </span>
                </div>
                <div className="relative h-2 rounded-full bg-red-100 overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-[var(--color-primary)] rounded-full transition-all duration-300"
                    style={{ width: `${forPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="hidden sm:flex flex-col items-end gap-2 text-sm text-[var(--color-muted-foreground)]">
              <div className="flex items-center gap-1 font-mono">
                <User className="h-4 w-4" />
                {formatAddress(proposal.proposer)}
              </div>
              {timeRemaining() && (
                <div className="flex items-center gap-1 font-mono">
                  <Clock className="h-4 w-4" />
                  {timeRemaining()}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
