"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, Droplets, DollarSign, TrendingUp } from "lucide-react";
import { useAccount } from "wagmi";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";
import { config } from "@/config";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

interface Position {
  tokenId: bigint;
  tickLower: number;
  tickUpper: number;
  liquidity: bigint;
  amount0: string;
  amount1: string;
  fees0: string;
  fees1: string;
}

interface PositionCardProps {
  position: Position;
  titanIsCurrency0: boolean;
  onRemoveLiquidity: (tokenId: bigint, percentage: number) => Promise<void>;
  onCollectFees: (tokenId: bigint) => Promise<void>;
  isRemovingLiquidity: boolean;
  isCollectingFees: boolean;
}

export function PositionCard({
  position,
  titanIsCurrency0,
  onRemoveLiquidity,
  onCollectFees,
  isRemovingLiquidity,
  isCollectingFees,
}: PositionCardProps) {
  const { isConnected } = useAccount();
  const [expanded, setExpanded] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [removePercentage, setRemovePercentage] = useState(100);

  const titanAmount = titanIsCurrency0 ? position.amount0 : position.amount1;
  const wethAmount = titanIsCurrency0 ? position.amount1 : position.amount0;
  const titanFees = titanIsCurrency0 ? position.fees0 : position.fees1;
  const wethFees = titanIsCurrency0 ? position.fees1 : position.fees0;

  const totalFees = parseFloat(titanFees) + parseFloat(wethFees);
  const hasUnclaimedFees = totalFees > 0;

  // Determine range status (simplified - in production, compare with current tick)
  const isInRange = position.liquidity > BigInt(0);

  // Check if this is a full range position
  const isFullRange = position.tickLower <= -887200 && position.tickUpper >= 887200;

  // Format price for display - handle extreme values for full range
  const formatPrice = (tick: number, isMin: boolean) => {
    if (isFullRange) {
      return isMin ? "0" : "∞";
    }
    const price = Math.pow(1.0001, tick);
    if (price < 0.000001) return "~0";
    if (price > 1000000000) return "∞";
    return formatNumber(price, { decimals: price < 1 ? 8 : 4 });
  };

  // Format position ID for display
  const formatPositionId = () => {
    if (isFullRange) return "Full Range";
    return `${position.tickLower} to ${position.tickUpper}`;
  };

  const handleRemove = async () => {
    await onRemoveLiquidity(position.tokenId, removePercentage);
    setRemoveDialogOpen(false);
  };

  return (
    <Card className="overflow-hidden hover:border-[var(--color-foreground)]/20 transition-all duration-200">
      <CardContent className="p-0">
        {/* Main Row */}
        <div className="p-4 cursor-pointer" onClick={() => setExpanded(!expanded)}>
          <div className="flex items-center justify-between">
            {/* Position Info */}
            <div className="flex items-center gap-4">
              <div className="relative flex items-center">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white bg-[var(--color-background)] flex items-center justify-center">
                  <Image
                    src={config.tokens.TITAN.logoUrl}
                    alt="TITAN"
                    width={36}
                    height={36}
                    className="rounded-full"
                  />
                </div>
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white bg-[var(--color-background)] -ml-3 flex items-center justify-center">
                  <Image
                    src={config.tokens.WETH.logoUrl}
                    alt="WETH"
                    width={36}
                    height={36}
                    className="rounded-full"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-[var(--color-foreground)]">TITAN / WETH</span>
                  <Badge
                    variant={isInRange ? "success" : "warning"}
                    className={cn(
                      "text-xs",
                      isInRange
                        ? "bg-green-500/10 text-green-600"
                        : "bg-yellow-500/10 text-yellow-600"
                    )}
                  >
                    {isInRange ? "In Range" : "Out of Range"}
                  </Badge>
                </div>
                <p className="text-sm text-[var(--color-muted-foreground)]">
                  {formatPositionId()}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="hidden sm:flex items-center gap-8">
              <div className="text-right">
                <p className="text-sm text-[var(--color-muted-foreground)]">Value</p>
                <p className="font-medium text-[var(--color-foreground)] font-mono">
                  {formatNumber(parseFloat(titanAmount), { decimals: 4 })} TITAN
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-[var(--color-muted-foreground)]">Unclaimed Fees</p>
                <p
                  className={cn(
                    "font-medium font-mono",
                    hasUnclaimedFees ? "text-[var(--color-primary)]" : "text-[var(--color-foreground)]"
                  )}
                >
                  ${formatNumber(totalFees * 2.5, { decimals: 2 })}
                </p>
              </div>
            </div>

            {/* Expand Icon */}
            <div className={cn("transition-transform duration-200", expanded && "rotate-180")}>
              <ChevronDown className="h-5 w-5 text-[var(--color-muted-foreground)]" />
            </div>
          </div>

          {/* Mobile Stats */}
          <div className="sm:hidden grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-[var(--color-border)]">
            <div>
              <p className="text-xs text-[var(--color-muted-foreground)]">Value</p>
              <p className="font-medium text-[var(--color-foreground)] font-mono">
                {formatNumber(parseFloat(titanAmount), { decimals: 4 })} TITAN
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-muted-foreground)]">Unclaimed Fees</p>
              <p className="font-medium text-[var(--color-foreground)] font-mono">
                ${formatNumber(totalFees * 2.5, { decimals: 2 })}
              </p>
            </div>
          </div>
        </div>

        {/* Expanded Content */}
        {expanded && (
          <div className="p-4 pt-0 space-y-4">
            <div className="h-px bg-[var(--color-border)]" />

            {/* Position Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-[var(--color-foreground)]/5 border border-[var(--color-border)] p-4">
                <div className="flex items-center gap-2 text-sm text-[var(--color-muted-foreground)] mb-2">
                  <Droplets className="h-4 w-4" />
                  <span>Liquidity</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-muted-foreground)]">TITAN</span>
                    <span className="font-medium text-[var(--color-foreground)] font-mono">
                      {formatNumber(parseFloat(titanAmount), { decimals: 6 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-muted-foreground)]">WETH</span>
                    <span className="font-medium text-[var(--color-foreground)] font-mono">
                      {formatNumber(parseFloat(wethAmount), { decimals: 6 })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-[var(--color-foreground)]/5 border border-[var(--color-border)] p-4">
                <div className="flex items-center gap-2 text-sm text-[var(--color-muted-foreground)] mb-2">
                  <DollarSign className="h-4 w-4" />
                  <span>Unclaimed Fees</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-muted-foreground)]">TITAN</span>
                    <span className="font-medium text-[var(--color-primary)] font-mono">
                      {formatNumber(parseFloat(titanFees), { decimals: 6 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-muted-foreground)]">WETH</span>
                    <span className="font-medium text-[var(--color-primary)] font-mono">
                      {formatNumber(parseFloat(wethFees), { decimals: 6 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Range */}
            <div className="rounded-xl bg-[var(--color-foreground)]/5 border border-[var(--color-border)] p-4">
              <div className="flex items-center gap-2 text-sm text-[var(--color-muted-foreground)] mb-2">
                <TrendingUp className="h-4 w-4" />
                <span>Price Range</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <p className="text-xs text-[var(--color-muted-foreground)]">Min Price</p>
                  <p className="font-medium text-[var(--color-foreground)] font-mono">
                    {formatPrice(position.tickLower, true)}
                  </p>
                </div>
                <div className="flex-1 mx-4 h-2 bg-[var(--color-border)] rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      isInRange ? "bg-green-500" : "bg-yellow-500"
                    )}
                    style={{ width: isInRange ? "50%" : "0%" }}
                  />
                </div>
                <div className="text-center">
                  <p className="text-xs text-[var(--color-muted-foreground)]">Max Price</p>
                  <p className="font-medium text-[var(--color-foreground)] font-mono">
                    {formatPrice(position.tickUpper, false)}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                className="flex-1 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onCollectFees(position.tokenId);
                }}
                disabled={!isConnected || !hasUnclaimedFees || isCollectingFees}
                isLoading={isCollectingFees}
              >
                Collect Fees
              </Button>

              <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-1 cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Remove Liquidity
                  </Button>
                </DialogTrigger>
                <DialogContent
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white border-[var(--color-border)]"
                >
                  <DialogHeader>
                    <DialogTitle className="text-[var(--color-foreground)]">
                      Remove Liquidity
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-[var(--color-muted-foreground)]">
                          Amount to Remove
                        </span>
                        <span className="text-2xl font-bold text-[var(--color-foreground)]">
                          {removePercentage}%
                        </span>
                      </div>
                      <Slider
                        value={[removePercentage]}
                        onValueChange={(value) => setRemovePercentage(value[0])}
                        max={100}
                        min={1}
                        step={1}
                        className="cursor-pointer"
                      />
                      <div className="flex justify-between gap-2">
                        {[25, 50, 75, 100].map((pct) => (
                          <Button
                            key={pct}
                            variant="outline"
                            size="sm"
                            onClick={() => setRemovePercentage(pct)}
                            className={cn(
                              "flex-1 cursor-pointer",
                              removePercentage === pct &&
                                "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                            )}
                          >
                            {pct}%
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl bg-[var(--color-foreground)]/5 border border-[var(--color-border)] p-4 space-y-2">
                      <p className="text-sm text-[var(--color-muted-foreground)]">
                        You will receive approximately:
                      </p>
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--color-foreground)]">TITAN</span>
                        <span className="font-medium text-[var(--color-foreground)] font-mono">
                          {formatNumber(
                            (parseFloat(titanAmount) * removePercentage) / 100,
                            { decimals: 4 }
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--color-foreground)]">WETH</span>
                        <span className="font-medium text-[var(--color-foreground)] font-mono">
                          {formatNumber(
                            (parseFloat(wethAmount) * removePercentage) / 100,
                            { decimals: 4 }
                          )}
                        </span>
                      </div>
                    </div>

                    <Button
                      className="w-full cursor-pointer"
                      onClick={handleRemove}
                      disabled={!isConnected || isRemovingLiquidity}
                      isLoading={isRemovingLiquidity}
                    >
                      Remove {removePercentage}% Liquidity
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
