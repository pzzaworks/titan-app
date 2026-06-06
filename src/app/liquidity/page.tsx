import type { Metadata } from "next";
import LiquidityPage from "@/components/pages/LiquidityPage";
import { SeoPageScaffold } from "@/components/seo/SeoPageScaffold";
import { StructuredData } from "@/components/seo/StructuredData";
import { buildPageSchemaGraph, createPageMetadata } from "@/lib/seo";

const schema = buildPageSchemaGraph({
  name: "Liquidity",
  path: "/liquidity",
  feature: {
    name: "TITAN WETH Liquidity",
    description:
      "Provide TITAN and WETH liquidity, review LP positions, collect fees, and manage Uniswap V4 pool ranges on Ethereum Sepolia.",
  },
});

export const metadata: Metadata = createPageMetadata({
  title: "Add TITAN/WETH Liquidity - Uniswap V4 on Sepolia",
  description:
    "Provide TITAN/WETH liquidity on a Uniswap V4 Sepolia pool. Add liquidity, manage pool ranges, track LP positions, and collect fees in Titan's testnet interface.",
  path: "/liquidity",
  keywords: [
    "add liquidity sepolia",
    "uniswap v4 liquidity pool",
    "titan weth pool",
    "lp positions",
    "provide liquidity testnet",
    "concentrated liquidity",
    "collect lp fees",
    "sepolia liquidity provider",
  ],
});

export default function Page() {
  return (
    <>
      <StructuredData data={schema} />
      <SeoPageScaffold
        title="TITAN WETH Liquidity"
        description="Add TITAN and WETH liquidity, review LP positions, collect fees, and manage Uniswap V4-based Sepolia pool ranges inside Titan."
      />
      <LiquidityPage />
    </>
  );
}
