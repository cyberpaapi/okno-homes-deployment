/** Stable product IDs, independent of editable customer-facing plan names. */
export const STUDIO_MODELS = ["tengo", "kray"] as const;
export type StudioModel = (typeof STUDIO_MODELS)[number];

export const studioVariantIds: Record<StudioModel, readonly string[]> = {
  tengo: ["2-bhk", "3-bhk", "signature"],
  kray: ["studio", "1-bhk", "signature"],
};

/** Explore currently shows the first two plans; Signature geometry is a separate layout. */
export function exploreVariantId(slug: string, index: number): string | null {
  if (!(slug in studioVariantIds) || !Number.isInteger(index) || index < 0) return null;
  const ids = studioVariantIds[slug as StudioModel];
  return index < ids.length - 1 ? ids[index] : null;
}
