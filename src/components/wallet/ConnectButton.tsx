"use client";

import { useState } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { Copy, LogOut, ChevronDown, Check, Wallet } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { shortenAddress } from "@/lib/format";

interface ConnectButtonProps {
  isHeroVisible?: boolean;
  inMobileMenu?: boolean;
}

export function ConnectButton({ isHeroVisible = false, inMobileMenu = false }: ConnectButtonProps) {
  const { address, isConnected, isConnecting } = useAccount();
  const { disconnect } = useDisconnect();
  const { open } = useAppKit();
  const [copied, setCopied] = useState(false);

  const handleConnect = () => {
    open();
  };

  const handleCopyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  // Disconnected state - show Connect Wallet button
  if (!isConnected) {
    return (
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className={cn(
          "inline-flex items-center justify-center gap-2",
          "h-10 px-4",
          "font-mono uppercase tracking-wider text-xs",
          "rounded-xl",
          "cursor-pointer",
          "transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          isHeroVisible
            ? "bg-white text-[var(--color-foreground)] hover:bg-white/90 focus-visible:ring-white/30"
            : "bg-[var(--color-titan-green)] text-[#243025] hover:bg-[var(--color-titan-green-light)] focus-visible:ring-[var(--color-titan-green)]/30"
        )}
      >
        {isConnecting ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Connecting...</span>
          </>
        ) : (
          "Connect Wallet"
        )}
      </button>
    );
  }

  // Connected state - show truncated address with dropdown
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
        className={cn(
          "inline-flex items-center justify-center gap-2",
          "h-10 px-4",
          "font-mono uppercase tracking-wider text-xs",
          "rounded-xl",
          "cursor-pointer",
          "transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          inMobileMenu
              ? "w-full bg-white/88 text-[var(--color-foreground)] hover:bg-white"
              : isHeroVisible
                ? "bg-white text-[var(--color-foreground)] hover:bg-white/90 focus-visible:ring-white/30"
                : "bg-white/88 text-[var(--color-foreground)] hover:bg-white focus-visible:ring-[var(--color-ring)]/30"
          )}
        >
          <Wallet className="h-4 w-4" />
          <span>{shortenAddress(address!)}</span>
          <ChevronDown className="h-3 w-3 opacity-60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 p-2">
        <DropdownMenuItem
          onClick={handleCopyAddress}
          className="cursor-pointer py-3 text-[15px]"
        >
          {copied ? (
            <Check className="h-4 w-4 text-[var(--color-primary)]" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          <span>{copied ? "Copied!" : "Copy Address"}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleDisconnect}
          className="cursor-pointer py-3 text-[15px] text-[#b84c4c] focus:bg-[#f1d9d9] focus:text-[#b84c4c]"
        >
          <LogOut className="h-4 w-4" />
          <span>Disconnect</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
