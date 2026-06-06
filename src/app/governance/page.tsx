import type { Metadata } from "next";
import GovernancePage from "@/components/pages/GovernancePage";
import { SeoPageScaffold } from "@/components/seo/SeoPageScaffold";
import { StructuredData } from "@/components/seo/StructuredData";
import { buildPageSchemaGraph, createPageMetadata } from "@/lib/seo";

const schema = buildPageSchemaGraph({
  name: "Governance",
  path: "/governance",
  feature: {
    name: "sTITAN Governance",
    description:
      "Read Titan proposals, activate sTITAN voting power, filter proposal status, and vote onchain on Ethereum Sepolia.",
  },
});

export const metadata: Metadata = createPageMetadata({
  title: "sTITAN Governance",
  description:
    "Read proposals, activate voting power, filter governance status, and vote with sTITAN in Titan's experimental Sepolia governance interface.",
  path: "/governance",
  keywords: ["defi governance", "stitan voting", "onchain proposals"],
});

export default function Page() {
  return (
    <>
      <StructuredData data={schema} />
      <SeoPageScaffold
        title="sTITAN Governance"
        description="Read Titan governance proposals, activate sTITAN voting power, filter proposal status, and submit votes through the Sepolia governance interface."
      />
      <GovernancePage />
    </>
  );
}
