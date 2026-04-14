"use client";

import { Droplets, Wallet, DollarSign, BarChart3 } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { PageContainer } from "@/components/shared/PageContainer";
import { StatsCard } from "@/components/shared/StatsCard";
import { AddLiquidityCard } from "@/components/liquidity/AddLiquidityCard";
import { PositionCard } from "@/components/liquidity/PositionCard";
import { formatNumber, formatCompact } from "@/lib/format";
import { useLiquidityV4 } from "@/hooks/useLiquidityV4";
import { useTitanPrice } from "@/hooks/useTitanPrice";
import { formatUnits } from "viem";

export default function LiquidityPage() {
  const {
    // State
    isAddingLiquidity,
    isRemovingLiquidity,
    isCollectingFees,
    isApproving,
    isWrapping,
    isLoadingPositions,
    positions,
    poolState,
    slippage,
    setSlippage,

    // Input state
    amount0,
    amount1,
    tickRange,
    setAmount0,
    setAmount1,
    setTickRange,

    // Balances
    ethBalance,
    wethBalance,
    titanBalance,

    // Approval checks
    needsTitanApprovalForPermit2,
    needsWethApprovalForPermit2,
    needsTitanPermit2Approval,
    needsWethPermit2Approval,
    hasEnoughWeth,
    hasEnoughTitan,
    hasEnoughEth,

    // Pool info
    titanIsCurrency0,
    hasLiquidity,

    // Totals
    totalPositionValue,
    totalUnclaimedFees,

    // Actions
    wrapETH,
    approveTokenToPermit2,
    approvePermit2ToPositionManager,
    addLiquidity,
    removeLiquidity,
    collectFees,
  } = useLiquidityV4();

  const { titanPrice, ethPerTitan } = useTitanPrice();
  const ethPrice = titanPrice / ethPerTitan; // ETH price in USD

  return (
    <PageContainer>
      <Reveal className="mb-12 text-center">
        <h1 className="mb-3 font-display text-[44px] leading-[0.95] font-[300] tracking-[-0.03em] text-[var(--color-foreground)] sm:text-[56px]">
          Liquidity
        </h1>
        <p className="mx-auto max-w-md text-[17px] leading-[1.28] text-[var(--color-muted-foreground)]">
          Open LP positions and collect fees from the TITAN and WETH pool.
        </p>
      </Reveal>

      <Reveal className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" delay={0.06}>
        <StatsCard
          title="Pool Liquidity"
          value={
            poolState && positions.length > 0
              ? `$${formatCompact(
                  positions.reduce((acc, p) => {
                    const wethValue = Number(titanIsCurrency0 ? p.amount1 : p.amount0) * ethPrice;
                    const titanValue = Number(titanIsCurrency0 ? p.amount0 : p.amount1) * titanPrice;
                    return acc + wethValue + titanValue;
                  }, 0)
                )}`
              : "-"
          }
          icon={Droplets}
        />
        <StatsCard
          title="Your Positions"
          value={positions.length.toString()}
          icon={BarChart3}
        />
        <StatsCard
          title="Position Value"
          value={`${formatNumber(totalPositionValue, { decimals: 2 })} LP`}
          icon={Wallet}
        />
        <StatsCard
          title="Unclaimed Fees"
          value={totalUnclaimedFees > 0 ? formatNumber(totalUnclaimedFees, { decimals: 4 }) : "-"}
          icon={DollarSign}
        />
      </Reveal>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)]">
        <Reveal>
          <AddLiquidityCard
            amount0={amount0}
            amount1={amount1}
            tickRange={tickRange}
            setAmount0={setAmount0}
            setAmount1={setAmount1}
            setTickRange={setTickRange}
            titanBalance={titanBalance}
            wethBalance={wethBalance}
            ethBalance={ethBalance}
            titanIsCurrency0={titanIsCurrency0}
            hasLiquidity={hasLiquidity}
            needsTitanApprovalForPermit2={needsTitanApprovalForPermit2}
            needsWethApprovalForPermit2={needsWethApprovalForPermit2}
            needsTitanPermit2Approval={needsTitanPermit2Approval}
            needsWethPermit2Approval={needsWethPermit2Approval}
            hasEnoughTitan={hasEnoughTitan}
            hasEnoughWeth={hasEnoughWeth}
            hasEnoughEth={hasEnoughEth}
            isAddingLiquidity={isAddingLiquidity}
            isApproving={isApproving}
            isWrapping={isWrapping}
            onWrapETH={wrapETH}
            onApproveTokenToPermit2={approveTokenToPermit2}
            onApprovePermit2ToPositionManager={approvePermit2ToPositionManager}
            onAddLiquidity={addLiquidity}
          />
        </Reveal>

        <Reveal className="space-y-4" delay={0.08}>
          <div className="mb-2">
            <h2 className="font-display text-[34px] leading-[0.98] font-[300] tracking-[-0.03em] text-[var(--color-foreground)]">
              Your positions
            </h2>
            <p className="mt-2 text-[15px] text-[var(--color-muted-foreground)]">
              Review ranges, fees, and removals in one place.
            </p>
          </div>

          {isLoadingPositions && (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-24 rounded-xl bg-white/52 animate-pulse"
                />
              ))}
            </div>
          )}

          {!isLoadingPositions && positions.length > 0 && (
            <div className="space-y-4">
              {positions.map((position) => (
                <PositionCard
                  key={position.tokenId.toString()}
                  position={position}
                  titanIsCurrency0={titanIsCurrency0}
                  currentTick={poolState?.tick ?? 0}
                  onRemoveLiquidity={removeLiquidity}
                  onCollectFees={collectFees}
                  isRemovingLiquidity={isRemovingLiquidity}
                  isCollectingFees={isCollectingFees}
                />
              ))}
            </div>
          )}

          {!isLoadingPositions && positions.length === 0 && (
            <div className="rounded-xl bg-white/52 p-8 text-center">
              <Droplets className="mx-auto mb-4 h-12 w-12 text-[var(--color-muted-foreground)]" />
              <h3 className="mb-2 font-display text-[30px] leading-[1] font-[300] tracking-[-0.03em] text-[var(--color-foreground)]">
                No Positions Yet
              </h3>
              <p className="mx-auto max-w-xs text-sm text-[var(--color-muted-foreground)]">
                Add liquidity to start earning fees from swaps in the pool.
              </p>
            </div>
          )}

          {poolState && (
            <div className="rounded-xl bg-white/52 p-5 space-y-3">
              <h3 className="font-display text-[24px] leading-[1] font-[300] tracking-[-0.03em] text-[var(--color-foreground)]">
                Pool info
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--color-muted-foreground)]">Fee Tier</span>
                  <span className="font-medium text-[var(--color-foreground)]">0.3%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-muted-foreground)]">Current Tick</span>
                  <span className="font-medium text-[var(--color-foreground)] font-mono">
                    {poolState.tick}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-muted-foreground)]">Status</span>
                  <span className="font-medium text-[var(--color-primary)]">
                    {poolState.initialized ? "Active" : "Not Initialized"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </Reveal>
      </div>
    </PageContainer>
  );
}
