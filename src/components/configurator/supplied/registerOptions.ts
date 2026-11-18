import { MATERIAL_FINISHES, type MaterialApplicationId, type MaterialFamilyId } from "@/data/configurator";
import { finishDetailImage } from "@/data/configurator/studio/finishes";
import { finishRendering } from "@/components/configurator/studio/finishRendering";
import type { Finish, Group } from "./cabinScene";
import renderTextures from "@/data/configurator/finishRenderTextures.json";

// Tileable textures taken from the client's Forza GLBs (16 November 2026). They render a
// finish in 3D; the original register sample stays the swatch the customer picks from.
const renderTexture = renderTextures as Record<string, { src: string; metersPerTile: number }>;

export const applicationGroups: { id: MaterialApplicationId; label: string; sceneGroup: Group; sharedInterior: boolean }[] = [
  { id: "external-roof", label: "External roof", sceneGroup: "roof", sharedInterior: false },
  { id: "external-wall", label: "External wall", sceneGroup: "cladding", sharedInterior: false },
  { id: "flooring", label: "Flooring", sceneGroup: "timber", sharedInterior: true },
  { id: "internal-ceiling", label: "Internal ceiling", sceneGroup: "timber", sharedInterior: true },
  { id: "internal-wall", label: "Internal wall", sceneGroup: "timber", sharedInterior: true },
];

export const familyLabels: Record<MaterialFamilyId, string> = {
  "metal-cladding": "Metal cladding", shingles: "Shingles", "thatched-roof": "Thatched roof",
  thermowood: "Thermowood", paint: "Paint", tiles: "Tiles",
  "laminated-wood-herringbone": "Laminated wood · Herringbone", "laminated-wood": "Laminated wood",
};

export const registerOptions = MATERIAL_FINISHES.map(material => {
  const profile = finishRendering(material);
  return {
    ...material,
    image: finishDetailImage(material.id).src,
    // The original swatch is a visual sample, not a calibrated PBR texture. Where the client
    // supplied a tileable texture for the finish, the 3D view uses it at its real size.
    preview: {
      color: "#ffffff",
      texture: renderTexture[material.id]?.src ?? finishDetailImage(material.id).src,
      ...(renderTexture[material.id] ? { scale: renderTexture[material.id].metersPerTile } : {}),
      detailAsset: profile.asset, normal: profile.normal, relief: profile.relief,
      roughness: profile.roughness, metalness: profile.metalness,
    } satisfies Finish,
  };
});

/** Shingle and thatch roofs cover the timber bands that cross the metal roof. */
export const coversRoofBands = (family: MaterialFamilyId) => family === "shingles" || family === "thatched-roof";

export const optionsForApplication = (id: MaterialApplicationId) => registerOptions.filter(option => option.approvedApplications.includes(id));
