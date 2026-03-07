"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useBalance,
  usePublicClient,
} from "wagmi";
import { parseUnits, formatUnits, keccak256, encodeAbiParameters } from "viem";
import { sepolia } from "viem/chains";
import { config } from "@/config";
import { ERC20_ABI, LIQUIDITY_ROUTER_ABI, STATE_VIEW_ABI, WETH_ABI } from "@/lib/contracts";
import { toast } from "./useToast";
import { parseError, waitForTx } from "@/lib/utils";

// Pool configuration
const POOL_FEE = 3000; // 0.3%
const TICK_SPACING = 60;
const Q96 = BigInt(2) ** BigInt(96);

// Min/Max sqrt prices (from Uniswap V4)
const MIN_SQRT_PRICE = BigInt("4295128739");
const MAX_SQRT_PRICE = BigInt("1461446703485210103287273052203988822378723970342");
const MIN_TICK = -887220;
const MAX_TICK = 887220;

// Convert tick to sqrtPriceX96 with proper bounds handling
function tickToSqrtPriceX96(tick: number): bigint {
  if (tick <= MIN_TICK) return MIN_SQRT_PRICE;
  if (tick >= MAX_TICK) return MAX_SQRT_PRICE;

  // For ticks in reasonable range, calculate precisely
  // sqrtPrice = 1.0001^(tick/2)
  const absTick = Math.abs(tick);
  let ratio = BigInt("0x100000000000000000000000000000000"); // 1 in Q128

  // Calculate using binary decomposition for precision
  if (absTick & 0x1) ratio = (ratio * BigInt("0xfffcb933bd6fad37aa2d162d1a594001")) >> BigInt(128);
  if (absTick & 0x2) ratio = (ratio * BigInt("0xfff97272373d413259a46990580e213a")) >> BigInt(128);
  if (absTick & 0x4) ratio = (ratio * BigInt("0xfff2e50f5f656932ef12357cf3c7fdcc")) >> BigInt(128);
  if (absTick & 0x8) ratio = (ratio * BigInt("0xffe5caca7e10e4e61c3624eaa0941cd0")) >> BigInt(128);
  if (absTick & 0x10) ratio = (ratio * BigInt("0xffcb9843d60f6159c9db58835c926644")) >> BigInt(128);
  if (absTick & 0x20) ratio = (ratio * BigInt("0xff973b41fa98c081472e6896dfb254c0")) >> BigInt(128);
  if (absTick & 0x40) ratio = (ratio * BigInt("0xff2ea16466c96a3843ec78b326b52861")) >> BigInt(128);
  if (absTick & 0x80) ratio = (ratio * BigInt("0xfe5dee046a99a2a811c461f1969c3053")) >> BigInt(128);
  if (absTick & 0x100) ratio = (ratio * BigInt("0xfcbe86c7900a88aedcffc83b479aa3a4")) >> BigInt(128);
  if (absTick & 0x200) ratio = (ratio * BigInt("0xf987a7253ac413176f2b074cf7815e54")) >> BigInt(128);
  if (absTick & 0x400) ratio = (ratio * BigInt("0xf3392b0822b70005940c7a398e4b70f3")) >> BigInt(128);
  if (absTick & 0x800) ratio = (ratio * BigInt("0xe7159475a2c29b7443b29c7fa6e889d9")) >> BigInt(128);
  if (absTick & 0x1000) ratio = (ratio * BigInt("0xd097f3bdfd2022b8845ad8f792aa5825")) >> BigInt(128);
  if (absTick & 0x2000) ratio = (ratio * BigInt("0xa9f746462d870fdf8a65dc1f90e061e5")) >> BigInt(128);
  if (absTick & 0x4000) ratio = (ratio * BigInt("0x70d869a156d2a1b890bb3df62baf32f7")) >> BigInt(128);
  if (absTick & 0x8000) ratio = (ratio * BigInt("0x31be135f97d08fd981231505542fcfa6")) >> BigInt(128);
  if (absTick & 0x10000) ratio = (ratio * BigInt("0x9aa508b5b7a84e1c677de54f3e99bc9")) >> BigInt(128);
  if (absTick & 0x20000) ratio = (ratio * BigInt("0x5d6af8dedb81196699c329225ee604")) >> BigInt(128);
  if (absTick & 0x40000) ratio = (ratio * BigInt("0x2216e584f5fa1ea926041bedfe98")) >> BigInt(128);
  if (absTick & 0x80000) ratio = (ratio * BigInt("0x48a170391f7dc42444e8fa2")) >> BigInt(128);

  if (tick > 0) {
    ratio = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff") / ratio;
  }

  // Convert from Q128 to Q96
  return (ratio >> BigInt(32)) + (ratio % (BigInt(1) << BigInt(32)) > BigInt(0) ? BigInt(1) : BigInt(0));
}

