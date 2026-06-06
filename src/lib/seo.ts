import type { Metadata } from "next";

export const seoConfig = {
  siteUrl: "https://titandefi.org",
  siteName: "Titan",
  siteTitle: "Titan DeFi Super App on Sepolia",
  siteDescription:
    "Titan is an experimental DeFi app on Ethereum Sepolia that brings swaps, liquidity, staking, borrowing, governance, sTITAN, and faucet flows into one interface.",
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
  titleTemplate: "%s | Titan DeFi",
  defaultOgImage: {
    url: "/og-image.png",
    width: 1200,
    height: 630,
    alt: "Titan",
  },
  logoUrl: "https://titandefi.org/titan-logo.svg",
  githubUrl: "https://github.com/pzzaworks/titan-app",
  twitterUrl: "https://x.com/pzzaworks",
  twitterHandle: "@pzzaworks",
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

/**
 * Resolves the title for the page-level `<title>` metadata field.
 *
 * When a page-specific title is provided we return a plain string so the root
 * layout title template ("%s | Titan DeFi") appends the brand automatically and
 * we never double up the suffix. When no title is given (the home route) we use
 * an absolute title so the template is bypassed and the brand is not repeated.
 */
function resolveTitle(title?: string): NonNullable<Metadata["title"]> {
  if (!title) {
    return { absolute: seoConfig.siteTitle };
  }

  return title;
}

/**
 * Computes the fully expanded title for OpenGraph and Twitter cards. These
 * fields do not inherit the layout title template, so the brand suffix is added
 * here to keep social previews consistent with the page title.
 */
function buildSocialTitle(title?: string): string {
  if (!title) {
    return seoConfig.siteTitle;
  }

  return seoConfig.titleTemplate.replace("%s", title);
}

export function createPageMetadata({
  title,
  description,
  path,
  keywords = [],
  noIndex = false,
}: PageMetadataConfig): Metadata {
  const url = buildUrl(path);
  const pageTitle = resolveTitle(title);
  const socialTitle = buildSocialTitle(title);

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
      title: socialTitle,
      description,
      images: [seoConfig.defaultOgImage],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [seoConfig.defaultOgImage.url],
      creator: seoConfig.twitterHandle,
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

/**
 * JSON-LD value type. Schema.org nodes are nested trees of strings, numbers,
 * arrays, and child nodes, so this is the smallest precise shape that covers
 * every structured-data object we emit without resorting to `any`.
 */
export type JsonLdValue =
  | string
  | number
  | boolean
  | JsonLdNode
  | JsonLdValue[];

export interface JsonLdNode {
  [key: string]: JsonLdValue;
}

const organizationId = `${seoConfig.siteUrl}/#organization`;
const websiteId = `${seoConfig.siteUrl}/#website`;

/**
 * Root structured data shared across every page: Organization, WebSite, and the
 * SoftwareApplication describing the Titan dApp.
 */
export function buildSchemaGraph(): JsonLdNode[] {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": organizationId,
      name: "Titan DeFi",
      url: seoConfig.siteUrl,
      logo: seoConfig.logoUrl,
      description: seoConfig.siteDescription,
      sameAs: [seoConfig.githubUrl, seoConfig.twitterUrl],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": websiteId,
      name: seoConfig.siteName,
      url: seoConfig.siteUrl,
      description: seoConfig.siteDescription,
      publisher: { "@id": organizationId },
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: seoConfig.siteName,
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web",
      url: seoConfig.siteUrl,
      description: seoConfig.siteDescription,
      publisher: { "@id": organizationId },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
  ];
}

export interface PageSchemaConfig {
  /** Breadcrumb label for the current page, e.g. "Swap". */
  name: string;
  /** Route path of the current page, e.g. "/swap". */
  path: string;
  /** Optional feature description rendered as a Service node. */
  feature?: {
    name: string;
    description: string;
  };
}

/**
 * Builds the per-page structured data: a BreadcrumbList rooting the page under
 * the home page and, when provided, a Service node describing the dApp feature.
 * No ratings or review data are emitted to keep the markup accurate.
 */
export function buildPageSchemaGraph({
  name,
  path,
  feature,
}: PageSchemaConfig): JsonLdNode[] {
  const url = buildUrl(path);

  const breadcrumb: JsonLdNode = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: seoConfig.siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name,
        item: url,
      },
    ],
  };

  const nodes: JsonLdNode[] = [breadcrumb];

  if (feature) {
    nodes.push({
      "@context": "https://schema.org",
      "@type": "Service",
      name: feature.name,
      description: feature.description,
      url,
      serviceType: "Decentralized finance",
      areaServed: "Ethereum Sepolia testnet",
      provider: { "@id": organizationId },
      isPartOf: { "@id": websiteId },
    });
  }

  return nodes;
}
