import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import MorphGallery from './MorphGallery';

const items = [
  { src: '/home-a.webp', alt: 'First OKNO home' },
  { src: '/home-b.webp', alt: 'Second OKNO home' },
  { src: '/home-c.webp', alt: 'Third OKNO home' },
];
let reduced = false;
let observers: Array<(entries: IntersectionObserverEntry[]) => void>;
let rafs: Map<number, FrameRequestCallback>;
let rafID = 0;
let gl: Record<string, unknown>;

beforeEach(() => {
  reduced = false;
  observers = [];
  rafs = new Map();
  rafID = 0;
  vi.stubGlobal('matchMedia', () => ({ matches: reduced, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  vi.stubGlobal('IntersectionObserver', class {
    constructor(callback: (entries: IntersectionObserverEntry[]) => void) { observers.push(callback); }
    observe() {}
    disconnect() {}
  });
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} });
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { rafs.set(++rafID, callback); return rafID; });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => rafs.delete(id));
  vi.stubGlobal('Image', class {
    crossOrigin = ''; decoding = ''; naturalWidth = 2400; naturalHeight = 1600;
    onload: (() => void) | null = null;
    set src(_value: string) { queueMicrotask(() => this.onload?.()); }
  });
  gl = {};
  for (const name of ['shaderSource', 'compileShader', 'deleteShader', 'attachShader', 'linkProgram', 'deleteProgram', 'useProgram', 'bindBuffer', 'bufferData', 'enableVertexAttribArray', 'vertexAttribPointer', 'pixelStorei', 'activeTexture', 'bindTexture', 'uniform1i', 'uniform1f', 'uniform2f', 'drawArrays', 'viewport', 'texImage2D', 'texParameteri', 'deleteTexture', 'deleteBuffer']) gl[name] = vi.fn();
  for (const name of ['createShader', 'createProgram', 'createBuffer', 'createTexture']) gl[name] = vi.fn(() => ({}));
  gl.getShaderParameter = () => true;
  gl.getProgramParameter = () => true;
  gl.getParameter = () => 4096;
  gl.getAttribLocation = () => 0;
  gl.getUniformLocation = () => ({});
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation((() => gl) as unknown as typeof HTMLCanvasElement.prototype.getContext);
});

afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

async function enter() {
  await act(async () => {
    observers[0]([{ isIntersecting: true } as IntersectionObserverEntry]);
    observers[1]([{ isIntersecting: true } as IntersectionObserverEntry]);
  });
}

function pointer(target: HTMLElement, type: string, x: number, y: number) {
  const event = new Event(type, { bubbles: true });
  Object.assign(event, { clientX: x, clientY: y });
  fireEvent(target, event);
}

describe('bookmarked Morph Gallery integration', () => {
  it('creates WebGL near the viewport and schedules frames only during a transition', async () => {
    const { unmount } = render(<MorphGallery items={items} duration={1000} />);
    expect(HTMLCanvasElement.prototype.getContext).not.toHaveBeenCalled();
    await enter();
    expect(screen.getByRole('region')).toHaveAttribute('data-morph-renderer', 'webgl');
    expect(rafs.size).toBe(0);
    fireEvent.click(screen.getByRole('button', { name: 'Next image' }));
    expect(rafs.size).toBe(1);
    act(() => {
      const pending = [...rafs.values()];
      rafs.clear();
      pending.forEach((callback) => callback(performance.now() + 1100));
    });
    expect(rafs.size).toBe(0);
    expect(gl.drawArrays).toHaveBeenCalled();
    unmount();
    expect(gl.deleteTexture).toHaveBeenCalledTimes(3);
    expect(gl.deleteProgram).toHaveBeenCalledOnce();
  });

  it('uses controlled navigation and only marks dedicated arrow controls magnetic', () => {
    const changed = vi.fn();
    const { rerender, container } = render(<MorphGallery items={items} index={0} onIndexChange={changed} />);
    fireEvent.keyDown(screen.getByRole('region'), { key: 'ArrowRight' });
    expect(changed).toHaveBeenCalledWith(1);
    expect(screen.getByRole('img')).toHaveAttribute('src', items[0].src);
    expect(container).not.toHaveTextContent(/\d\s*\/\s*\d/);
    rerender(<MorphGallery items={items} index={1} onIndexChange={changed} />);
    expect(screen.getByRole('img')).toHaveAttribute('src', items[1].src);
    expect(container).not.toHaveTextContent(/\d\s*\/\s*\d/);
    expect(container.querySelectorAll('[data-landing-magnetic]')).toHaveLength(2);
    expect(container.querySelector('img')).not.toHaveAttribute('data-landing-magnetic');
    expect(container.querySelector('canvas')).not.toHaveAttribute('data-landing-magnetic');
  });

  it('keeps reduced motion native and supports horizontal swipes without consuming vertical scroll', async () => {
    reduced = true;
    render(<MorphGallery items={items} />);
    await enter();
    expect(HTMLCanvasElement.prototype.getContext).not.toHaveBeenCalled();
    const region = screen.getByRole('region');
    pointer(region, 'pointerdown', 250, 100);
    pointer(region, 'pointerup', 160, 350);
    expect(screen.getByRole('img')).toHaveAttribute('src', items[0].src);
    pointer(region, 'pointerdown', 250, 100);
    pointer(region, 'pointerup', 160, 110);
    expect(screen.getByRole('img')).toHaveAttribute('src', items[1].src);
    expect(region).toHaveAttribute('data-morph-renderer', 'reduced');
    expect(rafs.size).toBe(0);
  });

  it('falls back to the source image on context loss and keeps navigation usable', async () => {
    const { container } = render(<MorphGallery items={items} />);
    await enter();
    fireEvent(container.querySelector('canvas')!, new Event('webglcontextlost', { cancelable: true }));
    expect(screen.getByRole('region')).toHaveAttribute('data-morph-renderer', 'fallback');
    fireEvent.click(screen.getByRole('button', { name: 'Next image' }));
    expect(screen.getByRole('img')).toHaveAttribute('src', items[1].src);
    expect(rafs.size).toBe(0);
  });
});
