import type { Metadata } from "next";

import { Reveal } from "@/components/motion/Reveal";
import { SeoPageScaffold } from "@/components/seo/SeoPageScaffold";
import { StructuredData } from "@/components/seo/StructuredData";
import { PageContainer } from "@/components/shared/PageContainer";
import { SwapCard } from "@/components/swap/SwapCard";
import { buildPageSchemaGraph, createPageMetadata } from "@/lib/seo";

const schema = buildPageSchemaGraph({
  name: "Swap",
  path: "/swap",
  feature: {
    name: "Titan Token Swap",
    description:
      "Swap TITAN and supported Ethereum Sepolia assets with visible routing, slippage controls, and price impact through Titan's Uniswap V4 interface.",
  },
});

export const metadata: Metadata = createPageMetadata({
  title: "Sepolia Token Swap - Uniswap V4 Testnet DEX",
  description:
    "Swap TITAN and supported Sepolia tokens on a Uniswap V4 testnet DEX. Preview price impact, set slippage, and route trades through Titan's experimental app.",
  path: "/swap",
  keywords: [
    "sepolia token swap",
    "uniswap v4 testnet",
    "testnet dex",
    "swap titan token",
    "sepolia testnet swap",
    "price impact",
    "slippage settings",
    "swap weth sepolia",
  ],
});

export default function SwapPage() {
  return (
    <>
      <StructuredData data={schema} />
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
