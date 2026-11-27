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
  gl.getUniformLocation.mockImplementation((_program, name: string) => name);
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
  const sceneTimes = () => gl.uniform4f.mock.calls.filter(call => call[0] === "u_scene").map(call => call[3] as number);

  it("keeps the original forest recipe by default and changes colours without rebuilding or restarting motion", () => {
    const view = render(<SilkBackground interactive={false} />);
    draw(1000);
    draw(1100);
    const initialColors = Array.from(gl.uniform3fv.mock.calls[0][1] as Float32Array);
    expect(initialColors.slice(0, 3)).toEqual([expect.closeTo(.025), expect.closeTo(.035), expect.closeTo(.030)]);
    expect(gl.uniform4f.mock.calls.find(call => call[0] === "u_finish")).toEqual(["u_finish", 0, .12, 0, .016]);
    const timeBeforePalette = sceneTimes().at(-1)!;
    expect(timeBeforePalette).toBeGreaterThan(0);

    view.rerender(<SilkBackground interactive={false} palette="pearl" />);
    expect(view.container.querySelector("canvas")).toHaveAttribute("data-palette", "pearl");
    const pearlColors = Array.from(gl.uniform3fv.mock.calls.at(-1)![1] as Float32Array);
    expect(pearlColors.length).toBe(initialColors.length);
    expect(Math.min(...pearlColors)).toBeGreaterThan(.7);
    draw(1200);
    expect(sceneTimes().at(-1)).toBeGreaterThan(timeBeforePalette);
    expect(gl.createProgram).toHaveBeenCalledOnce();
    expect(gl.deleteProgram).not.toHaveBeenCalled();

    view.rerender(<SilkBackground interactive={false} palette="forest" />);
    expect(Array.from(gl.uniform3fv.mock.calls.at(-1)![1] as Float32Array)).toEqual(initialColors);
    expect(gl.uniform4f.mock.calls.filter(call => call[0] === "u_finish").at(-1)).toEqual(["u_finish", 0, .12, 0, .016]);
    draw(1300);
    expect(sceneTimes().at(-1)).toBeGreaterThan(timeBeforePalette);
    expect(gl.createProgram).toHaveBeenCalledOnce();
  });

  it("holds elapsed phase through caller, menu and offscreen pauses rather than replaying the first frame", () => {
    const view = render(<SilkBackground interactive={false} palette="pearl" />);
    draw(1000);
    draw(1100);
    const firstTime = sceneTimes().at(-1)!;
    expect(firstTime).toBeGreaterThan(0);
    view.rerender(<SilkBackground interactive={false} palette="pearl" paused />);
    view.rerender(<SilkBackground interactive={false} palette="pearl" />);
    draw(10_000);
    expect(sceneTimes().at(-1)).toBe(firstTime);
    draw(10_100);
    const secondTime = sceneTimes().at(-1)!;
    expect(secondTime).toBeGreaterThan(firstTime);

    act(() => window.dispatchEvent(new CustomEvent("okno-public-menu-activity", { detail: { active: true } })));
    act(() => window.dispatchEvent(new CustomEvent("okno-public-menu-activity", { detail: { active: false } })));
    draw(20_000);
    expect(sceneTimes().at(-1)).toBe(secondTime);
    draw(20_100);
    const thirdTime = sceneTimes().at(-1)!;
    expect(thirdTime).toBeGreaterThan(secondTime);

    act(() => intersect([{ isIntersecting: false } as IntersectionObserverEntry]));
    act(() => intersect([{ isIntersecting: true } as IntersectionObserverEntry]));
    draw(30_000);
    expect(sceneTimes().at(-1)).toBe(thirdTime);
    draw(30_100);
    expect(sceneTimes().at(-1)).toBeGreaterThan(thirdTime);
    expect(gl.createProgram).toHaveBeenCalledOnce();
  });

  it("redraws the selected palette once under reduced motion without starting continuous animation", () => {
    environment.reduced = true;
    const view = render(<SilkBackground interactive={false} />);
    draw(1000);
    expect(rafs.size).toBe(0);
    view.rerender(<SilkBackground interactive={false} palette="pearl" />);
    draw(1100);
    expect(gl.drawArrays).toHaveBeenCalledTimes(2);
    expect(rafs.size).toBe(0);
    expect(sceneTimes()).toEqual([0, 0]);
    expect(gl.createProgram).toHaveBeenCalledOnce();
  });

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
