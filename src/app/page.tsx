import type { Metadata } from "next";
import HomePage from "@/components/pages/HomePage";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  description:
    "Titan is an experimental DeFi app on Ethereum Sepolia for swap, liquidity, staking, borrowing, governance, and faucet flows in one interface.",
  path: "/",
  keywords: ["titan defi", "defi app", "sepolia defi"],
});

export default function Page() {
  return <HomePage />;
}
