import type { Metadata } from "next";
import FaucetPage from "@/components/pages/FaucetPage";
import { SeoPageScaffold } from "@/components/seo/SeoPageScaffold";
import { StructuredData } from "@/components/seo/StructuredData";
import { buildPageSchemaGraph, createPageMetadata } from "@/lib/seo";

const schema = buildPageSchemaGraph({
  name: "Faucet",
  path: "/faucet",
  feature: {
    name: "Sepolia TITAN Faucet",
    description:
      "Claim TITAN test tokens on Ethereum Sepolia, check faucet cooldowns, and fund a wallet for Titan swap, staking, borrowing, and governance flows.",
  },
});

export const metadata: Metadata = createPageMetadata({
  title: "Sepolia TITAN Faucet",
  description:
    "Claim TITAN test tokens on Ethereum Sepolia, check faucet cooldowns, and prepare a wallet for Titan's swap, stake, borrow, and governance flows.",
  path: "/faucet",
  keywords: ["sepolia faucet", "titan faucet", "test tokens"],
});

export default function Page() {
  return (
    <>
      <StructuredData data={schema} />
      <SeoPageScaffold
        title="Sepolia TITAN Faucet"
        description="Claim Sepolia TITAN test tokens, check faucet cooldowns, prepare a wallet, and move into Titan swap, staking, borrowing, and governance flows."
      />
      <FaucetPage />
    </>
  );
}
