import { formatUnits, parseUnits } from 'viem';

/**
 * Format a token amount from bigint to a human-readable string
 * @param amount - The amount as bigint, string, or number
 * @param decimals - Token decimals (default 18)
 * @param displayDecimals - Number of decimal places to display (default 4)
 * @returns Formatted string with thousand separators
 */
export function formatTokenAmount(
  amount: bigint | string | number,
  decimals: number = 18,
  displayDecimals: number = 4
): string {
  let value: bigint;

  if (typeof amount === 'bigint') {
    value = amount;
  } else if (typeof amount === 'string') {
    // Handle empty or invalid strings
    if (!amount || amount === '0') return '0';
    try {
      // Check if it's already a decimal string (e.g., "123.45")
      if (amount.includes('.')) {
        const num = parseFloat(amount);
        if (isNaN(num)) return '0';
        return formatNumber(num, { decimals: displayDecimals });
      }
      value = BigInt(amount);
    } catch {
      // If it fails, try parsing as a float
      const num = parseFloat(amount);
      if (isNaN(num)) return '0';
      return formatNumber(num, { decimals: displayDecimals });
    }
  } else {
    // Handle number type
    if (isNaN(amount)) return '0';
    return formatNumber(amount, { decimals: displayDecimals });
  }

  if (value === BigInt(0)) return '0';

  const formatted = formatUnits(value, decimals);
  const num = parseFloat(formatted);

  if (num === 0) return '0';
  if (num < 0.0001 && num > 0) return '<0.0001';

  return num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: displayDecimals,
  });
}

/**
 * Parse a token amount from human-readable string to bigint
 * @param amount - The amount as a string (e.g., "123.45")
 * @param decimals - Token decimals (default 18)
 * @returns The amount as bigint
 */
export function parseTokenAmount(amount: string, decimals: number = 18): bigint {
  if (!amount || amount === '0') return BigInt(0);
  try {
    return parseUnits(amount, decimals);
  } catch {
    return BigInt(0);
  }
}

/**
 * Format a number as USD currency
 * @param amount - The amount to format
 * @returns Formatted string like "$1,234.56"
 */
export function formatUSD(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '$0.00';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Format a number as a percentage
 * @param value - The value to format (e.g., 12.34 for 12.34%)
 * @param decimals - Number of decimal places (default 2)
 * @returns Formatted string like "12.34%"
 */
export function formatPercent(value: number, decimals: number = 2): string {
  if (isNaN(value)) return '0.00%';
  return `${value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}%`;
}

/**
 * Format large numbers in compact notation
 * @param value - The value to format
 * @returns Formatted string like "1.2M", "3.4B", "567K"
 */
export function formatCompact(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0';

  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Format a number with options
 * @param value - The value to format
 * @param options - Formatting options
 * @returns Formatted string
 */
export function formatNumber(
  value: number | string,
  options?: {
    decimals?: number;
    compact?: boolean;
    currency?: boolean;
  }
): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0';

  const { decimals = 2, compact = false, currency = false } = options || {};

  if (compact) {
    const formatted = new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: decimals,
    }).format(num);
    return currency ? `$${formatted}` : formatted;
  }

  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(num);

  return currency ? `$${formatted}` : formatted;
}

/**
 * Shorten an Ethereum address
 * @param address - The full address
 * @param chars - Number of characters to show on each side (default 4)
 * @returns Shortened address like "0x1234...5678"
 */
export function shortenAddress(address: string, chars: number = 4): string {
  if (!address) return '';
  if (address.length < chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Alias for shortenAddress for backwards compatibility
 */
export const formatAddress = shortenAddress;

/**
 * Format time remaining from seconds
 * @param seconds - Number of seconds
 * @returns Formatted string like "2h 30m" or "45s"
 */
export function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return 'Ready';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

/**
 * Format a token amount smartly - removes trailing zeros
 * Shows full precision only when there are significant decimals
 * @param value - The value to format
 * @param maxDecimals - Maximum decimals to show (default 8)
 * @returns Formatted string like "100" or "100.00000001"
 */
export function formatTokenSmart(value: number | string, maxDecimals: number = 8): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0';
  if (num === 0) return '0';

  // Format with max decimals then remove trailing zeros
  const formatted = num.toFixed(maxDecimals);
  // Remove trailing zeros and trailing decimal point
  return formatted.replace(/\.?0+$/, '');
}
