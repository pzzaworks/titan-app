"use client";

import { cookieStorage, createStorage, http } from "wagmi";
import { sepolia } from "viem/chains";
import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import type { AppKitNetwork } from "@reown/appkit/networks";

export const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || "";

if (!projectId) {
  console.warn("NEXT_PUBLIC_REOWN_PROJECT_ID is not set.");
}

export const chains: [AppKitNetwork, ...AppKitNetwork[]] = [sepolia as AppKitNetwork];

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  projectId,
  networks: chains,
  transports: {
    [sepolia.id]: http("https://ethereum-sepolia-rpc.publicnode.com"),
  },
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;

let appKitInitialized = false;

export function initializeAppKit() {
  if (appKitInitialized || typeof window === "undefined") return;

  const originalConsoleError = console.error;
  console.error = (...args) => {
    const message = args.map(a => String(a)).join(" ");
    if (
      message.includes("Failed to fetch") ||
      message.includes("Analytics SDK") ||
      message.includes("walletconnect") ||
      message.includes("NetworkError") ||
      message.includes("pulse.walletconnect")
    ) return;
    originalConsoleError.apply(console, args);
  };

  const metadata = {
    name: "Titan",
    description: "DeFi Super App",
    url: window.location.origin,
    icons: ["/titan-logo.svg"],
  };

  try {
    createAppKit({
      adapters: [wagmiAdapter],
      projectId,
      networks: chains,
      defaultNetwork: sepolia,
      metadata,
      features: { analytics: false, email: false, socials: false },
      themeMode: "light",
      themeVariables: {
        "--w3m-accent": "#2c4540",
        "--w3m-border-radius-master": "12px",
      },
    });
    appKitInitialized = true;
  } catch {}
}
