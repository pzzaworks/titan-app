"use client";

import { useState, useMemo } from "react";
import { formatEther, parseEther } from "viem";
import { Vault, TrendingUp, Wallet, AlertTriangle, DollarSign, Percent } from "lucide-react";
import { PageContainer } from "@/components/shared/PageContainer";
import { StatsCard } from "@/components/shared/StatsCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatNumber, formatUSD, formatPercent } from "@/lib/format";
import { useVault } from "@/hooks/useVault";
import { useAccount } from "wagmi";
import { cn } from "@/lib/utils";

export default function BorrowPage() {
  const { isConnected } = useAccount();
  const {
    position,
    titanBalance,
    tusdBalance,
    titanAllowance,
    tusdAllowance,
    titanPrice,
    totalCollateral,
    totalDebt,
    mcr,
    minDebt,
    isDepositing,
    isWithdrawing,
    isBorrowing,
    isRepaying,
    isClosing,
    isApproving,
    approveTitan,
    approveTusd,
    depositCollateral,
    withdrawCollateral,
    borrow,
    repay,
    depositAndBorrow,
    closePosition,
  } = useVault();

  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [borrowAmount, setBorrowAmount] = useState("");
  const [repayAmount, setRepayAmount] = useState("");

  // Calculate values
  const titanPriceUsd = titanPrice ? Number(titanPrice) / 100000000 : 0.1;
  const hasPosition = position && (position.collateral > BigInt(0) || position.debt > BigInt(0));

  const collateralRatioPercent = position?.collateralRatio
    ? Number(position.collateralRatio) / 100
    : 0;

  const maxWithdrawable = useMemo(() => {
    if (!position || position.debt === BigInt(0)) return position?.collateral || BigInt(0);
    // Can withdraw while maintaining MCR
    const minCollateralValue = (position.debt * (mcr || BigInt(15000))) / BigInt(10000);
    const minCollateral = (minCollateralValue * BigInt(100000000)) / (titanPrice || BigInt(10000000));
    if (position.collateral > minCollateral) {
      return position.collateral - minCollateral;
    }
    return BigInt(0);
  }, [position, mcr, titanPrice]);

  const newCollateralRatio = useMemo(() => {
    if (!position || !borrowAmount) return collateralRatioPercent;
    const newDebt = position.debt + parseEther(borrowAmount || "0");
    if (newDebt === BigInt(0)) return Infinity;
    const ratio = (position.collateralValue * BigInt(10000)) / newDebt;
    return Number(ratio) / 100;
  }, [position, borrowAmount, collateralRatioPercent]);

  const isRatioSafe = collateralRatioPercent >= 150;
  const isRatioWarning = collateralRatioPercent >= 110 && collateralRatioPercent < 150;
  const isRatioDanger = collateralRatioPercent > 0 && collateralRatioPercent < 110;

  const needsTitanApproval = depositAmount && titanAllowance !== undefined
    ? parseEther(depositAmount) > titanAllowance
    : false;

  const needsTusdApproval = repayAmount && tusdAllowance !== undefined
    ? parseEther(repayAmount) > tusdAllowance
    : false;

  // Validation checks
  const depositExceedsBalance = depositAmount && titanBalance
    ? parseFloat(depositAmount) > parseFloat(formatEther(titanBalance))
    : false;

  const withdrawExceedsAvailable = withdrawAmount
    ? parseFloat(withdrawAmount) > parseFloat(formatEther(maxWithdrawable))
    : false;

  const borrowExceedsMax = borrowAmount && position?.maxBorrow
    ? parseFloat(borrowAmount) > parseFloat(formatEther(position.maxBorrow))
    : false;

  const repayExceedsDebt = repayAmount && position?.debt
    ? parseFloat(repayAmount) > parseFloat(formatEther(position.debt))
    : false;

  const repayExceedsBalance = repayAmount && tusdBalance
    ? parseFloat(repayAmount) > parseFloat(formatEther(tusdBalance))
    : false;

  const handleDeposit = async () => {
    if (!depositAmount) return;
    if (needsTitanApproval) {
      await approveTitan(depositAmount);
    } else {
      await depositCollateral(depositAmount);
      setDepositAmount("");
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount) return;
    await withdrawCollateral(withdrawAmount);
    setWithdrawAmount("");
  };

  const handleBorrow = async () => {
    if (!borrowAmount) return;
    await borrow(borrowAmount);
    setBorrowAmount("");
  };

  const handleRepay = async () => {
    if (!repayAmount) return;
    if (needsTusdApproval) {
      await approveTusd(repayAmount);
    } else {
      await repay(repayAmount);
      setRepayAmount("");
    }
  };

  const handleClosePosition = async () => {
    if (!position?.debt || position.debt === BigInt(0)) {
      // No debt, just withdraw
      if (position?.collateral && position.collateral > BigInt(0)) {
        await withdrawCollateral(formatEther(position.collateral));
      }
    } else {
      // Has debt, need tUSD approval
      const debtAmount = formatEther(position.debt);
      if (tusdAllowance && parseEther(debtAmount) > tusdAllowance) {
        await approveTusd(debtAmount);
      } else {
        await closePosition();
      }
    }
  };

  return (
    <PageContainer>
      <div className="text-center mb-10">
        <span className="inline-flex items-center font-mono uppercase tracking-wider text-xs text-[var(--color-muted-foreground)] mb-4 px-3 py-1.5 rounded-full border border-[var(--color-border)] bg-white">
          Lending Protocol
        </span>
        <h1 className="text-3xl sm:text-4xl font-medium leading-[1.15] tracking-tight text-[var(--color-foreground)] mb-2">
          Borrow tUSD
        </h1>
        <p className="text-[var(--color-muted-foreground)] max-w-md mx-auto">
          Deposit TITAN as collateral and borrow tUSD stablecoin
        </p>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatsCard
          title="TITAN Price"
          value={formatUSD(titanPriceUsd)}
          icon={DollarSign}
        />
        <StatsCard
          title="Total Collateral"
          value={`${formatNumber(Number(formatEther(totalCollateral || BigInt(0))), { decimals: 0 })} TITAN`}
          icon={Vault}
        />
        <StatsCard
          title="Total Borrowed"
          value={`${formatNumber(Number(formatEther(totalDebt || BigInt(0))), { decimals: 0 })} tUSD`}
          icon={TrendingUp}
        />
        <StatsCard
          title="Min Collateral Ratio"
          value="150%"
          icon={Percent}
        />
      </div>

      {!isConnected ? (
        <Card className="text-center py-16">
          <CardContent>
            <Wallet className="h-12 w-12 mx-auto mb-4 text-[var(--color-muted-foreground)]" />
            <p className="text-[var(--color-muted-foreground)]">
              Connect your wallet to start borrowing
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Position Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Vault className="h-5 w-5" />
                Your Position
              </CardTitle>
              <CardDescription>
                Manage your collateral and debt
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Position Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[var(--color-foreground)]/5">
                  <p className="text-sm text-[var(--color-muted-foreground)] mb-1">Collateral</p>
                  <p className="text-xl font-semibold">
                    {formatNumber(Number(formatEther(position?.collateral || BigInt(0))), { decimals: 2 })} TITAN
                  </p>
                  <p className="text-sm text-[var(--color-muted-foreground)]">
                    ≈ {formatUSD(Number(formatEther(position?.collateralValue || BigInt(0))))}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[var(--color-foreground)]/5">
                  <p className="text-sm text-[var(--color-muted-foreground)] mb-1">Debt</p>
                  <p className="text-xl font-semibold">
                    {formatNumber(Number(formatEther(position?.debt || BigInt(0))), { decimals: 2 })} tUSD
                  </p>
                  <p className="text-sm text-[var(--color-muted-foreground)]">
                    Max borrow: {formatNumber(Number(formatEther(position?.maxBorrow || BigInt(0))), { decimals: 2 })} tUSD
                  </p>
                </div>
              </div>

              {/* Vault Health */}
              {hasPosition && (
                <div className={cn(
                  "p-5 rounded-xl border transition-colors",
                  isRatioSafe && "border-green-200 bg-green-50/50",
                  isRatioWarning && "border-yellow-200 bg-yellow-50/50",
                  isRatioDanger && "border-red-200 bg-red-50/50",
                  !isRatioSafe && !isRatioWarning && !isRatioDanger && "border-[var(--color-border)] bg-[var(--color-foreground)]/5"
                )}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-3 h-3 rounded-full",
                        isRatioSafe && "bg-green-500",
                        isRatioWarning && "bg-yellow-500",
                        isRatioDanger && "bg-red-500"
                      )} />
                      <span className="font-medium">Vault Health</span>
                    </div>
                    <span className={cn(
                      "text-sm font-semibold px-3 py-1 rounded-full",
                      isRatioSafe && "bg-green-100 text-green-700",
                      isRatioWarning && "bg-yellow-100 text-yellow-700",
                      isRatioDanger && "bg-red-100 text-red-700"
                    )}>
                      {isRatioSafe ? "Healthy" : isRatioWarning ? "Caution" : isRatioDanger ? "At Risk" : "Safe"}
                    </span>
                  </div>

                  <div className="flex items-end gap-4 mb-4">
                    <div className="flex-1">
                      <p className="text-sm text-[var(--color-muted-foreground)] mb-1">Collateral Ratio</p>
                      <p className={cn(
                        "text-3xl font-bold",
                        isRatioSafe && "text-green-600",
                        isRatioWarning && "text-yellow-600",
                        isRatioDanger && "text-red-600"
                      )}>
                        {position?.debt === BigInt(0) ? "∞" : `${formatPercent(collateralRatioPercent)}`}
                      </p>
                    </div>
                    <div className="text-right text-sm text-[var(--color-muted-foreground)]">
                      <p>Min: 150%</p>
                      <p>Liq: 110%</p>
                    </div>
                  </div>

                  {/* Progress Bar - 100% to 200% range */}
                  <div className="relative h-3 rounded-full bg-gradient-to-r from-red-300 via-yellow-300 via-50% to-green-300 overflow-hidden">
                    {/* Marker for current position */}
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-[var(--color-foreground)] rounded-full transition-all"
                      style={{
                        left: `${Math.min(Math.max(collateralRatioPercent - 100, 0), 100)}%`,
                      }}
                    />
                    {/* Liquidation line at 110% = 10% of bar */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-red-600"
                      style={{ left: '10%' }}
                    />
                    {/* MCR line at 150% = 50% of bar */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-green-600"
                      style={{ left: '50%' }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-[var(--color-muted-foreground)] mt-1">
                    <span>100%</span>
                    <span>150%</span>
                    <span>200%+</span>
                  </div>

                  {isRatioDanger && (
                    <div className="flex items-center gap-2 mt-4 p-3 rounded-lg bg-red-100 text-red-700 text-sm font-medium">
                      <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                      <span>Your position is at risk of liquidation! Add collateral or repay debt.</span>
                    </div>
                  )}
                  {isRatioWarning && (
                    <div className="flex items-center gap-2 mt-4 p-3 rounded-lg bg-yellow-100 text-yellow-700 text-sm font-medium">
                      <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                      <span>Your position is below the safe threshold. Consider adding more collateral.</span>
                    </div>
                  )}
                </div>
              )}

              {/* Wallet Balances */}
              <div className="p-4 rounded-xl bg-[var(--color-foreground)]/5">
                <p className="text-sm text-[var(--color-muted-foreground)] mb-2">Wallet Balance</p>
                <div className="flex justify-between">
                  <span>{formatNumber(Number(formatEther(titanBalance || BigInt(0))), { decimals: 2 })} TITAN</span>
                  <span>{formatNumber(Number(formatEther(tusdBalance || BigInt(0))), { decimals: 2 })} tUSD</span>
                </div>
              </div>

              {/* Close Position */}
              {hasPosition && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleClosePosition}
                  disabled={isClosing || isApproving}
                >
                  {isClosing || isApproving ? "Processing..." : "Close Position"}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>
                Deposit, withdraw, borrow, or repay
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="deposit" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="deposit">Deposit</TabsTrigger>
                  <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
                  <TabsTrigger value="borrow">Borrow</TabsTrigger>
                  <TabsTrigger value="repay">Repay</TabsTrigger>
                </TabsList>

                <TabsContent value="deposit" className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm text-[var(--color-muted-foreground)] mb-2 block">
                      Deposit TITAN as collateral
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="0.0"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="pr-20"
                      />
                      <button
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-titan-green)] font-medium cursor-pointer hover:bg-[var(--color-titan-green)]/10 px-2 py-1 rounded-full transition-colors"
                        onClick={() => {
                          const max = titanBalance || BigInt(0);
                          const maxStr = formatEther(max);
                          const truncated = Math.floor(parseFloat(maxStr) * 10000) / 10000;
                          setDepositAmount(truncated > 0 ? truncated.toString() : "");
                        }}
                      >
                        MAX
                      </button>
                    </div>
                    <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
                      Balance: {formatNumber(Number(formatEther(titanBalance || BigInt(0))), { decimals: 4 })} TITAN
                    </p>
                  </div>
                  <Button
                    className={cn(
                      "w-full",
                      depositExceedsBalance
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-[var(--color-titan-green)] hover:bg-[var(--color-titan-green-dark)] text-white"
                    )}
                    onClick={handleDeposit}
                    disabled={!depositAmount || isDepositing || isApproving || depositExceedsBalance}
                  >
                    {depositExceedsBalance
                      ? "Insufficient Balance"
                      : isApproving
                      ? "Approving..."
                      : isDepositing
                      ? "Depositing..."
                      : needsTitanApproval
                      ? "Approve TITAN"
                      : "Deposit"}
                  </Button>
                </TabsContent>

                <TabsContent value="withdraw" className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm text-[var(--color-muted-foreground)] mb-2 block">
                      Withdraw TITAN collateral
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="0.0"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="pr-20"
                      />
                      <button
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-titan-green)] font-medium cursor-pointer hover:bg-[var(--color-titan-green)]/10 px-2 py-1 rounded-full transition-colors"
                        onClick={() => {
                          const maxStr = formatEther(maxWithdrawable);
                          const truncated = Math.floor(parseFloat(maxStr) * 10000) / 10000;
                          setWithdrawAmount(truncated > 0 ? truncated.toString() : "");
                        }}
                      >
                        MAX
                      </button>
                    </div>
                    <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
                      Available: {formatNumber(Number(formatEther(maxWithdrawable)), { decimals: 4 })} TITAN
                    </p>
                  </div>
                  <Button
                    className={cn(
                      "w-full",
                      withdrawExceedsAvailable
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-[var(--color-titan-green)] hover:bg-[var(--color-titan-green-dark)] text-white"
                    )}
                    onClick={handleWithdraw}
                    disabled={!withdrawAmount || isWithdrawing || withdrawExceedsAvailable}
                  >
                    {withdrawExceedsAvailable
                      ? "Exceeds Available"
                      : isWithdrawing
                      ? "Withdrawing..."
                      : "Withdraw"}
                  </Button>
                </TabsContent>

                <TabsContent value="borrow" className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm text-[var(--color-muted-foreground)] mb-2 block">
                      Borrow tUSD against collateral
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="0.0"
                        value={borrowAmount}
                        onChange={(e) => setBorrowAmount(e.target.value)}
                        className="pr-20"
                      />
                      <button
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-titan-green)] font-medium cursor-pointer hover:bg-[var(--color-titan-green)]/10 px-2 py-1 rounded-full transition-colors"
                        onClick={() => {
                          const max = position?.maxBorrow || BigInt(0);
                          // Truncate to 2 decimals to avoid precision issues
                          const maxStr = formatEther(max);
                          const truncated = Math.floor(parseFloat(maxStr) * 100) / 100;
                          setBorrowAmount(truncated > 0 ? truncated.toString() : "");
                        }}
                      >
                        MAX
                      </button>
                    </div>
                    <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
                      Max borrow: {formatNumber(Number(formatEther(position?.maxBorrow || BigInt(0))), { decimals: 2 })} tUSD
                    </p>
                  </div>
                  {borrowAmount && newCollateralRatio < Infinity && !borrowExceedsMax && (
                    <div className="p-3 rounded-lg bg-[var(--color-foreground)]/5">
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--color-muted-foreground)]">New Collateral Ratio:</span>
                        <span className={cn(
                          "font-medium",
                          newCollateralRatio >= 150 && "text-green-600",
                          newCollateralRatio >= 110 && newCollateralRatio < 150 && "text-yellow-600",
                          newCollateralRatio < 110 && "text-red-600"
                        )}>
                          {formatPercent(newCollateralRatio)}
                        </span>
                      </div>
                    </div>
                  )}
                  <Button
                    className={cn(
                      "w-full",
                      borrowExceedsMax
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-[var(--color-titan-green)] hover:bg-[var(--color-titan-green-dark)] text-white"
                    )}
                    onClick={handleBorrow}
                    disabled={!borrowAmount || isBorrowing || !position?.collateral || position.collateral === BigInt(0) || borrowExceedsMax}
                  >
                    {borrowExceedsMax
                      ? "Exceeds Max Borrow"
                      : isBorrowing
                      ? "Borrowing..."
                      : "Borrow tUSD"}
                  </Button>
                </TabsContent>

                <TabsContent value="repay" className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm text-[var(--color-muted-foreground)] mb-2 block">
                      Repay tUSD debt
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="0.0"
                        value={repayAmount}
                        onChange={(e) => setRepayAmount(e.target.value)}
                        className="pr-20"
                      />
                      <button
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-titan-green)] font-medium cursor-pointer hover:bg-[var(--color-titan-green)]/10 px-2 py-1 rounded-full transition-colors"
                        onClick={() => {
                          const maxRepay = tusdBalance && position?.debt
                            ? (tusdBalance < position.debt ? tusdBalance : position.debt)
                            : BigInt(0);
                          const maxStr = formatEther(maxRepay);
                          const truncated = Math.floor(parseFloat(maxStr) * 100) / 100;
                          setRepayAmount(truncated > 0 ? truncated.toString() : "");
                        }}
                      >
                        MAX
                      </button>
                    </div>
                    <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
                      Debt: {formatNumber(Number(formatEther(position?.debt || BigInt(0))), { decimals: 2 })} tUSD | Balance: {formatNumber(Number(formatEther(tusdBalance || BigInt(0))), { decimals: 2 })} tUSD
                    </p>
                  </div>
                  <Button
                    className={cn(
                      "w-full",
                      repayExceedsBalance
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-[var(--color-titan-green)] hover:bg-[var(--color-titan-green-dark)] text-white"
                    )}
                    onClick={handleRepay}
                    disabled={!repayAmount || isRepaying || isApproving || repayExceedsBalance}
                  >
                    {repayExceedsBalance
                      ? "Insufficient tUSD"
                      : isApproving
                      ? "Approving..."
                      : isRepaying
                      ? "Repaying..."
                      : needsTusdApproval
                      ? "Approve tUSD"
                      : "Repay"}
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Info Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>How it works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="w-10 h-10 rounded-full bg-[var(--color-titan-green)]/10 flex items-center justify-center mb-3">
                <span className="text-[var(--color-titan-green)] font-semibold">1</span>
              </div>
              <h3 className="font-medium mb-1">Deposit Collateral</h3>
              <p className="text-sm text-[var(--color-muted-foreground)]">
                Deposit TITAN tokens as collateral to open a position.
              </p>
            </div>
            <div>
              <div className="w-10 h-10 rounded-full bg-[var(--color-titan-green)]/10 flex items-center justify-center mb-3">
                <span className="text-[var(--color-titan-green)] font-semibold">2</span>
              </div>
              <h3 className="font-medium mb-1">Borrow tUSD</h3>
              <p className="text-sm text-[var(--color-muted-foreground)]">
                Borrow up to 66% of your collateral value in tUSD stablecoin.
              </p>
            </div>
            <div>
              <div className="w-10 h-10 rounded-full bg-[var(--color-titan-green)]/10 flex items-center justify-center mb-3">
                <span className="text-[var(--color-titan-green)] font-semibold">3</span>
              </div>
              <h3 className="font-medium mb-1">Maintain Ratio</h3>
              <p className="text-sm text-[var(--color-muted-foreground)]">
                Keep your collateral ratio above 110% to avoid liquidation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
