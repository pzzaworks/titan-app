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
  title: "sTITAN Governance - Vote On-Chain on Sepolia",
  description:
    "Vote on Titan proposals with sTITAN voting power on Ethereum Sepolia. Read active proposals, filter by status, and cast on-chain votes in the testnet interface.",
  path: "/governance",
  keywords: [
    "stitan governance",
    "onchain voting",
    "dao proposals",
    "stitan voting power",
    "defi governance sepolia",
    "vote on proposals",
    "testnet dao",
  ],
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
