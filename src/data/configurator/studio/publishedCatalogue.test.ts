import { describe, expect, it } from "vitest";
import { resolvePublishedConfiguration } from "./publishedCatalogue";
import { exploreVariantId } from "./variantIds";

describe("recovered published customer configurations", () => {
  it("serves the actually published Tengo and Kray revisions", () => {
    expect(resolvePublishedConfiguration("tengo")).toMatchObject({ status: "ready", catalogue: { revision: 1, variant: "signature" } });
    expect(resolvePublishedConfiguration("kray", "signature")).toMatchObject({ status: "ready", catalogue: { revision: 4, variant: "signature" } });
  });
  it("does not substitute those models for unregistered homes", () => {
    expect(resolvePublishedConfiguration("tish")).toBeNull();
    expect(resolvePublishedConfiguration("../kray")).toBeNull();
  });
  it("does not present Signature geometry as a bedroom variant", () => {
    expect(resolvePublishedConfiguration("tengo", "2-bhk")?.status).toBe("unsupported-variant");
    expect(resolvePublishedConfiguration("kray", ["signature", "studio"])?.status).toBe("unsupported-variant");
    for (const slug of ["tengo", "kray"] as const) {
      for (const index of [0, 1]) {
        expect(resolvePublishedConfiguration(slug, exploreVariantId(slug, index)!)?.status).toBe("unsupported-variant");
      }
      expect(resolvePublishedConfiguration(slug, "signature")?.status).toBe("ready");
    }
  });
});