// Calculate token amounts from liquidity using Uniswap V4 math
function getAmountsForLiquidity(
  sqrtPriceX96: bigint,
  tickLower: number,
  tickUpper: number,
  liquidity: bigint,
  currentTick: number
): { amount0: bigint; amount1: bigint } {
  const sqrtRatioA = tickToSqrtPriceX96(tickLower);
  const sqrtRatioB = tickToSqrtPriceX96(tickUpper);

  let amount0 = BigInt(0);
  let amount1 = BigInt(0);

  if (currentTick < tickLower) {
    // All in token0
    amount0 = getAmount0ForLiquidity(sqrtRatioA, sqrtRatioB, liquidity);
  } else if (currentTick >= tickUpper) {
    // All in token1
    amount1 = getAmount1ForLiquidity(sqrtRatioA, sqrtRatioB, liquidity);
  } else {
    // In range - split between both tokens
    amount0 = getAmount0ForLiquidity(sqrtPriceX96, sqrtRatioB, liquidity);
    amount1 = getAmount1ForLiquidity(sqrtRatioA, sqrtPriceX96, liquidity);
  }

  return { amount0, amount1 };
}

function getAmount0ForLiquidity(sqrtRatioA: bigint, sqrtRatioB: bigint, liquidity: bigint): bigint {
  if (sqrtRatioA > sqrtRatioB) {
    [sqrtRatioA, sqrtRatioB] = [sqrtRatioB, sqrtRatioA];
  }
  if (sqrtRatioA <= BigInt(0)) return BigInt(0);

  // amount0 = liquidity * (sqrtRatioB - sqrtRatioA) / sqrtRatioB / sqrtRatioA * Q96
  const numerator = liquidity * (sqrtRatioB - sqrtRatioA);
  return (numerator * Q96) / sqrtRatioB / sqrtRatioA;
}

function getAmount1ForLiquidity(sqrtRatioA: bigint, sqrtRatioB: bigint, liquidity: bigint): bigint {
  if (sqrtRatioA > sqrtRatioB) {
    [sqrtRatioA, sqrtRatioB] = [sqrtRatioB, sqrtRatioA];
  }
  // amount1 = liquidity * (sqrtRatioB - sqrtRatioA) / Q96
  return (liquidity * (sqrtRatioB - sqrtRatioA)) / Q96;
}

// Tick range presets
const TICK_RANGES = {
  full: { lower: -887220, upper: 887220 },
  wide: { lower: -120000, upper: 120000 },
  medium: { lower: -60000, upper: 60000 },
  narrow: { lower: -6000, upper: 6000 },
} as const;

export type TickRangePreset = keyof typeof TICK_RANGES;

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

interface PoolState {
  sqrtPriceX96: bigint;
  tick: number;
  liquidity: bigint;
  initialized: boolean;
}

