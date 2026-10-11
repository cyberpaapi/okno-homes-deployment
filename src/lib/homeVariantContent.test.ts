import { describe, expect, it } from "vitest";
import { homeVariantAccessibleTitle } from "./homeVariantContent";

describe("home variant accessible title", () => {
  it("uses the title edited in the opening collection", () => {
    expect(homeVariantAccessibleTitle({ id: "new-opening", fields: { accessibleTitle: "A new OKNO opening", heading: "Old title" } }, "Fallback"))
      .toBe("A new OKNO opening");
  });

  it("preserves a legacy heading when that is the only saved title", () => {
    expect(homeVariantAccessibleTitle({ id: "older-opening", fields: { heading: "Older title" } }, "Fallback"))
      .toBe("Older title");
  });

  it("uses the page fallback without a collection title", () => {
    expect(homeVariantAccessibleTitle({ id: "draft", fields: { accessibleTitle: "  " } }, "Fallback"))
      .toBe("Fallback");
  });
});
