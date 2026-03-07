"use client";

import { Clock, Gift, Wallet } from "lucide-react";
import { useAccount, useChainId, useChains } from "wagmi";
import { useFaucet } from "@/hooks/useFaucet";
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
    <PageContainer maxWidth="md" className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="w-full">
        <div className="text-center mb-10">
          <span className="inline-flex items-center font-mono uppercase tracking-wider text-xs text-[var(--color-muted-foreground)] mb-4 px-3 py-1.5 rounded-full border border-[var(--color-border)] bg-white">
            Testnet
          </span>
          <h1 className="text-3xl sm:text-4xl font-medium leading-[1.15] tracking-tight text-[var(--color-foreground)] mb-2">
            Testnet Faucet
          </h1>
          <p className="text-[var(--color-muted-foreground)]">
            Get free TITAN tokens to test the protocol{currentChain ? ` on ${currentChain.name}` : ""}
          </p>
        </div>

        <Card>
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-lg font-medium">Claim Test Tokens</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Amount Display */}
            <div className="rounded-xl bg-[var(--color-foreground)]/5 border border-[var(--color-border)] p-6 text-center">
              <p className="text-sm text-[var(--color-muted-foreground)] mb-4">You will receive</p>
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2">
                  <p className="text-4xl font-medium text-[var(--color-foreground)]">{claimAmount}</p>
                  <Gift className="h-8 w-8 text-[var(--color-primary)]" />
                </div>
                <p className="text-[var(--color-muted-foreground)]">TITAN Token</p>
              </div>
              <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
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
            <div className="rounded-xl bg-[var(--color-foreground)]/5 border border-[var(--color-border)] p-4">
              <p className="text-sm text-[var(--color-muted-foreground)]">
                <span className="font-medium text-[var(--color-foreground)]">Note:</span> This
                faucet is only available on {currentChain?.name || "the configured network"}. You can claim{" "}
                {claimAmount} TITAN every 24 hours.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">How to use</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4 text-sm">
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full text-[var(--color-foreground)] flex items-center justify-center text-xs font-medium font-mono border border-[var(--color-border)]">
                    1
                  </span>
                  <span className="text-[var(--color-muted-foreground)] pt-0.5">
                    Connect your wallet to {currentChain?.name || "the network"} {currentChain ? `(Chain ID: ${currentChain.id})` : ""}
                  </span>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full text-[var(--color-foreground)] flex items-center justify-center text-xs font-medium font-mono border border-[var(--color-border)]">
                    2
                  </span>
                  <span className="text-[var(--color-muted-foreground)] pt-0.5">
                    Make sure you have some ETH for gas fees on the network
                  </span>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full text-[var(--color-foreground)] flex items-center justify-center text-xs font-medium font-mono border border-[var(--color-border)]">
                    3
                  </span>
                  <span className="text-[var(--color-muted-foreground)] pt-0.5">
                    Click the claim button to receive your test tokens
                  </span>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full text-[var(--color-foreground)] flex items-center justify-center text-xs font-medium font-mono border border-[var(--color-border)]">
                    4
                  </span>
                  <span className="text-[var(--color-muted-foreground)] pt-0.5">
                    Use your tokens to test swapping, staking, and farming
                  </span>
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
