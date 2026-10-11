'use client';

import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';
import { useLenis } from 'lenis/react';
import { captureHeroPosition, HERO_POSITION_KEY, heroRestoreY, readHeroPosition } from '@/lib/heroReloadPosition';

export function useHeroReloadPosition(heroRef: RefObject<HTMLElement | null>) {
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  const restoreRef = useRef<(() => void) | null>(null);
  useLayoutEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const path = location.pathname + location.search;
    const previousRestoration = document.documentElement.dataset.v1Restoration;
    const position = readHeroPosition(sessionStorage, path);
    let restoring = Boolean(previousRestoration && position);
    let timer = 0;
    let legacyFrame = 0;
    let legacyPending = !previousRestoration && !position && (performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined)?.type === "reload";
    const save = () => {
      window.clearTimeout(timer); timer = 0;
      try { sessionStorage.setItem(HERO_POSITION_KEY, JSON.stringify(captureHeroPosition(hero, path))); } catch { /* Private browsing may disable storage. */ }
    };
    const restore = () => {
      if (!restoring || !position) return;
      const section = position.section ? document.getElementById(position.section) : null;
      const y = heroRestoreY(position, section ? section.getBoundingClientRect().top + window.scrollY : undefined);
      if (lenisRef.current) { lenisRef.current.resize(); lenisRef.current.scrollTo(y, { immediate: true, force: true }); }
      else window.scrollTo(0, y);
    };
    restoreRef.current = restoring ? restore : null;
    restore();
    // The horizontal Timeline measures its height after hydration. Keep the
    // original anchor/offset through that layout change, then yield to the user.
    const observer = restoring && typeof ResizeObserver !== "undefined" ? new ResizeObserver(restore) : null;
    if (restoring && hero.parentElement) observer?.observe(hero.parentElement);
    const finish = () => { restoring = false; observer?.disconnect(); restoreRef.current = null; save(); };
    const settling = restoring ? window.setTimeout(finish, 2000) : 0;
    if (restoring) void document.fonts?.ready.then(restore);
    const scroll = () => { if (!restoring && !timer) timer = window.setTimeout(save, 200); };
    const input = () => { legacyPending = false; if (restoring) finish(); };
    const restoreLegacy = () => {
      legacyFrame = requestAnimationFrame(() => {
        legacyFrame = requestAnimationFrame(() => {
          if (!legacyPending) return;
          legacyPending = false;
          // First reload after this release has no V1 snapshot. Let native
          // restoration finish, then classify its position in the actual V1 DOM.
          const current = captureHeroPosition(hero, path);
          const y = current.zone === 'hero' ? 0 : window.scrollY;
          if (lenisRef.current) { lenisRef.current.resize(); lenisRef.current.scrollTo(y, { immediate: true, force: true }); }
          else window.scrollTo(0, y);
          save();
        });
      });
    };
    if (legacyPending) {
      if (document.readyState === 'complete') restoreLegacy();
      else window.addEventListener('load', restoreLegacy, { once: true });
    }
    window.addEventListener('scroll', scroll, { passive: true });
    window.addEventListener('pagehide', save);
    window.addEventListener('beforeunload', save);
    window.addEventListener('wheel', input, { passive: true });
    window.addEventListener('touchstart', input, { passive: true });
    window.addEventListener('keydown', input);
    window.addEventListener('pointerdown', input, { passive: true });
    if (!restoring) save();
    return () => {
      window.clearTimeout(timer); window.clearTimeout(settling);
      legacyPending = false; cancelAnimationFrame(legacyFrame);
      window.removeEventListener("load", restoreLegacy);
      restoring = false; observer?.disconnect(); restoreRef.current = null;
      window.removeEventListener('scroll', scroll);
      window.removeEventListener('pagehide', save);
      window.removeEventListener('beforeunload', save);
      window.removeEventListener('wheel', input);
      window.removeEventListener('touchstart', input);
      window.removeEventListener('keydown', input);
      window.removeEventListener('pointerdown', input);
      if (previousRestoration === 'auto' || previousRestoration === 'manual') {
        history.scrollRestoration = previousRestoration;
        delete document.documentElement.dataset.v1Restoration;
      }
    };
  }, [heroRef]);
  useEffect(() => {
    lenisRef.current = lenis;
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        if (restoreRef.current) restoreRef.current();
        else lenis?.scrollTo(window.scrollY, { immediate: true, force: true });
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [lenis]);
}
