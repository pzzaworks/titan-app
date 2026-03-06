import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Re-export all formatting utilities from format.ts for backwards compatibility
export {
  formatAddress,
  formatNumber,
  formatTokenAmount,
  parseTokenAmount,
  formatUSD,
  formatPercent,
  formatCompact,
  shortenAddress,
  formatTimeRemaining,
} from "./format";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function calculatePriceImpact(
  inputAmount: number,
  outputAmount: number,
  spotPrice: number
): number {
  const expectedOutput = inputAmount * spotPrice;
  if (expectedOutput === 0) return 0;
  return ((expectedOutput - outputAmount) / expectedOutput) * 100;
}

export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Parse blockchain/wallet error messages into user-friendly messages
 */
/**
 * Wait for transaction receipt and throw if reverted
 */
export async function waitForTx(
  publicClient: { waitForTransactionReceipt: (params: { hash: `0x${string}` }) => Promise<{ status: string }> } | undefined,
  hash: `0x${string}`
): Promise<void> {
  if (!publicClient) return;

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  if (receipt.status === "reverted") {
    throw new Error("Transaction reverted on chain");
  }
}

export function parseError(error: unknown): string {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const lowerMessage = errorMessage.toLowerCase();

  // User rejected transaction
  if (
    lowerMessage.includes("user rejected") ||
    lowerMessage.includes("user denied") ||
    lowerMessage.includes("rejected the request")
  ) {
    return "Transaction cancelled";
  }

  // Insufficient funds
  if (
    lowerMessage.includes("insufficient funds") ||
    lowerMessage.includes("insufficient balance")
  ) {
    return "Insufficient balance for this transaction";
  }

  // Insufficient allowance
  if (lowerMessage.includes("insufficient allowance")) {
    return "Please approve tokens first";
  }

  // Gas estimation failed
  if (
    lowerMessage.includes("gas required exceeds") ||
    lowerMessage.includes("out of gas") ||
    lowerMessage.includes("exceeds block gas limit")
  ) {
    return "Transaction would fail. Check your inputs";
  }

  // Nonce issues
  if (lowerMessage.includes("nonce")) {
    return "Transaction nonce error. Please try again";
  }

  // Network errors
  if (
    lowerMessage.includes("network") ||
    lowerMessage.includes("disconnected") ||
    lowerMessage.includes("timeout")
  ) {
    return "Network error. Please check your connection";
  }

  // Contract reverts
  if (lowerMessage.includes("execution reverted")) {
    // Try to extract revert reason
    const revertMatch = errorMessage.match(/reason="([^"]+)"/);
    if (revertMatch) {
      return revertMatch[1];
    }
    return "Transaction failed. Please try again";
  }

  // Slippage / price change
  if (
    lowerMessage.includes("slippage") ||
    lowerMessage.includes("price changed")
  ) {
    return "Price changed. Please try again";
  }

  // Chain mismatch
  if (lowerMessage.includes("chain") && lowerMessage.includes("mismatch")) {
    return "Please switch to the correct network";
  }

  // Cooldown (faucet)
  if (lowerMessage.includes("cooldown") || lowerMessage.includes("wait")) {
    return "Please wait for the cooldown period";
  }

  // Generic fallback - truncate if too long
  if (errorMessage.length > 100) {
    // Try to get first sentence
    const firstSentence = errorMessage.split(/[.!?]/)[0];
    if (firstSentence && firstSentence.length < 100) {
      return firstSentence;
    }
    return "Transaction failed. Please try again";
  }

  return errorMessage || "Something went wrong";
}
