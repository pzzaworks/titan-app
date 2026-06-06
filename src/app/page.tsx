import type { Metadata } from "next";
import HomePage from "@/components/pages/HomePage";
import { SeoPageScaffold } from "@/components/seo/SeoPageScaffold";
import { createPageMetadata } from "@/lib/seo";

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
      <SeoPageScaffold
        title="Titan DeFi Super App on Sepolia"
        description="Titan combines Sepolia token swaps, TITAN WETH liquidity, staking rewards, sTITAN liquid staking, tUSD borrowing, governance voting, and faucet flows in one experimental DeFi interface."
      />
      <HomePage />
    </>
  );
}
