import { act, renderHook } from '@testing-library/react';
import { motionValue } from 'motion/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useHeroFilmExit } from './useHeroFilmExit';

vi.mock('lenis/react', () => ({ useLenis: () => undefined }));
let y = 0;
beforeEach(() => {
  vi.useFakeTimers(); y = 0;
  vi.spyOn(window, 'scrollY', 'get').mockImplementation(() => y);
  vi.stubGlobal('innerHeight', 1000);
  vi.spyOn(window, 'scrollTo').mockImplementation((...args) => { y = Number(args[1]); });
});
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
function setup() {
  const hero = document.createElement('section');
  Object.defineProperty(hero, 'offsetHeight', { value: 2000 });
  hero.getBoundingClientRect = () => ({ top: -y } as DOMRect);
  const shown = motionValue(0), fallback = vi.fn();
  const hook = renderHook(() => useHeroFilmExit({ current: hero }, shown, true, fallback));
  return { ...hook, hero, shown, fallback };
}
describe('Hero movie handoff', () => {
  it('holds before lower content, preserves overshoot and releases after the actual end frame', async () => {
    const view = setup();
    act(() => { y = 1200; window.dispatchEvent(new Event('scroll')); });
    expect(y).toBe(950); expect(view.hero.dataset.filmExitPending).toBe('true');
    const wheel = new WheelEvent('wheel', { deltaY: 300, cancelable: true });
    act(() => { window.dispatchEvent(wheel); });
    expect(wheel.defaultPrevented).toBe(true);
    await act(async () => { view.shown.set(1); await vi.advanceTimersByTimeAsync(200); });
    expect(y).toBe(1500); expect(view.hero.dataset.filmExitPending).toBeUndefined();
    expect(view.fallback).not.toHaveBeenCalled(); view.unmount();
  });
  it('allows immediate reverse input and does not rewind a lower-section reload', async () => {
    const view = setup();
    act(() => { y = 1200; window.dispatchEvent(new Event('scroll')); });
    const wheel = new WheelEvent('wheel', { deltaY: -100, cancelable: true });
    act(() => { window.dispatchEvent(wheel); });
    expect(wheel.defaultPrevented).toBe(false);
    await act(async () => { await vi.advanceTimersByTimeAsync(2500); });
    expect(view.fallback).not.toHaveBeenCalled(); view.unmount();
    y = 2100; const restored = setup();
    act(() => { y = 2200; window.dispatchEvent(new Event('scroll')); });
    expect(y).toBe(2200); restored.unmount();
  });
  it('recovers to the matching ending still if decoding fails, without trapping the visitor', async () => {
    const view = setup();
    act(() => { y = 1300; window.dispatchEvent(new Event('scroll')); });
    await act(async () => { await vi.advanceTimersByTimeAsync(2250); });
    expect(view.fallback).toHaveBeenCalledOnce(); expect(y).toBe(1300);
    view.unmount();
  });
});
