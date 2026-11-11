import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HERO_AUTOPLAY_IDLE_MS, useHeroAutoplay } from './useHeroAutoplay';

vi.mock('lenis/react', () => ({ useLenis: () => undefined }));
let y = 0;
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance', 'setTimeout'] });
  y = 0;
  vi.spyOn(window, 'scrollY', 'get').mockImplementation(() => y);
  vi.stubGlobal('innerHeight', 1000);
  vi.spyOn(window, 'scrollTo').mockImplementation((...args) => { y = Number(args[1]); window.dispatchEvent(new Event('scroll')); });
});
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals(); delete document.documentElement.dataset.heroLoading; });
function setup(enabled = true) {
  const hero = document.createElement('section');
  Object.defineProperty(hero, 'offsetHeight', { value: 3400 });
  hero.getBoundingClientRect = () => ({ top: -y } as DOMRect);
  return renderHook(() => useHeroAutoplay({ current: hero }, enabled, () => 24));
}
describe('Hero film autoplay', () => {
  it('advances through the hero at 1x and stops at the end of the film', () => {
    const view = setup();
    act(() => { vi.advanceTimersByTime(1000); });
    expect(y).toBeGreaterThan(90); expect(y).toBeLessThan(110);
    act(() => { vi.advanceTimersByTime(30000); });
    expect(y).toBe(2400);
    view.unmount();
  });
  it('yields to the visitor, follows reverse scroll and resumes after a pause', () => {
    const view = setup();
    act(() => { vi.advanceTimersByTime(1000); });
    act(() => { y = 40; window.dispatchEvent(new Event('scroll')); window.dispatchEvent(new WheelEvent('wheel', { deltaY: -60 })); });
    act(() => { vi.advanceTimersByTime(HERO_AUTOPLAY_IDLE_MS - 100); });
    expect(y).toBe(40);
    act(() => { vi.advanceTimersByTime(1000); });
    expect(y).toBeGreaterThan(40);
    view.unmount();
  });
  it('does nothing while disabled or below the hero', () => {
    const view = setup(false);
    act(() => { vi.advanceTimersByTime(1000); });
    expect(y).toBe(0);
    view.unmount();
    y = 3000;
    const below = setup();
    act(() => { vi.advanceTimersByTime(1000); });
    expect(y).toBe(3000);
    below.unmount();
  });
});
