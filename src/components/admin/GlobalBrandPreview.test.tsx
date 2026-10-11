import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import GlobalBrandPreview from "./GlobalBrandPreview";

describe("Global Brand placement preview", () => {
  it("updates every role from the pending brand values", () => {
    const { rerender } = render(<GlobalBrandPreview values={{}} />);
    const preview = screen.getByRole("region", { name: "Global Brand placement preview" });
    expect(preview.querySelectorAll("img")).toHaveLength(4);
    rerender(<GlobalBrandPreview values={{
      "brand.logo.light": "/media/new-light.webp",
      "brand.logo.dark": "/media/new-dark.webp",
      "brand.logo.compact": "/media/new-compact.webp",
      "brand.logo.icon": "/media/new-icon.png",
    }} />);
    expect([...preview.querySelectorAll("img")].map(image => image.getAttribute("src"))).toEqual([
      "/media/new-light.webp", "/media/new-dark.webp", "/media/new-compact.webp", "/media/new-icon.png",
    ]);
  });
});
