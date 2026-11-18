"use client";

import { cookieStorage, createStorage, http } from "wagmi";
import { sepolia } from "viem/chains";
import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import type { AppKitNetwork } from "@reown/appkit/networks";
import { seoConfig } from "@/lib/seo";

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

/**
 * Creates the AppKit modal once per JS realm. Called at module scope (see
 * providers.tsx) so it runs during server rendering too: AppKit hooks need it
 * before the first render, and the app must not wait for a client mount to
 * render page content, or crawlers get an empty body.
 */
export function initializeAppKit() {
  if (appKitInitialized) return;

  if (typeof window !== "undefined") {
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
  }

  const metadata = {
    name: "Titan",
    description: "DeFi Super App",
    // Must match the production origin (Reown verifies it); not window-based so it also works on the server.
    url: seoConfig.siteUrl,
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
