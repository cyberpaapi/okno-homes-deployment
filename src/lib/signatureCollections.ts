import { gazePrototype, oknoModels, type OknoModel } from "@/data/models";
import type { ContentItem } from "@/lib/contentCollections";

export const signatureBaseModels: OknoModel[] = ["forza", "kray", "gaze", "tengo", "trib", "octapod"].flatMap(slug => {
  const model = slug === "gaze" ? gazePrototype : oknoModels.find(item => item.slug === slug);
  return model ? [model] : [];
});

export const signatureModelDefaults: ContentItem[] = signatureBaseModels.map(model => ({
  id: model.slug,
  fields: { name: model.name },
}));

export function signaturePlanDefaults(values: Record<string, string> = {}): ContentItem[] {
  return signatureBaseModels.flatMap(model => model.variants.map((variant, index) => {
    const prefix = `models.signature.${model.slug}.variant-${index + 1}.`;
    return { id: `${model.slug}-plan-${index + 1}`, fields: {
      modelId: model.slug,
      name: values[`${prefix}name`] ?? variant.name,
      area: values[`${prefix}area`] ?? variant.areaDisplay ?? `${variant.areaSqFt.toLocaleString("en-IN")} sq ft`,
      price: values[`${prefix}price`] ?? variant.price.display,
      spaces: values[`${prefix}spaces`] ?? variant.spaces.join(" · "),
    } };
  }));
}

export function parseSignatureFeatures(raw?: string): { title: string; copy: string }[] {
  try {
    const value: unknown = JSON.parse(raw || "[]");
    return Array.isArray(value) ? value.filter((item): item is { title: string; copy: string } =>
      Boolean(item && typeof item === "object" && typeof item.title === "string" && typeof item.copy === "string")) : [];
  } catch { return []; }
}

export function parseSignatureGallery(raw?: string): { id: string; label: string; image: string; alt: string }[] {
  try {
    const value: unknown = JSON.parse(raw || "[]");
    return Array.isArray(value) ? value.filter((item): item is { id: string; label: string; image: string; alt: string } =>
      Boolean(item && typeof item === "object" && typeof item.id === "string" && typeof item.label === "string" && typeof item.image === "string" && typeof item.alt === "string")) : [];
  } catch { return []; }
}
