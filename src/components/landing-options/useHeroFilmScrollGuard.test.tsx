import { act, renderHook } from '@testing-library/react';
import type { MotionValue } from 'motion/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import useHeroFilmScrollGuard from './useHeroFilmScrollGuard';

const state = vi.hoisted(() => ({ y: 0, now: 1000, shown: 0, notify: null as (() => void) | null }));
const scrollTo = vi.fn((top: number) => { state.y = top; });
const resize = vi.fn();
vi.mock('lenis/react', () => ({ useLenis: () => ({ resize, scrollTo }) }));

function setup() {
  vi.spyOn(window, 'scrollY', 'get').mockImplementation(() => state.y);
  vi.spyOn(performance, 'now').mockImplementation(() => state.now);
  const element = document.createElement('section');
  Object.defineProperty(element, 'offsetHeight', { value: 6000+window.innerHeight });
  element.getBoundingClientRect = () => new DOMRect(0, -state.y, 1280, element.offsetHeight);
  const shown = {
    get: () => state.shown,
    on: (_event: string, callback: () => void) => { state.notify = callback; return () => { state.notify = null; }; },
  } as unknown as MotionValue<number>;
  return renderHook(() => useHeroFilmScrollGuard({ current: element }, shown, true));
}
function wheel() {
  const event = new WheelEvent('wheel', { deltaY: 7000, cancelable: true });
  act(() => window.dispatchEvent(event));
  return event;
}

describe('Hero film gesture boundaries', () => {
  afterEach(() => {
    state.y=0; state.now=1000; state.shown=0; state.notify=null;
    vi.restoreAllMocks(); vi.clearAllMocks();
  });
  it('discards excess input and synchronizes Lenis to displayed-frame lead', () => {
    const { unmount } = setup();
    expect(wheel().defaultPrevented).toBe(true);
    expect(state.y).toBeCloseTo(6000*(.3+.665*.035));
    expect(resize).toHaveBeenCalled();
    expect(scrollTo).toHaveBeenCalledWith(state.y, { immediate: true, force: true });
    state.shown=.5; act(() => state.notify?.());
    wheel(); expect(state.y).toBeCloseTo(6000*(.3+.665*.535));
    unmount(); expect(wheel().defaultPrevented).toBe(false);
  });
  it('fails open after a stalled decoder and leaves lower content usable', () => {
    setup(); wheel(); state.now=10001;
    expect(wheel().defaultPrevented).toBe(false);
    state.y=7000; expect(wheel().defaultPrevented).toBe(false);
  });
  it('allows explicit End navigation without fighting the resulting scroll', () => {
    setup(); wheel(); scrollTo.mockClear();
    act(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'End' })));
    state.y=8000;
    act(() => window.dispatchEvent(new Event('scroll')));
    expect(scrollTo).not.toHaveBeenCalled();
  });
});
