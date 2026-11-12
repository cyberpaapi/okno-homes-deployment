import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { adminPages } from "@/data/adminContent";
import { customerCopySections } from "@/data/configurator/studio/customerCopy";
import { makeDraft } from "@/data/configurator/studio/catalogue";
import CustomerStudio from "./CustomerStudio";
import CustomerUnavailable from "./CustomerUnavailable";

const mockContent = vi.hoisted(() => ({ values: {} as Record<string, string> }));
vi.mock("@/lib/useSiteContent", () => ({ useSiteContentMap: () => mockContent.values }));
vi.mock("./StudioViewer", () => ({ default: () => <div data-testid="model-viewer" /> }));

beforeEach(() => { mockContent.values = {}; });

describe("customer configurator copy", () => {
  it("places every customer copy field in screen order in Models → Configurators", () => {
    const page = adminPages.find(item => item.id === "models")?.children?.find(item => item.id === "configurators");
    expect(page?.sections.slice(0, -1).map(section => section.id)).toEqual(customerCopySections.map(section => section.id));
    expect(page?.sections.slice(0, -1).flatMap(section => section.fields.map(field => field.id))).toEqual(
      customerCopySections.flatMap(section => section.fields.map(([id]) => `configurator.${id}`)),
    );
    expect(page?.sections.at(-1)?.id).toBe("product-data");
  });

  it("updates the Tengo customer journey and review button from published copy", async () => {
    const catalogue = makeDraft("tengo");
    catalogue.variant = "2-bhk";
    catalogue.groups[0].enabled = true;
    mockContent.values = {
      "brand.logo.light": "/test/brand-wordmark.png",
      "brand.logo.alt": "New OKNO identity",
      "configurator.finish.heading": "Choose the surfaces.",
      "configurator.action.review": "See your palette",
      "configurator.selection.heading": "Your choices, together.",
    };
    const { rerender } = render(<CustomerStudio catalogue={catalogue} />);
    const brand = screen.getByRole("link", { name: "New OKNO identity home" });
    expect(brand).toHaveAttribute("href", "/");
    expect(brand.querySelector("img")?.getAttribute("src")).toContain("brand-wordmark.png");
    expect(screen.getByRole("heading", { name: "Choose the surfaces." })).toBeInTheDocument();
    mockContent.values = { ...mockContent.values, "configurator.finish.heading": "Choose each finish." };
    rerender(<CustomerStudio catalogue={catalogue} />);
    expect(screen.getByRole("heading", { name: "Choose each finish." })).toBeInTheDocument();
    const review = screen.getAllByRole("button", { name: /See your palette/ })[0];
    await waitFor(() => expect(review).toBeEnabled());
    fireEvent.click(review);
    expect(screen.getByRole("heading", { name: "Your choices, together." })).toBeInTheDocument();
  });

  it("updates the Kray unavailable layout and shared material library with optional layout", () => {
    mockContent.values = {
      "brand.logo.light": "/test/brand-wordmark.png",
      "brand.logo.alt": "New OKNO identity",
      "configurator.unavailable.variant": "Explore the {variant} layout now.",
      "configurator.unavailable.configure": "Open {variant}",
      "configurator.library.heading": "Our surface library.",
    };
    render(<CustomerUnavailable slug="kray" availableVariant="1-bhk" requestedVariant="studio" />);
    const brand = screen.getByRole("link", { name: "New OKNO identity home" });
    expect(brand).toHaveAttribute("href", "/");
    expect(brand.querySelector("img")?.getAttribute("src")).toContain("brand-wordmark.png");
    expect(screen.getByText("Explore the 1 BHK layout now.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open 1 BHK ↗" })).toHaveAttribute("href", "/models/signature/kray/configure?variant=1-bhk");
    expect(screen.getByRole("link", { name: "← Back to model" })).toHaveAttribute("href", "/models/signature?model=kray&details=1&variant=studio");
    expect(screen.getByRole("heading", { name: "Our surface library." })).toBeInTheDocument();
  });
});
