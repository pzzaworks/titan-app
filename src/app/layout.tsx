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
        {/*
          Emit the root JSON-LD graph as a direct child of <body> (a Server
          Component boundary) rather than inside <Providers>, a client
          component, so the script lands in the static HTML as-is.
        */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaGraph) }}
        />
        <Providers cookies={cookies}>
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
