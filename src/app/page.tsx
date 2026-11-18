import type { Metadata } from "next";
import HomePage from "@/components/pages/HomePage";
import { homeFaqItems } from "@/components/pages/home-faq";
import { StructuredData } from "@/components/seo/StructuredData";
import { buildFaqSchema, createPageMetadata } from "@/lib/seo";

const faqSchema = buildFaqSchema(homeFaqItems);

export const metadata: Metadata = createPageMetadata({
  description:
    "Try Titan, an experimental Sepolia DeFi app with token swaps, TITAN/WETH liquidity, staking, sTITAN, tUSD borrowing, governance, and a testnet faucet in one app.",
  path: "/",
  keywords: [
    "titan defi",
    "sepolia defi app",
    "ethereum testnet defi",
    "defi super app",
    "experimental defi",
    "sepolia dapp",
  ],
  ogImage: "/og-image.png",
});

export default function Page() {
  return (
    <>
      <StructuredData data={[faqSchema]} />
      <HomePage />
    </>
  );
}
