import type { Metadata } from "next";
import HomePage from "@/components/pages/HomePage";
import { SeoPageScaffold } from "@/components/seo/SeoPageScaffold";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  description:
    "Titan brings Sepolia swaps, liquidity, staking, borrowing, governance, sTITAN, and faucet flows together in one experimental DeFi interface.",
  path: "/",
  keywords: ["titan defi", "defi app", "sepolia defi"],
  ogImage: "/og-image.png",
});

export default function Page() {
  return (
    <>
      <SeoPageScaffold
        title="Titan DeFi Super App on Sepolia"
        description="Titan combines Sepolia token swaps, TITAN WETH liquidity, staking rewards, sTITAN liquid staking, tUSD borrowing, governance voting, and faucet flows in one experimental DeFi interface."
      />
      <HomePage />
    </>
  );
}
