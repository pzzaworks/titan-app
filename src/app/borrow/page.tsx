import type { Metadata } from "next";
import BorrowPage from "@/components/pages/BorrowPage";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Borrow",
  description:
    "Deposit TITAN as collateral and borrow tUSD inside Titan's experimental Sepolia vault interface.",
  path: "/borrow",
  keywords: ["borrow tusd", "titan vault", "defi borrowing"],
});

export default function Page() {
  return <BorrowPage />;
}
