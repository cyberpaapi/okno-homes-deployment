import { act, cleanup, render, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MobileJourneyFilm, { type MobileJourneyHandle } from "./MobileJourneyFilm";
import { mobileMedia } from "./mobileMedia";

const indexed = vi.hoisted(() => ({ create: vi.fn() }));
vi.mock("@/lib/indexedFrameScrubber", () => ({ createIndexedFrameScrubber: indexed.create }));
let draw: (time: number) => void;
let fail: () => void;
let signal: AbortSignal;
let local: { setTime: ReturnType<typeof vi.fn>; dispose: ReturnType<typeof vi.fn> };
let callbacks: Map<number, FrameRequestCallback>;
let id = 0;

beforeEach(() => {
  callbacks = new Map();
  local = { setTime: vi.fn(), dispose: vi.fn() };
  indexed.create.mockReset().mockImplementation(async (_film, _canvas, abort, _ready, failed, presented) => {
    signal = abort; draw = presented; fail = failed; return local;
  });
  vi.stubGlobal("VideoDecoder", class {});
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { callbacks.set(++id, callback); return id; });
  vi.stubGlobal("cancelAnimationFrame", (identifier: number) => callbacks.delete(identifier));
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
  vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => {});
  vi.spyOn(HTMLMediaElement.prototype, "readyState", "get").mockReturnValue(0);
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation((() => ({ drawImage: vi.fn() })) as unknown as typeof HTMLCanvasElement.prototype.getContext);
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe("phone original-frame renderer", () => {
  it("uses one indexed decoder, reports actual draws, and releases cache when inactive", async () => {
    const ref = createRef<MobileJourneyHandle>();
    const presented = vi.fn();
    const view = render(<MobileJourneyFilm ref={ref} className="film" onPresent={presented} />);
    act(() => { ref.current!.setTime(4); });
    await waitFor(() => expect(indexed.create).toHaveBeenCalledOnce());
    expect(local.setTime).toHaveBeenLastCalledWith(4);
    expect(indexed.create.mock.calls[0][7]).toEqual({ cacheLimit: 24, boundedPresentation: true, preserveFrame: true, reverseKeyframesFirst: true, independentRanges: true });
    expect(view.container.querySelector("video")).toBeNull();
    expect(presented).not.toHaveBeenCalled();
    act(() => { draw(3.9667); });
    expect(presented).toHaveBeenLastCalledWith(3.9667);
    const canvas = view.container.querySelector("canvas")!;
    expect(canvas.style.visibility).toBe("visible");
    act(() => { ref.current!.setActive(false); });
    expect(signal.aborted).toBe(true);
    expect(local.dispose).toHaveBeenCalled();
    expect(canvas.style.visibility).toBe("visible");
    act(() => { ref.current!.setTime(2); ref.current!.setActive(true); });
    await waitFor(() => expect(indexed.create).toHaveBeenCalledTimes(2));
    expect(local.setTime).toHaveBeenLastCalledWith(2);
    expect(canvas.style.visibility).toBe("visible");
    view.unmount();
    expect(signal.aborted).toBe(true);
  });

  it("retains the last canvas until native fallback decodes the latest target", async () => {
    const ref = createRef<MobileJourneyHandle>();
    const presented = vi.fn();
    const view = render(<MobileJourneyFilm ref={ref} className="film" onPresent={presented} />);
    await waitFor(() => expect(indexed.create).toHaveBeenCalledOnce());
    act(() => { ref.current!.setTime(4); draw(4); fail(); });
    expect(signal.aborted).toBe(true);
    expect(local.dispose).toHaveBeenCalled();
    const canvas = view.container.querySelector("canvas")!;
    const native = view.container.querySelector("video")!;
    expect(native.getAttribute("src")).toBe(mobileMedia.journey);
    expect(native.style.visibility).toBe("hidden");
    expect(canvas.style.visibility).toBe("visible");
    Object.defineProperty(native, "readyState", { configurable: true, value: 2 });
    act(() => { native.dispatchEvent(new Event("loadeddata")); });
    act(() => { const pending = [...callbacks.values()]; callbacks.clear(); pending.forEach(callback => callback(performance.now())); });
    act(() => { native.dispatchEvent(new Event("seeked")); });
    expect(native.style.visibility).toBe("hidden");
    expect(canvas.style.visibility).toBe("visible");
    // While another native seek is incomplete, the preceding canvas remains
    // the presented image rather than exposing the video's transient state.
    Object.defineProperty(native, "seeking", { configurable: true, value: true });
    act(() => { ref.current!.setTime(2); native.dispatchEvent(new Event("seeked")); });
    expect(canvas.style.visibility).toBe("visible");
    expect(presented).toHaveBeenLastCalledWith(4 + 0.25 / mobileMedia.frameRate);
    act(() => { ref.current!.setActive(false); });
    expect(canvas.style.visibility).toBe("visible");
    act(() => { ref.current!.setActive(true); });
    expect(view.container.querySelector("video")!.style.visibility).toBe("hidden");
    expect(canvas.style.visibility).toBe("visible");
  });

  it("retains the preceding composition when native copying fails and coalesces to the newest target", async () => {
    const ref = createRef<MobileJourneyHandle>();
    const presented = vi.fn();
    const copy = vi.fn();
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockImplementation((() => ({ drawImage: copy })) as unknown as typeof HTMLCanvasElement.prototype.getContext);
    const view = render(<MobileJourneyFilm ref={ref} className="film" onPresent={presented} />);
    await waitFor(() => expect(indexed.create).toHaveBeenCalledOnce());
    act(() => { ref.current!.setTime(4); draw(4); fail(); });
    const canvas = view.container.querySelector("canvas")!;
    const native = view.container.querySelector("video")!;
    Object.defineProperty(native, "readyState", { configurable: true, value: 2 });
    act(() => { native.dispatchEvent(new Event("loadeddata")); });
    act(() => { const pending = [...callbacks.values()]; callbacks.clear(); pending.forEach(callback => callback(performance.now())); });
    act(() => { ref.current!.setTime(3); ref.current!.setTime(2); native.dispatchEvent(new Event("seeked")); });
    expect(presented).toHaveBeenLastCalledWith(4);
    act(() => { const pending = [...callbacks.values()]; callbacks.clear(); pending.forEach(callback => callback(performance.now())); });
    copy.mockImplementationOnce(() => { throw new Error("frame unavailable"); });
    act(() => { native.dispatchEvent(new Event("seeked")); });
    expect(presented).toHaveBeenLastCalledWith(4);
    expect(canvas.style.visibility).toBe("visible");
    expect(native.style.visibility).toBe("hidden");
    act(() => { native.dispatchEvent(new Event("loadeddata")); });
    expect(presented).toHaveBeenLastCalledWith(2 + 0.25 / mobileMedia.frameRate);
  });

  it("uses native fallback without starting an indexed decoder when WebCodecs is absent", () => {
    vi.stubGlobal("VideoDecoder", undefined);
    const ref = createRef<MobileJourneyHandle>();
    const view = render(<MobileJourneyFilm ref={ref} className="film" onPresent={vi.fn()} />);
    expect(indexed.create).not.toHaveBeenCalled();
    expect(view.container.querySelectorAll("video")).toHaveLength(1);
    act(() => { ref.current!.setTime(2); });
    view.unmount();
    expect(callbacks.size).toBe(0);
  });
});
