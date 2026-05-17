import type { Metadata } from "next";
import FaucetPage from "@/components/pages/FaucetPage";
import { SeoPageScaffold } from "@/components/seo/SeoPageScaffold";
import { createPageMetadata } from "@/lib/seo";

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
      <SeoPageScaffold
        title="Sepolia TITAN Faucet"
        description="Claim Sepolia TITAN test tokens, check faucet cooldowns, prepare a wallet, and move into Titan swap, staking, borrowing, and governance flows."
      />
      <FaucetPage />
    </>
  );
}
