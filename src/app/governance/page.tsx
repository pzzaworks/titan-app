"use client";

import { useState } from "react";
import { Plus, Vote, Users, FileText, Filter } from "lucide-react";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
import { PageContainer } from "@/components/shared/PageContainer";
import { StatsCard } from "@/components/shared/StatsCard";
import { ProposalCard } from "@/components/governance/ProposalCard";
import { ProposalModal } from "@/components/governance/ProposalModal";
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

  const {
    proposals,
    isLoadingProposals,
    proposalCount,
    votingPower,
    isProposing,
    createProposal,
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
    status: p.status,
  }));

  const filteredProposals = mappedProposals.filter((proposal) => {
    if (statusFilter === "all") return true;
    return proposal.status === statusFilter;
  });

  const activeProposals = mappedProposals.filter((p) => p.status === "active").length;
  const totalVotingPower = parseFloat(votingPower);
  const participationRate = 68.5;

  const handleCreateProposal = async (data: {
    title: string;
    description: string;
    actions: { target: string; value: string; calldata: string }[];
  }) => {
    await createProposal(data);
    setIsProposalModalOpen(false);
  };

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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
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
              <SelectItem value="passed" className="cursor-pointer">Passed</SelectItem>
              <SelectItem value="failed" className="cursor-pointer">Failed</SelectItem>
              <SelectItem value="executed" className="cursor-pointer">Executed</SelectItem>
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
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-40 rounded-2xl bg-[var(--color-foreground)]/5 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Proposals List */}
      {!isLoadingProposals && (
        <div className="space-y-4">
          {filteredProposals.map((proposal) => (
            <ProposalCard key={proposal.id} proposal={proposal} />
          ))}
        </div>
      )}

      {!isLoadingProposals && filteredProposals.length === 0 && (
        <div className="text-center py-16">
          <p className="text-[var(--color-muted-foreground)]">No proposals found</p>
        </div>
      )}

      {/* Proposal Modal */}
      <ProposalModal
        open={isProposalModalOpen}
        onOpenChange={setIsProposalModalOpen}
        onSubmit={handleCreateProposal}
      />
    </PageContainer>
  );
}
