"use client";

import { useState } from "react";
import { Settings, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface SwapSettingsProps {
  slippage: number;
  suggestedSlippage?: number;
  autoSlippage?: boolean;
  deadline: number;
  onSlippageChange: (value: number) => void;
  onAutoSlippageChange?: () => void;
  onDeadlineChange: (value: number) => void;
}

const SLIPPAGE_PRESETS = [0.5, 1.0, 3.0];

export function SwapSettings({
  slippage,
  suggestedSlippage = 0.5,
  autoSlippage = false,
  deadline,
  onSlippageChange,
  onAutoSlippageChange,
  onDeadlineChange,
}: SwapSettingsProps) {
  const [customSlippage, setCustomSlippage] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleAutoSlippage = () => {
    setCustomSlippage("");
    onAutoSlippageChange?.();
  };

  const handleSlippagePreset = (value: number) => {
    setCustomSlippage("");
    onSlippageChange(value);
  };

  const handleCustomSlippage = (value: string) => {
    setCustomSlippage(value);
    const parsed = parseFloat(value);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 50) {
      onSlippageChange(parsed);
    }
  };

  const handleDeadlineChange = (value: string) => {
    const parsed = parseInt(value);
    if (!isNaN(parsed) && parsed > 0 && parsed <= 180) {
      onDeadlineChange(parsed);
    }
  };

  const isHighSlippage = slippage > 5;
  const isLowSlippage = slippage < 0.1;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className="p-2 rounded-full hover:bg-[#f5f5f5] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors cursor-pointer">
          <Settings className="h-5 w-5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b border-[var(--color-border)]">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-[var(--color-foreground)]">
              Swap Settings
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded hover:bg-[#f5f5f5] text-[var(--color-muted-foreground)] cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Slippage Tolerance */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--color-foreground)]">
                Slippage Tolerance
              </span>
              {isHighSlippage && (
                <span className="text-xs text-yellow-600 font-medium">
                  High slippage
                </span>
              )}
              {isLowSlippage && (
                <span className="text-xs text-yellow-600 font-medium">
                  May fail
                </span>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {/* Auto button */}
                <button
                  onClick={handleAutoSlippage}
                  className={cn(
                    "flex-1 py-2 px-3 rounded-full text-sm font-medium transition-colors cursor-pointer",
                    autoSlippage
                      ? "bg-[var(--color-primary)] text-white"
                      : "bg-[#f5f5f5] text-[var(--color-foreground)] hover:bg-[#ebebeb]"
                  )}
                >
                  Auto
                </button>
                {SLIPPAGE_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => handleSlippagePreset(preset)}
                    className={cn(
                      "flex-1 py-2 px-3 rounded-full text-sm font-medium transition-colors cursor-pointer",
                      !autoSlippage && slippage === preset && !customSlippage
                        ? "bg-[var(--color-primary)] text-white"
                        : "bg-[#f5f5f5] text-[var(--color-foreground)] hover:bg-[#ebebeb]"
                    )}
                  >
                    {preset}%
                  </button>
                ))}
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={customSlippage}
                  onChange={(e) => handleCustomSlippage(e.target.value)}
                  placeholder="Custom"
                  className={cn(
                    "w-full py-2 px-3 pr-8 rounded-full text-sm font-medium bg-[#f5f5f5] border border-transparent focus:border-[var(--color-primary)] focus:outline-none transition-colors",
                    !autoSlippage && customSlippage && "border-[var(--color-primary)]"
                  )}
                  min="0"
                  max="50"
                  step="0.1"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--color-muted-foreground)]">
                  %
                </span>
              </div>
            </div>
            {autoSlippage && suggestedSlippage > 0.5 && (
              <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
                Auto-adjusted to {suggestedSlippage.toFixed(2)}% based on price impact
              </p>
            )}
          </div>

          {/* Transaction Deadline */}
          <div className="space-y-2">
            <span className="text-sm font-medium text-[var(--color-foreground)]">
              Transaction Deadline
            </span>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={deadline}
                onChange={(e) => handleDeadlineChange(e.target.value)}
                className="w-20 py-2 px-3 rounded-full text-sm font-medium text-center bg-[#f5f5f5] border border-transparent focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                min="1"
                max="180"
              />
              <span className="text-sm text-[var(--color-muted-foreground)]">
                minutes
              </span>
            </div>
          </div>

          {/* Warning for high slippage */}
          {isHighSlippage && (
            <div className="p-3 rounded-full bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-xs text-yellow-600">
                Your transaction may be frontrun due to high slippage tolerance.
              </p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
