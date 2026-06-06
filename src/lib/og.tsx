import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Shared OpenGraph image size. Re-exported by each opengraph-image route so the
 * exported `size` config and the ImageResponse dimensions stay in sync.
 */
export const ogImageSize = {
  width: 1200,
  height: 630,
} as const;

export const ogContentType = "image/png";

// Brand palette taken from the original og-image.png / globals.css: a deep
// forest-green canvas with a warm cream foreground.
const brandGreen = "#213024";
const brandCream = "#eae5dd";
const brandMuted = "#9aae9d";

function loadAsset(relativePath: string): string {
  const buffer = readFileSync(join(process.cwd(), "public", relativePath));
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

// Pre-rasterized cream brand marks (recolored from the source SVGs) so the
// star icon and serif wordmark identity from the original og-image are
// preserved without shipping a custom font to Satori.
const starMark = loadAsset("og/mark.png");
const wordmark = loadAsset("og/wordmark.png");

// The site's display font (ABC Arizona Flare) so the title matches the app.
const fontData = readFileSync(join(process.cwd(), "public", "og", "font.ttf"));
const FONT_FAMILY = "ABC Arizona Flare";

interface OgImageOptions {
  /** Large headline, typically the page title. */
  title: string;
  /** Optional supporting line under the title. */
  eyebrow?: string;
}

/**
 * Builds an on-brand OpenGraph image that echoes the original Titan og-image
 * (forest-green canvas, cream serif wordmark) while surfacing the page title.
 */
export function createOgImage({ title }: OgImageOptions): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: brandGreen,
          backgroundImage:
            "radial-gradient(circle at 88% 12%, rgba(234,229,221,0.10), transparent 45%)",
          padding: "76px 84px",
          fontFamily: FONT_FAMILY,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <img src={starMark} height={62} width={62} alt="" />
          <img src={wordmark} height={58} width={157} alt="Titan" />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 78,
              lineHeight: 1.04,
              fontWeight: 700,
              color: brandCream,
              maxWidth: 1000,
            }}
          >
            {title}
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 27, color: brandMuted }}>
          titandefi.org
        </div>
      </div>
    ),
    {
      ...ogImageSize,
      fonts: [
        { name: FONT_FAMILY, data: fontData, weight: 400, style: "normal" },
        { name: FONT_FAMILY, data: fontData, weight: 700, style: "normal" },
      ],
    },
  );
}
