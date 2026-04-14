"use client";

import { useState } from "react";
import { Plus, Vote, Users, FileText, Filter, AlertCircle, Zap } from "lucide-react";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
import { Reveal } from "@/components/motion/Reveal";
import { PageContainer } from "@/components/shared/PageContainer";
import { StatsCard } from "@/components/shared/StatsCard";
import { ProposalCard } from "@/components/governance/ProposalCard";
import { ProposalModal } from "@/components/governance/ProposalModal";
import { ProposalDetailModal } from "@/components/governance/ProposalDetailModal";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCompact, formatPercent } from "@/lib/format";
import { useGovernance } from "@/hooks/useGovernance";

export default function GovernancePage() {
  const { isConnected } = useAccount();
  const [statusFilter, setStatusFilter] = useState("all");
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<number | null>(null);

  const {
    proposals,
    isLoadingProposals,
    proposalCount,
    sTitanBalance,
    votingPower,
    needsDelegate,
    isProposing,
    isVoting,
    isCanceling,
    isDelegating,
    currentBlock,
    createProposal,
    vote,
    cancel,
    delegate,
    getVoteReceipt,
  } = useGovernance();

  // Map proposals to the format expected by ProposalCard
  const mappedProposals = proposals.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    proposer: p.proposer,
    forVotes: Number(formatEther(p.forVotes)),
    againstVotes: Number(formatEther(p.againstVotes)),
    startTime: p.startTime,
    endTime: p.endTime,
    voteStart: p.voteStart,
    voteEnd: p.voteEnd,
    status: p.status,
  }));

  const filteredProposals = mappedProposals.filter((proposal) => {
    if (statusFilter === "all") return true;
    return proposal.status === statusFilter;
  });

  const activeProposals = mappedProposals.filter((p) => p.status === "active").length;
  const totalVotingPower = parseFloat(votingPower);
  const participationRate = proposalCount > 0 ? 68.5 : 0;

  const handleCreateProposal = async (data: {
    title: string;
    description: string;
  }) => {
    await createProposal(data);
    setIsProposalModalOpen(false);
  };

  const handleVote = async (proposalId: number, support: boolean) => {
    await vote(proposalId, support);
  };

  const handleCancel = async (proposalId: number) => {
    await cancel(proposalId);
    setSelectedProposal(null);
  };

  const selectedProposalData = selectedProposal
    ? mappedProposals.find((p) => p.id === selectedProposal) || null
    : null;

  return (
    <PageContainer>
      <Reveal className="mb-12 text-center">
        <h1 className="mb-3 font-display text-[44px] leading-[0.95] font-[300] tracking-[-0.03em] text-[var(--color-foreground)] sm:text-[56px]">
          Governance
        </h1>
        <p className="mx-auto max-w-md text-[17px] leading-[1.28] text-[var(--color-muted-foreground)]">
          Read proposals, activate voting power, and vote without leaving Titan.
        </p>
      </Reveal>

      <Reveal className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" delay={0.06}>
        <StatsCard
          title="Active Proposals"
          value={activeProposals.toString()}
          icon={FileText}
        />
        <StatsCard
          title="Total Proposals"
          value={proposalCount.toString()}
          icon={Vote}
        />
        <StatsCard
          title="Your Voting Power"
          value={totalVotingPower > 0 ? formatCompact(totalVotingPower) : "0"}
          subtitle="TITAN"
          icon={Users}
        />
        <StatsCard
          title="Participation Rate"
          value={formatPercent(participationRate)}
          icon={Vote}
        />
      </Reveal>

      {isConnected && needsDelegate && (
        <Reveal
          className="mb-8 flex flex-col items-start justify-between gap-4 rounded-xl bg-white/58 p-5 sm:flex-row sm:items-center"
          delay={0.1}
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--color-foreground)]" />
            <div>
              <p className="font-medium text-[var(--color-foreground)]">Activate your voting power</p>
              <p className="mt-0.5 text-sm text-[var(--color-muted-foreground)]">
                You have {formatCompact(parseFloat(sTitanBalance))} sTITAN. Activate voting power to start voting on proposals.
              </p>
            </div>
          </div>
          <Button
            onClick={() => delegate()}
            disabled={isDelegating}
            isLoading={isDelegating}
            className="cursor-pointer flex-shrink-0"
          >
            <Zap className="h-4 w-4 mr-2" />
            {isDelegating ? "Activating..." : "Activate Now"}
          </Button>
        </Reveal>
      )}

      <Reveal
        className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
        delay={0.12}
      >
        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] cursor-pointer">
              <Filter className="h-4 w-4 mr-2 text-[var(--color-muted-foreground)]" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="cursor-pointer">All Proposals</SelectItem>
              <SelectItem value="active" className="cursor-pointer">Active</SelectItem>
              <SelectItem value="pending" className="cursor-pointer">Pending</SelectItem>
              <SelectItem value="passed" className="cursor-pointer">Passed</SelectItem>
              <SelectItem value="queued" className="cursor-pointer">Queued</SelectItem>
              <SelectItem value="executed" className="cursor-pointer">Executed</SelectItem>
              <SelectItem value="failed" className="cursor-pointer">Failed</SelectItem>
              <SelectItem value="expired" className="cursor-pointer">Expired</SelectItem>
              <SelectItem value="canceled" className="cursor-pointer">Canceled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          disabled={!isConnected || isProposing}
          onClick={() => setIsProposalModalOpen(true)}
          isLoading={isProposing}
          className="cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Proposal
        </Button>
      </Reveal>

      {isLoadingProposals && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-48 rounded-xl bg-white/52 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Proposals Grid */}
      {!isLoadingProposals && (
        <Reveal className="grid grid-cols-1 md:grid-cols-2 gap-4" delay={0.16}>
          {filteredProposals.map((proposal) => (
            <ProposalCard
              key={proposal.id}
              proposal={proposal}
              currentBlock={currentBlock}
              onClick={() => setSelectedProposal(proposal.id)}
            />
          ))}
        </Reveal>
      )}

      {!isLoadingProposals && filteredProposals.length === 0 && (
        <Reveal className="text-center py-16" delay={0.16}>
          <p className="text-[var(--color-muted-foreground)]">No proposals found</p>
        </Reveal>
      )}

      {/* Create Proposal Modal */}
      <ProposalModal
        open={isProposalModalOpen}
        onOpenChange={setIsProposalModalOpen}
        onSubmit={handleCreateProposal}
      />

      {/* Proposal Detail Modal */}
      <ProposalDetailModal
        open={selectedProposal !== null}
        onOpenChange={(open) => !open && setSelectedProposal(null)}
        proposal={selectedProposalData}
        onVote={handleVote}
        isVoting={isVoting}
        getVoteReceipt={getVoteReceipt}
        votingPower={votingPower}
        needsDelegate={needsDelegate}
        onDelegate={delegate}
        isDelegating={isDelegating}
        onCancel={handleCancel}
        isCanceling={isCanceling}
        currentBlock={currentBlock}
      />
    </PageContainer>
  );
}
