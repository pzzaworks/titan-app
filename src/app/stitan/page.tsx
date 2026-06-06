import type { Metadata } from "next";

import { Reveal } from "@/components/motion/Reveal";
import { SeoPageScaffold } from "@/components/seo/SeoPageScaffold";
import { StructuredData } from "@/components/seo/StructuredData";
import { PageContainer } from "@/components/shared/PageContainer";
import { STitanCard } from "@/components/stitan/STitanCard";
import { buildPageSchemaGraph, createPageMetadata } from "@/lib/seo";

const schema = buildPageSchemaGraph({
  name: "sTITAN",
  path: "/stitan",
  feature: {
    name: "sTITAN Liquid Staking",
    description:
      "Deposit TITAN to receive sTITAN, track the exchange rate, and keep governance voting power while staked on Ethereum Sepolia.",
  },
});

export const metadata: Metadata = createPageMetadata({
  title: "sTITAN Liquid Staking - Stake TITAN on Sepolia",
  description:
    "Deposit TITAN to mint sTITAN with Titan's Sepolia liquid staking. Track the exchange rate and keep governance voting power while your stake stays liquid.",
  path: "/stitan",
  keywords: [
    "stitan liquid staking",
    "liquid staking token",
    "mint stitan",
    "stake titan keep voting power",
    "stitan exchange rate",
    "sepolia liquid staking",
    "liquid staked titan",
  ],
});

export default function STitanPage() {
  return (
    <>
      <StructuredData data={schema} />
      <SeoPageScaffold
        title="sTITAN Liquid Staking"
        description="Deposit TITAN, receive sTITAN, monitor exchange rates, and keep governance voting power attached through Titan's Sepolia liquid staking flow."
      />
      <PageContainer>
        <div className="max-w-3xl mx-auto">
          <Reveal className="mb-10 text-center">
            <h1 className="mb-3 font-display text-[44px] leading-[0.95] font-[300] tracking-[-0.03em] text-[var(--color-foreground)] sm:text-[56px]">
              sTitan
            </h1>
            <p className="mx-auto max-w-md text-[17px] leading-[1.28] text-[var(--color-muted-foreground)]">
              Deposit TITAN, receive sTITAN, monitor the exchange rate, and keep voting power attached.
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <STitanCard />
          </Reveal>
        </div>
      </PageContainer>
    </>
  );
}
