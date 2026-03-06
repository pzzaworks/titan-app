"use client";

import { PageContainer } from "@/components/shared/PageContainer";
import { StakeCard } from "@/components/stake/StakeCard";

export default function EarnPage() {
  return (
    <PageContainer>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <span className="inline-flex items-center font-mono uppercase tracking-wider text-xs text-[var(--color-muted-foreground)] mb-4 px-3 py-1.5 rounded-full border border-[var(--color-border)] bg-white">
            Earn
          </span>
          <h1 className="text-3xl sm:text-4xl font-medium leading-[1.15] tracking-tight text-[var(--color-foreground)] mb-2">
            Earn TITAN Rewards
          </h1>
          <p className="text-[var(--color-muted-foreground)] max-w-md mx-auto">
            Stake your TITAN tokens to earn rewards over time
          </p>
        </div>
        <StakeCard />
      </div>
    </PageContainer>
  );
}
