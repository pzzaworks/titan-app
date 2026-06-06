import { createOgImage, ogContentType, ogImageSize } from "@/lib/og";

export const alt = "Sepolia Token Swap on Titan DeFi";
export const size = ogImageSize;
export const contentType = ogContentType;

export default function Image() {
  return createOgImage({
    eyebrow: "Swap",
    title: "Sepolia Token Swap",
  });
}
