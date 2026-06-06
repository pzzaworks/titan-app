import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { Roboto_Mono } from "next/font/google";
import { headers } from "next/headers";
import Script from "next/script";
import { Providers } from "./providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { buildSchemaGraph, seoConfig } from "@/lib/seo";
import "@/styles/globals.css";

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
});

const schemaGraph = buildSchemaGraph();
const shouldLoadAnalytics = process.env.NODE_ENV === "production";
const staticSeoRoutes = [
  { href: "/", label: "Titan DeFi Super App" },
  { href: "/swap", label: "Sepolia Token Swap" },
  { href: "/liquidity", label: "TITAN WETH Liquidity" },
  { href: "/earn", label: "Earn TITAN Staking Rewards" },
  { href: "/stitan", label: "sTITAN Liquid Staking" },
  { href: "/borrow", label: "Borrow tUSD with TITAN Collateral" },
  { href: "/governance", label: "sTITAN Governance" },
  { href: "/faucet", label: "Sepolia TITAN Faucet" },
  { href: "/privacy", label: "Titan Privacy Notice" },
  { href: "/terms", label: "Titan Terms of Use" },
];

export const metadata: Metadata = {
  metadataBase: new URL(seoConfig.siteUrl),
  title: {
    default: seoConfig.siteTitle,
    template: seoConfig.titleTemplate,
  },
  description: seoConfig.siteDescription,
  keywords: [...seoConfig.defaultKeywords],
  applicationName: seoConfig.siteName,
  authors: [{ name: "Berke (pzzaworks)", url: "https://pzza.works" }],
  creator: "Berke (pzzaworks)",
  publisher: "Berke (pzzaworks)",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/titan-logo.svg",
    shortcut: "/titan-logo.svg",
    apple: "/titan-logo.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: seoConfig.siteUrl,
    siteName: seoConfig.siteName,
    title: seoConfig.siteTitle,
    description: seoConfig.siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: seoConfig.siteTitle,
    description: seoConfig.siteDescription,
    creator: "@pzzaworks",
  },
};

function StaticSeoFallback() {
  return (
    <section className="sr-only" aria-label="Titan crawlable route index">
      <h1>Titan DeFi Super App on Ethereum Sepolia</h1>
      <p>
        Titan is an experimental DeFi interface for Ethereum Sepolia with token
        swaps, TITAN WETH liquidity, staking rewards, sTITAN liquid staking,
        tUSD borrowing, governance voting, faucet claims, privacy information,
        and terms of use. These routes are available as crawlable links for
        users, search engines, and technical SEO tools even when wallet
        features hydrate on the client.
      </p>
      <p>
        The app groups common testnet DeFi actions into one product surface:
        reviewing token balances, preparing swaps, adding or removing
        liquidity, staking TITAN, tracking sTITAN governance power, testing loan
        flows, reading legal information, and using a faucet during development.
        Titan is built as a production-style interface for protocol iteration,
        so each route has a specific purpose and plain crawlable context in the
        HTML source. The visible application keeps the cyberpunk DeFi design and
        wallet interactions, while this hidden text gives non-JavaScript
        crawlers enough semantic content to understand the site without changing
        the experience for users.
      </p>
      <p>
        Users can move between swap, liquidity, earn, sTITAN, borrow,
        governance, faucet, privacy, and terms pages from the same navigation
        model. Each page explains one part of the protocol workflow and keeps
        the rest of the app reachable for crawlers that do not execute the
        wallet-ready client bundle.
      </p>
      <nav aria-label="Titan pages">
        {staticSeoRoutes.map((route) => (
          <a key={route.href} href={route.href}>
            {route.label}
          </a>
        ))}
      </nav>
    </section>
  );
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const cookies = headersList.get("cookie");

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/*
          Resolve DNS for the Sepolia RPC origin early. The connection itself is
          only opened after the user interacts with the wallet, so dns-prefetch
          (cheaper than preconnect) shaves latency off the first on-chain read
          without holding an unused socket on pages that stay read-only.
        */}
        <link rel="dns-prefetch" href="https://ethereum-sepolia-rpc.publicnode.com" />
      </head>
      <body
        className={`${GeistSans.variable} ${robotoMono.variable} font-sans antialiased bg-eigenpal-cream`}
      >
        <StaticSeoFallback />
        <Providers cookies={cookies}>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaGraph) }}
          />
          {shouldLoadAnalytics ? (
            <Script
              src="/api/rybbit/script.js"
              data-site-id="site-titan"
              strategy="beforeInteractive"
            />
          ) : null}
          <div className="relative min-h-screen flex flex-col">
            <Navbar />
            <div className="flex-1">{children}</div>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
