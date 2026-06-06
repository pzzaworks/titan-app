import { execFileSync } from "node:child_process";
import { statSync } from "node:fs";
import path from "node:path";
import type { MetadataRoute } from "next";
import { seoConfig, sitemapRoutes } from "@/lib/seo";

const projectRoot = process.cwd();

/**
 * Resolves a real lastModified date for a route's source file. Prefers the
 * file's last git commit date so the sitemap reflects actual content changes,
 * falls back to the filesystem mtime when git is unavailable (e.g. some build
 * environments), and finally to the current time so a date is always emitted.
 */
function resolveLastModified(sourceFile: string): Date {
  // Scope the dynamic filesystem read so Turbopack's file tracer does not treat
  // it as a whole-project trace (the join target is data, not a module import).
  const absolutePath = path.join(/* turbopackIgnore: true */ projectRoot, sourceFile);

  try {
    const gitDate = execFileSync(
      "git",
      ["log", "-1", "--format=%cI", "--", sourceFile],
      { cwd: projectRoot, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }
    ).trim();

    if (gitDate) {
      const parsed = new Date(gitDate);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }
  } catch {
    // git not available or file not tracked; fall back to filesystem mtime.
  }

  try {
    return statSync(absolutePath).mtime;
  } catch {
    return new Date();
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapRoutes.map((route) => ({
    url: route.path === "/" ? seoConfig.siteUrl : `${seoConfig.siteUrl}${route.path}`,
    lastModified: resolveLastModified(route.sourceFile),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
