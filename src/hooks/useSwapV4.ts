"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useBalance,
  usePublicClient,
} from "wagmi";
import { parseUnits, formatUnits, encodeAbiParameters, keccak256 } from "viem";
import { sepolia } from "viem/chains";
import { config, Token } from "@/config";
import { ERC20_ABI, STATE_VIEW_ABI, WETH_ABI, SWAP_ROUTER_ABI, V4_QUOTER_ABI } from "@/lib/contracts";
import { toast } from "./useToast";
import { parseError, waitForTx } from "@/lib/utils";
import { formatTokenSmart } from "@/lib/format";

// Pool configuration
const POOL_FEE = 3000; // 0.3%
const TICK_SPACING = 60;
const NO_HOOKS = "0x0000000000000000000000000000000000000000" as `0x${string}`;

interface SwapState {
  tokenIn: Token;
  tokenOut: Token;
  amountIn: string;
  amountOut: string;
  priceImpact: number;
  isLoading: boolean;
}

interface PoolKey {
  currency0: `0x${string}`;
  currency1: `0x${string}`;
  fee: number;
  tickSpacing: number;
  hooks: `0x${string}`;
}

interface PoolState {
  sqrtPriceX96: bigint;
  tick: number;
  liquidity: bigint;
  initialized: boolean;
}

