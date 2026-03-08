"use client";

import { useState } from "react";
import { Plus, Vote, Users, FileText, Filter, AlertCircle, Zap } from "lucide-react";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
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
      <div className="text-center mb-10">
        <span className="inline-flex items-center font-mono uppercase tracking-wider text-xs text-[var(--color-muted-foreground)] mb-4 px-3 py-1.5 rounded-full border border-[var(--color-border)] bg-white">
          DAO
        </span>
        <h1 className="text-3xl sm:text-4xl font-medium leading-[1.15] tracking-tight text-[var(--color-foreground)] mb-2">
          Governance
        </h1>
        <p className="text-[var(--color-muted-foreground)] max-w-md mx-auto">
          Vote on proposals and shape the future of the Titan protocol
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
      </div>

      {/* Delegate Banner */}
      {isConnected && needsDelegate && (
        <div className="mb-6 p-4 rounded-2xl border border-yellow-200 bg-yellow-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-800">Activate Your Voting Power</p>
              <p className="text-sm text-yellow-700 mt-0.5">
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
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
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
      </div>

      {/* Loading State */}
      {isLoadingProposals && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-48 rounded-2xl bg-[var(--color-foreground)]/5 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Proposals Grid */}
      {!isLoadingProposals && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProposals.map((proposal) => (
            <ProposalCard
              key={proposal.id}
              proposal={proposal}
              currentBlock={currentBlock}
              onClick={() => setSelectedProposal(proposal.id)}
            />
          ))}
        </div>
      )}

      {!isLoadingProposals && filteredProposals.length === 0 && (
        <div className="text-center py-16">
          <p className="text-[var(--color-muted-foreground)]">No proposals found</p>
        </div>
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
