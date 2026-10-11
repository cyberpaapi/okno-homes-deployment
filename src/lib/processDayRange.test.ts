import { describe, expect, it } from "vitest";
import { parseProcessDayRange, resolveProcessDayRange } from "./processDayRange";

describe("Process day range", () => {
  it("keeps an edited word label out of the large numerals", () => {
    expect(parseProcessDayRange("Weeks 1-3")).toEqual({ label: "Weeks", range: "01–03", display: "Weeks 01–03" });
    expect(parseProcessDayRange("01–10")).toEqual({ label: "Days", range: "01–10", display: "Days 01–10" });
    expect(parseProcessDayRange("Days 11 – 25")?.range).toBe("11–25");
  });

  it("rejects malformed or out-of-sequence ranges and safely reads older saved values", () => {
    for (const value of ["Days", "Days 01–1022321222", "Days 40–20", "Days 00–10", "Days 01–91", "A very long label 01–10"]) {
      expect(parseProcessDayRange(value)).toBeNull();
    }
    expect(resolveProcessDayRange("Days 01–1022321222", "Days 01–10").display).toBe("Days 01–10");
  });
});
