"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { Coins, TrendingUp, Gift, Wallet } from "lucide-react";
import { useStaking } from "@/hooks/useStaking";
import { useTitanPrice } from "@/hooks/useTitanPrice";
import { formatUSD, formatCompact, formatPercent, formatNumber } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsCard } from "@/components/shared/StatsCard";

export function StakeCard() {
  const { isConnected } = useAccount();
  const { open } = useAppKit();
  const [stakeAmount, setStakeAmount] = useState("");
  const [unstakeAmount, setUnstakeAmount] = useState("");

  const {
    isStaking,
    isUnstaking,
    isClaiming,
    stakedBalance,
    pendingRewards,
    totalStaked,
    apr,
    tokenBalance,
    stake,
    unstake,
    claimRewards,
  } = useStaking();

  const { titanPrice } = useTitanPrice();

  const handleStake = async () => {
    if (!isConnected) {
      open();
      return;
    }
    if (!stakeAmount) return;
    await stake(stakeAmount);
    setStakeAmount("");
  };

  const handleUnstake = async () => {
    if (!isConnected) {
      open();
      return;
    }
    if (!unstakeAmount) return;
    await unstake(unstakeAmount);
    setUnstakeAmount("");
  };

  const handleClaimRewards = async () => {
    if (!isConnected) {
      open();
      return;
    }
    await claimRewards();
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          title="Your Stake"
          value={`${formatNumber(stakedBalance, { decimals: 2 })} TITAN`}
          icon={Coins}
        />
        <StatsCard
          title="Pending Rewards"
          value={`${formatNumber(pendingRewards, { decimals: 4 })} TITAN`}
          icon={Gift}
        />
        <StatsCard
          title="APR"
          value={apr >= 999 ? "999%+" : formatPercent(apr)}
          icon={TrendingUp}
          trend={apr < 999 ? { value: 2.5, isPositive: true } : undefined}
        />
        <StatsCard
          title="Total Staked"
          value={formatCompact(parseFloat(totalStaked))}
          subtitle="TITAN"
          icon={Wallet}
        />
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Earn Rewards</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="stake" className="w-full">
            <TabsList className="w-full bg-[var(--color-foreground)]/5 p-1 rounded-full">
              <TabsTrigger
                value="stake"
                className="flex-1 rounded-full data-[state=active]:bg-white data-[state=active]:text-[var(--color-foreground)]"
              >
                Stake
              </TabsTrigger>
              <TabsTrigger
                value="unstake"
                className="flex-1 rounded-full data-[state=active]:bg-white data-[state=active]:text-[var(--color-foreground)]"
              >
                Unstake
              </TabsTrigger>
            </TabsList>

            <TabsContent value="stake" className="space-y-4 mt-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--color-muted-foreground)]">Amount to stake</span>
                  <span className="text-[var(--color-muted-foreground)]">
                    Balance: {formatNumber(tokenBalance, { decimals: 2 })} TITAN
                  </span>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder="0.0"
                    value={stakeAmount}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "" || /^\d*\.?\d*$/.test(value)) {
                        setStakeAmount(value);
                      }
                    }}
                    className="text-lg"
                  />
                  <Button
                    variant="outline"
                    onClick={() => setStakeAmount(tokenBalance)}
                    className="shrink-0"
                  >
                    MAX
                  </Button>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                variant={!isConnected ? "green" : "default"}
                onClick={handleStake}
                disabled={isStaking || (isConnected && !stakeAmount)}
                isLoading={isStaking}
              >
                {!isConnected
                  ? "Connect Wallet"
                  : isStaking
                  ? "Staking..."
                  : "Stake TITAN"}
              </Button>
            </TabsContent>

            <TabsContent value="unstake" className="space-y-4 mt-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--color-muted-foreground)]">Amount to unstake</span>
                  <span className="text-[var(--color-muted-foreground)]">
                    Staked: {formatNumber(stakedBalance, { decimals: 2 })} TITAN
                  </span>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder="0.0"
                    value={unstakeAmount}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "" || /^\d*\.?\d*$/.test(value)) {
                        setUnstakeAmount(value);
                      }
                    }}
                    className="text-lg"
                  />
                  <Button
                    variant="outline"
                    onClick={() => setUnstakeAmount(stakedBalance)}
                    className="shrink-0"
                  >
                    MAX
                  </Button>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                variant={!isConnected ? "green" : "default"}
                onClick={handleUnstake}
                disabled={isUnstaking || (isConnected && !unstakeAmount)}
                isLoading={isUnstaking}
              >
                {!isConnected
                  ? "Connect Wallet"
                  : isUnstaking
                  ? "Unstaking..."
                  : "Unstake TITAN"}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Rewards Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm text-[var(--color-muted-foreground)]">Pending Rewards</p>
              <p className="text-2xl font-medium text-[var(--color-foreground)]">
                {formatNumber(pendingRewards, { decimals: 4 })} TITAN
              </p>
              <p className="text-sm text-[var(--color-muted-foreground)] font-mono">
                {formatUSD(parseFloat(pendingRewards) * titanPrice)}
              </p>
            </div>
            <Button
              size="lg"
              variant={!isConnected ? "green" : "default"}
              onClick={handleClaimRewards}
              disabled={isClaiming || (isConnected && parseFloat(pendingRewards) === 0)}
              isLoading={isClaiming}
              className="w-full sm:w-auto"
            >
              {isConnected && <Gift className="mr-2 h-5 w-5" />}
              {!isConnected ? "Connect Wallet" : isClaiming ? "Claiming..." : "Claim Rewards"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
