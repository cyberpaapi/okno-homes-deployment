import {
  MATERIAL_APPLICATION_IDS,
  MATERIAL_FINISHES,
  type MaterialApplicationId,
} from "../index";
import assets from "./assets.json";
import type { CustomFinish } from "./finishes";
import { STUDIO_MODELS, studioVariantIds, type StudioModel } from "./variantIds";

export { STUDIO_MODELS };
export type { StudioModel };
export const labels: Record<MaterialApplicationId, string> = {
  "external-wall": "External walls",
  "external-roof": "Roof",
  flooring: "Flooring",
  "internal-ceiling": "Internal ceilings",
  "internal-wall": "Internal walls",
};
export const surfaceOrder: MaterialApplicationId[] = [
  "external-wall",
  "external-roof",
  "flooring",
  "internal-ceiling",
  "internal-wall",
];
export const posters: Record<StudioModel, string> = {
  tengo:
    "/models/tengo/blender-accurate/styled-imagen-final-1080p/tengo-a000-roof-final-1920x1080.png",
  kray: "/models/kray/orbit-keyframes-midnight-teal-1080p/kray-a00.png",
};
export const variants: Record<StudioModel, readonly string[]> = studioVariantIds;
export type Surface = {
  side?: "back";
  id: MaterialApplicationId;
  enabled: boolean;
  parts: number[];
  finishes: string[];
  defaultFinish: string;
};
export type Catalogue = {
  customFinishes?: CustomFinish[];
  schema: 1;
  slug: StudioModel;
  revision: number;
  sourceHash: string;
  variant: string;
  groups: Surface[];
  publishedAt: string | null;
};
export function isStudioModel(value: unknown): value is StudioModel {
  return STUDIO_MODELS.includes(value as StudioModel);
}
export function sourceFor(slug: StudioModel) {
  return assets[slug];
}
export function makeDraft(slug: StudioModel): Catalogue {
  return {
    schema: 1,
    slug,
    revision: 0,
    sourceHash: assets[slug].sha256,
    variant: "",
    publishedAt: null,
    groups: surfaceOrder.map((id) => {
      const finishes = MATERIAL_FINISHES.filter((f) =>
        f.approvedApplications.includes(id),
      ).map((f) => f.id);
      return {
        id,
        enabled: false,
        parts: [],
        finishes,
        defaultFinish: finishes[0],
      };
    }),
  };
}
export function validateCatalogue(
  value: unknown,
  slug: StudioModel,
  publishing = false,
  customLibrary: readonly CustomFinish[] = [],
): Catalogue {
  if (!value || typeof value !== "object")
    throw new Error("Invalid catalogue.");
  const input = value as Catalogue;
  if (
    input.schema !== 1 ||
    input.slug !== slug ||
    input.sourceHash !== assets[slug].sha256 ||
    !Number.isSafeInteger(input.revision) ||
    input.revision < 0
  )
    throw new Error(
      "This catalogue does not match the model source. Reload the studio.",
    );
  if (input.variant !== "" && !variants[slug].includes(input.variant))
    throw new Error("Choose a supported model variant.");
  if (!Array.isArray(input.groups) || input.groups.length !== 5)
    throw new Error("All five surface groups are required.");
  const ids = new Set<string>(),
    parts = new Set<string>();
  const validParts = new Set(assets[slug].parts.map((p) => p.id));
  const groups = input.groups.map((g) => {
    if (
      !g ||
      !MATERIAL_APPLICATION_IDS.includes(g.id) ||
      ids.has(g.id) ||
      typeof g.enabled !== "boolean"
    )
      throw new Error("Invalid or duplicate surface group.");
    ids.add(g.id);
    if (!Array.isArray(g.parts) || !Array.isArray(g.finishes))
      throw new Error("Invalid surface options.");
    if (g.side !== undefined && (g.side !== "back" || g.id !== "internal-ceiling"))
      throw new Error("Only ceilings can use the underside of a roof surface.");
    if (g.side === "back" && g.parts.some(id => !input.groups.find(group => group.id === "external-roof")?.parts.includes(id)))
      throw new Error("Ceiling underside parts must belong to the roof.");
    for (const id of g.parts) {
      const key = `${id}:${g.side || "front"}`;
      if (!validParts.has(id) || parts.has(key))
        throw new Error("Each model part must belong to at most one surface.");
      parts.add(key);
    }
    const allowed = [...MATERIAL_FINISHES, ...customLibrary].filter((f) =>
      f.approvedApplications.includes(g.id),
    ).map((f) => f.id);
    if (
      g.finishes.some((id) => !allowed.includes(id)) ||
      new Set(g.finishes).size !== g.finishes.length
    )
      throw new Error(
        `A finish is not approved for ${labels[g.id].toLowerCase()}.`,
      );
    if (
      typeof g.defaultFinish !== "string" ||
      (g.finishes.length > 0 && !g.finishes.includes(g.defaultFinish))
    )
      throw new Error("The default must be one of the offered finishes.");
    if (publishing && g.enabled && (!g.parts.length || !g.finishes.length))
      throw new Error(
        `${labels[g.id]} needs assigned parts and at least one finish.`,
      );
    return {
      id: g.id,
      enabled: g.enabled,
      parts: [...g.parts],
      finishes: [...g.finishes],
      defaultFinish: g.defaultFinish,
      ...(g.side ? { side: g.side } : {}),
    };
  });
  if (publishing && (!input.variant || !groups.some((g) => g.enabled)))
    throw new Error(
      "Confirm the source variant and enable at least one complete surface.",
    );
  return {
    schema: 1,
    slug,
    revision: input.revision,
    sourceHash: input.sourceHash,
    variant: input.variant,
    groups,
    customFinishes: customLibrary.filter((f) => groups.some((g) => g.finishes.includes(f.id))),
    publishedAt: null,
  };
}
