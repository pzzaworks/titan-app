import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { Roboto_Mono } from "next/font/google";
import { headers } from "next/headers";
import { Providers } from "./providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import "@/styles/globals.css";

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
});

const siteUrl = "https://titandefi.org";
const siteName = "Titan";
const siteTitle = "Titan - DeFi Super App";
const siteDescription = "Swap, stake, farm, and govern - all in one interface. Built with Uniswap V4 on Ethereum.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    "defi",
    "ethereum",
    "swap",
    "staking",
    "yield farming",
    "governance",
    "uniswap v4",
    "titan",
    "crypto",
    "blockchain",
    "web3",
    "decentralized finance",
  ],
  authors: [{ name: "Berke (pzzaworks)", url: "https://pzza.works" }],
  creator: "Berke (pzzaworks)",
  publisher: "Berke (pzzaworks)",
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
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: siteName,
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Titan - DeFi Super App",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/og-image.png"],
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
      <body className={`${GeistSans.variable} ${robotoMono.variable} font-sans antialiased bg-eigenpal-cream`}>
        <Providers cookies={cookies}>
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
