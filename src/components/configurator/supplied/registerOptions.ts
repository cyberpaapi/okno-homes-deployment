import { MATERIAL_FINISHES, type MaterialApplicationId, type MaterialFamilyId } from "@/data/configurator";
import { finishDetailImage } from "@/data/configurator/studio/finishes";
import { finishRendering } from "@/components/configurator/studio/finishRendering";
import type { Finish, Group } from "./cabinScene";

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
    // The original swatch is a visual sample, not a calibrated PBR texture.
    preview: { color: "#ffffff", texture: finishDetailImage(material.id).src, roughness: profile.roughness, metalness: profile.metalness } satisfies Finish,
  };
});

export const optionsForApplication = (id: MaterialApplicationId) => registerOptions.filter(option => option.approvedApplications.includes(id));
