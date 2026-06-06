import type { Metadata } from "next";

import { Reveal } from "@/components/motion/Reveal";
import { SeoPageScaffold } from "@/components/seo/SeoPageScaffold";
import { StructuredData } from "@/components/seo/StructuredData";
import { PageContainer } from "@/components/shared/PageContainer";
import { StakeCard } from "@/components/stake/StakeCard";
import { buildPageSchemaGraph, createPageMetadata } from "@/lib/seo";

const schema = buildPageSchemaGraph({
  name: "Earn",
  path: "/earn",
  feature: {
    name: "TITAN Staking Rewards",
    description:
      "Stake TITAN to earn rewards, track pending yield and APR, and manage stake or unstake actions on Ethereum Sepolia.",
  },
});

export const metadata: Metadata = createPageMetadata({
  title: "Stake TITAN to Earn Rewards - Sepolia Staking",
  description:
    "Stake TITAN to earn rewards on Ethereum Sepolia. Track pending yield and APR, then stake or unstake anytime through Titan's experimental testnet earn interface.",
  path: "/earn",
  keywords: [
    "stake titan",
    "titan staking rewards",
    "sepolia staking",
    "earn defi yield",
    "staking apr",
    "stake unstake",
    "testnet staking rewards",
  ],
});

export default function EarnPage() {
  return (
    <>
      <StructuredData data={schema} />
      <SeoPageScaffold
        title="Earn TITAN Staking Rewards"
        description="Stake TITAN, track pending staking rewards, review APR, and manage stake or unstake actions from one Sepolia earn panel in Titan."
      />
      <PageContainer>
        <div className="max-w-3xl mx-auto">
          <Reveal className="mb-10 text-center">
            <h1 className="mb-3 font-display text-[44px] leading-[0.95] font-[300] tracking-[-0.03em] text-[var(--color-foreground)] sm:text-[56px]">
              Earn
            </h1>
            <p className="mx-auto max-w-md text-[17px] leading-[1.28] text-[var(--color-muted-foreground)]">
              Stake TITAN, track pending rewards, and manage yield from one Sepolia testnet panel.
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <StakeCard />
          </Reveal>
        </div>
      </PageContainer>
    </>
  );
}
