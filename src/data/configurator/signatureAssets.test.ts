import { describe, it, expect } from "vitest";
import { signatureAsset } from "./signatureAssets";
import manifest from "./signatureAssetManifest.json";

describe("supplied house identity", () => {
  it("never substitutes one model for a missing house", () => {
    for (const slug of ["gaze", "trib", "octapod", "suite", "constructor", "__proto__"]) expect(signatureAsset(slug)).toBeUndefined();
    expect(signatureAsset("tish")?.identity).toContain("2 BHK");
  });
  it("uses versioned bounded assets with one unit convention", () => {
    for (const [slug, entry] of Object.entries(manifest)) {
      expect(signatureAsset(slug)?.url).toContain(`${slug}-${entry.sha256.slice(0, 12)}.glb`);
      expect(entry.bytes).toBeLessThan(16 * 1024 * 1024);
      expect(entry.metersPerUnit).toBe(1);
    }
  });
});
