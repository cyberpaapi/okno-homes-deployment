import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import SustainabilityJourney from "./SustainabilityJourney";

const environment = vi.hoisted(() => ({ compact: true, reduced: false }));
vi.mock("@/lib/useSiteContent", () => ({ useSiteContentMap: () => ({}) }));
vi.mock("@/components/Header/Header", () => ({ default: () => null }));
vi.mock("motion/react", async () => {
  const React = await import("react");
  const element = (tag: string) => function Element({ children, ...props }: Record<string, unknown> & { children?: ReactNode }) {
    const native = Object.fromEntries(Object.entries(props).filter(([key]) => !["initial", "animate", "exit", "transition", "variants"].includes(key)));
    return React.createElement(tag, native, children);
  };
  return {
    useReducedMotion: () => environment.reduced,
    AnimatePresence: ({ children }: { children: ReactNode }) => children,
    motion: { div: element("div"), article: element("article"), h2: element("h2"), p: element("p") },
  };
});

let callbacks: Map<number, FrameRequestCallback>;
let identifier = 0;

beforeEach(() => {
  environment.compact = true;
  environment.reduced = false;
  callbacks = new Map();
  vi.stubGlobal("matchMedia", vi.fn(() => ({ get matches() { return environment.compact; } })));
  vi.stubGlobal("requestAnimationFrame", vi.fn((callback: FrameRequestCallback) => {
    callbacks.set(++identifier, callback);
    return identifier;
  }));
  vi.stubGlobal("cancelAnimationFrame", vi.fn((id: number) => callbacks.delete(id)));
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => undefined);
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function advanceFrames() {
  let now = performance.now();
  act(() => {
    for (let i = 0; i < 100 && callbacks.size; i++) {
      now += 50;
      const pending = [...callbacks.values()];
      callbacks.clear();
      pending.forEach(callback => callback(now));
    }
  });
}

function setupJourney() {
  const view = render(<SustainabilityJourney />);
  const track = view.getByRole("region", { name: "OKNO sustainability journey" });
  const viewport = track.firstElementChild as HTMLElement;
  const movie = view.container.querySelector('video[src="/sustainability/scroll-journey.mp4"]') as HTMLVideoElement;
  Object.defineProperty(track, "offsetHeight", { configurable: true, value: 4800 });
  Object.defineProperty(viewport, "offsetHeight", { configurable: true, value: 800 });
  Object.defineProperty(movie, "duration", { configurable: true, value: 16 });
  let top = 0;
  vi.spyOn(track, "getBoundingClientRect").mockImplementation(() => ({ top }) as DOMRect);
  const scrollTo = (progress: number) => {
    top = -4000 * progress;
    act(() => { window.dispatchEvent(new Event("scroll")); });
    advanceFrames();
  };
  return { ...view, movie, viewport, scrollTo };
}

describe("Sustainability scroll movie", () => {
  it("scrubs forward and backward on compact screens", () => {
    const { movie, viewport, scrollTo } = setupJourney();
    scrollTo(0.6);
    expect(movie.currentTime).toBeGreaterThan(10);
    expect(Number(viewport.style.getPropertyValue("--journey-opacity"))).toBe(1);
    const laterTime = movie.currentTime;
    scrollTo(0.3);
    expect(movie.currentTime).toBeLessThan(laterTime);
    expect(movie.currentTime).toBeGreaterThan(0);
  });

  it("keeps the endpoint reachable after resizing from desktop to compact", () => {
    environment.compact = false;
    const { movie, scrollTo } = setupJourney();
    environment.compact = true;
    act(() => { window.dispatchEvent(new Event("resize")); });
    scrollTo(0.785);
    expect(movie.currentTime).toBeCloseTo(16 - 1 / 24, 1);
  });

  it("leaves the scroll movie still for reduced motion and releases pending work on unmount", () => {
    environment.reduced = true;
    const { movie, viewport, scrollTo, unmount } = setupJourney();
    scrollTo(0.6);
    expect(movie.currentTime).toBe(0);
    expect(viewport.style.getPropertyValue("--journey-opacity")).toBe("0");
    act(() => { window.dispatchEvent(new Event("scroll")); });
    expect(callbacks.size).toBeGreaterThan(0);
    unmount();
    expect(callbacks.size).toBe(0);
  });
});
