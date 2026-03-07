"use client";

import { useMemo } from "react";
import { usePublicClient } from "wagmi";
import { sepolia } from "viem/chains";
import { keccak256, encodeAbiParameters } from "viem";
import { useQuery } from "@tanstack/react-query";
import { config } from "@/config";
import { STATE_VIEW_ABI } from "@/lib/contracts";

const POOL_FEE = 3000;
const TICK_SPACING = 60;
const ETH_USD_PRICE = 2000; // Hardcoded ETH price for testnet

export function useTitanPrice() {
  const publicClient = usePublicClient({ chainId: sepolia.id });

  // Compute poolId
  const poolId = useMemo(() => {
    const weth = config.contracts.weth.toLowerCase();
    const titan = config.contracts.titanToken.toLowerCase();

    const [currency0, currency1] = weth < titan
      ? [config.contracts.weth, config.contracts.titanToken]
      : [config.contracts.titanToken, config.contracts.weth];

    const encoded = encodeAbiParameters(
      [
        { type: "address" },
        { type: "address" },
        { type: "uint24" },
        { type: "int24" },
        { type: "address" },
      ],
      [currency0, currency1, POOL_FEE, TICK_SPACING, "0x0000000000000000000000000000000000000000"]
    );
    return keccak256(encoded);
  }, []);

  const { data: priceData } = useQuery({
    queryKey: ["titanPrice", poolId],
    queryFn: async () => {
      if (!publicClient) return null;

      try {
        const slot0 = (await publicClient.readContract({
          address: config.contracts.stateView,
          abi: STATE_VIEW_ABI,
          functionName: "getSlot0",
          args: [poolId],
        })) as [bigint, number, number, number];

        const sqrtPriceX96 = slot0[0];
        const tick = slot0[1];

        if (sqrtPriceX96 === BigInt(0)) return null;

        // Calculate price from tick
        // price = 1.0001^tick
        const price = Math.pow(1.0001, tick);

        // WETH is currency0, TITAN is currency1
        // So price = TITAN/WETH (how many TITAN per WETH)
        // We want ETH per TITAN, so invert
        const weth = config.contracts.weth.toLowerCase();
        const titan = config.contracts.titanToken.toLowerCase();
        const wethIsCurrency0 = weth < titan;

        let ethPerTitan: number;
        if (wethIsCurrency0) {
          // price is TITAN/WETH, so ETH per TITAN = 1/price
          ethPerTitan = 1 / price;
        } else {
          // price is WETH/TITAN, so ETH per TITAN = price
          ethPerTitan = price;
        }

        // Convert to USD
        const titanUsdPrice = ethPerTitan * ETH_USD_PRICE;

        return {
          ethPerTitan,
          titanUsdPrice,
          tick,
        };
      } catch (error) {
        console.error("Error fetching TITAN price:", error);
        return null;
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    enabled: !!publicClient,
  });

  return {
    titanPrice: priceData?.titanUsdPrice ?? 0.10, // Fallback to $0.10
    ethPerTitan: priceData?.ethPerTitan ?? 0.00005,
    isLoading: !priceData,
    tick: priceData?.tick ?? 0,
  };
}

// Simple utility to format USD value from TITAN amount
export function formatTitanToUsd(titanAmount: number, titanPrice: number): string {
  const usdValue = titanAmount * titanPrice;
  if (usdValue < 0.01) return "< $0.01";
  return `$${usdValue.toFixed(2)}`;
}
