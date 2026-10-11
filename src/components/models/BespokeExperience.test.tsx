import { fireEvent, render, screen } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import BespokeExperience from "./BespokeExperience";

beforeAll(() => {
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
  it("presents the commission journey and a usable enquiry path", () => {
    render(<BespokeExperience />);

    expect(
      screen.getByRole("heading", { name: "A home authored from place." }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("OKNO bespoke architecture transition")).toBeInTheDocument();
    for (const stage of ["PLACE", "BRIEF", "FORM", "ATMOSPHERE"]) {
      expect(screen.getByRole("heading", { name: stage })).toBeInTheDocument();
    }
    expect(screen.queryByRole("heading", { name: "One place. One home." })).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: /completed okno residence following a curved garden path/i })).toHaveAttribute("src", expect.stringContaining("forrest-01.webp"));
    expect(screen.getByRole("button", { name: "Next step: BRIEF" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next step: FORM" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next step: ATMOSPHERE" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next step: The result" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Begin a bespoke enquiry." })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /begin a conversation/i })).not.toBeInTheDocument();
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
