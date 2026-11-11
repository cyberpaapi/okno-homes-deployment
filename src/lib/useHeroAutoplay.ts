'use client';

import { useEffect, type RefObject } from 'react';
import { useLenis } from 'lenis/react';

/** Idle time after wheel, touch, key or manual scroll before the film resumes by itself. */
export const HERO_AUTOPLAY_IDLE_MS = 1100;

/**
 * Client feedback (11 November 2026): the opening film plays by itself, scrolling
 * forward overtakes it and scrolling back reverses it. Playback advances the
 * document through the hero's scroll range at 1x, so scroll stays the single
 * source of truth for the frame and the page hands straight to the next section.
 */
export function useHeroAutoplay(target: RefObject<HTMLElement | null>, enabled: boolean, durationSeconds: () => number) {
  const lenis = useLenis();
  useEffect(() => {
    if (!enabled) return;
    let frame = 0;
    let previous = performance.now();
    let lastUser = -Infinity;
    let position = window.scrollY;
    let expected = window.scrollY;
    const user = () => { lastUser = performance.now(); };
    const scrolled = () => {
      if (Math.abs(window.scrollY - expected) > 2) { lastUser = performance.now(); position = window.scrollY; expected = window.scrollY; }
    };
    const tick = (now: number) => {
      const elapsed = Math.min(64, now - previous) / 1000;
      previous = now;
      const hero = target.current;
      const length = hero ? hero.offsetHeight - window.innerHeight : 0;
      const start = hero ? hero.getBoundingClientRect().top + window.scrollY : 0;
      const y = window.scrollY;
      const blocked = document.body.style.overflow === 'hidden' || document.documentElement.dataset.heroLoading === 'true' || Boolean(document.querySelector('[role="dialog"]'));
      if (length > 0 && !blocked && now - lastUser > HERO_AUTOPLAY_IDLE_MS && y >= start - 1 && y < start + length - 1) {
        if (Math.abs(y - position) > 2) position = y;
        position = Math.min(start + length, position + (length / Math.max(1, durationSeconds())) * elapsed);
        const next = Math.round(position);
        if (next !== Math.round(y)) {
          expected = next;
          if (lenis) lenis.scrollTo(next, { immediate: true, force: true });
          else window.scrollTo(0, next);
        }
      } else {
        position = y;
      }
      frame = requestAnimationFrame(tick);
    };
    const passive = { passive: true } as const;
    window.addEventListener('wheel', user, passive);
    window.addEventListener('touchstart', user, passive);
    window.addEventListener('touchmove', user, passive);
    window.addEventListener('pointerdown', user, passive);
    window.addEventListener('keydown', user);
    window.addEventListener('scroll', scrolled, passive);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('wheel', user);
      window.removeEventListener('touchstart', user);
      window.removeEventListener('touchmove', user);
      window.removeEventListener('pointerdown', user);
      window.removeEventListener('keydown', user);
      window.removeEventListener('scroll', scrolled);
    };
  }, [target, enabled, durationSeconds, lenis]);
}
