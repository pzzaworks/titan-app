"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, ExternalLink, TrendingUp } from "lucide-react";
import { useAccount } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { cn } from "@/lib/utils";
import { formatUSD, formatCompact, formatPercent, formatNumber } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Pool {
  id: number;
  name: string;
  token0: {
    symbol: string;
    logoUrl?: string;
  };
  token1: {
    symbol: string;
    logoUrl?: string;
  };
  apr: number;
  tvl: number;
  userStaked: number;
  pendingRewards: number;
  isHot?: boolean;
}

interface PoolCardProps {
  pool: Pool;
  onDeposit?: (poolId: number, amount: string) => Promise<void>;
  onWithdraw?: (poolId: number, amount: string) => Promise<void>;
  onHarvest?: (poolId: number) => Promise<void>;
}

export function PoolCard({
  pool,
  onDeposit,
  onWithdraw,
  onHarvest,
}: PoolCardProps) {
  const { isConnected } = useAccount();
  const { open } = useAppKit();
  const [expanded, setExpanded] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isDepositing, setIsDepositing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isHarvesting, setIsHarvesting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDeposit = async () => {
    if (!isConnected) {
      open();
      return;
    }
    if (!depositAmount || !onDeposit) return;
    setIsDepositing(true);
    try {
      await onDeposit(pool.id, depositAmount);
      setDepositAmount("");
      setDialogOpen(false);
    } finally {
      setIsDepositing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!isConnected) {
      open();
      return;
    }
    if (!withdrawAmount || !onWithdraw) return;
    setIsWithdrawing(true);
    try {
      await onWithdraw(pool.id, withdrawAmount);
      setWithdrawAmount("");
      setDialogOpen(false);
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleHarvest = async () => {
    if (!isConnected) {
      open();
      return;
    }
    if (!onHarvest) return;
    setIsHarvesting(true);
    try {
      await onHarvest(pool.id);
    } finally {
      setIsHarvesting(false);
    }
  };

  return (
    <Card className="overflow-hidden hover:border-[var(--color-foreground)]/20 transition-all duration-200">
      <CardContent className="p-0">
        {/* Main Row */}
        <div
          className="p-4 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center justify-between">
            {/* Pool Info */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white">
                  {pool.token0.logoUrl ? (
                    <Image
                      src={pool.token0.logoUrl}
                      alt={pool.token0.symbol}
                      width={40}
                      height={40}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-[var(--color-muted-foreground)]">
                      {pool.token0.symbol.slice(0, 2)}
                    </div>
                  )}
                </div>
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white absolute -right-4 top-0">
                  {pool.token1.logoUrl ? (
                    <Image
                      src={pool.token1.logoUrl}
                      alt={pool.token1.symbol}
                      width={40}
                      height={40}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-[var(--color-muted-foreground)]">
                      {pool.token1.symbol.slice(0, 2)}
                    </div>
                  )}
                </div>
              </div>
              <div className="ml-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-[var(--color-foreground)]">{pool.name}</span>
                  {pool.isHot && (
                    <Badge variant="destructive" className="text-xs font-mono uppercase">
                      HOT
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-[var(--color-muted-foreground)]">
                  {pool.token0.symbol}-{pool.token1.symbol} LP
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="hidden sm:flex items-center gap-8">
              <div className="text-right">
                <p className="text-sm text-[var(--color-muted-foreground)]">APR</p>
                <div className="flex items-center gap-1 text-[var(--color-primary)] font-medium font-mono">
                  <TrendingUp className="h-4 w-4" />
                  {formatPercent(pool.apr)}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-[var(--color-muted-foreground)]">TVL</p>
                <p className="font-medium text-[var(--color-foreground)]">
                  ${formatCompact(pool.tvl)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-[var(--color-muted-foreground)]">Your Stake</p>
                <p className="font-medium text-[var(--color-foreground)]">
                  {formatUSD(pool.userStaked)}
                </p>
              </div>
            </div>

            {/* Expand Icon */}
            <div className={cn("transition-transform duration-200", expanded && "rotate-180")}>
              <ChevronDown className="h-5 w-5 text-[var(--color-muted-foreground)]" />
            </div>
          </div>

          {/* Mobile Stats */}
          <div className="sm:hidden grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-[var(--color-border)]">
            <div>
              <p className="text-xs text-[var(--color-muted-foreground)]">APR</p>
              <p className="font-medium text-[var(--color-primary)] font-mono">{formatPercent(pool.apr)}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-muted-foreground)]">TVL</p>
              <p className="font-medium text-[var(--color-foreground)]">
                ${formatCompact(pool.tvl)}
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-muted-foreground)]">Staked</p>
              <p className="font-medium text-[var(--color-foreground)]">
                {formatUSD(pool.userStaked)}
              </p>
            </div>
          </div>
        </div>

        {/* Expanded Content */}
        {expanded && (
          <div className="p-4 pt-0 space-y-4">
            <div className="h-px bg-[var(--color-border)]" />

            <div className="flex flex-col sm:flex-row gap-4">
              {/* Rewards Section */}
              <div className="flex-1 rounded-xl bg-[var(--color-foreground)]/5 border border-[var(--color-border)] p-4">
                <p className="text-sm text-[var(--color-muted-foreground)] mb-1">
                  Pending Rewards
                </p>
                <p className="text-xl font-medium text-[var(--color-foreground)]">
                  {formatNumber(pool.pendingRewards, { decimals: 4 })} TITAN
                </p>
                <p className="text-sm text-[var(--color-muted-foreground)] font-mono">
                  ~${formatNumber(pool.pendingRewards * 2.5, { decimals: 2 })}
                </p>
                <Button
                  className="w-full mt-3 cursor-pointer"
                  variant={!isConnected ? "green" : "default"}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleHarvest();
                  }}
                  disabled={isHarvesting || (isConnected && pool.pendingRewards === 0)}
                  isLoading={isHarvesting}
                >
                  {!isConnected ? "Connect Wallet" : "Harvest"}
                </Button>
              </div>

              {/* Actions */}
              <div className="flex-1 flex flex-col gap-2">
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      className="w-full cursor-pointer"
                      variant="default"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Stake LP
                    </Button>
                  </DialogTrigger>
                  <DialogContent onClick={(e) => e.stopPropagation()} className="bg-white border-[var(--color-border)]">
                    <DialogHeader>
                      <DialogTitle className="text-[var(--color-foreground)]">{pool.name}</DialogTitle>
                    </DialogHeader>
                    <Tabs defaultValue="deposit">
                      <TabsList className="w-full bg-[var(--color-foreground)]/5 p-1 rounded-full">
                        <TabsTrigger value="deposit" className="flex-1 rounded-md data-[state=active]:bg-white cursor-pointer">
                          Deposit
                        </TabsTrigger>
                        <TabsTrigger value="withdraw" className="flex-1 rounded-md data-[state=active]:bg-white cursor-pointer">
                          Withdraw
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="deposit" className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-[var(--color-muted-foreground)]">Amount</span>
                            <span className="text-[var(--color-muted-foreground)]">
                              Balance: 0.00 LP
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Input
                              type="text"
                              placeholder="0.0"
                              value={depositAmount}
                              onChange={(e) => setDepositAmount(e.target.value)}
                            />
                            <Button variant="outline" className="cursor-pointer">MAX</Button>
                          </div>
                        </div>
                        <Button
                          className="w-full cursor-pointer"
                          variant={!isConnected ? "green" : "default"}
                          onClick={handleDeposit}
                          disabled={isDepositing || (isConnected && !depositAmount)}
                          isLoading={isDepositing}
                        >
                          {!isConnected ? "Connect Wallet" : "Deposit"}
                        </Button>
                      </TabsContent>
                      <TabsContent value="withdraw" className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-[var(--color-muted-foreground)]">Amount</span>
                            <span className="text-[var(--color-muted-foreground)]">
                              Staked: {formatNumber(pool.userStaked / 2.5, { decimals: 2 })} LP
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Input
                              type="text"
                              placeholder="0.0"
                              value={withdrawAmount}
                              onChange={(e) => setWithdrawAmount(e.target.value)}
                            />
                            <Button variant="outline" className="cursor-pointer">MAX</Button>
                          </div>
                        </div>
                        <Button
                          className="w-full cursor-pointer"
                          onClick={handleWithdraw}
                          disabled={isWithdrawing || (isConnected && !withdrawAmount)}
                          isLoading={isWithdrawing}
                        >
                          {!isConnected ? "Connect Wallet" : "Withdraw"}
                        </Button>
                      </TabsContent>
                    </Tabs>
                  </DialogContent>
                </Dialog>

                <Button
                  variant="outline"
                  className="w-full cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Get LP
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
