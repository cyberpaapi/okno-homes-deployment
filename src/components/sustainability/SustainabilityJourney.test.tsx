import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import SustainabilityJourney from "./SustainabilityJourney";
import { mobileJourneyTime, mobileMedia } from "./mobileMedia";
import { renderToString } from "react-dom/server";

const environment = vi.hoisted(() => ({ width: 390, reduced: false, present: true }));
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

vi.mock("./MobileJourneyFilm", async () => {
  const React = await import("react");
  return { default: function Film({ ref, className, onPresent }: { ref: React.Ref<import("./MobileJourneyFilm").MobileJourneyHandle>; className: string; onPresent(time: number): void }) {
    const node = React.useRef<HTMLCanvasElement>(null);
    React.useImperativeHandle(ref, () => ({
      setTime(time) { if (node.current) node.current.dataset.requestedTime = String(time); if (environment.present) onPresent(time); },
      setActive(active) { if (node.current) node.current.dataset.active = String(active); },
    }));
    return <canvas ref={node} className={className} data-mobile-journey-film />;
  } };
});

function movieTime(movie: HTMLElement) {
  return movie instanceof HTMLMediaElement ? movie.currentTime : Number(movie.dataset.requestedTime || 0);
}

let callbacks: Map<number, FrameRequestCallback>;
let identifier = 0;
let mediaListeners: Set<() => void>;
let visibilityCallback: ((entries: { isIntersecting: boolean }[]) => void) | undefined;
let pendingSeeks: Set<HTMLMediaElement>;
let seeking: WeakMap<HTMLMediaElement, boolean>;
let automaticallyCompleteSeeks: boolean;
let frameTime: number;

beforeEach(() => {
  environment.width = 390;
  environment.reduced = false;
  environment.present = true;
  callbacks = new Map();
  mediaListeners = new Set();
  pendingSeeks = new Set();
  seeking = new WeakMap();
  automaticallyCompleteSeeks = true;
  frameTime = performance.now();
  vi.spyOn(performance, "now").mockImplementation(() => frameTime);
  vi.stubGlobal("matchMedia", vi.fn((query: string) => ({
    get matches() {
      const maximum = query.match(/max-width: (\d+)px/);
      return maximum ? environment.width <= Number(maximum[1]) : false;
    },
    addEventListener: (_type: string, listener: () => void) => mediaListeners.add(listener),
    removeEventListener: (_type: string, listener: () => void) => mediaListeners.delete(listener),
  })));
  vi.stubGlobal("IntersectionObserver", class {
    constructor(callback: typeof visibilityCallback) { visibilityCallback = callback; }
    observe() {}
    disconnect() { visibilityCallback = undefined; }
  });
  vi.stubGlobal("requestAnimationFrame", vi.fn((callback: FrameRequestCallback) => {
    callbacks.set(++identifier, callback);
    return identifier;
  }));
  vi.stubGlobal("cancelAnimationFrame", vi.fn((id: number) => callbacks.delete(id)));
  const paused = new WeakMap<HTMLMediaElement, boolean>();
  vi.spyOn(HTMLMediaElement.prototype, "paused", "get").mockImplementation(function (this: HTMLMediaElement) { return paused.get(this) ?? true; });
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(function (this: HTMLMediaElement) { paused.set(this, true); });
  vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => {});
  vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function (this: HTMLMediaElement) { paused.set(this, false); return Promise.resolve(); });
  vi.spyOn(HTMLMediaElement.prototype, "duration", "get").mockImplementation(function (this: HTMLMediaElement) { return this.getAttribute("src") === mobileMedia.journey ? 8.9 : 16; });
  vi.spyOn(HTMLMediaElement.prototype, "readyState", "get").mockReturnValue(2);
  const times = new WeakMap<HTMLMediaElement, number>();
  vi.spyOn(HTMLMediaElement.prototype, "currentTime", "get").mockImplementation(function (this: HTMLMediaElement) { return times.get(this) ?? 0; });
  vi.spyOn(HTMLMediaElement.prototype, "currentTime", "set").mockImplementation(function (this: HTMLMediaElement, value: number) {
    times.set(this, value);
    seeking.set(this, true);
    pendingSeeks.add(this);
  });
  vi.spyOn(HTMLMediaElement.prototype, "seeking", "get").mockImplementation(function (this: HTMLMediaElement) { return seeking.get(this) ?? false; });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function completeSeek(movie: HTMLMediaElement) {
  pendingSeeks.delete(movie);
  seeking.set(movie, false);
  movie.dispatchEvent(new Event("seeked"));
}

