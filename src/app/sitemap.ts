import type { MetadataRoute } from "next";
import { seoConfig, sitemapRoutes } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return sitemapRoutes.map((route) => ({
    url: route.path === "/" ? seoConfig.siteUrl : `${seoConfig.siteUrl}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
