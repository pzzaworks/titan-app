import { createOgImage, ogContentType, ogImageSize } from "@/lib/og";

export const alt = "Titan Privacy Notice";
export const size = ogImageSize;
export const contentType = ogContentType;

export default function Image() {
  return createOgImage({
    eyebrow: "Legal",
    title: "Titan Privacy Notice",
  });
}
