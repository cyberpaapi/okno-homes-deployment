import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SilkBackground } from "./SilkBackground";

const environment = vi.hoisted(() => ({ reduced: false }));
vi.mock("motion/react", () => ({ useReducedMotion: () => environment.reduced }));

let rafs: Map<number, FrameRequestCallback>;
let nextId = 0;
let gl: Record<string, ReturnType<typeof vi.fn>>;
let intersect: (entries: IntersectionObserverEntry[]) => void;
let resize: () => void;
let bounds: { width: number; height: number };
let loseContext: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.useFakeTimers();
  environment.reduced = false;
  bounds = { width: 390, height: 844 };
  rafs = new Map();
  nextId = 0;
  vi.stubGlobal("innerWidth", 390);
  vi.stubGlobal("devicePixelRatio", 2);
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { rafs.set(++nextId, callback); return nextId; });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => rafs.delete(id));
  vi.stubGlobal("ResizeObserver", class {
    constructor(callback: () => void) { resize = callback; }
    observe() {}
    disconnect() {}
  });
  vi.stubGlobal("IntersectionObserver", class {
    constructor(callback: typeof intersect) { intersect = callback; }
    observe() {}
    disconnect() {}
  });
  vi.spyOn(HTMLCanvasElement.prototype, "getBoundingClientRect").mockImplementation(() => ({ ...bounds, top: 0, left: 0, right: bounds.width, bottom: bounds.height }) as DOMRect);
  gl = {};
  for (const name of ["shaderSource", "compileShader", "deleteShader", "attachShader", "linkProgram", "deleteProgram", "useProgram", "bindBuffer", "bufferData", "enableVertexAttribArray", "vertexAttribPointer", "uniform3fv", "uniform4f", "drawArrays", "viewport", "deleteBuffer"]) gl[name] = vi.fn();
  for (const name of ["createShader", "createProgram", "createBuffer", "getUniformLocation"]) gl[name] = vi.fn(() => ({}));
  gl.getAttribLocation = vi.fn(() => 0);
  loseContext = vi.fn();
  gl.getExtension = vi.fn(() => ({ loseContext }));
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation((() => gl) as unknown as typeof HTMLCanvasElement.prototype.getContext);
});

