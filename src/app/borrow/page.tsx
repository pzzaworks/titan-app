import type { Metadata } from "next";
import BorrowPage from "@/components/pages/BorrowPage";
import { SeoPageScaffold } from "@/components/seo/SeoPageScaffold";
import { StructuredData } from "@/components/seo/StructuredData";
import { buildPageSchemaGraph, createPageMetadata } from "@/lib/seo";

const schema = buildPageSchemaGraph({
  name: "Borrow",
  path: "/borrow",
  feature: {
    name: "Borrow tUSD with TITAN Collateral",
    description:
      "Deposit TITAN as collateral to borrow tUSD, monitor collateral ratios and vault health, and manage repayment on Ethereum Sepolia.",
  },
});

export const metadata: Metadata = createPageMetadata({
  title: "Borrow tUSD Against TITAN - Sepolia DeFi Vault",
  description:
    "Borrow tUSD against TITAN collateral on Ethereum Sepolia. Open a vault, monitor your collateral ratio and health, and repay anytime in Titan's testnet app.",
  path: "/borrow",
  keywords: [
    "borrow tusd",
    "titan collateral vault",
    "defi borrowing sepolia",
    "collateral ratio",
    "crypto loan testnet",
    "stablecoin borrow",
    "vault health",
  ],
});

export default function Page() {
  return (
    <>
      <StructuredData data={schema} />
      <SeoPageScaffold
        title="Borrow tUSD with TITAN Collateral"
        description="Deposit TITAN collateral, borrow tUSD, review collateral ratios, track vault health, and manage repayment in Titan's experimental Sepolia borrowing interface."
      />
      <BorrowPage />
    </>
  );
}
