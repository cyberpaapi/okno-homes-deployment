import detailSwatches from "./detailSwatches.json";
import { MATERIAL_FINISHES, type MaterialApplicationId, type MaterialFinish } from "../index";

export type CustomFinish = {
  id: string;
  name: string;
  family: "custom";
  registerNumber: "";
  approvedApplications: MaterialApplicationId[];
};
export type StudioFinish = MaterialFinish | CustomFinish;
export const isCustomFinishId = (id: string) => /^custom-[a-f0-9-]{36}$/.test(id);
export const finishImage = (id: string) => isCustomFinishId(id)
  ? `/api/configurator/materials/${id}`
  : `/configurator/materials/${id}/preview.jpg`;
export const catalogueFinishes = (catalogue: { customFinishes?: CustomFinish[] }): readonly StudioFinish[] =>
  [...MATERIAL_FINISHES, ...(catalogue.customFinishes || [])];

export function finishDetailImage(id: string): { src: string; width: number; height: number } {
  const sample = (detailSwatches as Record<string, { src: string; width: number; height: number }>)[id];
  return sample || { src: finishImage(id), width: 680, height: 680 };
}
