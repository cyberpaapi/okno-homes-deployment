export const MATERIAL_APPLICATION_IDS = [
  "external-roof",
  "external-wall",
  "flooring",
  "internal-ceiling",
  "internal-wall",
] as const;

export type MaterialApplicationId = (typeof MATERIAL_APPLICATION_IDS)[number];

export const MATERIAL_FAMILY_IDS = [
  "metal-cladding",
  "shingles",
  "thatched-roof",
  "thermowood",
  "paint",
  "tiles",
  "laminated-wood-herringbone",
  "laminated-wood",
] as const;

export type MaterialFamilyId = (typeof MATERIAL_FAMILY_IDS)[number];

export interface MaterialFinish {
  readonly id: string;
  readonly registerNumber: string;
  readonly name: string;
  readonly family: MaterialFamilyId;
  readonly approvedApplications: readonly MaterialApplicationId[];
}

export type MaterialRegisterUnconfirmedField =
  | "model-specific-compatibility"
  | "pbr-assets"
  | "prices";

export interface MaterialRegisterSource {
  readonly kind: "application-register";
  readonly approvalStatus: "client-approved";
  readonly fileName: string;
  readonly title: string;
  readonly scope: string;
  readonly unconfirmed: readonly MaterialRegisterUnconfirmedField[];
}

export type ConfiguratorPublicationStatus = "hidden" | "published";

export type ConfiguratorWebGlbAsset =
  | {
      readonly status: "requires-optimization";
      readonly src: null;
    }
  | {
      readonly status: "preview";
      readonly src: string;
    }
  | {
      readonly status: "ready";
      readonly src: string;
    };

export type SurfaceCompatibilityStatus = "review-required" | "approved";

export type EmbeddedGlbMeshCategory = "cladding" | "roof";

export interface ConfiguratorSurfaceDefinition {
  readonly applicationId: MaterialApplicationId;
  readonly meshCategory: EmbeddedGlbMeshCategory;
  readonly sourceLayers: readonly string[];
  readonly defaultFinishId: string;
  readonly candidateFinishIds: readonly string[];
  readonly compatibilityStatus: SurfaceCompatibilityStatus;
}

export interface ConfiguratorDefinition {
  readonly schemaVersion: 1;
  readonly catalogueVersion: string;
  readonly status: ConfiguratorPublicationStatus;
  readonly modelSlug: string;
  readonly variantIds: readonly string[];
  readonly posterSrc: string;
  readonly webGlbAsset: ConfiguratorWebGlbAsset;
  readonly surfaces: readonly ConfiguratorSurfaceDefinition[];
}
