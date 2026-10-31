'use client';

import { useLayoutEffect } from 'react';

/** Keep wheel, touch, keyboard, anchors and queued scroll at the opening. */
export function useHeroLoadingLock(locked: boolean) {
  useLayoutEffect(() => {
    if (!locked) return;
    const root = document.documentElement;
    root.dataset.heroLoading = 'true';
    const hold = () => { if (window.scrollY !== 0) window.scrollTo(0, 0); };
    const block = (event: Event) => {
      if (event.target instanceof Element && event.target.closest('[role="dialog"]')) return;
      event.preventDefault();
    };
    const key = (event: KeyboardEvent) => {
      if (event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable="true"], button, a')) return;
      if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) block(event);
    };
    hold();
    window.addEventListener('wheel', block, { passive: false, capture: true });
    window.addEventListener('touchmove', block, { passive: false, capture: true });
    window.addEventListener('keydown', key, true);
    window.addEventListener('scroll', hold);
    return () => {
      delete root.dataset.heroLoading;
      window.removeEventListener('wheel', block, true);
      window.removeEventListener('touchmove', block, true);
      window.removeEventListener('keydown', key, true);
      window.removeEventListener('scroll', hold);
    };
  }, [locked]);
}
