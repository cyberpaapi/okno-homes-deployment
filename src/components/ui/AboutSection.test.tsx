import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AboutSection from "./about-section";

vi.mock("@/components/projects/21st/SilkBackground", () => ({ SilkBackground: () => <canvas /> }));
vi.mock("@/lib/useSiteContent", () => ({
  useSiteContentMap: () => ({ "about.assurances.energy-icon": "shield" }),
}));

describe("About assurance icon choice", () => {
  it("renders the published choice without changing the other commitment icons", () => {
    render(<AboutSection />);
    const icons = document.querySelectorAll("[data-about-icon]");
    expect(icons).toHaveLength(5);
    expect(icons[0]).toHaveClass("lucide-badge-check");
    expect(icons[3]).toHaveClass("lucide-shield-check");
  });
});
