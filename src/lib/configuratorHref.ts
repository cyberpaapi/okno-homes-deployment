/** Keep selected plan context; the viewer discloses family-only geometry where applicable. */
export function configurationHref(slug: string, variant?: string | null) {
  const path = `/models/signature/${encodeURIComponent(slug)}/configure`;
  return variant ? `${path}?variant=${encodeURIComponent(variant)}` : path;
}
