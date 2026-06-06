import { createOgImage, ogContentType, ogImageSize } from "@/lib/og";

export const alt = "Titan DeFi Super App on Ethereum Sepolia";
export const size = ogImageSize;
export const contentType = ogContentType;

export default function Image() {
  return createOgImage({
    eyebrow: "DeFi Super App on Sepolia",
    title: "Swap, stake, borrow and govern in one place",
  });
}
