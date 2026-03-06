"use client";

import { Droplets, Wallet, DollarSign, BarChart3 } from "lucide-react";
import { PageContainer } from "@/components/shared/PageContainer";
import { StatsCard } from "@/components/shared/StatsCard";
import { AddLiquidityCard } from "@/components/liquidity/AddLiquidityCard";
import { PositionCard } from "@/components/liquidity/PositionCard";
import { formatNumber, formatCompact } from "@/lib/format";
import { useLiquidityV4 } from "@/hooks/useLiquidityV4";
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

  return (
    <PageContainer>
      <div className="text-center mb-10">
        <span className="inline-flex items-center font-mono uppercase tracking-wider text-xs text-[var(--color-muted-foreground)] mb-4 px-3 py-1.5 rounded-full border border-[var(--color-border)] bg-white">
          Liquidity Pool
        </span>
        <h1 className="text-3xl sm:text-4xl font-medium leading-[1.15] tracking-tight text-[var(--color-foreground)] mb-2">
          Liquidity
        </h1>
        <p className="text-[var(--color-muted-foreground)] max-w-md mx-auto">
          Provide liquidity to the TITAN/WETH pool and earn trading fees
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatsCard
          title="Pool Liquidity"
          value={
            poolState
              ? `$${formatCompact(Number(formatUnits(poolState.liquidity, 18)) * 200)}`
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
          value={`$${formatNumber(totalUnclaimedFees * 2.5, { decimals: 2 })}`}
          icon={DollarSign}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Liquidity */}
        <div>
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
        </div>

        {/* Your Positions */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-[var(--color-foreground)]">Your Positions</h2>

          {/* Loading State */}
          {isLoadingPositions && (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-24 rounded-2xl bg-[var(--color-foreground)]/5 animate-pulse"
                />
              ))}
            </div>
          )}

          {/* Position List */}
          {!isLoadingPositions && positions.length > 0 && (
            <div className="space-y-4">
              {positions.map((position) => (
                <PositionCard
                  key={position.tokenId.toString()}
                  position={position}
                  titanIsCurrency0={titanIsCurrency0}
                  onRemoveLiquidity={removeLiquidity}
                  onCollectFees={collectFees}
                  isRemovingLiquidity={isRemovingLiquidity}
                  isCollectingFees={isCollectingFees}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoadingPositions && positions.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-foreground)]/5 p-8 text-center">
              <Droplets className="h-12 w-12 mx-auto text-[var(--color-muted-foreground)] mb-4" />
              <h3 className="text-lg font-medium text-[var(--color-foreground)] mb-2">
                No Positions Yet
              </h3>
              <p className="text-sm text-[var(--color-muted-foreground)] max-w-xs mx-auto">
                Add liquidity to the TITAN/WETH pool to start earning trading fees
              </p>
            </div>
          )}

          {/* Pool Info */}
          {poolState && (
            <div className="rounded-xl bg-[var(--color-foreground)]/5 border border-[var(--color-border)] p-4 space-y-3">
              <h3 className="text-sm font-medium text-[var(--color-foreground)]">Pool Info</h3>
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
                  <span className="font-medium text-green-600">
                    {poolState.initialized ? "Active" : "Not Initialized"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
