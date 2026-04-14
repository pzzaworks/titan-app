"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, Check } from "lucide-react";
import { Token } from "@/config";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface TokenInputProps {
  label: string;
  token: Token;
  amount: string;
  balance?: string;
  onAmountChange?: (amount: string) => void;
  onTokenSelect?: (token: Token) => void;
  tokens?: Token[];
  disabled?: boolean;
  readOnly?: boolean;
  isLoading?: boolean;
}

export function TokenInput({
  label,
  token,
  amount,
  balance,
  onAmountChange,
  onTokenSelect,
  tokens,
  disabled,
  readOnly,
  isLoading,
}: TokenInputProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string, numbers, and single decimal point
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      onAmountChange?.(value);
    }
  };

  const handleMaxClick = () => {
    if (balance) {
      // Truncate to 6 decimals to avoid precision issues
      const truncated = Math.floor(parseFloat(balance) * 1000000) / 1000000;
      onAmountChange?.(truncated > 0 ? truncated.toString() : "");
    }
  };

  const handleTokenSelect = (selectedToken: Token) => {
    onTokenSelect?.(selectedToken);
    setIsOpen(false);
  };

  return (
    <div className="rounded-xl bg-[var(--color-foreground)]/4 p-4 transition-colors">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <span className="text-sm text-[var(--color-muted-foreground)]">{label}</span>
        {balance && (
          <div className="flex flex-wrap items-center justify-end gap-2">
            <span className="text-right text-sm text-[var(--color-muted-foreground)]">
              Balance: {formatNumber(balance, { decimals: 4 })}
            </span>
            {!readOnly && onAmountChange && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-[var(--color-primary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 cursor-pointer"
                onClick={handleMaxClick}
              >
                MAX
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="flex items-end gap-3">
        <div className="min-w-0 flex-1">
          <input
            type="text"
            inputMode="decimal"
            placeholder="0.0"
            value={amount}
            onChange={handleAmountChange}
            disabled={disabled || readOnly}
            className={cn(
              "no-focus-ring w-full min-w-0 bg-transparent text-[clamp(1.875rem,8vw,2.25rem)] leading-none font-medium text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)]/50",
              readOnly && "cursor-default",
              isLoading && "animate-pulse"
            )}
          />
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              className="h-12 shrink-0 rounded-xl bg-white/88 px-3 hover:bg-white flex items-center gap-2 cursor-pointer"
              disabled={!tokens || tokens.length <= 1}
            >
              <div className="w-7 h-7 rounded-xl overflow-hidden flex items-center justify-center">
                {token.logoUrl ? (
                  <Image
                    src={token.logoUrl}
                    alt={token.symbol}
                    width={28}
                    height={28}
                    className="rounded-xl"
                  />
                ) : (
                  <span className="text-xs font-bold text-[var(--color-muted-foreground)]">
                    {token.symbol.slice(0, 2)}
                  </span>
                )}
              </div>
              <span className="font-medium text-[var(--color-foreground)]">{token.symbol}</span>
              {tokens && tokens.length > 1 && (
                <ChevronDown className="h-4 w-4 text-[var(--color-muted-foreground)]" />
              )}
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md bg-white">
            <DialogHeader>
              <DialogTitle className="text-[var(--color-foreground)]">Select Token</DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-2">
              {tokens?.map((t) => (
                <button
                  key={t.symbol}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-xl transition-colors cursor-pointer",
                    t.symbol === token.symbol
                      ? "bg-[var(--color-primary)]/10"
                      : "hover:bg-[var(--color-foreground)]/5"
                  )}
                  onClick={() => handleTokenSelect(t)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center">
                      {t.logoUrl ? (
                        <Image
                          src={t.logoUrl}
                          alt={t.symbol}
                          width={40}
                          height={40}
                          className="rounded-xl"
                        />
                      ) : (
                        <span className="text-sm font-bold text-[var(--color-muted-foreground)]">
                          {t.symbol.slice(0, 2)}
                        </span>
                      )}
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-[var(--color-foreground)]">{t.symbol}</p>
                      <p className="text-sm text-[var(--color-muted-foreground)]">{t.name}</p>
                    </div>
                  </div>
                  {t.symbol === token.symbol && (
                    <Check className="h-5 w-5 text-[var(--color-primary)]" />
                  )}
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
