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
  title: "TITAN WETH Liquidity",
  description:
    "Add TITAN and WETH liquidity, review LP positions, collect fees, and manage Uniswap V4-based Sepolia pool ranges in Titan.",
  path: "/liquidity",
  keywords: ["uniswap v4 liquidity", "titan liquidity", "lp positions"],
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
