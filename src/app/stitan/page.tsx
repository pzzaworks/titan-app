"use client";

import { PageContainer } from "@/components/shared/PageContainer";
import { STitanCard } from "@/components/stitan/STitanCard";

export default function STitanPage() {
  return (
    <PageContainer>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <span className="inline-flex items-center font-mono uppercase tracking-wider text-xs text-[var(--color-muted-foreground)] mb-4 px-3 py-1.5 rounded-full border border-[var(--color-border)] bg-white">
            Liquid Staking
          </span>
          <h1 className="text-3xl sm:text-4xl font-medium leading-[1.15] tracking-tight text-[var(--color-foreground)] mb-2">
            Stake TITAN, Get sTITAN
          </h1>
          <p className="text-[var(--color-muted-foreground)] max-w-md mx-auto">
            Liquid staking token that appreciates in value as rewards accrue
          </p>
        </div>
        <STitanCard />
      </div>
    </PageContainer>
  );
}
