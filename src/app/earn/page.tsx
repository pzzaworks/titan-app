import type { Metadata } from "next";

import { Reveal } from "@/components/motion/Reveal";
import { PageContainer } from "@/components/shared/PageContainer";
import { StakeCard } from "@/components/stake/StakeCard";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Earn",
  description:
    "Stake TITAN, track rewards, and manage yield in Titan's experimental Sepolia earn interface.",
  path: "/earn",
  keywords: ["staking rewards", "earn titan", "defi staking"],
});

export default function EarnPage() {
  return (
    <PageContainer>
      <div className="max-w-3xl mx-auto">
        <Reveal className="mb-10 text-center">
          <h1 className="mb-3 font-display text-[44px] leading-[0.95] font-[300] tracking-[-0.03em] text-[var(--color-foreground)] sm:text-[56px]">
            Earn
          </h1>
          <p className="mx-auto max-w-md text-[17px] leading-[1.28] text-[var(--color-muted-foreground)]">
            Stake TITAN and keep rewards easy to read.
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <StakeCard />
        </Reveal>
      </div>
    </PageContainer>
  );
}
