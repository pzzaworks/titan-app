"use client";

import { ReactNode, useState } from "react";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider, MutationCache, QueryCache } from "@tanstack/react-query";
import { WagmiProvider, cookieToInitialState } from "wagmi";
import { Toaster } from "sonner";
import { wagmiConfig, initializeAppKit } from "@/lib/wagmi";

// Module scope, as Reown documents for the App Router: AppKit exists before the
// first render on both server and client, so pages render their real content
// into the server HTML instead of waiting for a client mount.
initializeAppKit();

interface ProvidersProps {
  children: ReactNode;
  cookies: string | null;
}

export function Providers({ children, cookies }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              // Don't retry on network errors from WalletConnect
              if (error instanceof TypeError && error.message === "Failed to fetch") {
                return false;
              }
              return failureCount < 3;
            },
          },
        },
        queryCache: new QueryCache({
          onError: (error) => {
            // Suppress WalletConnect/Reown fetch errors
            if (error instanceof TypeError && error.message === "Failed to fetch") {
              return;
            }
            console.error("Query error:", error);
          },
        }),
        mutationCache: new MutationCache({
          onError: (error) => {
            // Suppress WalletConnect/Reown fetch errors
            if (error instanceof TypeError && error.message === "Failed to fetch") {
              return;
            }
            console.error("Mutation error:", error);
          },
        }),
      })
  );

  const initialState = cookieToInitialState(wagmiConfig, cookies);

  return (
    <WagmiProvider config={wagmiConfig} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          {children}
          <Toaster
            position="top-right"
            offset={24}
            toastOptions={{
              className: "rounded-xl",
              style: {
                background: "white",
                border: "1px solid var(--color-border)",
                color: "var(--color-foreground)",
                borderRadius: "12px",
              },
            }}
            richColors
          />
        </ThemeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
