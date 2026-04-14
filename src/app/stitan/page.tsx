import type { Metadata } from "next";

import { Reveal } from "@/components/motion/Reveal";
import { PageContainer } from "@/components/shared/PageContainer";
import { STitanCard } from "@/components/stitan/STitanCard";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "sTitan",
  description:
    "Deposit TITAN, receive sTITAN, and keep governance voting power attached in Titan's experimental liquid staking flow on Sepolia.",
  path: "/stitan",
  keywords: ["stitan", "liquid staking", "staking titan"],
});

export default function STitanPage() {
  return (
    <PageContainer>
      <div className="max-w-3xl mx-auto">
        <Reveal className="mb-10 text-center">
          <h1 className="mb-3 font-display text-[44px] leading-[0.95] font-[300] tracking-[-0.03em] text-[var(--color-foreground)] sm:text-[56px]">
            sTitan
          </h1>
          <p className="mx-auto max-w-md text-[17px] leading-[1.28] text-[var(--color-muted-foreground)]">
            Deposit TITAN, receive sTITAN, and keep voting power attached.
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <STitanCard />
        </Reveal>
      </div>
    </PageContainer>
  );
}
