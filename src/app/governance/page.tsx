import type { Metadata } from "next";
import GovernancePage from "@/components/pages/GovernancePage";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Governance",
  description:
    "Read proposals, activate voting power, and vote with sTITAN in Titan's experimental governance interface on Sepolia.",
  path: "/governance",
  keywords: ["defi governance", "stitan voting", "onchain proposals"],
});

export default function Page() {
  return <GovernancePage />;
}
