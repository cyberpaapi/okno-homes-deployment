import { StrictMode } from 'react';
import { render, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import AtlasGlobe from './AtlasGlobe';
import { atlasLocations } from '@/data/projectAtlas';
const forceContextLoss = vi.hoisted(() => vi.fn());
vi.mock('three', async (importOriginal) => {
  const actual = await importOriginal<typeof import('three')>();
  return {
    ...actual,
    TextureLoader: class {
      load(
        _url: string,
        onLoad: (texture: import('three').Texture) => void,
      ) {
        queueMicrotask(() => onLoad(new actual.Texture()));
      }
    },
    WebGLRenderer: class {
      outputColorSpace = '';
      capabilities = { getMaxAnisotropy: () => 4 };
      setClearColor() {}
      setPixelRatio() {}
      setSize() {}
      render() {}
      compile() {}
      dispose() {}
      forceContextLoss() { forceContextLoss(); }
    },
  };
});
vi.mock('./GalleryLink', () => ({ default: () => null }));
afterEach(() => { vi.restoreAllMocks();vi.unstubAllGlobals();forceContextLoss.mockClear(); });
it('preserves the flat geographic poster when canvas rendering is unavailable', async () => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  const { container } = render(<AtlasGlobe locations={atlasLocations} focusId="lonavala" />);
  await waitFor(() => expect(container.firstChild).toHaveAttribute('data-state', 'fallback'));
  expect(container.querySelector('canvas')).toHaveAccessibleName('Interactive project globe. Drag or use arrow keys to rotate.');
});

it('runs an opening spin and settles into a continuous slow orbit', async () => {
  const callbacks: FrameRequestCallback[] = [];
  const context = new Proxy({}, { get: () => () => {}, set: () => true });
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation((() => context) as unknown as typeof HTMLCanvasElement.prototype.getContext);
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { callbacks.push(callback);return callbacks.length; });
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} });
  vi.stubGlobal('IntersectionObserver', class { observe() {} disconnect() {} });
  const fetchSpy = vi.fn();
  vi.stubGlobal('fetch', fetchSpy);
  const { container, unmount } = render(<AtlasGlobe locations={atlasLocations} />);
  await waitFor(() => expect(container.firstChild).toHaveAttribute('data-state', 'ready'));
  expect(fetchSpy).not.toHaveBeenCalled();
  const canvas = container.querySelector('canvas')!;
  callbacks.shift()!(100);
  const first = Number(canvas.dataset.longitude);
  expect(canvas).toHaveAttribute('data-rotation-phase', 'entrance');
  expect(callbacks).toHaveLength(1);
  callbacks.shift()!(200);
  expect(Number(canvas.dataset.longitude)).toBeGreaterThan(first);
  for (let now = 300; now <= 6800; now += 100) callbacks.shift()!(now);
  expect(canvas).toHaveAttribute('data-rotation-phase', 'steady');
  expect(Number(canvas.dataset.rotationSpeed)).toBeCloseTo(2.5, 2);
  expect(callbacks).toHaveLength(1);
  unmount();vi.unstubAllGlobals();
});

it('keeps the canvas context available through a React development remount', async () => {
  const context = new Proxy({}, { get: () => () => {}, set: () => true });
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation((() => context) as unknown as typeof HTMLCanvasElement.prototype.getContext);
  vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1));
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} });
  vi.stubGlobal('IntersectionObserver', class { observe() {} disconnect() {} });
  const { container, unmount } = render(<StrictMode><AtlasGlobe locations={atlasLocations} /></StrictMode>);
  await waitFor(() => expect(container.firstChild).toHaveAttribute('data-state', 'ready'));
  unmount();
  expect(forceContextLoss).not.toHaveBeenCalled();
});
