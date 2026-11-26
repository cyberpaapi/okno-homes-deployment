"use client";

import { useCallback, useLayoutEffect, useRef, useState, type RefObject } from 'react';

export const testimonialStepDuration = 720;
export const testimonialStepEase = (progress: number) => {
  const t = Math.max(0, Math.min(1, progress));
  return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
type Direction = 'previous' | 'next' | 'first' | 'last' | 'auto';
type Geometry = { base: number; period: number; stops: number[]; enabled: boolean };
const cycleOffset = (value: number, period: number) => {
  const offset = ((value % period) + period) % period;
  // Browser scroll offsets and rectangles may quantize to slightly different
  // subpixels. Do not mistake a settled cycle boundary for its opposite edge.
  return offset < .5 || period - offset < .5 ? 0 : offset;
};

/** Duplicate cycles are visual continuity only; the middle cycle owns semantics.
 * Rebase only between equivalent compositions, never by animating back to zero. */
export function useLoopingTestimonialRail({ rail, identity, count, reducedMotion, suspended, onStart, onEnd, onChange, isHeld }: {
  rail: RefObject<HTMLDivElement | null>; identity: string; count: number;
  reducedMotion: boolean; suspended: boolean; onStart: () => void; onEnd: () => void;
  onChange: () => void; isHeld: () => boolean;
}) {
  const elementRef = useRef<HTMLDivElement | null>(null);
  useLayoutEffect(() => { elementRef.current = rail.current; }, [rail]);
  const [canRotate, setCanRotate] = useState(false);
  const geometry = useRef<Geometry>({ base: 0, period: 0, stops: [], enabled: false });
  const frame = useRef<number | null>(null);
  const settleTimer = useRef<number | undefined>(undefined);
  const callbacks = useRef({ onStart, onEnd, onChange, isHeld });
  useLayoutEffect(() => { callbacks.current = { onStart, onEnd, onChange, isHeld }; });
  const previousIdentity = useRef(identity);

  const normalize = useCallback(() => {
    const element = elementRef.current, g = geometry.current;
    if (!element || !g.enabled || !g.period) return;
    const left = g.base + cycleOffset(element.scrollLeft - g.base, g.period);
    if (Math.abs(left - element.scrollLeft) > .5) element.scrollTo({ left, behavior: 'instant' });
  }, []);

  const cancel = useCallback(() => {
    if (frame.current === null) return;
    cancelAnimationFrame(frame.current);
    frame.current = null;
    if (elementRef.current) delete elementRef.current.dataset.testimonialAnimating;
    callbacks.current.onEnd();
  }, []);

  useLayoutEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    const measure = () => {
      cancel();
      const cards = Array.from(element.querySelectorAll<HTMLElement>('[data-testimonial-card="original"]'));
      const old = geometry.current;
      const changed = previousIdentity.current !== identity;
      const phase = !changed && old.enabled && old.period ? cycleOffset(element.scrollLeft - old.base, old.period) / old.period : 0;
      const first = cards[0], last = cards.at(-1);
      const firstRect = first?.getBoundingClientRect(), lastRect = last?.getBoundingClientRect();
      const hasLayout = Boolean(firstRect?.width && lastRect?.width);
      const step = cards.length > 1 ? hasLayout ? cards[1].getBoundingClientRect().left - firstRect!.left : cards[1].offsetLeft - first.offsetLeft : 0;
      const gap = Number.parseFloat(getComputedStyle(element.firstElementChild!).columnGap) || 0;
      const cardWidth = lastRect?.width || last?.offsetWidth || Math.max(0, step - gap);
      const width = hasLayout ? lastRect!.right - firstRect!.left : first && last ? last.offsetLeft - first.offsetLeft + cardWidth : 0;
      const enabled = count > 1 && step > 0 && width > element.clientWidth + 2;
      // Re-read after display changes: CSS grid widths are fractional, whereas
      // offsetLeft rounds independently and accumulates an error at the seam.
      element.dataset.testimonialLoop = String(enabled);
      const visibleFirst = first?.getBoundingClientRect();
      const nextCycle = element.querySelector<HTMLElement>('[data-testimonial-cycle="after"]')?.getBoundingClientRect();
      const precise = enabled && Boolean(visibleFirst?.width && nextCycle?.width);
      const base = enabled ? precise ? visibleFirst!.left - element.getBoundingClientRect().left + element.scrollLeft : first.offsetLeft : 0;
      const period = enabled ? precise ? nextCycle!.left - visibleFirst!.left : step * count : 0;
      const stops = enabled ? cards.map(card => precise ? card.getBoundingClientRect().left - visibleFirst!.left : card.offsetLeft - first.offsetLeft) : [];
      geometry.current = { base, period, stops, enabled };
      const left = enabled ? base + phase * period : 0;
      if (Math.abs(element.scrollLeft - left) > .5) element.scrollTo({ left, behavior: 'instant' });
      setCanRotate(enabled);
      if (changed) {
        previousIdentity.current = identity;
        callbacks.current.onChange();
      }
    };
    const onScroll = () => {
      if (frame.current !== null) return;
      window.clearTimeout(settleTimer.current);
      settleTimer.current = window.setTimeout(() => {
        if (!callbacks.current.isHeld()) normalize();
      }, 180);
    };
    const onVisibility = () => { if (document.hidden) cancel(); };
    measure();
    element.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure, { passive: true });
    window.addEventListener('pointerdown', cancel, { passive: true, capture: true });
    window.addEventListener('wheel', cancel, { passive: true, capture: true });
    window.addEventListener('keydown', cancel, true);
    window.addEventListener('pointerup', onScroll, { passive: true });
    window.addEventListener('pointercancel', onScroll, { passive: true });
    window.addEventListener('blur', onScroll);
    document.addEventListener('visibilitychange', onVisibility);
    const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(measure);
    observer?.observe(element);
    if (element.firstElementChild) observer?.observe(element.firstElementChild);
    return () => {
      cancel();
      window.clearTimeout(settleTimer.current);
      element.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', measure);
      window.removeEventListener('pointerdown', cancel, true);
      window.removeEventListener('wheel', cancel, true);
      window.removeEventListener('keydown', cancel, true);
      window.removeEventListener('pointerup', onScroll);
      window.removeEventListener('pointercancel', onScroll);
      window.removeEventListener('blur', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);
      observer?.disconnect();
    };
  }, [rail, identity, count, cancel, normalize]);

  useLayoutEffect(() => { if (suspended || reducedMotion) cancel(); }, [suspended, reducedMotion, cancel]);

  const move = useCallback((direction: Direction) => {
    const element = elementRef.current, g = geometry.current;
    if (!element || !g.enabled) return;
    cancel();
    normalize();
    const from = element.scrollLeft;
    const logical = cycleOffset(from - g.base, g.period);
    let to = g.base;
    if (direction === 'last') to += g.stops.at(-1) ?? 0;
    if (direction === 'next' || direction === 'auto') to += g.stops.find(stop => stop > logical + .5) ?? g.period;
    if (direction === 'previous') to += [...g.stops].reverse().find(stop => stop < logical - .5) ?? (g.stops.at(-1) ?? 0) - g.period;
    if (Math.abs(to - from) < .5) return;
    if (reducedMotion) {
      element.scrollTo({ left: to, behavior: 'instant' });
      normalize();
      return;
    }
    callbacks.current.onStart();
    element.dataset.testimonialAnimating = 'true';
    const started = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, Math.max(0, (now - started) / testimonialStepDuration));
      element.scrollTo({ left: from + (to - from) * testimonialStepEase(progress), behavior: 'instant' });
      if (progress < 1) frame.current = requestAnimationFrame(tick);
      else {
        frame.current = null;
        normalize();
        delete element.dataset.testimonialAnimating;
        callbacks.current.onEnd();
      }
    };
    frame.current = requestAnimationFrame(tick);
  }, [reducedMotion, cancel, normalize]);

  return { canRotate, move, cancel };
}
