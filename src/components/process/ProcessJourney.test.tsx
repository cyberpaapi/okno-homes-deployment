import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import ProcessJourney from "./ProcessJourney";

beforeAll(() => {
  vi.stubGlobal("matchMedia", vi.fn().mockImplementation((query: string) => ({
    matches: query.includes("prefers-reduced-motion"),
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })));
});

afterAll(() => vi.unstubAllGlobals());

describe("ProcessJourney", () => {
  it("covers the supplied process from site understanding through handover", () => {
    render(<ProcessJourney />);

    expect(screen.getByRole("heading", { name: "Built in 90 days." })).toBeInTheDocument();
    for (const heading of [
      "The brief meets the land.",
      "The plan takes shape.",
      "Every decision is resolved.",
      "The structure takes shape.",
      "The home closes around the view.",
      "Finished where it belongs.",
    ]) {
      expect(screen.getByRole("heading", { name: heading })).toBeInTheDocument();
    }

    expect(screen.getByText(/site, programme and chosen model/i)).toBeInTheDocument();
    expect(screen.getByText(/floor and wall panels are aligned/i)).toBeInTheDocument();
    expect(screen.getByText(/before the final handover/i)).toBeInTheDocument();
    const schedule = screen.getByRole("complementary", { name: "90-day home build schedule" });
    expect(within(schedule).getByText("Build sequence")).toBeInTheDocument();
    expect(within(schedule).getByText("Land to handover")).toBeInTheDocument();
    for (const label of ["Land", "Architecture", "Design lock", "Assembly", "Enclosure", "Handover"]) {
      expect(within(schedule).getByText(label)).toBeInTheDocument();
    }
    expect(within(schedule).getByText("Days 01–10")).toBeInTheDocument();
    expect(within(schedule).getAllByText("Days 11–25")).toHaveLength(2);
    expect(within(schedule).getAllByText("Days 73–90")).toHaveLength(3);
    expect(screen.getByRole("heading", { name: "From brief to handover." })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Factory manufacturing" })).toBeInTheDocument();
    for (const range of ["01–10", "11–25", "26–60", "61–72", "73–90"]) {
      expect(screen.getByText(range)).toBeInTheDocument();
    }
    expect(screen.getByRole("img", { name: "Visualized completed gabled modular home in its coastal landscape" })).toBeInTheDocument();
    expect(screen.queryByText(/packing and transport/i)).not.toBeInTheDocument();

  });

  it("keeps desktop destinations and an accessible compact menu", () => {
    render(<ProcessJourney />);

    const trigger = screen.getByRole("button", { name: "Open navigation" });
    fireEvent.click(trigger);

    const dialog = screen.getByRole("dialog", { name: "Site navigation" });
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(within(dialog).getByRole("link", { name: "Process" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(within(dialog).getByRole("link", { name: "Enquire" })).toHaveAttribute(
      "href",
      "/enquiry",
    );
  });
});
