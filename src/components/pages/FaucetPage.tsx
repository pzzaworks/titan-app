"use client";

import { Clock, Gift, Wallet } from "lucide-react";
import { useAccount, useChainId, useChains } from "wagmi";
import { useFaucet } from "@/hooks/useFaucet";
import { Reveal } from "@/components/motion/Reveal";
import { formatTimeRemaining, shortenAddress } from "@/lib/format";
import { PageContainer } from "@/components/shared/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function FaucetPage() {
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const chains = useChains();
  const currentChain = chains.find((c) => c.id === chainId);
  const { isClaiming, canClaim, timeRemaining, claimAmount, cooldownPeriod, faucetBalance, claim } =
    useFaucet();

  const cooldownProgress =
    timeRemaining > 0 ? ((cooldownPeriod - timeRemaining) / cooldownPeriod) * 100 : 100;

  return (
    <PageContainer maxWidth="md" className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center">
      <div className="w-full">
        <Reveal className="mb-10 text-center">
          <h1 className="mb-3 font-display text-[44px] leading-[0.95] font-[300] tracking-[-0.03em] text-[var(--color-foreground)] sm:text-[56px]">
            Faucet
          </h1>
          <p className="text-[17px] leading-[1.28] text-[var(--color-muted-foreground)]">
            Get TITAN tokens for testing{currentChain ? ` on ${currentChain.name}` : ""}.
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <Card className="overflow-hidden">
          <CardHeader className="text-center pb-4">
            <CardTitle className="font-display text-[34px] leading-[0.98] font-[300] tracking-[-0.03em]">Claim TITAN</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Amount Display */}
            <div className="rounded-xl bg-[var(--color-foreground)]/4 p-6 text-center">
              <p className="text-sm text-[var(--color-muted-foreground)] mb-4">You will receive</p>
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2">
                  <p className="text-4xl font-medium text-[var(--color-foreground)]">{claimAmount}</p>
                  <Gift className="h-8 w-8 text-[var(--color-primary)]" />
                </div>
                <p className="text-[var(--color-muted-foreground)]">TITAN Token</p>
              </div>
              <div className="mt-4 pt-4">
                <p className="text-sm text-[var(--color-muted-foreground)]">
                  Faucet Balance: <span className="font-mono font-medium text-[var(--color-foreground)]">{Number(faucetBalance).toLocaleString()}</span> TITAN
                </p>
              </div>
            </div>

            {/* Cooldown Progress */}
            {isConnected && timeRemaining > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-[var(--color-muted-foreground)]">
                    <Clock className="h-4 w-4" />
                    <span>Cooldown</span>
                  </div>
                  <span className="font-medium text-[var(--color-foreground)] font-mono">
                    {formatTimeRemaining(timeRemaining)}
                  </span>
                </div>
                <Progress value={cooldownProgress} className="h-2" />
              </div>
            )}

            {/* Wallet Info */}
            {isConnected && address && (
              <div className="flex items-center justify-center gap-2 text-sm text-[var(--color-muted-foreground)]">
                <Wallet className="h-4 w-4" />
                <span className="font-mono">
                  {shortenAddress(address)}
                </span>
              </div>
            )}

            {/* Claim Button */}
            <Button
              className="w-full cursor-pointer"
              size="lg"
              onClick={claim}
              disabled={!isConnected || !canClaim || isClaiming}
              isLoading={isClaiming}
            >
              {!isConnected
                ? "Connect Wallet"
                : isClaiming
                ? "Claiming..."
                : !canClaim && timeRemaining > 0
                ? `Wait ${formatTimeRemaining(timeRemaining)}`
                : "Claim Tokens"}
            </Button>

            {/* Info */}
            <div className="rounded-xl bg-[var(--color-foreground)]/4 p-4">
              <p className="text-sm text-[var(--color-muted-foreground)]">
                <span className="font-medium text-[var(--color-foreground)]">Note:</span> This
                faucet is only available on {currentChain?.name || "the configured network"}. You can claim{" "}
                {claimAmount} TITAN every 24 hours.
              </p>
            </div>
          </CardContent>
          </Card>
        </Reveal>

        {/* Instructions */}
        <Reveal className="mt-8" delay={0.14}>
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-[30px] leading-[1] font-[300] tracking-[-0.03em]">How it works</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4 text-sm">
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-7 h-7 rounded-xl text-[var(--color-foreground)] flex items-center justify-center text-xs font-medium font-mono bg-[var(--color-foreground)]/5">
                    1
                  </span>
                  <span className="text-[var(--color-muted-foreground)] pt-0.5">
                    Connect your wallet to {currentChain?.name || "the network"} {currentChain ? `(Chain ID: ${currentChain.id})` : ""}
                  </span>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-7 h-7 rounded-xl text-[var(--color-foreground)] flex items-center justify-center text-xs font-medium font-mono bg-[var(--color-foreground)]/5">
                    2
                  </span>
                  <span className="text-[var(--color-muted-foreground)] pt-0.5">
                    Make sure you have some ETH for gas fees on the network
                  </span>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-7 h-7 rounded-xl text-[var(--color-foreground)] flex items-center justify-center text-xs font-medium font-mono bg-[var(--color-foreground)]/5">
                    3
                  </span>
                  <span className="text-[var(--color-muted-foreground)] pt-0.5">
                    Click the claim button to receive your test tokens
                  </span>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-7 h-7 rounded-xl text-[var(--color-foreground)] flex items-center justify-center text-xs font-medium font-mono bg-[var(--color-foreground)]/5">
                    4
                  </span>
                  <span className="text-[var(--color-muted-foreground)] pt-0.5">
                    Use your tokens to test swapping, staking, and farming
                  </span>
                </li>
              </ol>
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </PageContainer>
  );
}
