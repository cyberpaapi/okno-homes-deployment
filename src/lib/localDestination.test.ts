import { describe, expect, it } from "vitest";
import { localDestination } from "./localDestination";

describe("local page action destinations", () => {
  it("accepts site paths, queries and in-page anchors", () => {
    expect(localDestination("/enquiry?intent=home", "/")).toBe("/enquiry?intent=home");
    expect(localDestination("#collection", "/projects")).toBe("#collection");
  });

  it("falls back for external, script or malformed destinations", () => {
    for (const value of ["https://example.com", "javascript:alert(1)", "//other.test", "/two words", "\\other"]) {
      expect(localDestination(value, "/safe")).toBe("/safe");
    }
  });
});
