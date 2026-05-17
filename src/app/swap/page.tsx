import type { Metadata } from "next";

import { Reveal } from "@/components/motion/Reveal";
import { SeoPageScaffold } from "@/components/seo/SeoPageScaffold";
import { PageContainer } from "@/components/shared/PageContainer";
import { SwapCard } from "@/components/swap/SwapCard";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Sepolia Token Swap",
  description:
    "Swap TITAN and supported Sepolia assets, review price impact and slippage settings, and route trades through Titan's experimental Uniswap V4 interface.",
  path: "/swap",
  keywords: ["token swap", "uniswap v4 swap", "sepolia swap"],
});

export default function SwapPage() {
  return (
    <>
      <SeoPageScaffold
        title="Sepolia Token Swap"
        description="Swap TITAN and supported Sepolia assets, review price impact, adjust slippage settings, and route trades through Titan's experimental Uniswap V4 interface."
      />
      <PageContainer maxWidth="md" className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center">
        <Reveal className="mb-10 text-center">
          <h1 className="mb-3 font-display text-[44px] leading-[0.95] font-[300] tracking-[-0.03em] text-[var(--color-foreground)] sm:text-[56px]">
            Swap
          </h1>
          <p className="text-[17px] leading-[1.28] text-[var(--color-muted-foreground)]">
            Trade TITAN and supported Sepolia assets with routing, slippage, and price impact visible.
          </p>
        </Reveal>
        <Reveal className="w-full" delay={0.08}>
          <SwapCard />
        </Reveal>
      </PageContainer>
    </>
  );
}
