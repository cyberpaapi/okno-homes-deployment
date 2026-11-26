import { act, fireEvent, render as rtlRender, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { metadata } from "@/app/testimonials/page";
import TestimonialsExperience from "./TestimonialsExperience";

vi.mock("@/components/Header/Header", () => ({ default: () => <header>Site navigation</header> }));
vi.mock("next/link", () => ({ default: ({ href, children, className }: { href: string; children: ReactNode; className: string }) => <a href={href} className={className}>{children}</a> }));
vi.mock("@/components/projects/21st/SilkBackground", () => ({
  SilkBackground: ({ maxPixels, fps, interactive, paused }: { maxPixels: number; fps: number; interactive: boolean; paused: boolean }) =>
    <canvas data-testid="silk" data-max-pixels={maxPixels} data-fps={fps} data-interactive={String(interactive)} data-paused={String(paused)} />,
}));
vi.mock("@/components/ui/SubtleAction", () => ({
  SubtleLink: ({ href, children, className }: { href: string; children: ReactNode; className: string }) => <a href={href} className={className}>{children}</a>,
}));

let viewportWidth = 600;
let contentWidth = 1800;
let reducedMotion = false;
let hidden = false;
let phone = true;
let focusVisible = true;
const mediaListeners = new Map<string, () => void>();
let notifyResize: () => void;
let notifyIntersection: (entries: { isIntersecting: boolean; intersectionRatio: number }[]) => void;
const disconnectIntersection = vi.fn();
const removeMotionListener = vi.fn();
const scrollTo = vi.fn(function (this: HTMLElement, options: ScrollToOptions) {
  this.scrollLeft = options.left ?? 0;
  fireEvent.scroll(this);
});
const settle = () => act(() => vi.advanceTimersByTime(180));
const rotation = () => screen.getByRole("button", { name: "Automatic testimonial rotation" });
const progress = () => rotation().querySelector<HTMLElement>("[data-testimonial-progress]")!;
// JSDOM has CSS animation styles but no AnimationEvent constructor. React
// consequently registers the WebKit event name in this test environment.
const endAnimation = (element: HTMLElement) => fireEvent(element, new Event("webkitAnimationEnd", { bubbles: true }));
const motion = () => act(() => vi.advanceTimersByTime(736));
const advance = () => { endAnimation(progress()); motion(); };
const click = (element: HTMLElement) => { fireEvent.click(element); motion(); };
const running = () => expect(progress()).toHaveAttribute("data-running", "true");
const stopped = () => expect(progress()).toHaveAttribute("data-running", "false");
const region = () => screen.getByRole("region", { name: "Testimonial stories" });
const render = (node: ReactNode) => { const view = rtlRender(node); settle(); scrollTo.mockClear(); return view; };

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ status: 204, ok: true }));
  viewportWidth = 600;
  contentWidth = 1800;
  reducedMotion = false;
  hidden = false;
  notifyResize = () => {};
  phone = true;
  focusVisible = true;
  mediaListeners.clear();
  const originalMatches = Element.prototype.matches;
  vi.spyOn(Element.prototype, "matches").mockImplementation(function (this: Element, selector: string) {
    return selector === ":focus-visible" ? focusVisible : originalMatches.call(this, selector);
  });
  scrollTo.mockClear();
  disconnectIntersection.mockClear();
  removeMotionListener.mockClear();
  vi.spyOn(document, "hidden", "get").mockImplementation(() => hidden);
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(() => viewportWidth);
  vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockImplementation(() => contentWidth);
  vi.spyOn(HTMLElement.prototype, "offsetLeft", "get").mockImplementation(function (this: HTMLElement) {
    const cards = this.parentElement?.querySelectorAll("[data-testimonial-card]");
    return cards ? Array.from(cards).indexOf(this) * 300 : 0;
  });
  vi.stubGlobal("ResizeObserver", class {
    constructor(callback: () => void) { notifyResize = callback; }
    observe() {}
    disconnect() {}
  });
  vi.stubGlobal("IntersectionObserver", class {
    constructor(callback: typeof notifyIntersection) { notifyIntersection = callback; }
    observe() { notifyIntersection([{ isIntersecting: true, intersectionRatio: 1 }]); }
    unobserve() {}
    disconnect = disconnectIntersection;
  });
  // Model phone size and reduced motion independently.
  vi.stubGlobal("matchMedia", vi.fn((query: string) => ({
    get matches() { return query.includes("prefers-reduced-motion") ? reducedMotion : phone; },
    addEventListener: (_: string, callback: () => void) => { mediaListeners.set(query, callback); },
    removeEventListener: removeMotionListener,
  })));
  Object.defineProperty(HTMLElement.prototype, "scrollTo", { configurable: true, value: scrollTo });
});

afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe("Testimonials page", () => {
  it("uses one fictional-preview disclosure, illustrative project photos and two location lines without review SEO claims", () => {
    render(<TestimonialsExperience />);
    expect(screen.getByRole("heading", { level: 1, name: "Testimonials" })).toBeVisible();
    expect(screen.getAllByText(/Preview: names, quotes and locations are fictional/)).toHaveLength(1);
    const cards = within(region()).getAllByRole("listitem");
    expect(cards).toHaveLength(6);
    const clones = region().querySelectorAll('[data-testimonial-card="clone"]');
    expect(clones).toHaveLength(12);
    for (const clone of clones) { expect(clone).toHaveAttribute('aria-hidden', 'true'); expect(clone).toHaveAttribute('inert'); }
    expect(region().querySelectorAll('[id]')).toHaveLength(0);
    for (const card of cards) {
      expect(within(card).getByRole("img", { name: /^Illustrative OKNO project photo:/ })).toHaveAttribute("sizes", expect.stringContaining("85vw"));
      expect(card.querySelector("figure")?.firstElementChild?.querySelector("img")).toBeInTheDocument();
      expect(card.querySelector("blockquote")).toHaveTextContent(/\S/);
      const caption = card.querySelector("figcaption")!;
      expect(caption.querySelectorAll("p")).toHaveLength(2);
      expect(caption.querySelectorAll("span")).toHaveLength(2);
    }
    expect(screen.queryByText("Sample testimonial")).not.toBeInTheDocument();
    expect(document.querySelector('script[type="application/ld+json"]')).not.toBeInTheDocument();
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(screen.getByRole("link", { name: "Talk to OKNO" })).toHaveAttribute("href", "/enquiry");
    expect(screen.getByRole("link", { name: "Explore our homes" })).toHaveAttribute("href", "/models");
    expect(screen.getByTestId("silk")).toHaveAttribute("data-max-pixels", "180000");
    expect(screen.getByTestId("silk")).toHaveAttribute("data-fps", "12");
    expect(screen.getByTestId("silk")).toHaveAttribute("data-interactive", "false");
  });

  it("uses only countdown completion to advance, repeatedly loops forward and never moves focus", () => {
    render(<TestimonialsExperience />);
    running();
    expect(rotation()).toHaveTextContent("");
    expect(rotation().querySelector("svg")).toBeNull();
    act(() => vi.advanceTimersByTime(60_000));
    expect(scrollTo).not.toHaveBeenCalled();
    for (let cycle = 0; cycle < 2; cycle += 1) {
      for (const left of [2100, 2400, 2700, 3000, 3300, 1800]) {
        const previousClock = progress();
        advance();
        expect(region().scrollLeft).toBe(left);
        expect(scrollTo).toHaveBeenLastCalledWith({ left, behavior: "instant" });
        expect(progress()).not.toBe(previousClock);
        settle();
        running();
      }
    }
    expect(document.activeElement).toBe(document.body);
  });

  it("consumes one completion event per countdown even when duplicate ends arrive together", () => {
    render(<TestimonialsExperience />);
    const fill = progress();
    act(() => { endAnimation(fill); endAnimation(fill); });
    expect(region()).toHaveAttribute("data-testimonial-animating", "true");
    motion();
    expect(region().scrollLeft).toBe(2100);
  });

  it("keeps both loop arrows available and resets without requiring an explicit restart", () => {
    render(<TestimonialsExperience />);
    const previous = screen.getByRole("button", { name: "Previous testimonial" });
    const next = screen.getByRole("button", { name: "Next testimonial" });
    expect(previous).toBeEnabled();
    expect(next).toHaveAttribute("aria-controls", region().id);
    const firstClock = progress();
    click(next);
    expect(region().scrollLeft).toBe(2100);
    expect(progress()).not.toBe(firstClock);
    expect(previous).toBeEnabled();
    settle();
    running();
    advance();
    expect(region().scrollLeft).toBe(2400);
    region().scrollLeft = 3300;
    fireEvent.scroll(region());
    expect(next).toBeEnabled();
    click(previous);
    expect(region().scrollLeft).toBe(3000);
    expect(next).toBeEnabled();
    expect(rotation()).toHaveAttribute("aria-pressed", "true");
  });

  it.each(["pointerup", "pointercancel"])("resumes after a held touch ends through %s", (endEvent) => {
    render(<TestimonialsExperience />);
    fireEvent.pointerDown(region(), { pointerType: "touch" });
    stopped();
    expect(screen.getByTestId("silk")).toHaveAttribute("data-paused", "true");
    advance();
    act(() => vi.advanceTimersByTime(10_000));
    expect(scrollTo).not.toHaveBeenCalled();
    stopped();
    fireEvent(window, new Event(endEvent));
    settle();
    running();
    advance();
    expect(region().scrollLeft).toBe(2100);
  });

  it("hands wheel input to the browser and retains Silk's last frame until document or rail scrolling settles", () => {
    render(<TestimonialsExperience />);
    expect(fireEvent.wheel(region(), { deltaY: 80 })).toBe(true);
    stopped();
    act(() => vi.advanceTimersByTime(150));
    fireEvent.scroll(document);
    act(() => vi.advanceTimersByTime(150));
    stopped();
    expect(screen.getByTestId("silk")).toHaveAttribute("data-paused", "true");
    settle();
    running();
    expect(screen.getByTestId("silk")).toHaveAttribute("data-paused", "false");
    advance();
    expect(region().scrollLeft).toBe(2100);
  });

  it("keeps rotating on hover and pointer-focused arrows but rests during visible keyboard focus", () => {
    render(<TestimonialsExperience />);
    fireEvent.pointerEnter(region(), { pointerType: "mouse" });
    running();
    focusVisible = false;
    const next = screen.getByRole("button", { name: "Next testimonial" });
    fireEvent.pointerDown(next, { pointerType: "mouse" });
    act(() => next.focus());
    click(next);
    settle();
    running();
    advance();
    expect(region().scrollLeft).toBe(2400);
    expect(next).toHaveFocus();
    settle();
    focusVisible = true;
    act(() => region().focus());
    stopped();
    fireEvent.keyDown(region(), { key: "End" });
    motion();
    expect(region().scrollLeft).toBe(3300);
    fireEvent.keyDown(region(), { key: "ArrowLeft" });
    motion();
    expect(region().scrollLeft).toBe(3000);
    fireEvent.keyDown(region(), { key: "Home" });
    motion();
    expect(region().scrollLeft).toBe(1800);
    const calls = scrollTo.mock.calls.length;
    expect(fireEvent.keyDown(region(), { key: "ArrowDown" })).toBe(true);
    expect(fireEvent.keyDown(region(), { key: "ArrowRight", ctrlKey: true })).toBe(true);
    expect(scrollTo).toHaveBeenCalledTimes(calls);
    act(() => region().blur());
    settle();
    running();
    advance();
    expect(region().scrollLeft).toBe(2100);
  });

  it("allows the very first keyboard step while resting automatic rotation", () => {
    render(<TestimonialsExperience />);
    fireEvent.keyDown(region(), { key: "ArrowRight" });
    expect(region()).toHaveAttribute("data-testimonial-animating", "true");
    stopped();
    motion();
    expect(region().scrollLeft).toBe(2100);
    expect(region()).not.toHaveAttribute("data-testimonial-animating");
  });

  it("supports explicit accessible stop and keyboard restart on the indicator", () => {
    render(<TestimonialsExperience />);
    act(() => rotation().focus());
    fireEvent.keyDown(rotation(), { key: " " });
    click(rotation());
    expect(rotation()).toHaveAttribute("aria-pressed", "false");
    stopped();
    advance();
    click(screen.getByRole("button", { name: "Next testimonial" }));
    settle();
    stopped();
    const calls = scrollTo.mock.calls.length;
    click(rotation());
    expect(rotation()).toHaveAttribute("aria-pressed", "true");
    running();
    advance();
    expect(scrollTo.mock.calls.length).toBeGreaterThan(calls);
    expect(rotation()).toHaveFocus();
  });

  it("restarts fresh after hidden/offscreen periods and removes lifecycle and gesture work on unmount", async () => {
    const removeListener = vi.spyOn(document, "removeEventListener");
    const removeWindowListener = vi.spyOn(window, "removeEventListener");
    const view = render(<TestimonialsExperience />);
    const firstClock = progress();
    act(() => { hidden = true; document.dispatchEvent(new Event("visibilitychange")); });
    stopped();
    advance();
    expect(screen.getByTestId("silk")).toHaveAttribute("data-paused", "true");
    act(() => { hidden = false; document.dispatchEvent(new Event("visibilitychange")); });
    running();
    expect(progress()).not.toBe(firstClock);
    act(() => notifyIntersection([{ isIntersecting: false, intersectionRatio: 0 }]));
    stopped();
    advance();
    expect(scrollTo).not.toHaveBeenCalled();
    act(() => notifyIntersection([{ isIntersecting: true, intersectionRatio: 1 }]));
    running();
    advance();
    expect(region().scrollLeft).toBe(2100);
    fireEvent.wheel(region());
    view.unmount();
    await act(async () => {}); // Let the normal aborted CMS request release its deadline.
    expect(disconnectIntersection).toHaveBeenCalledOnce();
    expect(removeMotionListener).toHaveBeenCalledWith("change", expect.any(Function));
    expect(removeListener).toHaveBeenCalledWith("visibilitychange", expect.any(Function));
    expect(removeWindowListener).toHaveBeenCalledWith("scroll", expect.any(Function), true);
    expect(removeWindowListener).toHaveBeenCalledWith("pointerup", expect.any(Function));
    expect(removeWindowListener).toHaveBeenCalledWith("pointercancel", expect.any(Function));
    expect(vi.getTimerCount()).toBe(0);
  });

  it("disables automatic rotation for reduced motion while preserving instant manual navigation", () => {
    reducedMotion = true;
    render(<TestimonialsExperience />);
    expect(rotation()).toBeDisabled();
    expect(rotation()).toHaveAttribute("aria-pressed", "false");
    stopped();
    advance();
    expect(scrollTo).not.toHaveBeenCalled();
    click(screen.getByRole("button", { name: "Next testimonial" }));
    expect(scrollTo).toHaveBeenLastCalledWith({ left: 2100, behavior: "instant" });
    act(() => { reducedMotion = false; mediaListeners.get("(prefers-reduced-motion: reduce)")!(); });
    settle();
    running();
    advance();
    expect(region().scrollLeft).toBe(2400);
    act(() => { reducedMotion = true; mediaListeners.get("(prefers-reduced-motion: reduce)")!(); });
    stopped();
    const calls = scrollTo.mock.calls.length;
    advance();
    expect(scrollTo).toHaveBeenCalledTimes(calls);
  });

  it("limits frost to the story below each opaque photograph and uses smaller independent phone/desktop budgets", () => {
    render(<TestimonialsExperience />);
    for (const card of within(region()).getAllByRole("listitem")) {
      const frost = card.querySelector<HTMLElement>("[data-testimonial-frost]")!;
      expect(frost.querySelector("img")).toBeNull();
      expect(frost.querySelector("blockquote")).toHaveTextContent(/\S/);
      expect(frost.style.backdropFilter).toBe("blur(11px) saturate(160%) brightness(1.02)");
    }
    const silk = screen.getByTestId("silk");
    expect(silk).toHaveAttribute("data-max-pixels", "180000");
    expect(silk).toHaveAttribute("data-fps", "12");
    expect(silk).toHaveAttribute("data-interactive", "false");
    act(() => { phone = false; mediaListeners.get("(max-width: 700px)")!(); });
    expect(silk).toHaveAttribute("data-max-pixels", "260000");
  });

  it("crosses the last review without a finite edge and recalculates fit after resizing", () => {
    contentWidth = 1720;
    render(<TestimonialsExperience />);
    const next = screen.getByRole("button", { name: "Next testimonial" });
    const previous = screen.getByRole("button", { name: "Previous testimonial" });
    region().scrollLeft = 3300;
    fireEvent.scroll(region());
    click(next);
    expect(scrollTo).toHaveBeenLastCalledWith({ left: 1800, behavior: "instant" });
    expect(next).toBeEnabled();
    region().scrollLeft = 0;
    viewportWidth = 1800;
    act(() => notifyResize());
    expect(previous).toBeDisabled();
    expect(next).toBeDisabled();
    viewportWidth = 600;
    fireEvent(window, new Event("resize"));
    expect(next).toBeEnabled();
  });
});
