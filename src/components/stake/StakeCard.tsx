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
import { cn } from "@/lib/utils";

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

  // Validation
  const stakeExceedsBalance = stakeAmount ? parseFloat(stakeAmount) > parseFloat(tokenBalance) : false;
  const unstakeExceedsStaked = unstakeAmount ? parseFloat(unstakeAmount) > parseFloat(stakedBalance) : false;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        <StatsCard
          title="Your Stake"
          value={formatNumber(stakedBalance, { decimals: 2 })}
          subtitle="TITAN"
          icon={Coins}
        />
        <StatsCard
          title="Pending Rewards"
          value={formatNumber(pendingRewards, { decimals: 4 })}
          subtitle="TITAN"
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
          <CardTitle className="font-display text-[30px] leading-[0.98] font-[300] tracking-[-0.03em] sm:text-[34px]">
            Stake TITAN
          </CardTitle>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Move between stake and unstake without extra chrome.
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="stake" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger
                value="stake"
                className="flex-1"
              >
                Stake
              </TabsTrigger>
              <TabsTrigger
                value="unstake"
                className="flex-1"
              >
                Unstake
              </TabsTrigger>
            </TabsList>

            <TabsContent value="stake" className="space-y-4 mt-4">
              <div className="space-y-2">
                <div className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between">
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
                    className="min-w-0 text-lg"
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      const truncated = Math.floor(parseFloat(tokenBalance) * 10000) / 10000;
                      setStakeAmount(truncated > 0 ? truncated.toString() : "");
                    }}
                    className="shrink-0 cursor-pointer"
                  >
                    MAX
                  </Button>
                </div>
              </div>

              <Button
                className={cn(
                  "w-full",
                  stakeExceedsBalance && isConnected && "bg-red-500 hover:bg-red-600 text-white"
                )}
                size="lg"
                variant={!isConnected ? "green" : "default"}
                onClick={handleStake}
                disabled={isStaking || (isConnected && (!stakeAmount || stakeExceedsBalance))}
                isLoading={isStaking}
              >
                {!isConnected
                  ? "Connect Wallet"
                  : stakeExceedsBalance
                  ? "Insufficient Balance"
                  : isStaking
                  ? "Staking..."
                  : "Stake TITAN"}
              </Button>
            </TabsContent>

            <TabsContent value="unstake" className="space-y-4 mt-4">
              <div className="space-y-2">
                <div className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between">
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
                    className="min-w-0 text-lg"
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      const truncated = Math.floor(parseFloat(stakedBalance) * 10000) / 10000;
                      setUnstakeAmount(truncated > 0 ? truncated.toString() : "");
                    }}
                    className="shrink-0 cursor-pointer"
                  >
                    MAX
                  </Button>
                </div>
              </div>

              <Button
                className={cn(
                  "w-full",
                  unstakeExceedsStaked && isConnected && "bg-red-500 hover:bg-red-600 text-white"
                )}
                size="lg"
                variant={!isConnected ? "green" : "default"}
                onClick={handleUnstake}
                disabled={isUnstaking || (isConnected && (!unstakeAmount || unstakeExceedsStaked))}
                isLoading={isUnstaking}
              >
                {!isConnected
                  ? "Connect Wallet"
                  : unstakeExceedsStaked
                  ? "Exceeds Staked Amount"
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
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="min-w-0">
              <p className="text-sm text-[var(--color-muted-foreground)]">Pending Rewards</p>
              <p className="font-display text-[clamp(2rem,10vw,2.5rem)] leading-[0.94] font-[300] tracking-[-0.03em] text-[var(--color-foreground)]">
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
