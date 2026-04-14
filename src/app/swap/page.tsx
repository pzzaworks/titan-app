import type { Metadata } from "next";

import { Reveal } from "@/components/motion/Reveal";
import { PageContainer } from "@/components/shared/PageContainer";
import { SwapCard } from "@/components/swap/SwapCard";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Swap",
  description:
    "Swap TITAN and other supported assets in Titan's experimental Sepolia trading interface with Uniswap V4 routing.",
  path: "/swap",
  keywords: ["token swap", "uniswap v4 swap", "sepolia swap"],
});

export default function SwapPage() {
  return (
    <PageContainer maxWidth="md" className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center">
      <Reveal className="mb-10 text-center">
        <h1 className="mb-3 font-display text-[44px] leading-[0.95] font-[300] tracking-[-0.03em] text-[var(--color-foreground)] sm:text-[56px]">
          Swap
        </h1>
        <p className="text-[17px] leading-[1.28] text-[var(--color-muted-foreground)]">
          Trade tokens with low friction.
        </p>
      </Reveal>
      <Reveal className="w-full" delay={0.08}>
        <SwapCard />
      </Reveal>
    </PageContainer>
  );
}
