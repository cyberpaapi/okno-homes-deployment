import { fireEvent, render, screen } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import HospitalityExperience from "./HospitalityExperience";
import { initialHospitalitySelections } from '@/data/hospitalitySelectedWork';

vi.mock("next/navigation", () => ({ usePathname: () => "/hospitality" }));

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeAll(() => {
  vi.stubGlobal("ResizeObserver", MockResizeObserver);
  vi.stubGlobal("matchMedia", vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })));
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
});

afterAll(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("HospitalityExperience", () => {
  it("speaks directly to multi-residence hospitality buyers", () => {
    render(<HospitalityExperience />);

    expect(screen.getByRole("heading", { name: "Built to welcome. Designed to scale." })).toBeInTheDocument();
    expect(screen.getByText(/coordinated across every residence and shared space/i)).toBeInTheDocument();
    for (const link of screen.getAllByRole("link", { name: /begin a project|hospitality enquiry/i })) {
      expect(link).toHaveAttribute("href", "/enquiry?intent=hospitality");
    }
  });

  it("covers every estate, delivery stage and care pillar from the brief", () => {
    render(<HospitalityExperience />);

    for (const estate of ["Forrest", "Miraya", "Nova Valley", "Layana Farms", "Project Thiru"]) {
      expect(screen.getByRole("button", { name: `View ${estate} photography` })).toBeInTheDocument();
    }
    for (const stage of ["Private consultation", "Site study", "Design curation", "Craftsmanship", "Delivery", "Installation", "Opening"]) {
      expect(screen.getByRole("heading", { name: stage })).toBeInTheDocument();
    }
    expect(screen.getByText("Terrain, utilities and resilience planned.")).toBeInTheDocument();
    expect(screen.getByText("Warranty, handover and long-term care.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Brief to opening." })).toBeInTheDocument();
  });

  it("uses the bookmarked bento and a single hospitality enquiry route without an embedded form", () => {
    render(<HospitalityExperience />);

    expect(screen.getAllByText("5+")).toHaveLength(1);
    expect(screen.getByText("Guest-ready or architectural shell.")).toBeInTheDocument();
    expect(screen.queryByText("Places with a life of their own")).not.toBeInTheDocument();
    expect(screen.queryByText("Projects from five residences")).not.toBeInTheDocument();
    expect(screen.queryByRole("form")).not.toBeInTheDocument();
    expect(screen.queryByText(/private WhatsApp/i)).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Begin a hospitality conversation." })).toBeInTheDocument();
  });

  it("opens portfolio photography in the projects-style viewer", () => {
    render(<HospitalityExperience />);
    fireEvent.click(screen.getByRole("button", { name: "View Forrest photography" }));
    expect(screen.getByRole("dialog", { name: "Forrest photograph" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close photograph" })).toBeInTheDocument();
  });

  it("hides Selected work at zero and fills the gallery at one, two and many selections", () => {
    const empty = render(<HospitalityExperience initialSelections={[]} />);
    expect(screen.queryByRole("region", { name: "Hospitality project photography" })).not.toBeInTheDocument();
    empty.unmount();

    const one = render(<HospitalityExperience initialSelections={initialHospitalitySelections.slice(0, 1)} />);
    expect(screen.getByRole("region", { name: "Hospitality project photography" }).querySelector('[data-count="1"]')).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /^View .* photography$/ })).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "View Forrest photography" }));
    expect(screen.queryByRole("button", { name: "Next project" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Previous project" })).not.toBeInTheDocument();
    one.unmount();

    const two = render(<HospitalityExperience initialSelections={initialHospitalitySelections.slice(0, 2)} />);
    expect(screen.getByRole("region", { name: "Hospitality project photography" }).querySelector('[data-count="2"]')).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /^View .* photography$/ })).toHaveLength(2);
    two.unmount();

    render(<HospitalityExperience initialSelections={initialHospitalitySelections} />);
    expect(screen.getByRole("region", { name: "Hospitality project photography" }).querySelector('[data-count="3"]')).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /^View .* photography$/ })).toHaveLength(5);
  });

  it("removes the rejected video-expansion and parallax opening", () => {
    const { container } = render(<HospitalityExperience />);

    expect(container.querySelector("video")).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Lakewood hospitality buildings/i })).toBeInTheDocument();
    expect(container.querySelectorAll("[data-stage-photo]")).toHaveLength(7);
    expect(screen.getByRole("heading", { name: "Selected work." })).toBeInTheDocument();
  });
});
