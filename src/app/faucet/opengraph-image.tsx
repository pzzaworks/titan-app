import { createOgImage, ogContentType, ogImageSize } from "@/lib/og";

export const alt = "Sepolia TITAN Faucet on Titan DeFi";
export const size = ogImageSize;
export const contentType = ogContentType;

export default function Image() {
  return createOgImage({
    eyebrow: "Faucet",
    title: "Sepolia TITAN Faucet",
  });
}