afterEach(() => {
  cleanup();
  delete document.documentElement.dataset.oknoPublicMenuActive;
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function draw(now = 1000) {
  act(() => {
    const pending = [...rafs.values()];
    rafs.clear();
    pending.forEach(callback => callback(now));
  });
}

describe("Silk framebuffer and scheduling", () => {
  it("uses the requested phone budget and retains the aspect ratio instead of applying a hidden cap", () => {
    const { container } = render(<SilkBackground maxPixels={520_000} interactive={false} />);
    draw();
    const canvas = container.querySelector("canvas")!;
    expect(canvas.width * canvas.height).toBeGreaterThan(500_000);
    expect(canvas.width * canvas.height).toBeLessThanOrEqual(520_000);
    expect(Math.abs(canvas.width / canvas.height - bounds.width / bounds.height)).toBeLessThan(0.002);
    bounds = { width: 844, height: 390 };
    act(() => resize());
    expect(canvas.width).toBeGreaterThan(canvas.height);
    expect(canvas.width * canvas.height).toBeLessThanOrEqual(520_000);
  });

  it.each(["ANGLE (Google, Vulkan SwiftShader Device)", "llvmpipe", "softpipe", "Software Rasterizer", "Microsoft Basic Render Driver"])("limits decorative pixels and cadence on identified software renderer %s", renderer => {
    vi.stubGlobal("innerWidth", 1440);
    gl.getExtension.mockImplementation(name => name === "WEBGL_debug_renderer_info" ? { UNMASKED_RENDERER_WEBGL: 0x9246 } : { loseContext });
    gl.getParameter = vi.fn(() => renderer);
    const { container } = render(<SilkBackground maxPixels={520_000} fps={30} interactive={false} />);
    draw(1000);
    const canvas = container.querySelector("canvas")!;
    expect(canvas.width * canvas.height).toBeLessThanOrEqual(120_000);
    expect(canvas.width * canvas.height).toBeGreaterThan(115_000);
    expect(canvas.dataset.softwareRenderer).toBe("true");
    expect(canvas.dataset.pixelBudget).toBe("120000");
    expect(canvas.dataset.fpsBudget).toBe("12");
    draw(1040);
    expect(gl.drawArrays).toHaveBeenCalledOnce();
    act(() => vi.advanceTimersByTime(44));
    draw(1084);
    expect(gl.drawArrays).toHaveBeenCalledTimes(2);
  });

  it.each(["ANGLE (NVIDIA GeForce)", null, "unavailable", "throws"])("preserves requested budgets for hardware or unavailable metadata: %s", renderer => {
    vi.stubGlobal("innerWidth", 1440);
    gl.getExtension.mockImplementation(name => {
      if (name !== "WEBGL_debug_renderer_info") return { loseContext };
      if (renderer === "throws") throw new Error("Renderer metadata blocked");
      return renderer === "unavailable" ? null : { UNMASKED_RENDERER_WEBGL: 0x9246 };
    });
    gl.getParameter = vi.fn(() => renderer);
    const { container } = render(<SilkBackground maxPixels={520_000} fps={30} interactive={false} />);
    draw(1000);
    const canvas = container.querySelector("canvas")!;
    expect(canvas.width * canvas.height).toBeGreaterThan(500_000);
    expect(canvas.width * canvas.height).toBeLessThanOrEqual(520_000);
    expect(canvas.dataset.softwareRenderer).toBe("false");
    expect(canvas.dataset.fpsBudget).toBe("30");
    draw(1040);
    expect(gl.drawArrays).toHaveBeenCalledTimes(2);
  });

  it("retains stricter caller budgets on software rendering", () => {
    gl.getExtension.mockImplementation(name => name === "WEBGL_debug_renderer_info" ? { UNMASKED_RENDERER_WEBGL: 0x9246 } : { loseContext });
    gl.getParameter = vi.fn(() => "SwiftShader");
    const { container } = render(<SilkBackground maxPixels={80_000} fps={8} interactive={false} />);
    draw(1000);
    const canvas = container.querySelector("canvas")!;
    expect(canvas.width * canvas.height).toBeLessThanOrEqual(80_000);
    expect(canvas.dataset.pixelBudget).toBe("80000");
    expect(canvas.dataset.fpsBudget).toBe("8");
    draw(1100);
    expect(gl.drawArrays).toHaveBeenCalledOnce();
    act(() => vi.advanceTimersByTime(25));
    draw(1125);
    expect(gl.drawArrays).toHaveBeenCalledTimes(2);
  });

  it("never enlarges beyond the capped device resolution when the pixel budget is larger", () => {
    bounds = { width: 200, height: 100 };
    vi.stubGlobal("devicePixelRatio", 3);
    const { container } = render(<SilkBackground maxPixels={520_000} interactive={false} />);
    draw();
    const canvas = container.querySelector("canvas")!;
    expect([canvas.width, canvas.height]).toEqual([400, 200]);
  });

  it("stops offscreen and while paused, resumes on entry, and releases the WebGL context", () => {
    const view = render(<SilkBackground maxPixels={520_000} interactive={false} />);
    draw();
    expect(gl.drawArrays).toHaveBeenCalledOnce();
    act(() => intersect([{ isIntersecting: false } as IntersectionObserverEntry]));
    expect(rafs.size).toBe(0);
    act(() => intersect([{ isIntersecting: true } as IntersectionObserverEntry]));
    expect(rafs.size).toBe(1);
    view.rerender(<SilkBackground maxPixels={520_000} interactive={false} paused />);
    expect(rafs.size).toBe(0);
    const canvas = view.container.querySelector("canvas")!;
    expect(canvas.dataset.animationState).toBe("paused");
    view.unmount();
    act(() => vi.runOnlyPendingTimers());
    expect(loseContext).toHaveBeenCalledOnce();
    expect([canvas.width, canvas.height]).toEqual([1, 1]);
  });

  it("retains its canvas while the menu pauses RAF and resumes without rebuilding WebGL", () => {
    const view = render(<SilkBackground interactive={false} />);
    draw();
    const canvas = view.container.querySelector("canvas")!;
    const active = (value: boolean) => act(() => window.dispatchEvent(new CustomEvent("okno-public-menu-activity", { detail: { active: value } })));
    active(true);
    expect(rafs.size).toBe(0);
    expect(canvas).toHaveAttribute("data-render-paused", "true");
    expect(canvas.dataset.animationState).toBe("paused");
    draw(1500);
    expect(gl.drawArrays).toHaveBeenCalledOnce();
    expect(gl.createProgram).toHaveBeenCalledOnce();
    active(false);
    expect(rafs.size).toBe(1);
    draw(2000);
    expect(gl.drawArrays).toHaveBeenCalledTimes(2);
    expect(gl.createProgram).toHaveBeenCalledOnce();
    expect(loseContext).not.toHaveBeenCalled();
  });

  it("does not resume behind an open menu or override a caller's paused prop", () => {
    const view = render(<SilkBackground interactive={false} paused />);
    const active = (value: boolean) => act(() => window.dispatchEvent(new CustomEvent("okno-public-menu-activity", { detail: { active: value } })));
    active(true);
    active(false);
    expect(rafs.size).toBe(0);
    active(true);
    view.rerender(<SilkBackground interactive={false} paused={false} />);
    expect(rafs.size).toBe(0);
    active(false);
    expect(rafs.size).toBe(1);
  });

  it("honours an already open menu on mount and removes its activity listener on unmount", () => {
    document.documentElement.dataset.oknoPublicMenuActive = "true";
    const remove = vi.spyOn(window, "removeEventListener");
    const view = render(<SilkBackground interactive={false} />);
    expect(rafs.size).toBe(0);
    view.unmount();
    expect(remove).toHaveBeenCalledWith("okno-public-menu-activity", expect.any(Function));
    act(() => window.dispatchEvent(new CustomEvent("okno-public-menu-activity", { detail: { active: false } })));
    expect(rafs.size).toBe(0);
  });

  it("renders a single still frame for reduced motion and stops immediately on context loss", () => {
    environment.reduced = true;
    const { container } = render(<SilkBackground maxPixels={520_000} />);
    draw();
    expect(gl.drawArrays).toHaveBeenCalledOnce();
    expect(rafs.size).toBe(0);
    const canvas = container.querySelector("canvas")!;
    expect(canvas).toHaveAttribute("data-animated", "false");
    fireEvent(canvas, new Event("webglcontextlost", { cancelable: true }));
    expect(canvas.dataset.animationState).toBe("context-lost");
    expect(rafs.size).toBe(0);
  });
});
