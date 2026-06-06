import { ImageResponse } from "next/og";

/**
 * Shared OpenGraph image size. Re-exported by each opengraph-image route so the
 * exported `size` config and the ImageResponse dimensions stay in sync.
 */
export const ogImageSize = {
  width: 1200,
  height: 630,
} as const;

export const ogContentType = "image/png";

// Brand colors sourced from src/styles/globals.css.
const brandCream = "#eae5dd";
const brandInk = "#2a1a1d";
const brandGreen = "#26d862";
const brandMuted = "#645757";

interface OgImageOptions {
  /** Large headline, typically the page title. */
  title: string;
  /** Optional supporting line under the title. */
  eyebrow?: string;
}

/**
 * Builds an on-brand OpenGraph image using the default font (no remote or woff2
 * fonts) so the build stays deterministic and offline-safe. Layout is plain
 * flexbox with inline styles to respect ImageResponse/Satori constraints.
 */
export function createOgImage({ title, eyebrow }: OgImageOptions): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: brandCream,
          backgroundImage: `radial-gradient(circle at 85% 15%, rgba(38, 216, 98, 0.18), transparent 45%)`,
          padding: "72px 80px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              backgroundColor: brandGreen,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: 34,
              fontWeight: 700,
            }}
          >
            T
          </div>
          <div
            style={{
              marginLeft: 20,
              fontSize: 34,
              fontWeight: 600,
              color: brandInk,
            }}
          >
            Titan DeFi
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {eyebrow ? (
            <div
              style={{
                fontSize: 26,
                color: brandMuted,
                marginBottom: 18,
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              {eyebrow}
            </div>
          ) : null}
          <div
            style={{
              fontSize: 76,
              lineHeight: 1.05,
              fontWeight: 700,
              color: brandInk,
              maxWidth: 980,
            }}
          >
            {title}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 26,
            color: brandMuted,
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 7,
              backgroundColor: brandGreen,
              marginRight: 14,
            }}
          />
          titandefi.org
        </div>
      </div>
    ),
    {
      ...ogImageSize,
    },
  );
}
