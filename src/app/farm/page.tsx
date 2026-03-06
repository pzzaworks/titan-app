"use client";

import { useState } from "react";
import { Search, Filter, TrendingUp, Wallet, Coins, BarChart3 } from "lucide-react";
import { formatEther } from "viem";
import { PageContainer } from "@/components/shared/PageContainer";
import { StatsCard } from "@/components/shared/StatsCard";
import { PoolCard } from "@/components/farm/PoolCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCompact, formatNumber, formatUSD } from "@/lib/format";
import { useFarming } from "@/hooks/useFarming";

export default function FarmPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("apr");

  const {
    pools,
    isLoadingPools,
    totalTVL,
    totalUserStaked,
    totalPendingRewards,
    deposit,
    withdraw,
    harvest,
  } = useFarming();

  // Map pools to the format expected by PoolCard
  const mappedPools = pools.map((pool) => ({
    id: pool.id,
    name: pool.name,
    token0: pool.token0,
    token1: pool.token1,
    apr: pool.apr,
    tvl: pool.tvl,
    userStaked: Number(formatEther(pool.userStaked)),
    pendingRewards: Number(formatEther(pool.pendingRewards)),
    isHot: pool.isHot,
  }));

  const filteredPools = mappedPools
    .filter((pool) =>
      pool.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "apr") return b.apr - a.apr;
      if (sortBy === "tvl") return b.tvl - a.tvl;
      if (sortBy === "staked") return b.userStaked - a.userStaked;
      return 0;
    });

  const handleDeposit = async (poolId: number, amount: string) => {
    await deposit(poolId, amount);
  };

  const handleWithdraw = async (poolId: number, amount: string) => {
    await withdraw(poolId, amount);
  };

  const handleHarvest = async (poolId: number) => {
    await harvest(poolId);
  };

  return (
    <PageContainer>
      <div className="text-center mb-10">
        <span className="inline-flex items-center font-mono uppercase tracking-wider text-xs text-[var(--color-muted-foreground)] mb-4 px-3 py-1.5 rounded-full border border-[var(--color-border)] bg-white">
          Yield Farming
        </span>
        <h1 className="text-3xl sm:text-4xl font-medium leading-[1.15] tracking-tight text-[var(--color-foreground)] mb-2">
          Liquidity Pools
        </h1>
        <p className="text-[var(--color-muted-foreground)] max-w-md mx-auto">
          Provide liquidity and earn TITAN rewards with competitive APRs
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatsCard
          title="Total Value Locked"
          value={`$${formatCompact(totalTVL)}`}
          icon={Wallet}
        />
        <StatsCard
          title="Your Deposits"
          value={formatUSD(totalUserStaked)}
          icon={Coins}
        />
        <StatsCard
          title="Pending Rewards"
          value={`${formatNumber(totalPendingRewards, { decimals: 2 })} TITAN`}
          icon={TrendingUp}
        />
        <StatsCard
          title="Active Pools"
          value={pools.length.toString()}
          icon={BarChart3}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-muted-foreground)]" />
          <Input
            placeholder="Search pools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-[180px] cursor-pointer">
            <Filter className="h-4 w-4 mr-2 text-[var(--color-muted-foreground)]" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apr" className="cursor-pointer">Highest APR</SelectItem>
            <SelectItem value="tvl" className="cursor-pointer">Highest TVL</SelectItem>
            <SelectItem value="staked" className="cursor-pointer">Your Stakes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loading State */}
      {isLoadingPools && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 rounded-2xl bg-[var(--color-foreground)]/5 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Pool List */}
      {!isLoadingPools && (
        <div className="space-y-4">
          {filteredPools.map((pool) => (
            <PoolCard
              key={pool.id}
              pool={pool}
              onDeposit={handleDeposit}
              onWithdraw={handleWithdraw}
              onHarvest={handleHarvest}
            />
          ))}
        </div>
      )}

      {!isLoadingPools && filteredPools.length === 0 && (
        <div className="text-center py-16">
          <p className="text-[var(--color-muted-foreground)]">No pools found matching your search</p>
        </div>
      )}
    </PageContainer>
  );
}
