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
            // Estimate token amounts from liquidity (simplified)
            const liquidityNum = Number(formatUnits(liquidity, 18));
            // Generate a pseudo tokenId from tick range for UI purposes
            const tokenId = BigInt(Math.abs(tickLower) * 1000000 + Math.abs(tickUpper));
            fetchedPositions.push({
              tokenId,
              tickLower,
              tickUpper,
              liquidity,
              amount0: (liquidityNum / 2).toFixed(4),
              amount1: (liquidityNum / 2).toFixed(4),
              fees0: "0", // LiquidityRouter doesn't track fees separately
              fees1: "0",
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
        toast({ title: `${token} approved`, variant: "success" });

        if (token === "TITAN") {
          await refetchTitanAllowance();
        } else {
          await refetchWethAllowance();
        }
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
      // currency0 is WETH, currency1 is TITAN (because WETH address < TITAN address)
      // So for amount0 (WETH), use amount1 input if titan is currency1
      // amount0 is always the WETH amount, amount1 is always the TITAN amount
      const amt0 = parseUnits(titanIsCurrency0 ? amount0 || "0" : amount1 || "0", 18);
      const amt1 = parseUnits(titanIsCurrency0 ? amount1 || "0" : amount0 || "0", 18);

      console.log("[addLiquidity] Parameters:");
      console.log("  tickRange:", tickRange);
      console.log("  tickLower:", tickLower);
      console.log("  tickUpper:", tickUpper);
      console.log("  currency0:", currency0, titanIsCurrency0 ? "(TITAN)" : "(WETH)");
      console.log("  currency1:", currency1, titanIsCurrency0 ? "(WETH)" : "(TITAN)");
      console.log("  amount0Desired:", amt0.toString());
      console.log("  amount1Desired:", amt1.toString());
      console.log("  recipient:", address);
      console.log("  titanIsCurrency0:", titanIsCurrency0);
      console.log("  liquidityRouter:", config.contracts.liquidityRouter);

      // Check approvals before proceeding
      console.log("[addLiquidity] Checking approvals...");
      console.log("  TITAN allowance:", titanAllowance?.toString());
      console.log("  WETH allowance:", wethAllowance?.toString());
      console.log("  TITAN balance:", titanBalance?.toString());
      console.log("  WETH balance:", wethBalance?.toString());

      // Check if we need more approvals
      const neededTitan = titanIsCurrency0 ? amt0 : amt1;
      const neededWeth = titanIsCurrency0 ? amt1 : amt0;

      if (titanAllowance !== undefined && neededTitan > titanAllowance) {
        toast({ title: "Insufficient TITAN allowance", description: "Please approve TITAN first", variant: "destructive" });
        setIsAddingLiquidity(false);
        return;
      }

      if (wethAllowance !== undefined && neededWeth > wethAllowance) {
        toast({ title: "Insufficient WETH allowance", description: "Please approve WETH first", variant: "destructive" });
        setIsAddingLiquidity(false);
        return;
      }

      toast({ title: "Adding liquidity...", description: "Please confirm in your wallet" });

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
    titanIsCurrency0,
    currency0,
    currency1,
    poolState,
    writeContractAsync,
    refetchTitanBalance,
    refetchWethBalance,
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
    isCollectingFees: false,
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
    totalUnclaimedFees: 0,

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
    collectFees: async () => {
      toast({ title: "Fee collection not implemented yet" });
    },
    refetch: () => Promise.all([fetchPoolState(), fetchPositions()]),

    // Tick range options
    tickRanges: TICK_RANGES,
  };
}
