import { describe, it, expect } from "vitest";
import { makeDraft } from "@/data/configurator/studio/catalogue";
import { restoreChoices, selectionLink, sharedChoices } from "./selection";
describe("customer selection recovery", () => {
  const draft = makeDraft("tengo"); draft.groups[0].enabled = true;
  it("restores only permitted selections for the exact catalogue revision and source", () => {
    expect(restoreChoices(draft, { revision: 0, sourceHash: draft.sourceHash, choices: { "external-wall": "golden-oak", "external-roof": "ebony-timber" } })).toEqual({ "external-wall": "golden-oak" });
  });
  it("resets stale, forged and removed choices to the curated defaults", () => {
    const defaults = restoreChoices(draft, null);
    expect(restoreChoices(draft, { revision: 2, sourceHash: draft.sourceHash, choices: { "external-wall": "golden-oak" } })).toEqual(defaults);
    expect(restoreChoices(draft, { revision: 0, sourceHash: "other", choices: { "external-wall": "golden-oak" } })).toEqual(defaults);
    expect(restoreChoices(draft, { revision: 0, sourceHash: draft.sourceHash, choices: { "external-wall": "not-offered" } })).toEqual(defaults);
    expect(restoreChoices(draft, "broken")).toEqual(defaults);
  });
});

describe("published customer selection links", () => {
  const catalogue = makeDraft("tengo");
  catalogue.variant = "2-bhk";
  catalogue.revision = 3;
  catalogue.groups[0].enabled = true;
  const choices = { "external-wall": "golden-oak" };
  it("round-trips offered choices and pins the model, variant and revision", () => {
    const url = new URL(selectionLink(catalogue, choices, "https://example.com"));
    expect(url.pathname).toBe("/models/signature/tengo/configure");
    expect(url.searchParams.get("variant")).toBe("2-bhk");
    expect(sharedChoices(catalogue, url.hash)).toEqual(choices);
    expect(url.hash).not.toContain("internal-wall");
  });
  it("rejects stale, missing, duplicate and unoffered values instead of partially applying a palette", () => {
    expect(sharedChoices(catalogue, "#revision=2&external-wall=golden-oak")).toBeNull();
    expect(sharedChoices(catalogue, "#revision=3")).toBeNull();
    expect(sharedChoices(catalogue, "#revision=3&external-wall=private-material")).toBeNull();
    expect(sharedChoices(catalogue, "#revision=3&external-wall=golden-oak&external-wall=ebony-timber")).toBeNull();
    expect(sharedChoices(catalogue, "#" + "x".repeat(2001))).toBeNull();
  });
  it("never serializes unoffered choices", () => {
    const url = new URL(selectionLink(catalogue, { "external-wall": "forged" }, "https://example.com"));
    expect(sharedChoices(catalogue, url.hash)).toEqual(restoreChoices(catalogue, null));
  });
});
