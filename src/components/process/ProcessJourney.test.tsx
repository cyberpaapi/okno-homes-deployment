import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { PROCESS_DAY_RANGES } from "@/lib/processChapters";
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
      "The structure rises.",
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
    for (const [id, days] of Object.entries(PROCESS_DAY_RANGES)) {
      expect(within(schedule).getAllByText(days)).toHaveLength(1);
      const label = id === 'design-lock' ? 'Design lock' : id[0].toUpperCase() + id.slice(1);
      expect(within(schedule).getByRole('listitem', { name: `${days} · ${label}` })).toBeInTheDocument();
    }
    expect(screen.getByRole("heading", { name: "From brief to handover." })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Made off-site" })).toBeInTheDocument();
    for (const range of ["01–10", "11–25", "26–60", "61–72", "73–90"]) {
      expect(within(screen.getByRole("list", { name: "Build day timeline" })).getByText(range)).toBeInTheDocument();
    }
    expect(screen.queryByText(/0[1-5]\s*\/\s*05/)).not.toBeInTheDocument();
    expect(within(screen.getByRole("list", { name: "Build day timeline" })).queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Visualized completed gabled modular home in its coastal landscape" })).toBeInTheDocument();
    expect(screen.queryByText(/packing and transport/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Before we begin." })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Let’s talk about your place." })).not.toBeInTheDocument();

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
