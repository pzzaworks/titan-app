"use client";

import { useState } from "react";
import Image from "next/image";
import { Info, ArrowRight, Loader2 } from "lucide-react";
import { useAccount } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";
import { TickRangePreset } from "@/hooks/useLiquidityV4";

interface AddLiquidityCardProps {
  amount0: string;
  amount1: string;
  tickRange: TickRangePreset;
  setAmount0: (amount: string) => void;
  setAmount1: (amount: string) => void;
  setTickRange: (range: TickRangePreset) => void;
  titanBalance: string;
  wethBalance: string;
  ethBalance: string;
  titanIsCurrency0: boolean;
  hasLiquidity: boolean;
  needsTitanApprovalForPermit2: boolean;
  needsWethApprovalForPermit2: boolean;
  needsTitanPermit2Approval: boolean;
  needsWethPermit2Approval: boolean;
  hasEnoughTitan: boolean;
  hasEnoughWeth: boolean;
  hasEnoughEth: boolean;
  isAddingLiquidity: boolean;
  isApproving: boolean;
  isWrapping: boolean;
  onWrapETH: (amount: string) => Promise<void>;
  onApproveTokenToPermit2: (token: "TITAN" | "WETH") => Promise<void>;
  onApprovePermit2ToPositionManager: (token: "TITAN" | "WETH") => Promise<void>;
  onAddLiquidity: () => Promise<void>;
}

const TICK_RANGE_OPTIONS: { value: TickRangePreset; label: string; description: string }[] = [
  { value: "full", label: "Full Range", description: "Entire price range" },
  { value: "wide", label: "Wide", description: "Large price range" },
  { value: "medium", label: "Medium", description: "Moderate range" },
  { value: "narrow", label: "Narrow", description: "Concentrated liquidity" },
];

