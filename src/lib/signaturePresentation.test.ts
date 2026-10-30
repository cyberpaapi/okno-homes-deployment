import { describe, expect, it } from "vitest";
import { indicativePrice, planLabel } from "./signaturePresentation";

describe("Signature presentation", () => {
  it("qualifies published and edited prices without duplicating the label", () => {
    expect(indicativePrice("₹18.50 lakh")).toBe("Indicative ₹ 18.50 lakh");
    expect(indicativePrice("₹75 lakh")).toBe("Indicative ₹ 75 lakh");
    expect(indicativePrice("Indicative ₹ 18 lakh")).toBe("Indicative ₹ 18 lakh");
  });
  it("preserves unknown prices instead of inventing an amount", () => {
    expect(indicativePrice("Price on request")).toBe("Price on request");
    expect(indicativePrice("")).toBe("");
  });
  it("uses bedroom labels while leaving custom plan names intact", () => {
    expect(planLabel("2 BHK")).toBe("Two-bedroom");
    expect(planLabel("3 BHK")).toBe("Three-bedroom");
    expect(planLabel("Kray Studio")).toBe("Kray Studio");
  });
});
