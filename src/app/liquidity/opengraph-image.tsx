import { createOgImage, ogContentType, ogImageSize } from "@/lib/og";

export const alt = "TITAN WETH Liquidity on Titan DeFi";
export const size = ogImageSize;
export const contentType = ogContentType;

export default function Image() {
  return createOgImage({
    eyebrow: "Liquidity",
    title: "TITAN WETH Liquidity",
  });
}
