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
  currentTick: number;
  onRemoveLiquidity: (tokenId: bigint, percentage: number) => Promise<void>;
  onCollectFees: (tokenId: bigint) => Promise<void>;
  isRemovingLiquidity: boolean;
  isCollectingFees: boolean;
}

export function PositionCard({
  position,
  titanIsCurrency0,
  currentTick,
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

  // Determine range status - check if current tick is within position range
  const isInRange = currentTick >= position.tickLower && currentTick < position.tickUpper;

  // Check if this is a full range position
  const isFullRange = position.tickLower <= -887220 && position.tickUpper >= 887220;

  // Calculate position within range for progress bar (0-100%)
  const rangeProgress = (() => {
    if (isFullRange) {
      // For full range, show position relative to reasonable bounds
      const displayLower = -200000;
      const displayUpper = 200000;
      const clampedTick = Math.max(displayLower, Math.min(displayUpper, currentTick));
      return ((clampedTick - displayLower) / (displayUpper - displayLower)) * 100;
    }
    if (currentTick <= position.tickLower) return 0;
    if (currentTick >= position.tickUpper) return 100;
    return ((currentTick - position.tickLower) / (position.tickUpper - position.tickLower)) * 100;
  })();

  // Convert tick to price (TITAN per ETH)
  const tickToPrice = (tick: number): number => {
    return Math.pow(1.0001, tick);
  };

  // Current price from tick
  const currentPrice = tickToPrice(currentTick);

  // Format price for display - shows ETH per TITAN (how much ETH for 1 TITAN)
  const formatPriceDisplay = (tick: number): string => {
    const price = tickToPrice(tick);
    // price is TITAN/ETH, we want ETH/TITAN
    const ethPerTitan = 1 / price;
    if (ethPerTitan < 0.0000001) return "< 0.0000001";
    if (ethPerTitan > 1000000) return "> 1M";
    return ethPerTitan.toFixed(ethPerTitan < 0.001 ? 8 : ethPerTitan < 1 ? 6 : 4);
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
          <div className="flex items-center gap-3">
            {/* Token Icons */}
            <div className="relative flex items-center flex-shrink-0">
              <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white bg-[var(--color-background)] flex items-center justify-center">
                <Image
                  src={config.tokens.TITAN.logoUrl}
                  alt="TITAN"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              </div>
              <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white bg-[var(--color-background)] -ml-2.5 flex items-center justify-center">
                <Image
                  src={config.tokens.WETH.logoUrl}
                  alt="WETH"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              </div>
            </div>

            {/* Position Info */}
            <div className="flex-shrink-0 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-[var(--color-foreground)] text-sm">TITAN/WETH</span>
                <Badge
                  className={cn(
                    "text-[10px] px-1.5 py-0",
                    isInRange
                      ? "bg-green-500/10 text-green-600"
                      : "bg-yellow-500/10 text-yellow-600"
                  )}
                >
                  {isInRange ? "In Range" : "Out"}
                </Badge>
              </div>
              <p className="text-xs text-[var(--color-muted-foreground)]">
                {formatPositionId()}
              </p>
            </div>

            {/* Stats - flex grow to fill space */}
            <div className="flex items-center gap-4 sm:gap-6 ml-auto">
              <div className="text-right">
                <p className="text-[10px] text-[var(--color-muted-foreground)] uppercase tracking-wide">Value</p>
                <p className="font-medium text-[var(--color-foreground)] font-mono text-sm">
                  {formatNumber(parseFloat(titanAmount), { decimals: 2 })}
                  <span className="text-[var(--color-muted-foreground)] ml-1 text-xs">TITAN</span>
                </p>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-[10px] text-[var(--color-muted-foreground)] uppercase tracking-wide">Fees</p>
                <p className={cn(
                  "font-medium font-mono text-sm",
                  hasUnclaimedFees ? "text-green-600" : "text-[var(--color-muted-foreground)]"
                )}>
                  {hasUnclaimedFees ? formatNumber(totalFees, { decimals: 4 }) : "-"}
                </p>
              </div>

              {/* Expand Icon */}
              <div className={cn("transition-transform duration-200 flex-shrink-0", expanded && "rotate-180")}>
                <ChevronDown className="h-4 w-4 text-[var(--color-muted-foreground)]" />
              </div>
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

              <div className={cn(
                "rounded-xl border p-4",
                hasUnclaimedFees
                  ? "bg-green-500/5 border-green-500/20"
                  : "bg-[var(--color-foreground)]/5 border-[var(--color-border)]"
              )}>
                <div className={cn(
                  "flex items-center gap-2 text-sm mb-2",
                  hasUnclaimedFees ? "text-green-600" : "text-[var(--color-muted-foreground)]"
                )}>
                  <DollarSign className="h-4 w-4" />
                  <span>Unclaimed Fees</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-muted-foreground)]">TITAN</span>
                    <span className={cn(
                      "font-medium font-mono",
                      parseFloat(titanFees) > 0 ? "text-green-600" : "text-[var(--color-muted-foreground)]"
                    )}>
                      {parseFloat(titanFees) > 0 ? formatNumber(parseFloat(titanFees), { decimals: 6 }) : "0"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-muted-foreground)]">WETH</span>
                    <span className={cn(
                      "font-medium font-mono",
                      parseFloat(wethFees) > 0 ? "text-green-600" : "text-[var(--color-muted-foreground)]"
                    )}>
                      {parseFloat(wethFees) > 0 ? formatNumber(parseFloat(wethFees), { decimals: 8 }) : "0"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Range */}
            <div className="rounded-xl bg-[var(--color-foreground)]/5 border border-[var(--color-border)] p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm text-[var(--color-muted-foreground)]">
                  <TrendingUp className="h-4 w-4" />
                  <span>Price Range</span>
                </div>
                {isFullRange && (
                  <Badge className="bg-blue-500/10 text-blue-600 text-xs">
                    Full Range
                  </Badge>
                )}
              </div>

              {isFullRange ? (
                /* Full Range Display */
                <div className="text-center py-2">
                  <div className="flex items-center justify-center gap-4 text-sm">
                    <span className="text-[var(--color-muted-foreground)]">0</span>
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-green-500/10 rounded-full">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="font-mono text-green-600">
                        1 TITAN = {formatPriceDisplay(currentTick)} ETH
                      </span>
                    </div>
                    <span className="text-[var(--color-muted-foreground)]">∞</span>
                  </div>
                  <p className="text-xs text-[var(--color-muted-foreground)] mt-2">
                    Earns fees at any price
                  </p>
                </div>
              ) : (
                /* Normal Range Display */
                <div className="space-y-3">
                  {/* Price bounds */}
                  <div className="flex justify-between text-sm">
                    <div>
                      <p className="text-xs text-[var(--color-muted-foreground)] mb-1">Min Price</p>
                      <p className="font-mono text-[var(--color-foreground)]">
                        {formatPriceDisplay(position.tickLower)} ETH
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[var(--color-muted-foreground)] mb-1">Max Price</p>
                      <p className="font-mono text-[var(--color-foreground)]">
                        {formatPriceDisplay(position.tickUpper)} ETH
                      </p>
                    </div>
                  </div>

                  {/* Range bar with current price */}
                  <div className="relative">
                    <div className="h-2 bg-[var(--color-border)] rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          isInRange ? "bg-green-500/30" : "bg-yellow-500/30"
                        )}
                        style={{ width: "100%" }}
                      />
                    </div>
                    {/* Current price indicator */}
                    <div
                      className={cn(
                        "absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow-sm",
                        isInRange ? "bg-green-500" : "bg-yellow-500"
                      )}
                      style={{ left: `calc(${Math.min(100, Math.max(0, rangeProgress))}% - 6px)` }}
                    />
                  </div>

                  {/* Current price */}
                  <div className="text-center">
                    <span className="text-xs text-[var(--color-muted-foreground)]">Current: </span>
                    <span className="text-xs font-mono text-[var(--color-foreground)]">
                      1 TITAN = {formatPriceDisplay(currentTick)} ETH
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                className="flex-1 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onCollectFees(position.tokenId);
                }}
                disabled={!isConnected || isCollectingFees || !hasUnclaimedFees}
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
