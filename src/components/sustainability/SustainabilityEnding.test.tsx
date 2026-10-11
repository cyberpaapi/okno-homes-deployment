import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SustainabilityEnding from "./SustainabilityEnding";

const published = vi.hoisted(() => ({ values: {} as Record<string, string> }));
vi.mock("@/lib/useSiteContent", () => ({ useSiteContentMap: () => published.values }));

beforeEach(() => { published.values = {}; });

describe("Sustainability ending", () => {
  it("keeps the original enquiry destination by default", () => {
    render(<SustainabilityEnding />);
    expect(screen.getByRole("link", { name: /Begin a conversation/ })).toHaveAttribute("href", "/enquiry");
  });

  it("uses a published same-site destination and rejects an unsafe override", () => {
    published.values = { "sustainability.ending.action-href": "/enquiry?intent=sustainability" };
    const view = render(<SustainabilityEnding />);
    expect(screen.getByRole("link", { name: /Begin a conversation/ })).toHaveAttribute("href", "/enquiry?intent=sustainability");
    published.values = { "sustainability.ending.action-href": "https://elsewhere.example" };
    view.rerender(<SustainabilityEnding />);
    expect(screen.getByRole("link", { name: /Begin a conversation/ })).toHaveAttribute("href", "/enquiry");
  });
});
