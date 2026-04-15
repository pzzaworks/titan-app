import type { Metadata } from "next";

export const seoConfig = {
  siteUrl: "https://titandefi.org",
  siteName: "Titan",
  siteTitle: "Titan - DeFi Super App",
  siteDescription:
    "Experimental DeFi app on Ethereum Sepolia for swap, liquidity, staking, borrowing, governance, and testnet faucet flows.",
  defaultKeywords: [
    "defi",
    "ethereum",
    "sepolia",
    "swap",
    "liquidity",
    "staking",
    "governance",
    "uniswap v4",
    "titan",
    "web3",
    "decentralized finance",
    "testnet",
  ],
  defaultOgImage: {
    url: "/og-image.png",
    width: 1200,
    height: 630,
    alt: "Titan",
  },
  githubUrl: "https://github.com/pzzaworks/titan-app",
} as const;

export interface PageMetadataConfig {
  title?: string;
  description: string;
  path: string;
  keywords?: string[];
  noIndex?: boolean;
}

function buildUrl(path: string): string {
  if (path === "/") {
    return seoConfig.siteUrl;
  }

  return `${seoConfig.siteUrl}${path}`;
}

function buildTitle(title?: string): string {
  if (!title || title === seoConfig.siteTitle) {
    return seoConfig.siteTitle;
  }

  return `${title} | ${seoConfig.siteName}`;
}

export function createPageMetadata({
  title,
  description,
  path,
  keywords = [],
  noIndex = false,
}: PageMetadataConfig): Metadata {
  const url = buildUrl(path);
  const pageTitle = buildTitle(title);

  return {
    title: pageTitle,
    description,
    keywords: [...seoConfig.defaultKeywords, ...keywords],
    alternates: {
      canonical: path,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        }
      : undefined,
    openGraph: {
      type: "website",
      locale: "en_US",
      url,
      siteName: seoConfig.siteName,
      title: pageTitle,
      description,
      images: [seoConfig.defaultOgImage],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: [seoConfig.defaultOgImage.url],
      creator: "@pzzaworks",
    },
  };
}

export interface SitemapRoute {
  path: string;
  priority: number;
  changeFrequency:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
}

export const sitemapRoutes: SitemapRoute[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/swap", priority: 0.9, changeFrequency: "weekly" },
  { path: "/liquidity", priority: 0.9, changeFrequency: "weekly" },
  { path: "/earn", priority: 0.8, changeFrequency: "weekly" },
  { path: "/stitan", priority: 0.8, changeFrequency: "weekly" },
  { path: "/borrow", priority: 0.8, changeFrequency: "weekly" },
  { path: "/governance", priority: 0.8, changeFrequency: "weekly" },
  { path: "/faucet", priority: 0.7, changeFrequency: "weekly" },
  { path: "/terms", priority: 0.3, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "monthly" },
];

export function buildSchemaGraph(): Array<Record<string, string | Record<string, string>>> {
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: seoConfig.siteName,
      url: seoConfig.siteUrl,
      description: seoConfig.siteDescription,
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: seoConfig.siteName,
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web",
      url: seoConfig.siteUrl,
      description: seoConfig.siteDescription,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
  ];
}
