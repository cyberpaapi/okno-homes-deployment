import { act, fireEvent, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { testimonialStepDuration, testimonialStepEase, useLoopingTestimonialRail } from './useLoopingTestimonialRail';

let element: HTMLDivElement, now: number, nextFrame: number, viewport: number;
let frames: Map<number, FrameRequestCallback>;
let resize: () => void;
const positions: number[] = [];
const start = vi.fn(), end = vi.fn(), change = vi.fn();
let held = false;
function cards(count: number) {
  element.innerHTML = `<ul>${(count > 1 ? ['before', 'original', 'after'] : ['original']).flatMap(cycle => Array.from({ length: count }, (_, i) => `<li data-testimonial-card="${cycle === 'original' ? 'original' : 'clone'}" data-testimonial-cycle="${cycle}" data-index="${i}"></li>`)).join('')}</ul>`;
}
function tick(milliseconds: number) {
  now += milliseconds;
  act(() => { const active = [...frames.values()]; frames.clear(); active.forEach(callback => callback(now)); });
}
function setup(count = 6) {
  cards(count);
  return renderHook(({ identity = 'reviews', count, reducedMotion = false, suspended = false }) => useLoopingTestimonialRail({
    rail: { current: element }, identity, count, reducedMotion, suspended,
    onStart: start, onEnd: end, onChange: change, isHeld: () => held,
  }), { initialProps: { identity: 'reviews', count, reducedMotion: false, suspended: false } });
}
beforeEach(() => {
  vi.useFakeTimers(); now = 0; nextFrame = 0; viewport = 640; frames = new Map(); held = false; positions.length = 0;
  start.mockClear(); end.mockClear(); change.mockClear(); resize = () => {};
  element = document.createElement('div'); document.body.append(element);
  vi.spyOn(performance, 'now').mockImplementation(() => now);
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { frames.set(++nextFrame, callback); return nextFrame; });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id));
  vi.stubGlobal('ResizeObserver', class { constructor(callback: () => void) { resize = callback; } observe() {} disconnect() {} });
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(() => viewport);
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(() => 300);
  vi.spyOn(HTMLElement.prototype, 'offsetLeft', 'get').mockImplementation(function(this: HTMLElement) {
    const children = [...this.parentElement?.children ?? []].filter(child => element.dataset.testimonialLoop === 'true' || child.getAttribute('data-testimonial-card') === 'original');
    return Math.max(0, children.indexOf(this)) * 320;
  });
  Object.defineProperty(element, 'scrollTo', { configurable: true, value: ({ left }: ScrollToOptions) => {
    element.scrollLeft = left ?? 0; positions.push(element.scrollLeft); fireEvent.scroll(element);
  } });
});
afterEach(() => { element.remove(); vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers(); });

