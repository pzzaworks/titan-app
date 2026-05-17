import type { Metadata } from "next";
import BorrowPage from "@/components/pages/BorrowPage";
import { SeoPageScaffold } from "@/components/seo/SeoPageScaffold";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Borrow tUSD with TITAN Collateral",
  description:
    "Deposit TITAN as collateral, borrow tUSD, watch collateral ratios, and manage repayment inside Titan's experimental Sepolia vault interface.",
  path: "/borrow",
  keywords: ["borrow tusd", "titan vault", "defi borrowing"],
});

export default function Page() {
  return (
    <>
      <SeoPageScaffold
        title="Borrow tUSD with TITAN Collateral"
        description="Deposit TITAN collateral, borrow tUSD, review collateral ratios, track vault health, and manage repayment in Titan's experimental Sepolia borrowing interface."
      />
      <BorrowPage />
    </>
  );
}