function advanceFrames(limit = 100) {
  act(() => {
    for (let i = 0; i < limit && (callbacks.size || (automaticallyCompleteSeeks && pendingSeeks.size)); i++) {
      frameTime += 50;
      const pending = [...callbacks.values()];
      callbacks.clear();
      pending.forEach(callback => callback(frameTime));
      if (automaticallyCompleteSeeks) [...pendingSeeks].forEach(completeSeek);
    }
  });
}

function setupJourney() {
  const view = render(<SustainabilityJourney />);
  const track = view.getByRole("region", { name: "OKNO sustainability journey" });
  const viewport = track.firstElementChild as HTMLElement;
  const movie = (view.container.querySelector("[data-mobile-journey-film]") ?? view.container.querySelectorAll("video")[1]) as HTMLVideoElement;
  Object.defineProperty(track, "offsetHeight", { configurable: true, value: 4800 });
  Object.defineProperty(viewport, "offsetHeight", { configurable: true, value: 800 });
  let top = 0;
  vi.spyOn(track, "getBoundingClientRect").mockImplementation(() => ({ top }) as DOMRect);
  const scrollTo = (progress: number, frames = 100) => {
    top = -4000 * progress;
    act(() => { window.dispatchEvent(new Event("scroll")); });
    advanceFrames(frames);
  };
  return { ...view, movie, viewport, scrollTo };
}

function resizeTo(width: number) {
  act(() => {
    environment.width = width;
    mediaListeners.forEach(listener => listener());
    window.dispatchEvent(new Event("resize"));
  });
  advanceFrames();
}

async function settlePlayback() {
  await act(async () => { await Promise.resolve(); await Promise.resolve(); });
  advanceFrames();
}

