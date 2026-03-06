"use client";

import { PageContainer } from "@/components/shared/PageContainer";
import { SwapCard } from "@/components/swap/SwapCard";

export default function SwapPage() {
  return (
    <PageContainer maxWidth="md" className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="text-center mb-8">
        <span className="inline-flex items-center font-mono uppercase tracking-wider text-xs text-[var(--color-muted-foreground)] mb-4 px-3 py-1.5 rounded-full border border-[var(--color-border)] bg-white">
          Exchange
        </span>
        <h1 className="text-3xl sm:text-4xl font-medium leading-[1.15] tracking-tight text-[var(--color-foreground)] mb-2">
          Swap Tokens
        </h1>
        <p className="text-[var(--color-muted-foreground)]">
          Trade tokens instantly with minimal slippage
        </p>
      </div>
      <div className="w-full">
        <SwapCard />
      </div>
    </PageContainer>
  );
}