export function AddLiquidityCard({
  amount0,
  amount1,
  tickRange,
  setAmount0,
  setAmount1,
  setTickRange,
  titanBalance,
  wethBalance,
  ethBalance,
  titanIsCurrency0,
  hasLiquidity,
  needsTitanApprovalForPermit2,
  needsWethApprovalForPermit2,
  needsTitanPermit2Approval,
  needsWethPermit2Approval,
  hasEnoughTitan,
  hasEnoughWeth,
  hasEnoughEth,
  isAddingLiquidity,
  isApproving,
  isWrapping,
  onWrapETH,
  onApproveTokenToPermit2,
  onApprovePermit2ToPositionManager,
  onAddLiquidity,
}: AddLiquidityCardProps) {
  const { isConnected } = useAccount();
  const { open } = useAppKit();
  const [showWrapDialog, setShowWrapDialog] = useState(false);

  const titanAmount = titanIsCurrency0 ? amount0 : amount1;
  const wethAmount = titanIsCurrency0 ? amount1 : amount0;
  const setTitanAmountRaw = titanIsCurrency0 ? setAmount0 : setAmount1;
  const setWethAmountRaw = titanIsCurrency0 ? setAmount1 : setAmount0;

  // Sanitize input to only allow valid decimal numbers
  const sanitizeInput = (value: string): string => {
    // Allow only digits and one decimal point
    let sanitized = value.replace(/[^0-9.]/g, "");
    // Ensure only one decimal point
    const parts = sanitized.split(".");
    if (parts.length > 2) {
      sanitized = parts[0] + "." + parts.slice(1).join("");
    }
    return sanitized;
  };

  const setTitanAmount = (value: string) => setTitanAmountRaw(sanitizeInput(value));
  const setWethAmount = (value: string) => setWethAmountRaw(sanitizeInput(value));

  // Determine next action
  const getNextAction = () => {
    if (!isConnected) return { text: "Connect Wallet", action: () => open(), disabled: false };
    if (isApproving) return { text: "Approving...", disabled: true };
    if (isWrapping) return { text: "Wrapping ETH...", disabled: true };
    if (isAddingLiquidity) return { text: "Adding Liquidity...", disabled: true };

    const hasTitanAmount = titanAmount && parseFloat(titanAmount) > 0;
    const hasWethAmount = wethAmount && parseFloat(wethAmount) > 0;

    if (!hasTitanAmount && !hasWethAmount) {
      return { text: "Enter Amount", disabled: true };
    }

    if (hasWethAmount && !hasEnoughWeth && hasEnoughEth) {
      return { text: "Wrap ETH", action: () => onWrapETH(wethAmount), disabled: false };
    }

    if (hasTitanAmount && !hasEnoughTitan) {
      return { text: "Insufficient TITAN Balance", disabled: true };
    }

    if (hasWethAmount && !hasEnoughWeth && !hasEnoughEth) {
      return { text: "Insufficient ETH Balance", disabled: true };
    }

    if (hasTitanAmount && needsTitanApprovalForPermit2) {
      return {
        text: "Approve TITAN",
        action: () => onApproveTokenToPermit2("TITAN"),
        disabled: false,
      };
    }

    if (hasWethAmount && needsWethApprovalForPermit2) {
      return {
        text: "Approve WETH",
        action: () => onApproveTokenToPermit2("WETH"),
        disabled: false,
      };
    }

    if (hasTitanAmount && needsTitanPermit2Approval) {
      return {
        text: "Enable TITAN for Liquidity",
        action: () => onApprovePermit2ToPositionManager("TITAN"),
        disabled: false,
      };
    }

    if (hasWethAmount && needsWethPermit2Approval) {
      return {
        text: "Enable WETH for Liquidity",
        action: () => onApprovePermit2ToPositionManager("WETH"),
        disabled: false,
      };
    }

    if (!hasLiquidity) {
      return { text: "Create Pool & Add Liquidity", action: onAddLiquidity, disabled: false };
    }

    return { text: "Add Liquidity", action: onAddLiquidity, disabled: false };
  };

  const action = getNextAction();

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Add Liquidity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* TITAN Input */}
        <div className="rounded-xl bg-[var(--color-foreground)]/5 border border-[var(--color-border)] p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-[var(--color-muted-foreground)]">TITAN</span>
            <span className="text-sm text-[var(--color-muted-foreground)]">
              Balance: {formatNumber(parseFloat(titanBalance), { decimals: 4 })}
            </span>
          </div>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="0.0"
              value={titanAmount}
              onChange={(e) => setTitanAmount(e.target.value)}
              className="text-xl font-medium border-0 bg-transparent p-0 h-auto !outline-none !ring-0 !shadow-none"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTitanAmount(titanBalance)}
              className="text-[var(--color-primary)] hover:text-[var(--color-primary)] cursor-pointer"
            >
              MAX
            </Button>
          </div>
        </div>

        {/* Plus icon */}
        <div className="flex justify-center">
          <span className="text-xl text-[var(--color-muted-foreground)]">+</span>
        </div>

        {/* WETH Input */}
        <div className="rounded-xl bg-[var(--color-foreground)]/5 border border-[var(--color-border)] p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-[var(--color-muted-foreground)]">WETH</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--color-muted-foreground)]">
                Balance: {formatNumber(parseFloat(wethBalance), { decimals: 4 })}
              </span>
              {parseFloat(ethBalance) > 0.01 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="outline" className="text-xs cursor-help">
                        {formatNumber(parseFloat(ethBalance), { decimals: 4 })} ETH
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>You have ETH that can be wrapped to WETH</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="0.0"
              value={wethAmount}
              onChange={(e) => setWethAmount(e.target.value)}
              className="text-xl font-medium border-0 bg-transparent p-0 h-auto !outline-none !ring-0 !shadow-none"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setWethAmount(wethBalance)}
              className="text-[var(--color-primary)] hover:text-[var(--color-primary)] cursor-pointer"
            >
              MAX
            </Button>
          </div>
        </div>

        {/* Price Range Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[var(--color-foreground)]">Price Range</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-[var(--color-muted-foreground)]" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>
                    Concentrated liquidity allows you to provide liquidity within a specific price
                    range. Narrower ranges earn more fees but may go out of range.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {TICK_RANGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setTickRange(option.value)}
                className={cn(
                  "p-3 rounded-xl border text-center transition-all cursor-pointer",
                  tickRange === option.value
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                    : "border-[var(--color-border)] hover:border-[var(--color-foreground)]/20"
                )}
              >
                <p className="text-sm font-medium text-[var(--color-foreground)]">{option.label}</p>
                <p className="text-xs text-[var(--color-muted-foreground)]">{option.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Pool Info */}
        {hasLiquidity && (
          <div className="rounded-xl bg-[var(--color-foreground)]/5 border border-[var(--color-border)] p-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[var(--color-muted-foreground)]">Pool Status:</span>
              <Badge variant="success" className="bg-green-500/10 text-green-600">
                Active
              </Badge>
            </div>
          </div>
        )}

        {/* Wrap ETH Info */}
        {wethAmount && parseFloat(wethAmount) > 0 && !hasEnoughWeth && hasEnoughEth && (
          <div className="rounded-xl bg-[var(--color-foreground)]/5 border border-[var(--color-foreground)]/10 p-4">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-[var(--color-foreground)] mt-0.5 flex-shrink-0" />
              <div className="text-sm text-[var(--color-foreground)]">
                <p className="font-medium">Wrap ETH to WETH</p>
                <p className="mt-1 text-[var(--color-muted-foreground)]">
                  Your WETH balance ({formatNumber(parseFloat(wethBalance), { decimals: 4 })} WETH) is insufficient.
                  You have {formatNumber(parseFloat(ethBalance), { decimals: 4 })} ETH available to wrap.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <Button
          className="w-full cursor-pointer"
          size="lg"
          variant={!isConnected ? "green" : "default"}
          onClick={action.action}
          disabled={action.disabled}
          isLoading={isAddingLiquidity || isApproving || isWrapping}
        >
          {action.text}
        </Button>

        {/* Uniswap Link */}
        <a
          href="https://uniswap.org"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 pt-3 text-[var(--color-muted-foreground)] hover:text-[#FF007A] transition-colors"
        >
          <Image
            src="/uniswap-logo.svg"
            alt="Uniswap"
            width={14}
            height={14}
            className="rounded-full"
          />
          <span className="text-xs font-medium">Uniswap V4</span>
        </a>
      </CardContent>
    </Card>
  );
}
