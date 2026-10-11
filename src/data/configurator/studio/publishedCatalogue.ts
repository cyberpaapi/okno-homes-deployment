import published from "./published.json";
import { isStudioModel, validateCatalogue, type Catalogue, type StudioModel } from "./catalogue";

type PublishedConfiguration = {
  status: "ready" | "unsupported-variant";
  slug: StudioModel;
  catalogue: Catalogue;
};

/** Read-only showcase snapshot of actually published catalogues, never draft mappings. */
export function resolvePublishedConfiguration(slug: string, requestedVariant?: string | string[]): PublishedConfiguration | null {
  if (!isStudioModel(slug)) return null;
  const catalogue = validateCatalogue(published[slug], slug, true);
  // Published geometry identifies Signature only. Bedroom variants must not borrow it.
  const supported = requestedVariant === undefined || requestedVariant === catalogue.variant;
  return { status: supported ? "ready" : "unsupported-variant", slug, catalogue };
}