describe("Sustainability scroll movie", () => {
  it("renders a responsive portrait poster without binding desktop movies before hydration", () => {
    const markup = renderToString(<SustainabilityJourney />);
    expect(markup).toContain('media="(max-width: 700px)"');
    expect(markup).toContain(mobileMedia.heroPoster);
    expect(markup).not.toContain('/sustainability/hero-idle.mp4');
    expect(markup).not.toContain('/sustainability/scroll-journey.mp4');
    expect(markup).not.toContain('/sustainability/fog-loop.mp4');
    expect(markup).not.toContain('<link rel="preload"');
  });

  it("selects all three portrait movies and individual matching posters on phones", () => {
    const { container } = setupJourney();
    const videos = [...container.querySelectorAll("video")];
    expect(videos.map(video => video.getAttribute("src"))).toEqual([mobileMedia.idle, mobileMedia.fog]);
    expect(container.querySelector("[data-mobile-journey-film]")).not.toBeNull();
    expect(videos.map(video => video.getAttribute("poster"))).toEqual([mobileMedia.heroPoster, mobileMedia.fogPoster]);
    expect(videos.every(video => !video.autoplay)).toBe(true);
  });

  it("retries the active mobile idle when media arrives after an early play rejection", async () => {
    vi.mocked(HTMLMediaElement.prototype.play).mockRejectedValueOnce(new Error("source not ready"));
    const { container } = setupJourney();
    const idle = container.querySelectorAll("video")[0];
    await act(async () => { await Promise.resolve(); });
    expect(idle.paused).toBe(true);
    act(() => { idle.dispatchEvent(new Event("loadeddata")); });
    advanceFrames();
    expect(idle.paused).toBe(false);
  });

  it("keeps original sources and 24fps sampling above the phone breakpoint", () => {
    environment.width = 701;
    const { container, movie, scrollTo } = setupJourney();
    expect([...container.querySelectorAll("video")].map(video => video.getAttribute("src"))).toEqual([
      "/sustainability/hero-idle.mp4", "/sustainability/scroll-journey.mp4", "/sustainability/fog-loop.mp4",
    ]);
    scrollTo(0.785);
    expect(movieTime(movie)).toBeCloseTo(16 - 1 / 24, 6);
  });

  it("replaces video nodes and releases stale seek work when resizing across 700/701", () => {
    const { container, movie, scrollTo, unmount } = setupJourney();
    scrollTo(0.6);
    resizeTo(701);
    const desktop = container.querySelectorAll("video")[1];
    expect(desktop).not.toBe(movie);
    expect(desktop.getAttribute("src")).toBe("/sustainability/scroll-journey.mp4");
    resizeTo(700);
    const phone = container.querySelector("[data-mobile-journey-film]") as HTMLCanvasElement;
    expect(phone).not.toBe(desktop);
    expect(movieTime(phone)).toBeGreaterThan(6);
    expect(phone.tagName).toBe("CANVAS");
    unmount();
    expect(callbacks.size).toBe(0);
    expect(mediaListeners.size).toBe(0);
  });

  it("samples inside native mobile frames and clamps both endpoints safely", () => {
    expect(Math.floor(mobileJourneyTime(-1, 8.9) * 30)).toBe(0);
    expect(Math.floor(mobileJourneyTime(0.5, 8.9) * 30)).toBe(133);
    expect(Math.floor(mobileJourneyTime(1, 8.9) * 30)).toBe(266);
    expect(mobileJourneyTime(2, 8.9)).toBeLessThan(8.9);
  });

  it("holds the journey until its final decoded frame is available before showing moving fog", async () => {
    const { container, viewport, scrollTo } = setupJourney();
    environment.present = false;
    scrollTo(0.9);
    const fog = container.querySelectorAll("video")[1];
    expect(viewport.style.getPropertyValue("--fog-opacity")).toBe("0.0000");
    expect(viewport.style.getPropertyValue("--journey-opacity")).toBe("1.0000");
    expect(fog.paused).toBe(true);
    environment.present = true;
    scrollTo(0.9);
    await settlePlayback();
    expect(viewport.style.getPropertyValue("--fog-opacity")).toBe("1.0000");
    expect(fog.paused).toBe(false);
    scrollTo(0.6);
    expect(fog.paused).toBe(true);
    expect(fog.currentTime).toBe(0);
  });

  it("pauses mobile loops when hidden or offscreen and resumes only the current phase", async () => {
    const { container, scrollTo } = setupJourney();
    const [idle, fog] = [...container.querySelectorAll("video")];
    expect(idle.paused).toBe(false);
    act(() => { visibilityCallback?.([{ isIntersecting: false }]); });
    advanceFrames();
    expect(idle.paused).toBe(true);
    act(() => { visibilityCallback?.([{ isIntersecting: true }]); });
    advanceFrames();
    expect(idle.paused).toBe(false);
    scrollTo(0.9);
    await settlePlayback();
    expect(fog.paused).toBe(false);
    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    act(() => { document.dispatchEvent(new Event("visibilitychange")); });
    advanceFrames();
    expect(fog.paused).toBe(true);
    Object.defineProperty(document, "hidden", { configurable: true, value: false });
    act(() => { document.dispatchEvent(new Event("visibilitychange")); });
    advanceFrames();
    await settlePlayback();
    expect(fog.paused).toBe(false);
  });

  it("prewarms phone fog once after the middle chapters and leaves desktop loading unchanged", () => {
    const { container, scrollTo } = setupJourney();
    const fog = container.querySelectorAll("video")[1];
    expect(fog.preload).toBe("none");
    expect(HTMLMediaElement.prototype.load).not.toHaveBeenCalled();
    scrollTo(0.34);
    expect(HTMLMediaElement.prototype.load).not.toHaveBeenCalled();
    scrollTo(0.35);
    expect(fog.preload).toBe("auto");
    expect(HTMLMediaElement.prototype.load).toHaveBeenCalledOnce();
    scrollTo(0.6); scrollTo(0.2); scrollTo(0.6);
    expect(HTMLMediaElement.prototype.load).toHaveBeenCalledOnce();
    resizeTo(701);
    expect(container.querySelectorAll("video")[2].preload).toBe("none");
    expect(HTMLMediaElement.prototype.load).toHaveBeenCalledOnce();
  });

  it("completes the phone endpoint tail within 150ms of reaching the raw endpoint", () => {
    const { movie, scrollTo } = setupJourney();
    scrollTo(0.77);
    expect(movieTime(movie)).toBeLessThan(266 / 30);
    scrollTo(0.8, 1); // Raw endpoint observed by the scroll update.
    advanceFrames(2);
    expect(movieTime(movie)).toBeLessThan(266 / 30);
    advanceFrames(1);
    expect(movieTime(movie)).toBe(266 / 30);
    scrollTo(0.76);
    expect(movieTime(movie)).toBeLessThan(266 / 30);
  });

  it("holds the endpoint until fog data and actual playback start are both available", async () => {
    const { container, viewport, scrollTo } = setupJourney();
    const fog = container.querySelectorAll("video")[1];
    Object.defineProperty(fog, "readyState", { configurable: true, value: 1 });
    const basePlay = fog.play.bind(fog);
    const fogPlay = vi.fn(basePlay);
    Object.defineProperty(fog, "play", { configurable: true, value: fogPlay });
    scrollTo(0.9);
    expect(fogPlay).not.toHaveBeenCalled();
    expect(viewport.style.getPropertyValue("--fog-opacity")).toBe("0.0000");
    expect(viewport.style.getPropertyValue("--journey-opacity")).toBe("1.0000");
    Object.defineProperty(fog, "readyState", { configurable: true, value: 2 });
    let start!: () => void;
    fogPlay.mockImplementation(() => new Promise<void>(resolve => { start = () => { void basePlay(); resolve(); }; }));
    seeking.set(fog, true);
    act(() => { fog.dispatchEvent(new Event("loadeddata")); });
    advanceFrames();
    expect(fogPlay).not.toHaveBeenCalled();
    act(() => { completeSeek(fog); });
    advanceFrames();
    expect(fogPlay).toHaveBeenCalledOnce();
    expect(viewport.style.getPropertyValue("--fog-opacity")).toBe("0.0000");
    start();
    await settlePlayback();
    expect(viewport.style.getPropertyValue("--fog-opacity")).toBe("1.0000");
  });

  it("keeps opaque endpoint coverage under the whole fog crossfade and retains it while buffering", async () => {
    const { container, viewport, scrollTo } = setupJourney();
    const fog = container.querySelectorAll("video")[1];
    for (const progress of [0.785, 0.8, 0.8175, 0.835, 0.85, 0.9, 0.835, 0.8]) {
      scrollTo(progress);
      await settlePlayback();
      const journey = Number(viewport.style.getPropertyValue("--journey-opacity"));
      const incoming = Number(viewport.style.getPropertyValue("--fog-opacity"));
      // Source-over compositing must leave zero contribution from the hero
      // poster beneath the two decoded layers, including halfway through.
      expect((1 - journey) * (1 - incoming)).toBe(0);
    }
    scrollTo(0.9);
    await settlePlayback();
    const opacity = viewport.style.getPropertyValue("--fog-opacity");
    Object.defineProperty(fog, "readyState", { configurable: true, value: 1 });
    act(() => { fog.dispatchEvent(new Event("waiting")); });
    advanceFrames();
    expect(viewport.style.getPropertyValue("--fog-opacity")).toBe(opacity);
    expect(viewport.style.getPropertyValue("--journey-opacity")).toBe("1.0000");
  });

  it("coalesces pending fog play and ignores stale starts after reverse, hidden state, and unmount", async () => {
    const { container, viewport, scrollTo, unmount } = setupJourney();
    const fog = container.querySelectorAll("video")[1];
    let resolve!: () => void;
    const basePlay = fog.play.bind(fog);
    const play = vi.fn(() => new Promise<void>(done => { resolve = done; }));
    Object.defineProperty(fog, "play", { configurable: true, value: play });
    scrollTo(0.9);
    scrollTo(0.88); scrollTo(0.86);
    expect(play).toHaveBeenCalledOnce();
    scrollTo(0.78);
    void basePlay();
    resolve();
    await settlePlayback();
    act(() => { fog.dispatchEvent(new Event("playing")); });
    advanceFrames();
    expect(fog.paused).toBe(true);
    expect(viewport.style.getPropertyValue("--fog-opacity")).toBe("0.0000");
    scrollTo(0.9);
    expect(play).toHaveBeenCalledTimes(2);
    act(() => { visibilityCallback?.([{ isIntersecting: false }]); });
    advanceFrames();
    void basePlay();
    resolve();
    await settlePlayback();
    expect(fog.paused).toBe(true);
    expect(viewport.style.getPropertyValue("--fog-opacity")).toBe("0.0000");
    act(() => { visibilityCallback?.([{ isIntersecting: true }]); });
    advanceFrames();
    expect(play).toHaveBeenCalledTimes(3);
    unmount();
    resolve();
    await settlePlayback();
    expect(callbacks.size).toBe(0);
  });

  it("pauses near the fog boundary without resetting and resets only on a deeper reverse", async () => {
    const { container, scrollTo } = setupJourney();
    const fog = container.querySelectorAll("video")[1];
    scrollTo(0.9);
    await settlePlayback();
    act(() => { fog.currentTime = 3; completeSeek(fog); });
    scrollTo(0.78);
    expect(fog.paused).toBe(true);
    expect(fog.currentTime).toBe(3);
    scrollTo(0.79);
    await settlePlayback();
    expect(fog.currentTime).toBe(3);
    expect(fog.paused).toBe(false);
    scrollTo(0.71);
    expect(fog.currentTime).toBe(0);
    const reset = vi.spyOn(fog, "currentTime", "set");
    reset.mockClear();
    scrollTo(0.7); scrollTo(0.68);
    expect(reset).not.toHaveBeenCalled();
  });

  it("uses static correct portrait posters without loading or playing videos for reduced motion", () => {
    environment.reduced = true;
    const { container, viewport, scrollTo } = setupJourney();
    const videos = [...container.querySelectorAll("video")];
    expect(videos.every(video => !video.hasAttribute("src") && !video.autoplay)).toBe(true);
    expect(videos.map(video => video.getAttribute("poster"))).toEqual([mobileMedia.heroPoster, mobileMedia.journeyPoster, mobileMedia.fogPoster]);
    scrollTo(0.9);
    expect(viewport.style.getPropertyValue("--fog-opacity")).toBe("1");
    expect(videos.every(video => video.paused)).toBe(true);
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
  });
  it("scrubs forward and backward on compact screens", () => {
    const { movie, viewport, scrollTo } = setupJourney();
    scrollTo(0.6);
    expect(movieTime(movie)).toBeGreaterThan(6);
    expect(Number(viewport.style.getPropertyValue("--journey-opacity"))).toBe(1);
    const laterTime = movieTime(movie);
    scrollTo(0.3);
    expect(movieTime(movie)).toBeLessThan(laterTime);
    expect(movieTime(movie)).toBeGreaterThan(0);
  });

  it("keeps the endpoint reachable after resizing from desktop to compact", () => {
    environment.width = 1440;
    const { container, scrollTo } = setupJourney();
    resizeTo(700);
    const movie = container.querySelector("[data-mobile-journey-film]") as HTMLCanvasElement;
    scrollTo(0.785);
    expect(movie.tagName).toBe("CANVAS");
    expect(Math.floor(movieTime(movie) * 30)).toBe(266);
    expect(movieTime(movie)).toBeLessThan(8.9);
  });

  it("gathers separated text before revealing the final title and reverses continuously through the old scene boundary", () => {
    const { viewport, scrollTo } = setupJourney();
    const value = (key: string) => Number(viewport.style.getPropertyValue(key));
    scrollTo(0.70);
    expect(value("--final-gather")).toBe(0);
    expect(value("--final-reveal")).toBe(0);
    scrollTo(0.77);
    const middle = value("--final-gather");
    expect(middle).toBeCloseTo(0.5, 3);
    expect(value("--final-copy-opacity")).toBe(1);
    expect(value("--final-reveal")).toBe(0);
    scrollTo(0.81999);
    const beforeBoundary = value("--final-gather");
    scrollTo(0.82001);
    expect(Math.abs(value("--final-gather") - beforeBoundary)).toBeLessThan(0.001);
    scrollTo(0.84);
    expect(value("--final-gather")).toBe(1);
    expect(value("--final-reveal")).toBe(0);
    scrollTo(0.875);
    expect(value("--final-gather")).toBe(1);
    expect(value("--final-reveal")).toBeCloseTo(0.5, 3);
    scrollTo(0.91);
    expect(value("--final-reveal")).toBe(1);
    scrollTo(0.77);
    expect(value("--final-gather")).toBe(middle);
    expect(value("--final-reveal")).toBe(0);
  });

  it("finishes the desktop title exchange after scrolling stops and reverses without a half-title hold", () => {
    environment.width = 1440;
    const { viewport, scrollTo } = setupJourney();
    const reveal = () => Number(viewport.style.getPropertyValue("--final-reveal"));
    scrollTo(0.83);
    expect(reveal()).toBe(0);
    scrollTo(0.85);
    expect(reveal()).toBe(1);
    advanceFrames();
    expect(reveal()).toBe(1);
    // Tiny reversals within the handoff band do not restart an exchange.
    scrollTo(0.83);
    expect(reveal()).toBe(1);
    scrollTo(0.81);
    expect(reveal()).toBe(0);
  });

  it("keeps final text centered with no scroll displacement for reduced motion", () => {
    environment.reduced = true;
    const { viewport, scrollTo } = setupJourney();
    scrollTo(0.71);
    expect(viewport.style.getPropertyValue("--final-gather")).toBe("1.00000");
  });

  it("uses deterministic CSS surround colors and retraces them on reverse scroll", () => {
    const { container, viewport, scrollTo } = setupJourney();
    expect(container.querySelector("canvas")).toHaveAttribute("data-mobile-journey-film");
    expect(container.querySelector("[data-color-surround]")).not.toBeNull();
    scrollTo(0);
    expect(viewport.style.getPropertyValue("--surround-top")).toBe("rgb(0.00 0.00 0.00)");
    scrollTo(0.46);
    const top = viewport.style.getPropertyValue("--surround-top");
    const bottom = viewport.style.getPropertyValue("--surround-bottom");
    scrollTo(0.9);
    expect(viewport.style.getPropertyValue("--surround-top")).not.toBe(top);
    scrollTo(0.46);
    expect(viewport.style.getPropertyValue("--surround-top")).toBe(top);
    expect(viewport.style.getPropertyValue("--surround-bottom")).toBe(bottom);
  });

  it("leaves the scroll movie still for reduced motion and releases pending work on unmount", () => {
    environment.reduced = true;
    const { movie, viewport, scrollTo, unmount } = setupJourney();
    scrollTo(0.6);
    expect(movieTime(movie)).toBe(0);
    expect(viewport.style.getPropertyValue("--journey-opacity")).toBe("0");
    act(() => { window.dispatchEvent(new Event("scroll")); });
    expect(callbacks.size).toBeGreaterThan(0);
    unmount();
    expect(callbacks.size).toBe(0);
  });
});
