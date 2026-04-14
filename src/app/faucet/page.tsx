import type { Metadata } from "next";
import FaucetPage from "@/components/pages/FaucetPage";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Faucet",
  description:
    "Claim TITAN test tokens on Ethereum Sepolia and start exploring Titan's experimental DeFi flows.",
  path: "/faucet",
  keywords: ["sepolia faucet", "titan faucet", "test tokens"],
});

export default function Page() {
  return <FaucetPage />;
}
