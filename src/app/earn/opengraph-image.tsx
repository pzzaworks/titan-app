import { createOgImage, ogContentType, ogImageSize } from "@/lib/og";

export const alt = "Earn TITAN Staking Rewards on Titan DeFi";
export const size = ogImageSize;
export const contentType = ogContentType;

export default function Image() {
  return createOgImage({
    eyebrow: "Earn",
    title: "Earn TITAN Staking Rewards",
  });
}
