import { describe, expect, it } from "vitest";
import { MATERIAL_APPLICATION_IDS } from "@/data/configurator";
import { configurationHref } from "@/lib/configuratorHref";
import { gazePrototype, oknoModels } from "@/data/models";
import { optionsForApplication, registerOptions } from "./registerOptions";

// Independent transcription of the supplied PDF application matrix.
const expected = {
  "external-roof": [1, 2, 3, 4, 5, 6, 7, 8, 9, 11],
  "external-wall": [1, 2, 3, 9, 10, 12, 13, 14, 15, 16],
  flooring: [18, 19, 20, 21, 22, 23, 24, 25],
  "internal-ceiling": [1, 2, 3, 9, 10, 11, 12, 13, 15, 16, 17, 20, 21, 22, 23, 24, 26],
  "internal-wall": [9, 10, 11, 12, 13, 15, 16, 17, 22, 23, 24, 25],
};

describe("supplied configurator register and routes", () => {
  it.each(MATERIAL_APPLICATION_IDS)("matches the PDF matrix for %s", id => {
    expect(optionsForApplication(id).map(option => Number(option.registerNumber))).toEqual(expected[id]);
  });
  it("represents all 26 finishes with original swatches and no invented prices", () => {
    expect(registerOptions).toHaveLength(26);
    for (const option of registerOptions) {
      expect(option.image).toMatch(/^\/configurator\/material-details\/v1\//);
      expect(option.preview.texture).toBe(option.image);
      expect(option).not.toHaveProperty("price");
    }
  });
  it("maps every current model and optional plan to the configure route", () => {
    for (const model of [...oknoModels, gazePrototype]) {
      expect(configurationHref(model.slug)).toBe(`/models/signature/${model.slug}/configure`);
      expect(configurationHref(model.slug, "2-bhk")).toBe(`/models/signature/${model.slug}/configure?variant=2-bhk`);
    }
    expect(configurationHref("new-home", "custom & plan")).toBe("/models/signature/new-home/configure?variant=custom%20%26%20plan");
  });
});
