import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HandwrittenQuote, type QuoteInkRegistry } from "./HandwrittenQuote";

const observers: { target?: Element; callback: IntersectionObserverCallback; disconnect: ReturnType<typeof vi.fn> }[] = [];
let fontLoad: ReturnType<typeof vi.fn>;
let registry: QuoteInkRegistry;
const originalFonts = Object.getOwnPropertyDescriptor(document, "fonts");
const quote = "A quietly considered home, with room to gather and a generous view of the garden. A place to return to, together.";

function visible(element: Element, isVisible = true) {
  const observer = [...observers].reverse().find(item => item.target === element)!;
  act(() => observer.callback([{ target: element, isIntersecting: isVisible, intersectionRatio: isVisible ? 1 : 0 } as IntersectionObserverEntry], {} as IntersectionObserver));
}
const loaded = () => act(async () => { await Promise.resolve(); });

beforeEach(() => {
  vi.useFakeTimers();
  const started = Date.now();
  vi.spyOn(performance, "now").mockImplementation(() => Date.now() - started);
  vi.spyOn(document, "hidden", "get").mockReturnValue(false);
  registry = new Map();
  observers.length = 0;
  fontLoad = vi.fn().mockResolvedValue([{}]);
  Object.defineProperty(document, "fonts", { configurable: true, value: { load: fontLoad } });
  vi.stubGlobal("CSS", { supports: vi.fn().mockReturnValue(true) });
  vi.stubGlobal("IntersectionObserver", class {
    private item: typeof observers[number];
    constructor(callback: IntersectionObserverCallback) { this.item = { callback, disconnect: vi.fn() }; observers.push(this.item); }
    observe(target: Element) { this.item.target = target; }
    disconnect() { this.item.disconnect(); }
  });
});
afterEach(() => {
  if (originalFonts) Object.defineProperty(document, "fonts", originalFonts);
  else Reflect.deleteProperty(document, "fonts");
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("HandwrittenQuote", () => {
  it("preserves plain CMS punctuation and whitespace, without interpreting annotation syntax", async () => {
    const text = 'A ==quiet== home, ((ours)) — never ~~erased~~.  It’s here.\nWelcome.';
    const { container } = render(<HandwrittenQuote text={text} reviewId="one" registry={registry} />);
    const p = container.querySelector("p")!;
    expect(p.textContent).toBe(`“${text}”`);
    expect(p.querySelector("svg")).toBeNull();
    expect(p.querySelector("script")).toBeNull();
    expect(p).toHaveAttribute("data-quote-ink", "readable");
    await loaded();
    visible(p);
    expect(p).toHaveAttribute("data-quote-ink", "writing");
    expect(p.textContent).toBe(`“${text}”`);
    const words = p.querySelectorAll<HTMLElement>("[data-ink-word]");
    expect(words[0].style.getPropertyValue("--ink-delay")).toBe("0ms");
    expect(parseFloat(words[words.length - 1].style.getPropertyValue("--ink-delay"))).toBeGreaterThan(0);
  });

  it("completes a bounded reveal and does not rewrite a review after leaving and returning", async () => {
    const { container } = render(<HandwrittenQuote text={quote} reviewId="one" registry={registry} />);
    const p = container.querySelector("p")!;
    await loaded(); visible(p);
    expect(p).toHaveAttribute("data-quote-ink", "writing");
    const children = p.innerHTML;
    act(() => vi.advanceTimersByTime(1400));
    expect(p).toHaveAttribute("data-quote-ink", "complete");
    expect(p.innerHTML).toBe(children);
    visible(p, false); visible(p);
    expect(p).toHaveAttribute("data-quote-ink", "complete");
    expect(registry.size).toBe(1);
  });

  it("shares one phase across equivalent cycles; an offscreen unused clone cannot complete the active quote", async () => {
    const { container } = render(<><HandwrittenQuote text={quote} reviewId="one" registry={registry} /><HandwrittenQuote text={quote} reviewId="one" registry={registry} /></>);
    const [original, clone] = container.querySelectorAll("p");
    await loaded(); visible(original); visible(clone, false);
    expect(registry.values().next().value?.complete).toBe(false);
    act(() => vi.advanceTimersByTime(200));
    visible(clone);
    expect(clone).toHaveAttribute("data-quote-ink", "writing");
    expect(clone.style.getPropertyValue("--ink-elapsed")).toBe("200ms");
    expect(registry.size).toBe(1);
    act(() => vi.advanceTimersByTime(1200));
    expect(original).toHaveAttribute("data-quote-ink", "complete");
    expect(clone).toHaveAttribute("data-quote-ink", "complete");
  });

  it("defers unseen content while suspended, but interrupts active writing without replay", async () => {
    const { container, rerender } = render(<HandwrittenQuote text={quote} reviewId="one" registry={registry} suspended />);
    const p = container.querySelector("p")!;
    await loaded(); visible(p);
    expect(registry.size).toBe(0);
    expect(p).not.toHaveAttribute("data-quote-ink", "writing");
    rerender(<HandwrittenQuote text={quote} reviewId="one" registry={registry} />);
    expect(p).toHaveAttribute("data-quote-ink", "writing");
    rerender(<HandwrittenQuote text={quote} reviewId="one" registry={registry} suspended />);
    expect(p).toHaveAttribute("data-quote-ink", "complete");
    rerender(<HandwrittenQuote text={quote} reviewId="one" registry={registry} />);
    expect(p).toHaveAttribute("data-quote-ink", "complete");
    expect(vi.getTimerCount()).toBe(0);
  });

  it("keeps genuinely user-interrupted visible incoming content complete when the gesture settles", async () => {
    const { container, rerender } = render(<HandwrittenQuote text={quote} reviewId="one" registry={registry} interrupted suspended />);
    const p = container.querySelector("p")!;
    await loaded(); visible(p);
    expect(registry.values().next().value?.complete).toBe(true);
    rerender(<HandwrittenQuote text={quote} reviewId="one" registry={registry} />);
    expect(p).toHaveAttribute("data-quote-ink", "complete");
  });

  it("shows the full quote with reduced motion and cancels an in-flight reveal when the preference changes", async () => {
    const { container, rerender } = render(<HandwrittenQuote text={quote} reviewId="one" registry={registry} reducedMotion />);
    const p = container.querySelector("p")!;
    await loaded(); visible(p);
    expect(p.textContent).toBe(`“${quote}”`);
    expect(p).not.toHaveAttribute("data-quote-ink", "writing");
    rerender(<HandwrittenQuote text={quote} reviewId="one" registry={registry} />);
    expect(p).toHaveAttribute("data-quote-ink", "writing");
    rerender(<HandwrittenQuote text={quote} reviewId="one" registry={registry} reducedMotion />);
    expect(p).toHaveAttribute("data-quote-ink", "complete");
    expect(vi.getTimerCount()).toBe(0);
  });

  it("falls back to native text for huge or unbroken input, missing APIs and rejected fonts", async () => {
    const huge = "a".repeat(2000);
    const view = render(<HandwrittenQuote text={huge} reviewId="one" registry={registry} />);
    expect(view.container.querySelector("p")?.textContent).toBe(`“${huge}”`);
    expect(view.container.querySelectorAll("[data-ink-word]")).toHaveLength(0);
    expect(observers).toHaveLength(0);
    view.unmount();
    vi.stubGlobal("CSS", undefined);
    const missing = render(<HandwrittenQuote text={quote} reviewId="two" registry={registry} />);
    expect(observers).toHaveLength(0);
    expect(missing.container.querySelector("p")).toHaveTextContent(quote);
    missing.unmount();
    vi.stubGlobal("CSS", { supports: () => true });
    Object.defineProperty(document, "fonts", { configurable: true, value: undefined });
    const missingFontApi = render(<HandwrittenQuote text={quote} reviewId="api" registry={registry} />);
    expect(observers).toHaveLength(0);
    expect(missingFontApi.container.querySelector("p")).toHaveTextContent(quote);
    missingFontApi.unmount();
    Object.defineProperty(document, "fonts", { configurable: true, value: { load: fontLoad } });
    fontLoad.mockRejectedValue(new Error("font unavailable"));
    const rejected = render(<HandwrittenQuote text={quote} reviewId="three" registry={registry} />);
    await loaded(); visible(rejected.container.querySelector("p")!);
    expect(rejected.container.querySelector("p")).not.toHaveAttribute("data-quote-ink", "writing");
    expect(rejected.container.querySelector("p")).toHaveTextContent(quote);
  });

  it("cleans timers and observation on unmount and ignores late font resolution", async () => {
    let resolveFont!: (faces: object[]) => void;
    fontLoad.mockReturnValue(new Promise(resolve => { resolveFont = resolve; }));
    const { container, unmount } = render(<HandwrittenQuote text={quote} reviewId="one" registry={registry} />);
    visible(container.querySelector("p")!);
    unmount();
    await act(async () => resolveFont([{}]));
    expect(registry.size).toBe(0);
    expect(observers[0].disconnect).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("keeps editable quote identities separate and bounds settled edit history", async () => {
    for (let i = 0; i < 200; i++) registry.set(`old-${i}`, { startedAt: 0, complete: true });
    const { container, rerender } = render(<HandwrittenQuote text={quote} reviewId="one" registry={registry} />);
    await loaded(); visible(container.querySelector("p")!);
    expect(registry.size).toBe(200);
    expect(registry.has(`one\u0000${quote}`)).toBe(true);
    rerender(<HandwrittenQuote text="An edited quote." reviewId="one" registry={registry} />);
    await loaded(); visible(container.querySelector("p")!);
    expect(registry.size).toBe(200);
    expect(registry.has("one\u0000An edited quote.")).toBe(true);
  });
});
