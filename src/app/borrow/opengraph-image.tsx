import { createOgImage, ogContentType, ogImageSize } from "@/lib/og";

export const alt = "Borrow tUSD with TITAN Collateral on Titan DeFi";
export const size = ogImageSize;
export const contentType = ogContentType;

export default function Image() {
  return createOgImage({
    eyebrow: "Borrow",
    title: "Borrow tUSD with TITAN Collateral",
  });
}
