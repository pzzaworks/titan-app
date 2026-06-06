import type { MetadataRoute } from "next";
import { seoConfig } from "@/lib/seo";

/**
 * Major AI crawlers and answer-engine bots we explicitly welcome so Titan stays
 * discoverable in ChatGPT, Perplexity, Claude, Google AI Overviews, and Apple
 * Intelligence. They are already covered by the wildcard rule; listing them
 * makes the access intent explicit.
 */
const aiCrawlers = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-Web",
  "PerplexityBot",
  "Google-Extended",
  "Applebot-Extended",
  "cohere-ai",
  "Bytespider",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/_next/"],
      },
      {
        userAgent: aiCrawlers,
        allow: "/",
      },
    ],
    sitemap: `${seoConfig.siteUrl}/sitemap.xml`,
    host: seoConfig.siteUrl,
  };
}
