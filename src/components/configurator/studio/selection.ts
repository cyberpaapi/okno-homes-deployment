import type { Catalogue } from "@/data/configurator/studio/catalogue";

export function restoreChoices(catalogue: Catalogue, stored: unknown): Record<string, string> {
  const value = stored && typeof stored === "object" ? stored as { revision?: unknown; sourceHash?: unknown; choices?: Record<string, unknown> } : null;
  const valid = value?.revision === catalogue.revision && value?.sourceHash === catalogue.sourceHash;
  return Object.fromEntries(catalogue.groups.filter((g) => g.enabled).map((g) => {
    const id = valid ? value?.choices?.[g.id] : undefined;
    return [g.id, typeof id === "string" && g.finishes.includes(id) ? id : g.defaultFinish];
  }));
}

// Links carry only offered finish IDs. The live catalogue remains the authority.
export function selectionLink(catalogue: Catalogue, choices: Record<string, string>, origin: string): string {
  const url = new URL(`/models/signature/${catalogue.slug}/configure`, origin);
  url.searchParams.set("variant", catalogue.variant);
  const params = new URLSearchParams({ revision: String(catalogue.revision) });
  for (const group of catalogue.groups.filter((g) => g.enabled)) {
    params.set(group.id, group.finishes.includes(choices[group.id]) ? choices[group.id] : group.defaultFinish);
  }
  url.hash = params.toString();
  return url.href;
}

export function sharedChoices(catalogue: Catalogue, hash: string): Record<string, string> | null {
  if (!hash || hash.length > 2000) return null;
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  if (params.get("revision") !== String(catalogue.revision)) return null;
  const groups = catalogue.groups.filter((g) => g.enabled);
  if (!groups.every((g) => params.getAll(g.id).length === 1 && g.finishes.includes(params.get(g.id)!))) return null;
  return Object.fromEntries(groups.map((g) => [g.id, params.get(g.id)!]));
}
