import { createOgImage, ogContentType, ogImageSize } from "@/lib/og";

export const alt = "Titan Terms of Use";
export const size = ogImageSize;
export const contentType = ogContentType;

export default function Image() {
  return createOgImage({
    eyebrow: "Legal",
    title: "Titan Terms of Use",
  });
}
