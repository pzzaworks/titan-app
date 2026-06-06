import type { JsonLdNode } from "@/lib/seo";

interface StructuredDataProps {
  /** One or more JSON-LD nodes to serialize into a single script tag. */
  data: JsonLdNode[];
}

/**
 * Renders JSON-LD structured data as an inline script. Pages pass their
 * per-page graph (breadcrumbs, feature service nodes) built from seo.ts so the
 * markup stays consistent with the root graph emitted in the layout.
 */
export function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
