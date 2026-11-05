import { fireEvent, render, screen } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import BespokeExperience from "./BespokeExperience";

beforeAll(() => {
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
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
});

afterAll(() => vi.unstubAllGlobals());

describe("BespokeExperience", () => {
  it("presents the calibrated journey and a usable enquiry path", () => {
    render(<BespokeExperience />);

    expect(
      screen.getByRole("heading", { name: "A home authored from place." }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("OKNO bespoke architecture transition")).toBeInTheDocument();
    for (const stage of ["PLACE", "BRIEF", "FORM", "ATMOSPHERE"]) {
      expect(screen.getByRole("heading", { name: stage })).toBeInTheDocument();
    }
    expect(screen.queryByRole("heading", { name: "One place. One home." })).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Lakewood Villa entrance and planted garden/i })).toHaveAttribute("src", expect.stringContaining("/thumbnail-images/"));
    expect(screen.getByRole("button", { name: "Next step: BRIEF" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next step: FORM" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next step: ATMOSPHERE" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next step: The result" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Begin a bespoke enquiry." })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /begin crafting/i })).toHaveAttribute("href", "/enquiry?intent=home&model=bespoke");
    const portal = screen.getByLabelText("OKNO bespoke architecture transition");
    expect(portal.querySelector("mask image")).toHaveAttribute("href", "/assets/projects/brand/okno-modhomes-white.svg");
    expect(portal.querySelector("mask text")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "View photograph 1" }));
    expect(screen.getByRole("dialog", { name: "Lakewood Villa fullscreen photograph" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Next photograph" }));
    expect(screen.getByText("Photograph 2 of 10")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Close fullscreen photograph" }));
  });

  it("removes the previous selector comparison and named concept cards", () => {
    render(<BespokeExperience />);

    expect(screen.queryByText("Two ways to begin.")).not.toBeInTheDocument();
    expect(screen.queryByText("Project N")).not.toBeInTheDocument();
    expect(screen.queryByText("Suite Luma")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Bespoke commission stages")).not.toBeInTheDocument();
    expect(screen.queryByText("Enter the commission")).not.toBeInTheDocument();
  });

  it("moves the horizontal story forward from the Next step control", () => {
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
    render(<BespokeExperience />);

    fireEvent.click(screen.getByRole("button", { name: "Next step: BRIEF" }));
    expect(scrollTo).toHaveBeenCalledWith(expect.objectContaining({ behavior: "smooth" }));
    scrollTo.mockRestore();
  });
});
