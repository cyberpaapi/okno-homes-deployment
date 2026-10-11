import { describe, expect, it } from "vitest";
import { isSiteNavigationActive, siteNavigationItems } from "./siteNavigation";

describe("siteNavigationItems", () => {
  it("keeps every primary destination internal and in the canonical order", () => {
    expect(siteNavigationItems.map((item) => item.href)).toEqual([
      "/projects",
      "/models",
      "/hospitality",
      "/process",
      "/sustainability",
      "/journal",
      "/about",
    ]);
    expect(siteNavigationItems.every((item) => item.href.startsWith("/"))).toBe(true);
  });

  it("keeps parent destinations active on nested routes", () => {
    expect(isSiteNavigationActive("/models/bespoke", "/models")).toBe(true);
    expect(isSiteNavigationActive("/sustainability", "/models")).toBe(false);
  });
});
