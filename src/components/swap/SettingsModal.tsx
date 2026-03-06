"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slippage: number;
  deadline: number;
  onSave: (slippage: number, deadline: number) => void;
}

const presetSlippages = [0.1, 0.5, 1.0];

export function SettingsModal({
  open,
  onOpenChange,
  slippage: initialSlippage,
  deadline: initialDeadline,
  onSave,
}: SettingsModalProps) {
  const [slippage, setSlippage] = useState(initialSlippage);
  const [customSlippage, setCustomSlippage] = useState("");
  const [deadline, setDeadline] = useState(initialDeadline);
  const [isCustom, setIsCustom] = useState(false);

  const handleSlippagePreset = (value: number) => {
    setSlippage(value);
    setCustomSlippage("");
    setIsCustom(false);
  };

  const handleCustomSlippage = (value: string) => {
    setCustomSlippage(value);
    const parsed = parseFloat(value);
    if (!isNaN(parsed) && parsed > 0 && parsed <= 50) {
      setSlippage(parsed);
      setIsCustom(true);
    }
  };

  const handleSave = () => {
    onSave(slippage, deadline);
    onOpenChange(false);
  };

  const isSlippageWarning = slippage > 5;
  const isSlippageDanger = slippage > 10;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white border-[var(--color-border)]">
        <DialogHeader>
          <DialogTitle className="text-[var(--color-foreground)]">Swap Settings</DialogTitle>
          <DialogDescription>
            Adjust your swap settings including slippage tolerance and transaction deadline.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Slippage Tolerance */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-[var(--color-foreground)]">
                Slippage Tolerance
              </label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-[var(--color-muted-foreground)]" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Your transaction will revert if the price changes unfavorably by more than
                      this percentage.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex gap-2">
              {presetSlippages.map((preset) => (
                <Button
                  key={preset}
                  variant={slippage === preset && !isCustom ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSlippagePreset(preset)}
                  className="flex-1 cursor-pointer"
                >
                  {preset}%
                </Button>
              ))}
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="Custom"
                  value={customSlippage}
                  onChange={(e) => handleCustomSlippage(e.target.value)}
                  className={cn(
                    "pr-8 text-sm",
                    isCustom && "border-[var(--color-foreground)]/30"
                  )}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-muted-foreground)]">
                  %
                </span>
              </div>
            </div>

            {isSlippageWarning && (
              <p
                className={cn(
                  "text-sm",
                  isSlippageDanger ? "text-red-500" : "text-yellow-600"
                )}
              >
                {isSlippageDanger
                  ? "Slippage is very high. Your transaction may be frontrun."
                  : "Your transaction may be frontrun."}
              </p>
            )}
          </div>

          {/* Transaction Deadline */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-[var(--color-foreground)]">
                Transaction Deadline
              </label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-[var(--color-muted-foreground)]" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Your transaction will revert if it is pending for more than this period of
                      time.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={deadline}
                onChange={(e) => setDeadline(parseInt(e.target.value) || 20)}
                min={1}
                max={60}
                className="w-24"
              />
              <span className="text-sm text-[var(--color-muted-foreground)]">minutes</span>
            </div>
          </div>

          {/* Save Button */}
          <Button className="w-full cursor-pointer" size="lg" onClick={handleSave}>
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
