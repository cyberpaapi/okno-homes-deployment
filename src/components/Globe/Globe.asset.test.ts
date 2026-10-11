import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Projects globe assets", () => {
  it("ships the GeoJSON file requested by the production globe", async () => {
    const file = await readFile(
      resolve(process.cwd(), "public/assets/geo/world.geojson"),
      "utf8",
    );
    const geoJson = JSON.parse(file) as { type?: string; features?: unknown[] };

    expect(geoJson.type).toBe("FeatureCollection");
    expect(geoJson.features?.length).toBeGreaterThan(0);
  });
});
