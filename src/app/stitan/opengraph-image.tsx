import { createOgImage, ogContentType, ogImageSize } from "@/lib/og";

export const alt = "sTITAN Liquid Staking on Titan DeFi";
export const size = ogImageSize;
export const contentType = ogContentType;

export default function Image() {
  return createOgImage({
    eyebrow: "sTITAN",
    title: "sTITAN Liquid Staking",
  });
}
