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
  /**
   * Static OG image to use instead of the per-page generated card. Set on the
   * home route so it keeps the original brand og-image.
   */
  ogImage?: string;
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
  ogImage,
}: PageMetadataConfig): Metadata {
  const url = buildUrl(path);
  const pageTitle = resolveTitle(title);
  const socialTitle = buildSocialTitle(title);
  const ogImages = ogImage ? [{ url: ogImage, width: 1200, height: 630 }] : undefined;

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
      // Only set images for pages that opt into a static OG (the home route);
      // other pages omit it so their file-convention opengraph-image card wins.
      ...(ogImages ? { images: ogImages } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      creator: seoConfig.twitterHandle,
      ...(ogImage ? { images: [ogImage] } : {}),
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
  /**
   * Path to the route's source file, relative to the project root. The sitemap
   * derives a real per-URL lastModified date from this file (git commit date,
   * falling back to filesystem mtime) instead of stamping every URL with the
   * build time.
   */
  sourceFile: string;
}

export const sitemapRoutes: SitemapRoute[] = [
  { path: "/", priority: 1, changeFrequency: "weekly", sourceFile: "src/app/page.tsx" },
  { path: "/swap", priority: 0.9, changeFrequency: "weekly", sourceFile: "src/app/swap/page.tsx" },
  { path: "/liquidity", priority: 0.9, changeFrequency: "weekly", sourceFile: "src/app/liquidity/page.tsx" },
  { path: "/earn", priority: 0.8, changeFrequency: "weekly", sourceFile: "src/app/earn/page.tsx" },
  { path: "/stitan", priority: 0.8, changeFrequency: "weekly", sourceFile: "src/app/stitan/page.tsx" },
  { path: "/borrow", priority: 0.8, changeFrequency: "weekly", sourceFile: "src/app/borrow/page.tsx" },
  { path: "/governance", priority: 0.8, changeFrequency: "weekly", sourceFile: "src/app/governance/page.tsx" },
  { path: "/faucet", priority: 0.7, changeFrequency: "weekly", sourceFile: "src/app/faucet/page.tsx" },
  { path: "/terms", priority: 0.3, changeFrequency: "monthly", sourceFile: "src/app/terms/page.tsx" },
  { path: "/privacy", priority: 0.3, changeFrequency: "monthly", sourceFile: "src/app/privacy/page.tsx" },
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
const personId = `${seoConfig.siteUrl}/#berke`;

/**
 * The site author / maintainer as a schema.org Person. Used for E-E-A-T so the
 * Organization, WebSite, and SoftwareApplication nodes all attribute the work
 * to a real, verifiable individual with linked X and GitHub profiles.
 */
const authorPerson: JsonLdNode = {
  "@type": "Person",
  "@id": personId,
  name: "Berke (pzzaworks)",
  url: "https://pzza.works",
  sameAs: ["https://x.com/pzzaworks", "https://github.com/pzzaworks"],
};

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
      founder: authorPerson,
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
      author: { "@id": personId },
      creator: { "@id": personId },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
  ];
}

export interface FaqItem {
  question: string;
  answer: string;
}

/**
 * Builds FAQPage structured data. The question and answer text must match the
 * visible FAQ content exactly, since Google requires the markup and the
 * on-page text to be identical for rich-result eligibility.
 */
export function buildFaqSchema(items: FaqItem[]): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
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
