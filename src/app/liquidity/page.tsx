import type { Metadata } from "next";
import LiquidityPage from "@/components/pages/LiquidityPage";
import { SeoPageScaffold } from "@/components/seo/SeoPageScaffold";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "TITAN WETH Liquidity",
  description:
    "Add TITAN and WETH liquidity, review LP positions, collect fees, and manage Uniswap V4-based Sepolia pool ranges in Titan.",
  path: "/liquidity",
  keywords: ["uniswap v4 liquidity", "titan liquidity", "lp positions"],
});

export default function Page() {
  return (
    <>
      <SeoPageScaffold
        title="TITAN WETH Liquidity"
        description="Add TITAN and WETH liquidity, review LP positions, collect fees, and manage Uniswap V4-based Sepolia pool ranges inside Titan."
      />
      <LiquidityPage />
    </>
  );
}