export function useLiquidityV4() {
  const { address, isConnected } = useAccount();
  const [isAddingLiquidity, setIsAddingLiquidity] = useState(false);
  const [isRemovingLiquidity, setIsRemovingLiquidity] = useState(false);
  const [isCollectingFees, setIsCollectingFees] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isWrapping, setIsWrapping] = useState(false);
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoadingPositions, setIsLoadingPositions] = useState(true);
  const [poolState, setPoolState] = useState<PoolState | null>(null);

  // Input state
  const [amount0, setAmount0] = useState("");
  const [amount1, setAmount1] = useState("");
  const [tickRange, setTickRange] = useState<TickRangePreset>("full");
  const [slippage, setSlippage] = useState(0.5); // 0.5% default slippage

  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient({ chainId: sepolia.id });

  // Sort tokens to get currency0 and currency1
  const { currency0, currency1, titanIsCurrency0 } = useMemo(() => {
    const titanAddr = config.contracts.titanToken.toLowerCase();
    const wethAddr = config.contracts.weth.toLowerCase();

    if (titanAddr < wethAddr) {
      return {
        currency0: config.contracts.titanToken,
        currency1: config.contracts.weth,
        titanIsCurrency0: true,
      };
    } else {
      return {
        currency0: config.contracts.weth,
        currency1: config.contracts.titanToken,
        titanIsCurrency0: false,
      };
    }
  }, []);

  // Compute poolId
  const poolId = useMemo(() => {
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
  }, [currency0, currency1]);

  // Get ETH balance
  const { data: ethBalance, refetch: refetchEthBalance } = useBalance({ address });

  // Get WETH balance
  const { data: wethBalance, refetch: refetchWethBalance } = useReadContract({
    address: config.contracts.weth,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Get TITAN balance
  const { data: titanBalance, refetch: refetchTitanBalance } = useReadContract({
    address: config.contracts.titanToken,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Get TITAN allowance for LiquidityRouter
  const { data: titanAllowance, refetch: refetchTitanAllowance } = useReadContract({
    address: config.contracts.titanToken,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, config.contracts.liquidityRouter] : undefined,
    query: { enabled: !!address },
  });

  // Get WETH allowance for LiquidityRouter
  const { data: wethAllowance, refetch: refetchWethAllowance } = useReadContract({
    address: config.contracts.weth,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, config.contracts.liquidityRouter] : undefined,
    query: { enabled: !!address },
  });

  // Fetch pool state
  const fetchPoolState = useCallback(async () => {
    if (!publicClient) return;

    console.log("[fetchPoolState] Fetching pool state for poolId:", poolId);

    try {
      const slot0 = (await publicClient.readContract({
        address: config.contracts.stateView,
        abi: STATE_VIEW_ABI,
        functionName: "getSlot0",
        args: [poolId],
      })) as [bigint, number, number, number];

      console.log("[fetchPoolState] slot0:", slot0);

      const liquidity = (await publicClient.readContract({
        address: config.contracts.stateView,
        abi: STATE_VIEW_ABI,
        functionName: "getLiquidity",
        args: [poolId],
      })) as bigint;

      console.log("[fetchPoolState] liquidity:", liquidity.toString());

      const state = {
        sqrtPriceX96: slot0[0],
        tick: slot0[1],
        liquidity,
        initialized: slot0[0] > BigInt(0),
      };
      console.log("[fetchPoolState] Pool state:", state);
      setPoolState(state);
    } catch (err) {
      console.error("[fetchPoolState] Error:", err);
      setPoolState(null);
    }
  }, [publicClient, poolId]);

  // Fetch user positions from LiquidityRouter
  const fetchPositions = useCallback(async () => {
    if (!publicClient || !address) {
      setIsLoadingPositions(false);
      return;
    }

    setIsLoadingPositions(true);
    console.log("[fetchPositions] Starting fetch for address:", address);
    console.log("[fetchPositions] currency0:", currency0, "currency1:", currency1);

    try {
      const fetchedPositions: Position[] = [];

      // Check for positions at each tick range preset
      for (const [rangeName, range] of Object.entries(TICK_RANGES)) {
        const tickLower = Math.floor(range.lower / TICK_SPACING) * TICK_SPACING;
        const tickUpper = Math.floor(range.upper / TICK_SPACING) * TICK_SPACING;

        console.log(`[fetchPositions] Checking ${rangeName}: tickLower=${tickLower}, tickUpper=${tickUpper}`);

        try {
          // Also try querying the positions mapping directly
          const localPoolId = keccak256(
            encodeAbiParameters(
              [
                { type: "address" },
                { type: "address" },
                { type: "uint24" },
                { type: "int24" },
                { type: "address" },
              ],
              [currency0, currency1, POOL_FEE, TICK_SPACING, "0x0000000000000000000000000000000000000000"]
            )
          );
          console.log(`[fetchPositions] Computed poolId:`, localPoolId);

          const liquidity = (await publicClient.readContract({
            address: config.contracts.liquidityRouter,
            abi: LIQUIDITY_ROUTER_ABI,
            functionName: "getPosition",
            args: [address, currency0, currency1, POOL_FEE, TICK_SPACING, tickLower, tickUpper],
          })) as bigint;

          console.log(`[fetchPositions] ${rangeName} liquidity:`, liquidity.toString());

          if (liquidity > BigInt(0)) {
            // Get current pool state for amount calculations
            let amt0 = "0";
            let amt1 = "0";
            let fee0 = "0";
            let fee1 = "0";

            try {
              const slot0 = (await publicClient.readContract({
                address: config.contracts.stateView,
                abi: STATE_VIEW_ABI,
                functionName: "getSlot0",
                args: [localPoolId],
              })) as [bigint, number, number, number];

              const sqrtPriceX96 = slot0[0];
              const currentTick = slot0[1];

              // Calculate actual token amounts using Uniswap math
              const { amount0, amount1 } = getAmountsForLiquidity(
                sqrtPriceX96,
                tickLower,
                tickUpper,
                liquidity,
                currentTick
              );

              amt0 = formatUnits(amount0, 18);
              amt1 = formatUnits(amount1, 18);

              // Calculate fees - get position info and current fee growth
              try {
                const positionInfo = (await publicClient.readContract({
                  address: config.contracts.stateView,
                  abi: STATE_VIEW_ABI,
                  functionName: "getPositionInfo",
                  args: [localPoolId, config.contracts.liquidityRouter, tickLower, tickUpper, "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`],
                })) as [bigint, bigint, bigint];

                const feeGrowthInside = (await publicClient.readContract({
                  address: config.contracts.stateView,
                  abi: STATE_VIEW_ABI,
                  functionName: "getFeeGrowthInside",
                  args: [localPoolId, tickLower, tickUpper],
                })) as [bigint, bigint];

                const feeGrowth0Last = positionInfo[1];
                const feeGrowth1Last = positionInfo[2];
                const feeGrowth0Inside = feeGrowthInside[0];
                const feeGrowth1Inside = feeGrowthInside[1];

                // Calculate fees: (feeGrowthInside - feeGrowthLast) * liquidity / 2^128
                const Q128 = BigInt(2) ** BigInt(128);
                const fees0Wei = ((feeGrowth0Inside - feeGrowth0Last) * liquidity) / Q128;
                const fees1Wei = ((feeGrowth1Inside - feeGrowth1Last) * liquidity) / Q128;

                fee0 = formatUnits(fees0Wei, 18);
                fee1 = formatUnits(fees1Wei, 18);

                console.log(`[fetchPositions] Fees for ${rangeName}: fee0=${fee0}, fee1=${fee1}`);
              } catch (feeErr) {
                console.error("Error calculating fees:", feeErr);
              }
            } catch (e) {
              console.error("Error calculating amounts:", e);
              // Fallback to simple calculation
              const liquidityNum = Number(formatUnits(liquidity, 18));
              amt0 = (liquidityNum / 2).toFixed(4);
              amt1 = (liquidityNum / 2).toFixed(4);
            }

            // Generate a pseudo tokenId from tick range for UI purposes
            const tokenId = BigInt(Math.abs(tickLower) * 1000000 + Math.abs(tickUpper));
            fetchedPositions.push({
              tokenId,
              tickLower,
              tickUpper,
              liquidity,
              amount0: amt0,
              amount1: amt1,
              fees0: fee0,
              fees1: fee1,
            });
          }
        } catch (err) {
          console.error(`[fetchPositions] Error fetching ${rangeName}:`, err);
        }
      }

      console.log("[fetchPositions] Found positions:", fetchedPositions.length);
      setPositions(fetchedPositions);
    } catch (error) {
      console.error("Error fetching positions:", error);
      setPositions([]);
    } finally {
      setIsLoadingPositions(false);
    }
  }, [publicClient, address, currency0, currency1]);

  // Initial fetch
  useEffect(() => {
    console.log("[useLiquidityV4] Initial fetch triggered");
    console.log("[useLiquidityV4] TITAN address:", config.contracts.titanToken);
    console.log("[useLiquidityV4] WETH address:", config.contracts.weth);
    console.log("[useLiquidityV4] LiquidityRouter:", config.contracts.liquidityRouter);
    console.log("[useLiquidityV4] currency0:", currency0);
    console.log("[useLiquidityV4] currency1:", currency1);
    console.log("[useLiquidityV4] titanIsCurrency0:", titanIsCurrency0);
    fetchPoolState();
    fetchPositions();
  }, [fetchPoolState, fetchPositions, currency0, currency1, titanIsCurrency0]);

  // Initialize pool if needed
  const initializePool = useCallback(async () => {
    if (!isConnected || !publicClient) {
      toast({ title: "Wallet not connected", variant: "destructive" });
      return;
    }

    try {
      // Default sqrtPriceX96 for price = 1 (equal value)
      // If WETH is currency0: we want TITAN/WETH price, so price = 10000 means 10000 TITAN = 1 WETH
      // sqrtPriceX96 = sqrt(10000) * 2^96 ≈ 7.92e30
      const sqrtPriceX96 = titanIsCurrency0
        ? BigInt("792281625142643375935439503") // TITAN is currency0: price ~0.0001
        : BigInt("7922816251426433759354395033600"); // WETH is currency0: price ~10000

      console.log("[initializePool] Initializing pool...");
      console.log("  currency0:", currency0);
      console.log("  currency1:", currency1);
      console.log("  sqrtPriceX96:", sqrtPriceX96.toString());

      toast({ title: "Initializing pool...", description: "Please confirm in your wallet" });

      const hash = await writeContractAsync({
        address: config.contracts.liquidityRouter,
        abi: LIQUIDITY_ROUTER_ABI,
        functionName: "initializePool",
        args: [currency0, currency1, POOL_FEE, TICK_SPACING, sqrtPriceX96],
        chainId: sepolia.id,
      });

      await waitForTx(publicClient, hash);
      toast({ title: "Pool initialized!", variant: "success" });
      await fetchPoolState();
    } catch (error) {
      console.error("[initializePool] Error:", error);
      const message = parseError(error);
      // Pool already initialized is not an error
      if (message.includes("already") || message.includes("initialized")) {
        toast({ title: "Pool already initialized", variant: "default" });
      } else {
        toast({ title: "Initialize pool failed", description: message, variant: "destructive" });
      }
    }
  }, [isConnected, publicClient, currency0, currency1, titanIsCurrency0, writeContractAsync, fetchPoolState]);

  // Wrap ETH to WETH
  const wrapETH = useCallback(
    async (amount: string) => {
      if (!isConnected || !address || !publicClient) {
        toast({ title: "Wallet not connected", variant: "destructive" });
        return;
      }

      setIsWrapping(true);
      try {
        toast({ title: "Wrapping ETH...", description: "Please confirm in your wallet" });

        const hash = await writeContractAsync({
          address: config.contracts.weth,
          abi: WETH_ABI,
          functionName: "deposit",
          value: parseUnits(amount, 18),
          chainId: sepolia.id,
        });

        await waitForTx(publicClient, hash);
        toast({ title: "ETH wrapped successfully", variant: "success" });
        await Promise.all([refetchEthBalance(), refetchWethBalance()]);
      } catch (error) {
        toast({ title: "Wrap failed", description: parseError(error), variant: "destructive" });
      } finally {
        setIsWrapping(false);
      }
    },
    [isConnected, address, publicClient, writeContractAsync, refetchEthBalance, refetchWethBalance]
  );

  // Approve token to LiquidityRouter
  const approveToken = useCallback(
    async (token: "TITAN" | "WETH") => {
      if (!isConnected || !address || !publicClient) {
        toast({ title: "Wallet not connected", variant: "destructive" });
        return;
      }

      const tokenAddress = token === "TITAN" ? config.contracts.titanToken : config.contracts.weth;

      setIsApproving(true);
      try {
        toast({ title: `Approving ${token}...`, description: "Please confirm in your wallet" });

        const hash = await writeContractAsync({
          address: tokenAddress,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [config.contracts.liquidityRouter, BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")],
          chainId: sepolia.id,
        });

        await waitForTx(publicClient, hash);

        // Wait a bit for state to propagate
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Refetch both allowances
        await Promise.all([refetchTitanAllowance(), refetchWethAllowance()]);

        toast({ title: `${token} approved`, variant: "success" });
      } catch (error) {
        toast({ title: "Approval failed", description: parseError(error), variant: "destructive" });
      } finally {
        setIsApproving(false);
      }
    },
    [isConnected, address, publicClient, writeContractAsync, refetchTitanAllowance, refetchWethAllowance]
  );

  // Add liquidity
  const addLiquidity = useCallback(async () => {
    if (!isConnected || !address || !publicClient) {
      toast({ title: "Wallet not connected", variant: "destructive" });
      return;
    }

    if (!amount0 && !amount1) {
      toast({ title: "Enter amounts", variant: "destructive" });
      return;
    }

    // Check if pool is initialized
    if (!poolState || !poolState.initialized) {
      console.log("[addLiquidity] Pool not initialized, attempting to initialize...");
      toast({ title: "Pool not initialized", description: "Initializing pool first..." });

      try {
        const sqrtPriceX96 = titanIsCurrency0
          ? BigInt("792281625142643375935439503")
          : BigInt("7922816251426433759354395033600");

        const initHash = await writeContractAsync({
          address: config.contracts.liquidityRouter,
          abi: LIQUIDITY_ROUTER_ABI,
          functionName: "initializePool",
          args: [currency0, currency1, POOL_FEE, TICK_SPACING, sqrtPriceX96],
          chainId: sepolia.id,
        });
        await waitForTx(publicClient, initHash);
        console.log("[addLiquidity] Pool initialized successfully");
        toast({ title: "Pool initialized!" });
        await fetchPoolState();
      } catch (err) {
        const errMsg = parseError(err);
        if (!errMsg.includes("already") && !errMsg.includes("initialized")) {
          console.error("[addLiquidity] Failed to initialize pool:", err);
          toast({ title: "Failed to initialize pool", description: errMsg, variant: "destructive" });
          return;
        }
        // Pool already initialized, continue
        console.log("[addLiquidity] Pool was already initialized");
      }
    }

    setIsAddingLiquidity(true);
    try {
      const { lower, upper } = TICK_RANGES[tickRange];
      const tickLower = Math.floor(lower / TICK_SPACING) * TICK_SPACING;
      const tickUpper = Math.floor(upper / TICK_SPACING) * TICK_SPACING;

      // Parse amounts based on token order
      // In AddLiquidityCard: titanAmount sets amount0/amount1 based on titanIsCurrency0
      // If titanIsCurrency0=true: amount0=TITAN, amount1=WETH
      // If titanIsCurrency0=false: amount0=WETH, amount1=TITAN (from card's perspective)
      // But here amount0/amount1 state is already mapped correctly by the card
      // So we just use them directly - amount0 goes to currency0, amount1 goes to currency1
      const amt0 = parseUnits(amount0 || "0", 18);
      const amt1 = parseUnits(amount1 || "0", 18);

      console.log("[addLiquidity] Parameters:");
      console.log("  tickRange:", tickRange, "→", tickLower, "to", tickUpper);
      console.log("  currency0:", currency0, titanIsCurrency0 ? "(TITAN)" : "(WETH)", "amount:", amt0.toString());
      console.log("  currency1:", currency1, titanIsCurrency0 ? "(WETH)" : "(TITAN)", "amount:", amt1.toString());

      // Refetch allowances to get fresh data
      await Promise.all([refetchTitanAllowance(), refetchWethAllowance()]);

      toast({ title: "Adding liquidity...", description: "Please confirm in your wallet" });

      // Calculate minimum amounts based on slippage
      const slippageMultiplier = BigInt(Math.floor((100 - slippage) * 100));
      const amount0Min = (amt0 * slippageMultiplier) / BigInt(10000);
      const amount1Min = (amt1 * slippageMultiplier) / BigInt(10000);

      const hash = await writeContractAsync({
        address: config.contracts.liquidityRouter,
        abi: LIQUIDITY_ROUTER_ABI,
        functionName: "addLiquidity",
        args: [
          {
            token0: currency0,
            token1: currency1,
            fee: POOL_FEE,
            tickSpacing: TICK_SPACING,
            tickLower,
            tickUpper,
            amount0Desired: amt0,
            amount1Desired: amt1,
            amount0Min,
            amount1Min,
            recipient: address,
          },
        ],
        chainId: sepolia.id,
      });

      console.log("[addLiquidity] Transaction hash:", hash);
      const receipt = await waitForTx(publicClient, hash);
      console.log("[addLiquidity] Transaction receipt:", receipt);

      toast({ title: "Liquidity added!", variant: "success" });

      setAmount0("");
      setAmount1("");

      await Promise.all([
        refetchTitanBalance(),
        refetchWethBalance(),
        fetchPoolState(),
        fetchPositions(),
      ]);
    } catch (error) {
      console.error("Add liquidity error:", error);
      toast({ title: "Add liquidity failed", description: parseError(error), variant: "destructive" });
    } finally {
      setIsAddingLiquidity(false);
    }
  }, [
    isConnected,
    address,
    publicClient,
    amount0,
    amount1,
    tickRange,
    slippage,
    titanIsCurrency0,
    currency0,
    currency1,
    poolState,
    writeContractAsync,
    refetchTitanBalance,
    refetchWethBalance,
    refetchTitanAllowance,
    refetchWethAllowance,
    fetchPoolState,
    fetchPositions,
  ]);

  // Remove liquidity
  const removeLiquidity = useCallback(
    async (tickLower: number, tickUpper: number, percentage: number = 100) => {
      if (!isConnected || !address || !publicClient) {
        toast({ title: "Wallet not connected", variant: "destructive" });
        return;
      }

      const position = positions.find((p) => p.tickLower === tickLower && p.tickUpper === tickUpper);
      if (!position) {
        toast({ title: "Position not found", variant: "destructive" });
        return;
      }

      setIsRemovingLiquidity(true);
      try {
        const liquidityToRemove = (position.liquidity * BigInt(percentage)) / BigInt(100);

        toast({ title: "Removing liquidity...", description: "Please confirm in your wallet" });

        const hash = await writeContractAsync({
          address: config.contracts.liquidityRouter,
          abi: LIQUIDITY_ROUTER_ABI,
          functionName: "removeLiquidity",
          args: [
            {
              token0: currency0,
              token1: currency1,
              fee: POOL_FEE,
              tickSpacing: TICK_SPACING,
              tickLower,
              tickUpper,
              liquidity: liquidityToRemove,
              amount0Min: BigInt(0),
              amount1Min: BigInt(0),
              recipient: address,
            },
          ],
          chainId: sepolia.id,
        });

        await waitForTx(publicClient, hash);

        toast({ title: "Liquidity removed!", variant: "success" });

        await Promise.all([
          refetchTitanBalance(),
          refetchWethBalance(),
          fetchPoolState(),
          fetchPositions(),
        ]);
      } catch (error) {
        console.error("Remove liquidity error:", error);
        toast({ title: "Remove liquidity failed", description: parseError(error), variant: "destructive" });
      } finally {
        setIsRemovingLiquidity(false);
      }
    },
    [
      isConnected,
      address,
      publicClient,
      positions,
      currency0,
      currency1,
      writeContractAsync,
      refetchTitanBalance,
      refetchWethBalance,
      fetchPoolState,
      fetchPositions,
    ]
  );

  // Collect fees from a position
  const collectFees = useCallback(
    async (tickLower: number, tickUpper: number) => {
      if (!isConnected || !address || !publicClient) {
        toast({ title: "Wallet not connected", variant: "destructive" });
        return;
      }

      setIsCollectingFees(true);
      try {
        toast({ title: "Collecting fees...", description: "Please confirm in your wallet" });

        const hash = await writeContractAsync({
          address: config.contracts.liquidityRouter,
          abi: LIQUIDITY_ROUTER_ABI,
          functionName: "collectFees",
          args: [
            {
              token0: currency0,
              token1: currency1,
              fee: POOL_FEE,
              tickSpacing: TICK_SPACING,
              tickLower,
              tickUpper,
              recipient: address,
            },
          ],
          chainId: sepolia.id,
        });

        const receipt = await waitForTx(publicClient, hash);
        console.log("[collectFees] Receipt:", receipt);

        toast({ title: "Fees collected!", variant: "success" });

        await Promise.all([
          refetchTitanBalance(),
          refetchWethBalance(),
          fetchPositions(),
        ]);
      } catch (error) {
        console.error("Collect fees error:", error);
        toast({ title: "Collect fees failed", description: parseError(error), variant: "destructive" });
      } finally {
        setIsCollectingFees(false);
      }
    },
    [
      isConnected,
      address,
      publicClient,
      currency0,
      currency1,
      writeContractAsync,
      refetchTitanBalance,
      refetchWethBalance,
      fetchPositions,
    ]
  );

  // Helper to safely parse amount
  const safeParseUnits = (value: string, decimals: number): bigint => {
    if (!value || value === "") return BigInt(0);
    if (!/^-?\d*\.?\d*$/.test(value)) return BigInt(0);
    try {
      return parseUnits(value, decimals);
    } catch {
      return BigInt(0);
    }
  };

  // Check approval needs - treat undefined allowance as 0 (needs approval)
  const titanAmountWei = safeParseUnits(titanIsCurrency0 ? amount0 : amount1, 18);
  const wethAmountWei = safeParseUnits(titanIsCurrency0 ? amount1 : amount0, 18);

  const needsTitanApproval =
    titanAmountWei > BigInt(0) &&
    (titanAllowance === undefined || titanAmountWei > titanAllowance);

  const needsWethApproval =
    wethAmountWei > BigInt(0) &&
    (wethAllowance === undefined || wethAmountWei > wethAllowance);

  // Debug approval state
  console.log("[Approval Check]", {
    titanAmountWei: titanAmountWei.toString(),
    wethAmountWei: wethAmountWei.toString(),
    titanAllowance: titanAllowance?.toString() ?? "undefined",
    wethAllowance: wethAllowance?.toString() ?? "undefined",
    needsTitanApproval,
    needsWethApproval,
  });

  const hasEnoughWeth = wethBalance !== undefined && wethBalance >= wethAmountWei;
  const hasEnoughTitan = titanBalance !== undefined && titanBalance >= titanAmountWei;
  const hasEnoughEth = ethBalance !== undefined && ethBalance.value >= wethAmountWei + parseUnits("0.01", 18);

  return {
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
    ethBalance: ethBalance ? formatUnits(ethBalance.value, 18) : "0",
    wethBalance: wethBalance ? formatUnits(wethBalance, 18) : "0",
    titanBalance: titanBalance ? formatUnits(titanBalance, 18) : "0",

    // Approval checks (simplified - no Permit2)
    needsTitanApprovalForPermit2: needsTitanApproval,
    needsWethApprovalForPermit2: needsWethApproval,
    needsTitanPermit2Approval: false,
    needsWethPermit2Approval: false,
    hasEnoughWeth,
    hasEnoughTitan,
    hasEnoughEth,

    // Pool info
    titanIsCurrency0,
    hasLiquidity: poolState !== null && poolState.initialized && poolState.liquidity > BigInt(0),

    // Totals
    totalPositionValue: positions.reduce((acc, p) => acc + Number(p.amount0) + Number(p.amount1), 0),
    totalUnclaimedFees: positions.reduce((acc, p) => acc + Number(p.fees0) + Number(p.fees1), 0),

    // Actions
    wrapETH,
    initializePool,
    approveTokenToPermit2: approveToken,
    approvePermit2ToPositionManager: approveToken,
    addLiquidity,
    removeLiquidity: async (tokenId: bigint, percentage: number) => {
      // Find position by tokenId
      const pos = positions.find((p) => p.tokenId === tokenId);
      if (pos) {
        await removeLiquidity(pos.tickLower, pos.tickUpper, percentage);
      }
    },
    collectFees: async (tokenId: bigint) => {
      // Find position by tokenId
      const pos = positions.find((p) => p.tokenId === tokenId);
      if (pos) {
        await collectFees(pos.tickLower, pos.tickUpper);
      }
    },
    refetch: () => Promise.all([fetchPoolState(), fetchPositions()]),

    // Tick range options
    tickRanges: TICK_RANGES,
  };
}