describe('looping testimonial motion', () => {
  it('accelerates from rest and decelerates into the next card over720ms', () => {
    const { result } = setup(); positions.length = 0;
    expect(result.current.canRotate).toBe(true); expect(element.scrollLeft).toBe(1920);
    act(() => result.current.move('auto'));
    tick(180); expect(element.scrollLeft).toBe(1940);
    tick(180); expect(element.scrollLeft).toBe(2080);
    tick(180); expect(element.scrollLeft).toBe(2220);
    tick(180); expect(element.scrollLeft).toBe(2240);
    expect(positions).toEqual([1940, 2080, 2220, 2240]);
    expect(start).toHaveBeenCalledOnce(); expect(end).toHaveBeenCalledOnce();
    expect(element).not.toHaveAttribute('data-testimonial-animating'); expect(frames.size).toBe(0);
    expect(testimonialStepEase(-1)).toBe(0); expect(testimonialStepEase(2)).toBe(1);
  });
  it('advances forward through twelve steps and rebases only an equivalent complete cycle', () => {
    const { result } = setup();
    for (let step = 0; step < 12; step++) {
      positions.length = 0;
      const from = element.scrollLeft;
      act(() => result.current.move('auto')); tick(360); tick(360);
      expect(positions[0]).toBeGreaterThan(from);
      expect(positions[1]).toBeGreaterThan(positions[0]);
      if ((step + 1) % 6 === 0) {
        expect(positions).toEqual([3680, 3840, 1920]);
        expect((positions[1] - positions[2]) / 320).toBe(6);
      } else expect(positions).toHaveLength(2);
      expect(element.scrollLeft).toBe(1920 + ((step + 1) % 6) * 320);
    }
  });
  it('wraps previous from the first review without animated travel through the whole set', () => {
    const { result } = setup(); positions.length = 0;
    act(() => result.current.move('previous')); tick(360); tick(360);
    expect(positions).toEqual([1760, 1600, 3520]);
  });
  it('keeps fractional grid seams equivalent across quantized writes, repeated loops and resize', () => {
    viewport = 768;
    let pitch = 323.1562601666667;
    const x = 17.25;
    const visibleCards = (card: HTMLElement) => [...card.parentElement?.children ?? []].filter(child => element.dataset.testimonialLoop === 'true' || child.getAttribute('data-testimonial-card') === 'original');
    vi.spyOn(HTMLElement.prototype, 'offsetLeft', 'get').mockImplementation(function(this: HTMLElement) {
      return Math.round(Math.max(0, visibleCards(this).indexOf(this)) * pitch);
    });
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function(this: HTMLElement) {
      if (this === element) return new DOMRect(x, 0, viewport, 200);
      if (!this.hasAttribute('data-testimonial-card') || (element.dataset.testimonialLoop !== 'true' && this.dataset.testimonialCard === 'clone')) return new DOMRect();
      const index = visibleCards(this).indexOf(this);
      return new DOMRect(x + index * pitch - element.scrollLeft, 0, pitch - 24, 200);
    });
    const compositions: { original: number; after: number }[] = [];
    Object.defineProperty(element, 'scrollTo', { configurable: true, value: ({ left }: ScrollToOptions) => {
      element.scrollLeft = Math.round((left ?? 0) * 64) / 64;
      positions.push(element.scrollLeft);
      compositions.push({
        original: element.querySelector<HTMLElement>('[data-testimonial-cycle="original"]')!.getBoundingClientRect().left,
        after: element.querySelector<HTMLElement>('[data-testimonial-cycle="after"]')!.getBoundingClientRect().left,
      });
      fireEvent.scroll(element);
    } });
    const { result } = setup();
    expect(element.scrollLeft).toBe(1938.9375);
    // Rounded offsetLeft yields a323px step and1938px cycle, neither is correct.
    expect(element.querySelectorAll<HTMLElement>('[data-testimonial-card="original"]')[1].offsetLeft - element.querySelector<HTMLElement>('[data-testimonial-card="original"]')!.offsetLeft).toBe(323);
    for (const resizing of [false, true]) {
      if (resizing) { pitch = 269.0781351666667; act(() => resize()); }
      for (let step = 0; step < 12; step++) {
        positions.length = 0; compositions.length = 0;
        const from = element.scrollLeft;
        act(() => result.current.move('auto')); tick(360); tick(360);
        expect(positions[0]).toBeGreaterThan(from);
        expect(positions[1]).toBeGreaterThan(positions[0]);
        if ((step + 1) % 6 === 0) {
          expect(positions).toHaveLength(3);
          expect(Math.abs(compositions[1].after - compositions[2].original)).toBeLessThan(1 / 64);
          expect(Math.abs(element.scrollLeft - pitch * 6)).toBeLessThan(1 / 64);
        } else expect(positions).toHaveLength(2);
      }
    }
  });
  it('cancels a partial step for native wheel input and leaves its current composition intact', () => {
    const { result } = setup(); act(() => result.current.move('auto')); tick(180);
    const interrupted = element.scrollLeft;
    fireEvent.wheel(element, { deltaX: 80 }); tick(1000);
    expect(element.scrollLeft).toBe(interrupted); expect(frames.size).toBe(0); expect(end).toHaveBeenCalledOnce();
    expect(fireEvent.wheel(element, { deltaY: 80 })).toBe(true);
  });
  it('normalizes a native swipe after release, not while a finger is held', () => {
    setup(); held = true; element.scrollLeft = 4000; fireEvent.scroll(element);
    act(() => vi.advanceTimersByTime(180)); expect(element.scrollLeft).toBe(4000);
    held = false; fireEvent.pointerUp(window); act(() => vi.advanceTimersByTime(180));
    expect(element.scrollLeft).toBe(2080);
  });
  it('keeps reduced-motion controls instant and turns motion off when suspended', () => {
    const view = setup();
    view.rerender({ identity: 'reviews', count: 6, reducedMotion: true, suspended: false });
    act(() => view.result.current.move('next')); expect(element.scrollLeft).toBe(2240); expect(frames.size).toBe(0);
    view.rerender({ identity: 'reviews', count: 6, reducedMotion: false, suspended: false });
    act(() => view.result.current.move('next')); tick(180);
    const left = element.scrollLeft;
    view.rerender({ identity: 'reviews', count: 6, reducedMotion: false, suspended: true }); tick(1000);
    expect(element.scrollLeft).toBe(left); expect(frames.size).toBe(0);
  });
  it('recalculates on resize, preserves unchanged identity and safely resets shrinking CMS data', () => {
    const view = setup(); act(() => view.result.current.move('next')); tick(testimonialStepDuration);
    view.rerender({ identity: 'reviews', count: 6, reducedMotion: false, suspended: false }); expect(change).not.toHaveBeenCalled();
    expect(element.scrollLeft).toBe(2240);
    viewport = 3000; act(() => resize()); expect(view.result.current.canRotate).toBe(false); expect(element.scrollLeft).toBe(0);
    viewport = 640; act(() => resize()); expect(view.result.current.canRotate).toBe(true);
    cards(1); view.rerender({ identity: 'one', count: 1, reducedMotion: false, suspended: false });
    expect(view.result.current.canRotate).toBe(false); expect(element.scrollLeft).toBe(0); expect(change).toHaveBeenCalledOnce();
    cards(0); view.rerender({ identity: 'empty', count: 0, reducedMotion: false, suspended: false }); expect(element.scrollLeft).toBe(0);
  });
  it('cancels pending frames and normalization timers on unmount', () => {
    const view = setup(); act(() => view.result.current.move('auto')); tick(180); view.unmount(); tick(1000);
    expect(frames.size).toBe(0); expect(vi.getTimerCount()).toBe(0);
  });
});