export function useSwapV4() {
  const { address, isConnected } = useAccount();
  const [isSwapping, setIsSwapping] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isWrapping, setIsWrapping] = useState(false);
  const [slippage, setSlippage] = useState(0.5); // 0.5% default
  const [autoSlippage, setAutoSlippage] = useState(true); // Auto mode enabled by default
  const [deadline, setDeadline] = useState(20); // 20 minutes default
  const [poolState, setPoolState] = useState<PoolState | null>(null);

  const [state, setState] = useState<SwapState>({
    tokenIn: config.tokens.TITAN,
    tokenOut: config.tokens.WETH,
    amountIn: "",
    amountOut: "",
    priceImpact: 0,
    isLoading: false,
  });
  const [estimatedGas, setEstimatedGas] = useState<string | null>(null);

  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient({ chainId: sepolia.id });

  // Get actual token addresses (use WETH for ETH since pool uses WETH)
  const getPoolAddress = (token: Token): `0x${string}` => {
    return token.symbol === "ETH" ? config.contracts.weth : token.address;
  };

  // Create sorted PoolKey
  const poolKey = useMemo((): PoolKey => {
    const addr0 = getPoolAddress(state.tokenIn).toLowerCase();
    const addr1 = getPoolAddress(state.tokenOut).toLowerCase();

    if (addr0 < addr1) {
      return {
        currency0: getPoolAddress(state.tokenIn),
        currency1: getPoolAddress(state.tokenOut),
        fee: POOL_FEE,
        tickSpacing: TICK_SPACING,
        hooks: NO_HOOKS,
      };
    } else {
      return {
        currency0: getPoolAddress(state.tokenOut),
        currency1: getPoolAddress(state.tokenIn),
        fee: POOL_FEE,
        tickSpacing: TICK_SPACING,
        hooks: NO_HOOKS,
      };
    }
  }, [state.tokenIn, state.tokenOut]);

  // Determine swap direction
  const zeroForOne = useMemo(() => {
    return getPoolAddress(state.tokenIn).toLowerCase() < getPoolAddress(state.tokenOut).toLowerCase();
  }, [state.tokenIn, state.tokenOut]);

  // Get ETH balance
  const { data: ethBalance, refetch: refetchEthBalance } = useBalance({
    address,
  });

  // Get token in balance (use WETH address for ETH to avoid invalid contract call)
  const tokenInAddress = state.tokenIn.symbol === "ETH" ? config.contracts.weth : state.tokenIn.address;
  const tokenOutAddress = state.tokenOut.symbol === "ETH" ? config.contracts.weth : state.tokenOut.address;

  const { data: tokenInBalance, refetch: refetchTokenInBalance } = useReadContract({
    address: tokenInAddress,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && state.tokenIn.symbol !== "ETH",
    },
  });

  // Get token out balance
  const { data: tokenOutBalance, refetch: refetchTokenOutBalance } = useReadContract({
    address: tokenOutAddress,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && state.tokenOut.symbol !== "ETH",
    },
  });

  // Get ERC20 allowance for SwapRouter
  const { data: tokenAllowanceForSwapRouter, refetch: refetchTokenAllowance } = useReadContract({
    address: tokenInAddress,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, config.contracts.swapRouter] : undefined,
    query: {
      enabled: !!address && state.tokenIn.symbol !== "ETH",
    },
  });

  // Compute poolId from poolKey
  const poolId = useMemo(() => {
    const encoded = encodeAbiParameters(
      [
        {
          type: "tuple",
          components: [
            { type: "address", name: "currency0" },
            { type: "address", name: "currency1" },
            { type: "uint24", name: "fee" },
            { type: "int24", name: "tickSpacing" },
            { type: "address", name: "hooks" },
          ],
        },
      ],
      [
        {
          currency0: poolKey.currency0,
          currency1: poolKey.currency1,
          fee: poolKey.fee,
          tickSpacing: poolKey.tickSpacing,
          hooks: poolKey.hooks,
        },
      ]
    );
    return keccak256(encoded);
  }, [poolKey]);

  // Fetch pool state from StateView
  const fetchPoolState = useCallback(async () => {
    if (!publicClient) return;

    try {
      const slot0 = (await publicClient.readContract({
        address: config.contracts.stateView,
        abi: STATE_VIEW_ABI,
        functionName: "getSlot0",
        args: [poolId],
      })) as [bigint, number, number, number];

      const liquidity = (await publicClient.readContract({
        address: config.contracts.stateView,
        abi: STATE_VIEW_ABI,
        functionName: "getLiquidity",
        args: [poolId],
      })) as bigint;

      setPoolState({
        sqrtPriceX96: slot0[0],
        tick: slot0[1],
        liquidity,
        initialized: slot0[0] > BigInt(0),
      });
    } catch (error) {
      console.error("Error fetching pool state:", error);
      setPoolState(null);
    }
  }, [publicClient, poolId]);

  useEffect(() => {
    fetchPoolState();
  }, [fetchPoolState]);

  // Fallback calculation if quoter fails
  const calculateOutputFallback = useCallback(
    (amountIn: string): string => {
      if (!poolState || !poolState.initialized || !amountIn || parseFloat(amountIn) <= 0) {
        return "";
      }

      try {
        const amountInWei = parseUnits(amountIn, state.tokenIn.decimals);
        const sqrtPrice = poolState.sqrtPriceX96;
        const Q96 = BigInt(2) ** BigInt(96);

        let amountOut: bigint;
        if (zeroForOne) {
          amountOut = (amountInWei * sqrtPrice * sqrtPrice) / (Q96 * Q96);
        } else {
          if (sqrtPrice === BigInt(0)) return "";
          amountOut = (amountInWei * Q96 * Q96) / (sqrtPrice * sqrtPrice);
        }

        // Apply fee (0.3%)
        amountOut = (amountOut * BigInt(9970)) / BigInt(10000);
        return formatUnits(amountOut, state.tokenOut.decimals);
      } catch (error) {
        console.error("Calculate output error:", error);
        return "";
      }
    },
    [poolState, state.tokenIn.decimals, state.tokenOut.decimals, zeroForOne]
  );

  // Get quote from V4 Quoter contract
  const getQuoteFromQuoter = useCallback(
    async (amountIn: string): Promise<string> => {
      if (!publicClient || !poolState?.initialized || !amountIn || parseFloat(amountIn) <= 0) {
        return "";
      }

      try {
        const amountInWei = parseUnits(amountIn, state.tokenIn.decimals);

        // Call quoter using simulateContract
        const { result } = await publicClient.simulateContract({
          address: config.contracts.quoter,
          abi: V4_QUOTER_ABI,
          functionName: "quoteExactInputSingle",
          args: [
            {
              poolKey: {
                currency0: poolKey.currency0,
                currency1: poolKey.currency1,
                fee: poolKey.fee,
                tickSpacing: poolKey.tickSpacing,
                hooks: poolKey.hooks,
              },
              zeroForOne,
              exactAmount: amountInWei,
              hookData: "0x" as `0x${string}`,
            },
          ],
        });

        const [amountOut] = result as [bigint, bigint];
        return formatUnits(amountOut, state.tokenOut.decimals);
      } catch (error) {
        console.error("Quoter error:", error);
        // Fallback to simple calculation if quoter fails
        return calculateOutputFallback(amountIn);
      }
    },
    [publicClient, poolState, state.tokenIn.decimals, state.tokenOut.decimals, poolKey, zeroForOne, calculateOutputFallback]
  );

  // Get quote when amount changes
  const getQuote = useCallback(
    async (amountIn: string, tokenInSymbol: string, tokenOutSymbol: string) => {
      if (!amountIn || parseFloat(amountIn) <= 0) {
        setState((prev) => ({
          ...prev,
          amountOut: "",
          priceImpact: 0,
          isLoading: false,
        }));
        return;
      }

      // Check if this is a wrap/unwrap operation (1:1 ratio)
      const isWrap = tokenInSymbol === "ETH" && tokenOutSymbol === "WETH";
      const isUnwrap = tokenInSymbol === "WETH" && tokenOutSymbol === "ETH";

      if (isWrap || isUnwrap) {
        setState((prev) => ({
          ...prev,
          amountOut: amountIn, // 1:1 ratio
          priceImpact: 0,
          isLoading: false,
        }));
        return;
      }

      setState((prev) => ({ ...prev, isLoading: true }));

      try {
        const amountOut = await getQuoteFromQuoter(amountIn);

        // Calculate approximate price impact
        let priceImpact = 0;
        if (poolState && poolState.liquidity > BigInt(0)) {
          const inputValue = parseFloat(amountIn);
          const liquidityNum = Number(formatUnits(poolState.liquidity, 18));
          priceImpact = Math.min((inputValue / liquidityNum) * 100, 50);
        }

        setState((prev) => ({
          ...prev,
          amountOut: amountOut ? formatTokenSmart(amountOut, 8) : "",
          priceImpact,
          isLoading: false,
        }));
      } catch (error) {
        console.error("Quote error:", error);
        setState((prev) => ({
          ...prev,
          amountOut: "",
          priceImpact: 0,
          isLoading: false,
        }));
      }
    },
    [getQuoteFromQuoter, poolState]
  );

  // Debounced quote update
  useEffect(() => {
    const timer = setTimeout(() => {
      if (state.amountIn) {
        getQuote(state.amountIn, state.tokenIn.symbol, state.tokenOut.symbol);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [state.amountIn, state.tokenIn, state.tokenOut, getQuote]);

  // Token selection handlers
  const setTokenIn = useCallback((token: Token) => {
    setState((prev) => {
      if (token.symbol === prev.tokenOut.symbol) {
        return {
          ...prev,
          tokenIn: token,
          tokenOut: prev.tokenIn,
          amountIn: prev.amountOut,
          amountOut: prev.amountIn,
        };
      }
      return { ...prev, tokenIn: token, amountOut: "" };
    });
  }, []);

  const setTokenOut = useCallback((token: Token) => {
    setState((prev) => {
      if (token.symbol === prev.tokenIn.symbol) {
        return {
          ...prev,
          tokenIn: prev.tokenOut,
          tokenOut: token,
          amountIn: prev.amountOut,
          amountOut: prev.amountIn,
        };
      }
      return { ...prev, tokenOut: token, amountOut: "" };
    });
  }, []);

  const setAmountIn = useCallback((amount: string) => {
    setState((prev) => ({ ...prev, amountIn: amount }));
  }, []);

  const switchTokens = useCallback(() => {
    setState((prev) => ({
      ...prev,
      tokenIn: prev.tokenOut,
      tokenOut: prev.tokenIn,
      amountIn: prev.amountOut,
      amountOut: prev.amountIn,
    }));
  }, []);

  // Approve token to SwapRouter
  const approveToSwapRouter = useCallback(async () => {
    if (!isConnected || !address || !publicClient) {
      toast.error("Wallet not connected", { description: "Please connect your wallet to continue." });
      return;
    }

    // Don't approve ETH (native token)
    if (state.tokenIn.symbol === "ETH") {
      return;
    }

    setIsApproving(true);
    const toastId = toast.loading(`Approving ${state.tokenIn.symbol}...`);

    try {
      const hash = await writeContractAsync({
        address: state.tokenIn.address,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [config.contracts.swapRouter, BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")],
        chainId: sepolia.id,
      });

      await waitForTx(publicClient, hash);
      await refetchTokenAllowance();

      toast.dismiss(toastId);
      toast.success(`${state.tokenIn.symbol} approved for swapping`);
    } catch (error: unknown) {
      toast.dismiss(toastId);
      toast.error("Approval failed", { description: parseError(error) });
    } finally {
      setIsApproving(false);
    }
  }, [isConnected, address, state.tokenIn, writeContractAsync, publicClient, refetchTokenAllowance]);

  // Wrap ETH to WETH
  const wrapETH = useCallback(async (amount: string) => {
    if (!isConnected || !address || !publicClient) {
      toast.error("Wallet not connected", { description: "Please connect your wallet to continue." });
      return;
    }

    setIsWrapping(true);
    const toastId = toast.loading("Wrapping ETH...");

    try {
      const amountWei = parseUnits(amount, 18);

      const hash = await writeContractAsync({
        address: config.contracts.weth,
        abi: WETH_ABI,
        functionName: "deposit",
        value: amountWei,
        chainId: sepolia.id,
      });

      await waitForTx(publicClient, hash);
      await Promise.all([refetchEthBalance(), refetchTokenInBalance(), refetchTokenOutBalance()]);

      toast.dismiss(toastId);
      toast.success(`Wrapped ${amount} ETH to WETH`);
    } catch (error: unknown) {
      toast.dismiss(toastId);
      toast.error("Wrap failed", { description: parseError(error) });
    } finally {
      setIsWrapping(false);
    }
  }, [isConnected, address, publicClient, writeContractAsync, refetchEthBalance, refetchTokenInBalance, refetchTokenOutBalance]);

  // Unwrap WETH to ETH
  const unwrapWETH = useCallback(async (amount: string) => {
    if (!isConnected || !address || !publicClient) {
      toast.error("Wallet not connected", { description: "Please connect your wallet to continue." });
      return;
    }

    setIsWrapping(true);
    const toastId = toast.loading("Unwrapping WETH...");

    try {
      const amountWei = parseUnits(amount, 18);

      const hash = await writeContractAsync({
        address: config.contracts.weth,
        abi: WETH_ABI,
        functionName: "withdraw",
        args: [amountWei],
        chainId: sepolia.id,
      });

      await waitForTx(publicClient, hash);
      await Promise.all([refetchEthBalance(), refetchTokenInBalance(), refetchTokenOutBalance()]);

      toast.dismiss(toastId);
      toast.success(`Unwrapped ${amount} WETH to ETH`);
    } catch (error: unknown) {
      toast.dismiss(toastId);
      toast.error("Unwrap failed", { description: parseError(error) });
    } finally {
      setIsWrapping(false);
    }
  }, [isConnected, address, publicClient, writeContractAsync, refetchEthBalance, refetchTokenInBalance, refetchTokenOutBalance]);

  // Estimate gas for swap
  const estimateSwapGas = useCallback(async () => {
    if (!publicClient || !address || !state.amountIn || !poolState?.initialized) return null;
    try {
      const amountInWei = parseUnits(state.amountIn, state.tokenIn.decimals);
      const currentSlippage = autoSlippage
        ? Math.max(0.5, Math.min(49, state.priceImpact * 1.5 + 0.5))
        : slippage;
      const expectedOut = parseFloat(state.amountOut || "0");
      const minOut = expectedOut * (1 - currentSlippage / 100);
      const minAmountOutWei = parseUnits(minOut.toFixed(state.tokenOut.decimals), state.tokenOut.decimals);

      const gasEstimate = await publicClient.estimateContractGas({
        address: config.contracts.swapRouter,
        abi: SWAP_ROUTER_ABI,
        functionName: "swap",
        args: [
          {
            currency0: poolKey.currency0,
            currency1: poolKey.currency1,
            fee: poolKey.fee,
            tickSpacing: poolKey.tickSpacing,
            hooks: poolKey.hooks,
          },
          zeroForOne,
          amountInWei,
          minAmountOutWei,
        ],
        account: address,
      });
      const gasPrice = await publicClient.getGasPrice();
      const totalCost = gasEstimate * gasPrice;
      setEstimatedGas(formatUnits(totalCost, 18));
      return formatUnits(totalCost, 18);
    } catch {
      return null;
    }
  }, [publicClient, address, state, poolState, poolKey, zeroForOne, slippage, autoSlippage]);

  // Execute swap using SwapRouter
  const swap = useCallback(async () => {
    if (!isConnected || !address || !publicClient) {
      toast.error("Wallet not connected", { description: "Please connect your wallet to continue." });
      return;
    }

    if (!state.amountIn || !state.amountOut) {
      toast.error("Enter amount", { description: "Please enter an amount to swap." });
      return;
    }

    if (!poolState || !poolState.initialized) {
      toast.error("Pool not found", { description: "This trading pair is not available." });
      return;
    }

    setIsSwapping(true);

    try {
      const toastId = toast.loading("Swapping...");

      const amountInWei = parseUnits(state.amountIn, state.tokenIn.decimals);

      // Calculate effective slippage (auto mode uses suggested based on price impact)
      const currentSlippage = autoSlippage
        ? Math.max(0.5, Math.min(49, state.priceImpact * 1.5 + 0.5))
        : slippage;

      // Calculate minimum output with slippage
      const expectedOut = parseFloat(state.amountOut);
      const minOut = expectedOut * (1 - currentSlippage / 100);
      const minAmountOutWei = parseUnits(minOut.toFixed(state.tokenOut.decimals), state.tokenOut.decimals);

      // Execute swap via SwapRouter
      const hash = await writeContractAsync({
        address: config.contracts.swapRouter,
        abi: SWAP_ROUTER_ABI,
        functionName: "swap",
        args: [
          {
            currency0: poolKey.currency0,
            currency1: poolKey.currency1,
            fee: poolKey.fee,
            tickSpacing: poolKey.tickSpacing,
            hooks: poolKey.hooks,
          },
          zeroForOne,
          amountInWei,
          minAmountOutWei,
        ],
        chainId: sepolia.id,
      });

      await waitForTx(publicClient, hash);

      // Wait a bit for state to settle
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Reset and refetch
      setState((prev) => ({
        ...prev,
        amountIn: "",
        amountOut: "",
        priceImpact: 0,
      }));

      await Promise.all([
        refetchTokenInBalance(),
        refetchTokenOutBalance(),
        refetchEthBalance(),
        fetchPoolState(),
      ]);

      toast.dismiss(toastId);
      toast.success(`Swapped ${state.amountIn} ${state.tokenIn.symbol} for ~${state.amountOut} ${state.tokenOut.symbol}`);
    } catch (error: unknown) {
      console.error("Swap error:", error);
      toast.error("Swap failed", { description: parseError(error) });
    } finally {
      setIsSwapping(false);
      setEstimatedGas(null);
    }
  }, [
    isConnected,
    address,
    publicClient,
    state,
    poolState,
    poolKey,
    zeroForOne,
    slippage,
    autoSlippage,
    estimateSwapGas,
    writeContractAsync,
    refetchTokenInBalance,
    refetchTokenOutBalance,
    refetchEthBalance,
    fetchPoolState,
  ]);

  // Get balance helper
  const getBalance = useCallback(
    (token: Token) => {
      if (token.symbol === "ETH") {
        return ethBalance ? formatUnits(ethBalance.value, 18) : "0";
      }
      if (token.symbol === state.tokenIn.symbol && tokenInBalance) {
        return formatUnits(tokenInBalance, token.decimals);
      }
      if (token.symbol === state.tokenOut.symbol && tokenOutBalance) {
        return formatUnits(tokenOutBalance, token.decimals);
      }
      return "0";
    },
    [ethBalance, tokenInBalance, tokenOutBalance, state.tokenIn.symbol, state.tokenOut.symbol]
  );

  // Check if this is a wrap/unwrap operation
  const isWrapOperation = state.tokenIn.symbol === "ETH" && state.tokenOut.symbol === "WETH";
  const isUnwrapOperation = state.tokenIn.symbol === "WETH" && state.tokenOut.symbol === "ETH";
  const isWrapOrUnwrap = isWrapOperation || isUnwrapOperation;

  // Approval state checks (not needed for ETH or wrap/unwrap)
  const needsTokenApproval =
    !isWrapOrUnwrap &&
    state.tokenIn.symbol !== "ETH" &&
    state.amountIn &&
    tokenAllowanceForSwapRouter !== undefined &&
    parseUnits(state.amountIn || "0", state.tokenIn.decimals) > tokenAllowanceForSwapRouter;

  // For wrap/unwrap, liquidity is always available (1:1)
  const hasLiquidity = isWrapOrUnwrap || (poolState !== null && poolState.initialized && poolState.liquidity > BigInt(0));
  const poolInitializedButEmpty = poolState !== null && poolState.initialized && poolState.liquidity === BigInt(0);

  // Check if user needs to wrap ETH (has ETH but not enough WETH) - for regular swaps
  const wethBalance = state.tokenIn.symbol === "WETH" ? tokenInBalance : tokenOutBalance;
  const needsWrap = !isWrapOrUnwrap &&
    state.tokenIn.symbol === "WETH" &&
    state.amountIn &&
    wethBalance !== undefined &&
    parseUnits(state.amountIn || "0", 18) > wethBalance &&
    ethBalance !== undefined &&
    ethBalance.value >= parseUnits(state.amountIn || "0", 18);

  // Calculate suggested slippage based on price impact
  // Formula: max(0.5%, priceImpact * 1.5 + 0.5%)
  // This ensures slippage is always higher than price impact with a buffer
  const suggestedSlippage = useMemo(() => {
    if (state.priceImpact <= 0) return 0.5;
    // Add 50% buffer on top of price impact, minimum 0.5%
    const calculated = Math.max(0.5, state.priceImpact * 1.5 + 0.5);
    // Cap at reasonable maximum (49%)
    return Math.min(calculated, 49);
  }, [state.priceImpact]);

  // Effective slippage: use suggested when auto mode, otherwise manual
  const effectiveSlippage = autoSlippage ? suggestedSlippage : slippage;

  // Handle slippage change - disable auto mode when user sets manual slippage
  const handleSetSlippage = useCallback((value: number) => {
    setSlippage(value);
    setAutoSlippage(false);
  }, []);

  // Enable auto mode
  const enableAutoSlippage = useCallback(() => {
    setAutoSlippage(true);
  }, []);

  return {
    // State
    ...state,
    isSwapping,
    isApproving,
    isWrapping,
    isWrapOperation,
    isUnwrapOperation,
    needsTokenApproval,
    needsWrap,
    hasLiquidity,
    poolInitializedButEmpty,
    poolState,
    ethBalance: ethBalance ? formatUnits(ethBalance.value, 18) : "0",
    wethBalance: wethBalance ? formatUnits(wethBalance, 18) : "0",
    estimatedGas,

    // Settings
    slippage: effectiveSlippage,
    suggestedSlippage,
    autoSlippage,
    deadline,
    setSlippage: handleSetSlippage,
    setAutoSlippage: enableAutoSlippage,
    setDeadline,

    // Actions
    setTokenIn,
    setTokenOut,
    setAmountIn,
    switchTokens,
    approveToSwapRouter,
    wrapETH,
    unwrapWETH,
    swap,
    getBalance,
    estimateSwapGas,

    // Available tokens (ETH, WETH, TITAN)
    tokens: Object.values(config.tokens).filter(
      (t) => t.symbol === "TITAN" || t.symbol === "WETH" || t.symbol === "ETH"
    ),
  };
}
