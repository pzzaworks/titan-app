import { createOgImage, ogContentType, ogImageSize } from "@/lib/og";

export const alt = "sTITAN Governance on Titan DeFi";
export const size = ogImageSize;
export const contentType = ogContentType;

export default function Image() {
  return createOgImage({
    eyebrow: "Governance",
    title: "sTITAN Governance",
  });
}
