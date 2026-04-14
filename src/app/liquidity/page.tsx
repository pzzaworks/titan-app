import type { Metadata } from "next";
import LiquidityPage from "@/components/pages/LiquidityPage";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Liquidity",
  description:
    "Add and manage TITAN and WETH liquidity positions in Titan's experimental Uniswap V4-based Sepolia pool interface.",
  path: "/liquidity",
  keywords: ["uniswap v4 liquidity", "titan liquidity", "lp positions"],
});

export default function Page() {
  return <LiquidityPage />;
}
