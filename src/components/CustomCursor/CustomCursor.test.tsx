import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import CustomCursor from "./CustomCursor";

let coarse = false;
let noHover = false;
let reduced = false;

beforeEach(() => {
  coarse = false;
  noHover = false;
  reduced = false;
  vi.stubGlobal("matchMedia", (query: string) => ({
    get matches() {
      if (query.includes("pointer: coarse")) return coarse;
      if (query.includes("hover: none")) return noHover;
      if (query.includes("reduced-motion")) return reduced;
      return false;
    },
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("shared cursor", () => {
  it("mounts one Obsidian-style canvas trail for the entire site", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    render(<CustomCursor />);

    expect(screen.getByTestId("site-cursor-trail")).toHaveAttribute("data-cursor-trail", "obsidian");
    expect(screen.queryByTestId("site-cursor")).not.toBeInTheDocument();
    expect(screen.queryByTestId("landing-cursor")).not.toBeInTheDocument();
  });

  it("keeps the native pointer instead of hiding it behind route-specific attributes", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    render(<CustomCursor />);

    expect(document.documentElement).not.toHaveAttribute("data-okno-cursor");
    expect(document.documentElement).not.toHaveAttribute("data-landing-cursor");
    expect(document.documentElement).not.toHaveAttribute("data-models-cursor");
  });

  it("does not initialise the animated canvas for touch or reduced-motion contexts", () => {
    const getContext = vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    coarse = true;
    noHover = true;
    reduced = true;

    render(<CustomCursor />);

    expect(screen.getByTestId("site-cursor-trail")).toBeInTheDocument();
    expect(getContext).not.toHaveBeenCalled();
  });

  it("keeps the Obsidian trail active in a narrow desktop window with a fine pointer", () => {
    const getContext = vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);

    render(<CustomCursor />);

    expect(getContext).toHaveBeenCalledTimes(1);
  });

  it("does not spend animation frames until the pointer actually moves", () => {
    const requestFrame = vi.fn(() => 1);
    vi.stubGlobal("requestAnimationFrame", requestFrame);
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation((() => ({
      clearRect: vi.fn(),
      setTransform: vi.fn(),
    } as unknown as CanvasRenderingContext2D)) as unknown as typeof HTMLCanvasElement.prototype.getContext);

    render(<CustomCursor />);
    expect(requestFrame).not.toHaveBeenCalled();

    fireEvent.pointerMove(window, { clientX: 120, clientY: 80 });
    expect(requestFrame).toHaveBeenCalledTimes(1);
  });
});
