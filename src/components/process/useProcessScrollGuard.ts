'use client';

import { useEffect, type RefObject } from 'react';
import type { MotionValue } from 'motion/react';
import { limitProcessScroll, wheelPixels } from '@/lib/processScrollGuard';
import { processFilmProgress } from '@/lib/processScrub';

/** Local guard, not a document scroll lock. Explicit Home/End, links and
 * history restoration stay native; unsupported/stalled media fail open. */
export default function useProcessScrollGuard(
  track: RefObject<HTMLElement | null>, shown: MotionValue<number>,
  kind: 'film' | 'timeline' = 'film', enabled = true,
) {
  useEffect(() => {
    if (!enabled || !track.current) return;
    const element = track.current;
    let lastY = window.scrollY;
    let armed = false;
    let touchY = 0;
    let stalledSince = 0;
    let bypassUntil = 0;
    element.setAttribute('data-presented-progress', String(shown.get()));
    const unsubscribe = shown.on('change', value => {
      stalledSince = 0;
      element.setAttribute('data-presented-progress', String(value));
    });
    const nested = (target: EventTarget | null) => target instanceof Element && !!target.closest('a, button, input, textarea, select, [contenteditable="true"], [role="dialog"], nav');
    const constrain = (current: number, requested: number) => {
      // Escape a stalled source rather than trapping the visitor on a film.
      if (performance.now() < bypassUntil) return requested;
      // Short mobile/reduced-motion CSS uses an ordinary vertical document,
      // not a pinned sequence. Follow that layout rather than constraining it.
      if (kind === 'timeline' && element.firstElementChild && getComputedStyle(element.firstElementChild).position !== 'sticky') return requested;
      const rect = element.getBoundingClientRect();
      const start = rect.top + window.scrollY;
      const span = element.offsetHeight - window.innerHeight;
      if (span <= 0) return requested;
      const expectedAt = (position: number) => {
        const raw = Math.min(1, Math.max(0, (position - start) / span));
        return kind === 'film' ? processFilmProgress(raw) : Math.round(raw * 4) / 4;
      };
      // Reading a settled phase is not a decoder stall. Only keep the escape
      // clock while the current scroll position requests unpresented content.
      if (Math.abs(expectedAt(current) - shown.get()) < .004) stalledSince = 0;
      if (stalledSince && performance.now() - stalledSince > 8000) return requested;
      // The nearest sequence owns a crossing gesture. The lower timeline
      // must not intercept a gesture starting in the film, or vice versa.
      const route = element.closest('[data-route="process"]');
      if (kind === 'timeline' && requested > current && current < start) {
        const film = route?.querySelector<HTMLElement>('[data-playback="scroll"]');
        if (film && Number(film.dataset.presentedProgress ?? 0) < .993) return requested;
      }
      if (kind === 'film' && requested < current && current > start + element.offsetHeight) {
        const timeline = route?.querySelector<HTMLElement>('[data-process-detail-timeline]');
        if (timeline && Number(timeline.dataset.presentedProgress ?? 0) > .003) return requested;
      }
      const allowed = limitProcessScroll(current, requested, start, span, shown.get(), kind);
      if (Math.abs(allowed - requested) > .5 && !stalledSince && Math.abs(expectedAt(allowed) - shown.get()) >= .004) stalledSince = performance.now();
      return allowed;
    };
    const move = (delta: number, event: Event) => {
      armed = true;
      lastY = window.scrollY;
      const requested = lastY + delta;
      const allowed = constrain(lastY, requested);
      if (Math.abs(allowed - requested) > .5 && event.cancelable) {
        event.preventDefault();
        window.scrollTo({ top: allowed, behavior: 'instant' });
        lastY = allowed;
      }
    };
    const wheel = (event: WheelEvent) => {
      if (event.defaultPrevented || event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY) || nested(event.target)) return;
      bypassUntil = 0;
      move(wheelPixels(event.deltaY, event.deltaMode, window.innerHeight), event);
    };
    const touchStart = (event: TouchEvent) => {
      armed = event.touches.length === 1 && !nested(event.target);
      if (!armed) return;
      bypassUntil = 0;
      touchY = event.touches[0].clientY;
      lastY = window.scrollY;
    };
    const touchMove = (event: TouchEvent) => {
      if (event.defaultPrevented || !armed || event.touches.length !== 1) return;
      const next = event.touches[0].clientY;
      move(touchY - next, event);
      touchY = next;
    };
    const key = (event: KeyboardEvent) => {
      if (event.defaultPrevented || nested(event.target) || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === 'Home' || event.key === 'End' || event.key === 'Escape') {
        armed = false;
        bypassUntil = performance.now() + 1000;
        return;
      }
      const delta = event.key === 'ArrowDown' ? 40 : event.key === 'ArrowUp' ? -40
        : event.key === 'PageDown' || (event.key === ' ' && !event.shiftKey) ? window.innerHeight * .9
          : event.key === 'PageUp' || (event.key === ' ' && event.shiftKey) ? -window.innerHeight * .9 : 0;
      if (delta) { bypassUntil = 0; move(delta, event); }
    };
    const scroll = () => {
      const requested = window.scrollY;
      const allowed = armed ? constrain(lastY, requested) : requested;
      lastY = allowed;
      if (Math.abs(allowed - requested) > .5) window.scrollTo({ top: allowed, behavior: 'instant' });
    };
    const pointer = (event: PointerEvent) => {
      // Includes scrollbar dragging without interfering with links or forms.
      if (event.clientX >= document.documentElement.clientWidth) {
        armed = true; bypassUntil = 0; lastY = window.scrollY;
      } else if (nested(event.target)) armed = false;
    };
    window.addEventListener('wheel', wheel, { passive: false });
    window.addEventListener('touchstart', touchStart, { passive: true });
    window.addEventListener('touchmove', touchMove, { passive: false });
    window.addEventListener('keydown', key);
    window.addEventListener('scroll', scroll, { passive: true });
    window.addEventListener('pointerdown', pointer, { passive: true });
    return () => {
      unsubscribe();
      element.removeAttribute('data-presented-progress');
      window.removeEventListener('wheel', wheel);
      window.removeEventListener('touchstart', touchStart);
      window.removeEventListener('touchmove', touchMove);
      window.removeEventListener('keydown', key);
      window.removeEventListener('scroll', scroll);
      window.removeEventListener('pointerdown', pointer);
    };
  }, [track, shown, kind, enabled]);
}
