"use client";

import { ArrowUpDown, Info } from "lucide-react";
import { useAccount } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { useSwapV4 } from "@/hooks/useSwapV4";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TokenInput } from "@/components/shared/TokenInput";
import { SwapSettings } from "./SwapSettings";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { formatPercent, formatNumber } from "@/lib/format";
import Image from "next/image";

export function SwapCard() {
  const { isConnected } = useAccount();
  const { open } = useAppKit();
  const {
    tokenIn,
    tokenOut,
    amountIn,
    amountOut,
    priceImpact,
    isLoading,
    isSwapping,
    isApproving,
    isWrapping,
    isWrapOperation,
    isUnwrapOperation,
    needsTokenApproval,
    needsWrap,
    hasLiquidity,
    poolInitializedButEmpty,
    slippage,
    suggestedSlippage,
    autoSlippage,
    deadline,
    ethBalance,
    wethBalance,
    setSlippage,
    setAutoSlippage,
    setDeadline,
    setTokenIn,
    setTokenOut,
    setAmountIn,
    switchTokens,
    approveToSwapRouter,
    wrapETH,
    unwrapWETH,
    swap,
    getBalance,
    tokens,
  } = useSwapV4();

  const isWrapOrUnwrap = isWrapOperation || isUnwrapOperation;

  const handleSwap = async () => {
    if (!isConnected) {
      open();
      return;
    }
    if (isWrapOperation) {
      await wrapETH(amountIn);
    } else if (isUnwrapOperation) {
      await unwrapWETH(amountIn);
    } else if (needsWrap) {
      await wrapETH(amountIn);
    } else if (needsTokenApproval) {
      await approveToSwapRouter();
    } else {
      await swap();
    }
  };

  const getButtonText = () => {
    if (!isConnected) return "Connect Wallet";
    if (isWrapping) return isWrapOperation ? "Wrapping..." : "Unwrapping...";
    if (isApproving) return "Approving...";
    if (isSwapping) return "Swapping...";
    if (isWrapOperation) return "Wrap ETH";
    if (isUnwrapOperation) return "Unwrap WETH";
    if (needsWrap) return "Wrap ETH to WETH";
    if (needsTokenApproval) return `Approve ${tokenIn.symbol}`;
    if (!amountIn) return "Enter Amount";
    if (poolInitializedButEmpty) return "Add Liquidity First";
    if (!hasLiquidity) return "No Liquidity";
    return "Swap";
  };

  const isButtonDisabled =
    isSwapping ||
    isApproving ||
    isWrapping ||
    (isConnected && (isWrapOrUnwrap ? !amountIn : (!needsWrap && !needsTokenApproval && (!amountIn || !amountOut || !hasLiquidity))));

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Swap</CardTitle>
        <SwapSettings
          slippage={slippage}
          suggestedSlippage={suggestedSlippage}
          autoSlippage={autoSlippage}
          deadline={deadline}
          onSlippageChange={setSlippage}
          onAutoSlippageChange={setAutoSlippage}
          onDeadlineChange={setDeadline}
        />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Token Inputs with Switch Button */}
        <div className="relative">
          {/* Token In */}
          <TokenInput
            label="You Pay"
            token={tokenIn}
            amount={amountIn}
            balance={getBalance(tokenIn)}
            onAmountChange={setAmountIn}
            onTokenSelect={setTokenIn}
            tokens={tokens}
          />

          {/* Switch Button - positioned between inputs */}
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-5 z-10">
            <button
              className="p-2 rounded-full bg-white border border-[var(--color-border)] hover:border-[#999999] hover:bg-[#f5f5f5] transition-all duration-200 cursor-pointer group"
              onClick={switchTokens}
            >
              <ArrowUpDown className="h-4 w-4 text-[var(--color-muted-foreground)] group-hover:text-[var(--color-foreground)] transition-colors" />
            </button>
          </div>
        </div>

        {/* Token Out */}
        <TokenInput
          label="You Receive"
          token={tokenOut}
          amount={amountOut}
          balance={getBalance(tokenOut)}
          onTokenSelect={setTokenOut}
          tokens={tokens}
          readOnly
          isLoading={isLoading}
        />

        {/* Price Info */}
        {amountIn && amountOut && (
          <div className="px-1 space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--color-muted-foreground)]">Rate</span>
              <span className="font-medium text-[var(--color-foreground)]">
                1 {tokenIn.symbol} ={" "}
                {formatNumber(parseFloat(amountOut) / parseFloat(amountIn), { decimals: 4 })}{" "}
                {tokenOut.symbol}
              </span>
            </div>
            {isWrapOrUnwrap ? (
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--color-muted-foreground)]">
                  {isWrapOperation ? "Wrap" : "Unwrap"} Fee
                </span>
                <span className="font-medium text-green-600 font-mono">Free</span>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-[var(--color-muted-foreground)]">
                    <span>Price Impact</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-3 w-3" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>The impact your trade has on the market price</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <span
                    className={cn(
                      "font-medium font-mono",
                      priceImpact > 3
                        ? "text-red-500"
                        : priceImpact > 1
                        ? "text-yellow-600"
                        : "text-[var(--color-primary)]"
                    )}
                  >
                    {formatPercent(priceImpact)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--color-muted-foreground)]">Slippage Tolerance</span>
                  <span className="font-medium text-[var(--color-foreground)] font-mono">
                    {autoSlippage ? `Auto (${slippage.toFixed(2)}%)` : `${slippage.toFixed(2)}%`}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--color-muted-foreground)]">Min. Received</span>
                  <span className="font-medium text-[var(--color-foreground)] font-mono">
                    {formatNumber(parseFloat(amountOut) * (100 - slippage) / 100, { decimals: 6 })} {tokenOut.symbol}
                  </span>
                </div>
              </>
            )}
          </div>
        )}

        {/* Wrap ETH Info */}
        {needsWrap && (
          <div className="rounded-xl bg-[var(--color-foreground)]/5 border border-[var(--color-foreground)]/10 p-4 space-y-2">
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

        {/* Swap Button */}
        <Button
          className="w-full cursor-pointer"
          size="lg"
          variant={!isConnected ? "green" : "default"}
          onClick={handleSwap}
          disabled={isButtonDisabled}
          isLoading={isSwapping || isApproving || isWrapping}
        >
          {getButtonText()}
        </Button>

        {/* Uniswap Link */}
        <a
          href="https://uniswap.org"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 pt-3 text-[var(--color-muted-foreground)] hover:text-[#FF007A] transition-colors"
        >
          <span className="text-xs">Powered by</span>
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
