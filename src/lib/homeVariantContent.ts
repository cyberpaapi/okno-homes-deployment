import type { ContentItem } from "@/lib/contentCollections";

export function homeVariantAccessibleTitle(variant: ContentItem | undefined, fallback: string) {
  return variant?.fields.accessibleTitle?.trim() || variant?.fields.heading?.trim() || fallback;
}
