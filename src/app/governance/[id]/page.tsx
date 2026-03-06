"use client";

import { useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Timer,
  User,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
import { PageContainer } from "@/components/shared/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VoteModal } from "@/components/governance/VoteModal";
import { useGovernance } from "@/hooks/useGovernance";
import { cn } from "@/lib/utils";
import { formatAddress, formatCompact, formatPercent } from "@/lib/format";

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

export default function ProposalDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params);
  const proposalId = parseInt(resolvedParams.id);
  const { isConnected } = useAccount();
  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false);

  const { proposals, isVoting, vote, isLoadingProposals } = useGovernance();

  const proposal = proposals.find((p) => p.id === proposalId);

  if (isLoadingProposals) {
    return (
      <PageContainer>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="h-8 w-32 bg-[var(--color-foreground)]/5 rounded animate-pulse" />
          <div className="h-64 bg-[var(--color-foreground)]/5 rounded-2xl animate-pulse" />
          <div className="h-48 bg-[var(--color-foreground)]/5 rounded-2xl animate-pulse" />
        </div>
      </PageContainer>
    );
  }

  if (!proposal) {
    return (
      <PageContainer>
        <div className="max-w-4xl mx-auto text-center py-16">
          <h1 className="text-2xl font-medium mb-4">Proposal not found</h1>
          <p className="text-[var(--color-muted-foreground)] mb-6">
            The proposal you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link href="/governance">
            <Button variant="outline" className="cursor-pointer">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Governance
            </Button>
          </Link>
        </div>
      </PageContainer>
    );
  }

  const forVotes = Number(formatEther(proposal.forVotes));
  const againstVotes = Number(formatEther(proposal.againstVotes));
  const totalVotes = forVotes + againstVotes;
  const forPercentage = totalVotes > 0 ? (forVotes / totalVotes) * 100 : 0;
  const againstPercentage = totalVotes > 0 ? (againstVotes / totalVotes) * 100 : 0;
  const statusInfo = statusConfig[proposal.status];
  const StatusIcon = statusInfo.icon;

  const timeRemaining = () => {
    const now = Date.now() / 1000;
    if (proposal.status !== "active") return null;

    const remaining = proposal.endTime - now;
    if (remaining <= 0) return "Ended";

    const days = Math.floor(remaining / 86400);
    const hours = Math.floor((remaining % 86400) / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h ${minutes}m remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  const handleVote = async (proposalId: number, voteType: "for" | "against" | "abstain") => {
    const support = voteType === "for";
    await vote(proposalId, support);
    setIsVoteModalOpen(false);
  };

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link href="/governance" className="inline-flex items-center gap-2 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors mb-6 cursor-pointer">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Governance</span>
        </Link>

        {/* Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
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
              {timeRemaining() && (
                <div className="flex items-center gap-1 text-sm text-[var(--color-muted-foreground)] font-mono">
                  <Clock className="h-4 w-4" />
                  {timeRemaining()}
                </div>
              )}
            </div>

            <h1 className="text-2xl font-medium text-[var(--color-foreground)] mb-4">
              {proposal.title}
            </h1>

            <p className="text-[var(--color-muted-foreground)] mb-6">
              {proposal.description}
            </p>

            <div className="flex items-center gap-4 text-sm text-[var(--color-muted-foreground)]">
              <div className="flex items-center gap-1 font-mono">
                <User className="h-4 w-4" />
                Proposed by {formatAddress(proposal.proposer)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Voting Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Vote For */}
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2 text-[var(--color-primary)]">
                <ThumbsUp className="h-5 w-5" />
                For
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-medium text-[var(--color-foreground)] mb-2">
                {formatCompact(forVotes)}
              </p>
              <p className="text-sm text-[var(--color-muted-foreground)] font-mono mb-4">
                {formatPercent(forPercentage, 1)} of votes
              </p>
              <div className="h-2 rounded-full bg-[var(--color-primary)]/20 overflow-hidden">
                <div
                  className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-300"
                  style={{ width: `${forPercentage}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Vote Against */}
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2 text-red-500">
                <ThumbsDown className="h-5 w-5" />
                Against
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-medium text-[var(--color-foreground)] mb-2">
                {formatCompact(againstVotes)}
              </p>
              <p className="text-sm text-[var(--color-muted-foreground)] font-mono mb-4">
                {formatPercent(againstPercentage, 1)} of votes
              </p>
              <div className="h-2 rounded-full bg-red-100 overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full transition-all duration-300"
                  style={{ width: `${againstPercentage}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vote Button */}
        {proposal.status === "active" && (
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-medium text-[var(--color-foreground)] mb-1">
                    Cast Your Vote
                  </h3>
                  <p className="text-sm text-[var(--color-muted-foreground)]">
                    Your vote will be recorded on-chain and cannot be changed.
                  </p>
                </div>
                <Button
                  size="lg"
                  onClick={() => setIsVoteModalOpen(true)}
                  disabled={!isConnected || isVoting}
                  isLoading={isVoting}
                  className="cursor-pointer w-full sm:w-auto"
                >
                  {!isConnected ? "Connect Wallet" : "Vote Now"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Vote Modal */}
        <VoteModal
          open={isVoteModalOpen}
          onOpenChange={setIsVoteModalOpen}
          proposalId={proposal.id}
          proposalTitle={proposal.title}
          onVote={handleVote}
        />
      </div>
    </PageContainer>
  );
}
