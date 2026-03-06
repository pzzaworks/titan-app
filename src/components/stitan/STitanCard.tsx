"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { Coins, TrendingUp, ArrowRightLeft, Wallet } from "lucide-react";
import { useSTitan } from "@/hooks/useSTitan";
import { formatCompact, formatNumber } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsCard } from "@/components/shared/StatsCard";
import { config } from "@/config";

export function STitanCard() {
  const { isConnected } = useAccount();
  const { open } = useAppKit();
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const {
    isDepositing,
    isWithdrawing,
    sTitanBalance,
    titanValue,
    exchangeRate,
    totalTitan,
    tokenBalance,
    deposit,
    withdraw,
  } = useSTitan();

  // Check if contract is deployed
  const isContractDeployed = config.contracts.stakedTitan !== "0x0000000000000000000000000000000000000000";

  const handleDeposit = async () => {
    if (!isConnected) {
      open();
      return;
    }
    if (!depositAmount) return;
    await deposit(depositAmount);
    setDepositAmount("");
  };

  const handleWithdraw = async () => {
    if (!isConnected) {
      open();
      return;
    }
    if (!withdrawAmount) return;
    await withdraw(withdrawAmount);
    setWithdrawAmount("");
  };

  // Calculate estimated sTitan from deposit
  const estimatedSTitan = depositAmount
    ? (parseFloat(depositAmount) / parseFloat(exchangeRate)).toFixed(4)
    : "0";

  // Calculate estimated TITAN from withdraw
  const estimatedTitan = withdrawAmount
    ? (parseFloat(withdrawAmount) * parseFloat(exchangeRate)).toFixed(4)
    : "0";

  if (!isContractDeployed) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-[var(--color-muted-foreground)] mb-4">
              <Coins className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-[var(--color-foreground)] mb-2">
                sTitan Not Yet Deployed
              </h3>
              <p className="text-sm">
                The StakedTitan contract has not been deployed yet. Run the deployment script to enable liquid staking.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          title="Your sTITAN"
          value={`${formatNumber(sTitanBalance, { decimals: 2 })}`}
          subtitle="sTITAN"
          icon={Coins}
        />
        <StatsCard
          title="TITAN Value"
          value={`${formatNumber(titanValue, { decimals: 2 })}`}
          subtitle="TITAN"
          icon={Wallet}
        />
        <StatsCard
          title="Exchange Rate"
          value={`${exchangeRate}`}
          subtitle="TITAN/sTITAN"
          icon={ArrowRightLeft}
        />
        <StatsCard
          title="Total Staked"
          value={formatCompact(parseFloat(totalTitan))}
          subtitle="TITAN"
          icon={TrendingUp}
        />
      </div>

      {/* Info Banner */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-[var(--color-foreground)]/5 rounded-lg">
              <TrendingUp className="h-5 w-5 text-[var(--color-foreground)]" />
            </div>
            <div>
              <h4 className="font-medium text-[var(--color-foreground)] mb-1">
                How sTITAN Works
              </h4>
              <p className="text-sm text-[var(--color-muted-foreground)]">
                sTITAN is a liquid staking token. When you deposit TITAN, you receive sTITAN.
                As rewards accrue, the exchange rate increases, meaning your sTITAN becomes
                worth more TITAN over time. You can withdraw anytime.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Liquid Staking</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="deposit" className="w-full">
            <TabsList className="w-full bg-[var(--color-foreground)]/5 p-1 rounded-full">
              <TabsTrigger
                value="deposit"
                className="flex-1 rounded-full data-[state=active]:bg-white data-[state=active]:text-[var(--color-foreground)]"
              >
                Deposit
              </TabsTrigger>
              <TabsTrigger
                value="withdraw"
                className="flex-1 rounded-full data-[state=active]:bg-white data-[state=active]:text-[var(--color-foreground)]"
              >
                Withdraw
              </TabsTrigger>
            </TabsList>

            <TabsContent value="deposit" className="space-y-4 mt-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--color-muted-foreground)]">TITAN to deposit</span>
                  <span className="text-[var(--color-muted-foreground)]">
                    Balance: {formatNumber(tokenBalance, { decimals: 2 })} TITAN
                  </span>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder="0.0"
                    value={depositAmount}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "" || /^\d*\.?\d*$/.test(value)) {
                        setDepositAmount(value);
                      }
                    }}
                    className="text-lg"
                  />
                  <Button
                    variant="outline"
                    onClick={() => setDepositAmount(tokenBalance)}
                    className="shrink-0"
                  >
                    MAX
                  </Button>
                </div>
              </div>

              {depositAmount && parseFloat(depositAmount) > 0 && (
                <div className="p-3 bg-[var(--color-foreground)]/5 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--color-muted-foreground)]">You will receive</span>
                    <span className="font-medium text-[var(--color-foreground)]">
                      ~{estimatedSTitan} sTITAN
                    </span>
                  </div>
                </div>
              )}

              <Button
                className="w-full"
                size="lg"
                variant={!isConnected ? "green" : "default"}
                onClick={handleDeposit}
                disabled={isDepositing || (isConnected && !depositAmount)}
                isLoading={isDepositing}
              >
                {!isConnected
                  ? "Connect Wallet"
                  : isDepositing
                  ? "Depositing..."
                  : "Deposit TITAN"}
              </Button>
            </TabsContent>

            <TabsContent value="withdraw" className="space-y-4 mt-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--color-muted-foreground)]">sTITAN to withdraw</span>
                  <span className="text-[var(--color-muted-foreground)]">
                    Balance: {formatNumber(sTitanBalance, { decimals: 2 })} sTITAN
                  </span>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder="0.0"
                    value={withdrawAmount}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "" || /^\d*\.?\d*$/.test(value)) {
                        setWithdrawAmount(value);
                      }
                    }}
                    className="text-lg"
                  />
                  <Button
                    variant="outline"
                    onClick={() => setWithdrawAmount(sTitanBalance)}
                    className="shrink-0"
                  >
                    MAX
                  </Button>
                </div>
              </div>

              {withdrawAmount && parseFloat(withdrawAmount) > 0 && (
                <div className="p-3 bg-[var(--color-foreground)]/5 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--color-muted-foreground)]">You will receive</span>
                    <span className="font-medium text-[var(--color-foreground)]">
                      ~{estimatedTitan} TITAN
                    </span>
                  </div>
                </div>
              )}

              <Button
                className="w-full"
                size="lg"
                variant={!isConnected ? "green" : "default"}
                onClick={handleWithdraw}
                disabled={isWithdrawing || (isConnected && !withdrawAmount)}
                isLoading={isWithdrawing}
              >
                {!isConnected
                  ? "Connect Wallet"
                  : isWithdrawing
                  ? "Withdrawing..."
                  : "Withdraw TITAN"}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Your Position */}
      {parseFloat(sTitanBalance) > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-medium text-[var(--color-foreground)] mb-4">Your Position</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[var(--color-muted-foreground)]">sTITAN Balance</p>
                <p className="text-xl font-medium text-[var(--color-foreground)]">
                  {formatNumber(sTitanBalance, { decimals: 4 })}
                </p>
              </div>
              <div>
                <p className="text-sm text-[var(--color-muted-foreground)]">TITAN Value</p>
                <p className="text-xl font-medium text-[var(--color-foreground)]">
                  {formatNumber(titanValue, { decimals: 4 })}
                </p>
              </div>
            </div>
            {parseFloat(titanValue) > parseFloat(sTitanBalance) && (
              <div className="mt-4 p-3 bg-[var(--color-foreground)]/5 rounded-lg">
                <p className="text-sm text-[var(--color-foreground)]">
                  You have earned {formatNumber((parseFloat(titanValue) - parseFloat(sTitanBalance)).toString(), { decimals: 4 })} TITAN in rewards
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
