import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SustainabilityEnding from "./SustainabilityEnding";

const published = vi.hoisted(() => ({ values: {} as Record<string, string> }));
vi.mock("@/lib/useSiteContent", () => ({ useSiteContentMap: () => published.values }));

beforeEach(() => { published.values = {}; });

describe("Sustainability ending", () => {
  it("keeps the original enquiry destination by default", () => {
    render(<SustainabilityEnding />);
    const link = screen.getByRole("link", { name: "Enquire" });
    expect(link).toHaveAttribute("href", "/enquiry");
    expect(link).toHaveAttribute("data-landing-magnetic");
    expect(link.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });

  it("uses a published same-site destination and rejects an unsafe override", () => {
    published.values = { "sustainability.ending.action-href": "/enquiry?intent=sustainability" };
    const view = render(<SustainabilityEnding />);
    expect(screen.getByRole("link", { name: "Enquire" })).toHaveAttribute("href", "/enquiry?intent=sustainability");
    published.values = { "sustainability.ending.action-href": "https://elsewhere.example" };
    view.rerender(<SustainabilityEnding />);
    expect(screen.getByRole("link", { name: "Enquire" })).toHaveAttribute("href", "/enquiry");
  });

  it("retains the published action label", () => {
    published.values = { "sustainability.ending.action": "Enquire about Reflections" };
    render(<SustainabilityEnding />);
    expect(screen.getByRole("link", { name: "Enquire about Reflections" })).toHaveAttribute("href", "/enquiry");
  });
});
