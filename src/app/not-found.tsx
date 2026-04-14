import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { PageContainer } from "@/components/shared/PageContainer";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Page Not Found",
  description: "The page you requested could not be found on Titan.",
  path: "/404",
  noIndex: true,
  keywords: ["404", "not found"],
});

export default function NotFound() {
  return (
    <PageContainer maxWidth="md" className="flex min-h-[calc(100vh-240px)] items-center">
      <div className="w-full py-10 text-center">
        <Reveal y={34}>
          <p className="eyebrow text-[var(--color-muted-foreground)]">404</p>
          <h1 className="mt-4 font-display text-[44px] leading-[0.94] font-[300] tracking-[-0.03em] text-[var(--color-foreground)] sm:text-[58px]">
            Page not found
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-[18px] leading-[1.5] text-[var(--color-muted-foreground)]">
            The route you tried does not exist or may have moved. Head back to Titan and continue
            with swap, liquidity, staking, borrowing, governance, or the faucet.
          </p>
        </Reveal>

        <Reveal delay={0.08} y={22}>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-[var(--color-titan-green-dark)] px-5 text-[16px] font-[350] text-[var(--color-warm-50)] transition-colors hover:bg-[var(--color-eigenpal-green)]"
            >
              Go Home
            </Link>
            <Link
              href="/swap"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-[var(--color-border)] px-5 text-[16px] font-[350] text-[var(--color-foreground)] transition-colors hover:bg-white/52"
            >
              Open Swap
            </Link>
          </div>
        </Reveal>
      </div>
    </PageContainer>
  );
}
