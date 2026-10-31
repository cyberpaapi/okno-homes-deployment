'use client';

import { useEffect, type RefObject } from 'react';
import { useLenis } from 'lenis/react';
import type { MotionValue } from 'motion/react';
import { HERO_FILM_EXIT } from '@/lib/heroFilmScroll';

/** Only the handoff is gated. Keep the full input distance and release it once
 * the actual window frame has painted, rather than running the film offscreen. */
export function useHeroFilmExit(section: RefObject<HTMLElement | null>, shown: MotionValue<number>, enabled: boolean) {
  const lenis = useLenis();
  useEffect(() => {
    const hero = section.current;
    if (!enabled || !hero) return;
    let previousY = window.scrollY;
    let pendingY: number | null = null;
    let release = 0, paint = 0;
    const boundary = () => hero.getBoundingClientRect().top + window.scrollY + (hero.offsetHeight - window.innerHeight) * HERO_FILM_EXIT;
    const move = (y: number, immediate: boolean) => {
      if (lenis) lenis.scrollTo(y, { immediate, force: true });
      else window.scrollTo(0, y);
    };
    const clear = () => {
      window.clearTimeout(release); cancelAnimationFrame(paint);
      release = 0; paint = 0;
      hero.removeAttribute('data-film-exit-pending');
    };
    const finish = () => {
      if (document.body.style.overflow === 'hidden' || pendingY === null || (shown.get() < 1) || release || paint) return;
      // Let the endpoint and its matching still render before moving the page.
      paint = requestAnimationFrame(() => {
        paint = requestAnimationFrame(() => {
          paint = 0;
          release = window.setTimeout(() => {
            release = 0;
            if (document.body.style.overflow === 'hidden') return;
            const y = pendingY;
            pendingY = null; clear();
            if (y !== null) { previousY = y; move(y, false); }
          }, 120);
        });
      });
    };
    const check = () => {
      if (document.body.style.overflow === 'hidden') return;
      const y = window.scrollY, end = boundary();
      if (pendingY !== null) {
        if (y < end - 3) { pendingY = null; clear(); }
        else if (y > end + 1) {
          pendingY = Math.max(pendingY, y, lenis?.targetScroll ?? y);
          move(end, true);
        }
      } else if (previousY <= end && y > end && shown.get() < 1) {
        pendingY = Math.max(y, lenis?.targetScroll ?? y);
        hero.setAttribute('data-film-exit-pending', 'true');
        move(end, true);
        // Loading/failure is handled at the opening. Never replace a slow
        // frame with an ending still just because a two-second timer elapsed.
        finish();
      }
      previousY = Math.min(y, pendingY === null ? y : end);
    };
    const wheel = (event: WheelEvent) => {
      if (document.body.style.overflow === 'hidden' || pendingY === null || event.ctrlKey) return;
      if (event.deltaY < 0) { pendingY = null; clear(); return; }
      if (event.deltaY > 0) {
        const unit = event.deltaMode === 2 ? window.innerHeight : event.deltaMode === 1 ? 16 : 1;
        pendingY += event.deltaY * unit;
        event.preventDefault();
      }
    };
    const unsubscribe = shown.on('change', finish);
    const key = (event: KeyboardEvent) => {
      if (document.body.style.overflow === 'hidden' || event.key !== 'Home' || (event.target instanceof Element && event.target.closest('input,textarea,select,[contenteditable]'))) return;
      // Native Home must supersede a still-running wheel animation; otherwise
      // its next Lenis tick can pull the document back down again.
      if (lenis) { pendingY = null; clear(); lenis.scrollTo(0,{immediate:true,force:true}); }
    };
    const lockObserver = new MutationObserver(finish);
    lockObserver.observe(document.body, { attributes: true, attributeFilter: ['style'] });
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('wheel', wheel, { passive: false, capture: true });
    window.addEventListener('keydown',key);
    lenis?.on('scroll', check);
    return () => {
      lockObserver.disconnect(); clear(); unsubscribe(); lenis?.off('scroll', check);
      window.removeEventListener('scroll', check);
      window.removeEventListener('wheel', wheel, true);
      window.removeEventListener('keydown',key);
    };
  }, [section, shown, enabled, lenis]);
}
