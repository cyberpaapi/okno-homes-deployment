'use client';

import { useEffect, type RefObject } from 'react';
import type { MotionValue } from 'motion/react';
import { useLenis } from 'lenis/react';
import { heroFilmProgress, limitHeroFilmScroll } from '@/lib/heroFilmScroll';
import { wheelPixels } from '@/lib/processScrollGuard';

export default function useHeroFilmScrollGuard(track: RefObject<HTMLElement | null>, shown: MotionValue<number>, enabled: boolean) {
  const lenis = useLenis();
  useEffect(() => {
    if (!enabled || !track.current) return;
    const element = track.current;
    let armed = false, lastY = window.scrollY, touchY = 0, stalledSince = 0, bypassUntil = 0;
    const interactive = (target: EventTarget | null) => target instanceof Element && !!target.closest('a,button,input,textarea,select,[contenteditable="true"],[role="dialog"],nav');
    const moveTo = (top: number) => {
      if (lenis) { lenis.resize(); lenis.scrollTo(top, { immediate: true, force: true }); }
      else window.scrollTo({ top, behavior: 'instant' });
    };
    const constrain = (current: number, requested: number) => {
      if (performance.now() < bypassUntil) return requested;
      const rect = element.getBoundingClientRect();
      const start = rect.top + window.scrollY, span = element.offsetHeight - window.innerHeight;
      if (span <= 0) return requested;
      if (Math.abs(heroFilmProgress((current-start)/span) - shown.get()) < .002) stalledSince = 0;
      if (stalledSince && performance.now()-stalledSince > 8000) return requested;
      const allowed = limitHeroFilmScroll(current, requested, start, span, shown.get());
      if (Math.abs(allowed-requested) > .5 && !stalledSince) stalledSince = performance.now();
      return allowed;
    };
    const move = (delta: number, event: Event) => {
      armed = true; lastY = window.scrollY;
      const requested = lastY + delta, allowed = constrain(lastY, requested);
      if (Math.abs(allowed-requested) > .5 && event.cancelable) {
        event.preventDefault();
        (event as Event & { lenisStopPropagation?: boolean }).lenisStopPropagation = true;
        moveTo(allowed); lastY = allowed;
      }
    };
    const wheel = (event: WheelEvent) => {
      if (event.defaultPrevented || event.ctrlKey || Math.abs(event.deltaX)>Math.abs(event.deltaY) || interactive(event.target)) return;
      bypassUntil = 0; move(wheelPixels(event.deltaY,event.deltaMode,window.innerHeight),event);
    };
    const touchStart = (event: TouchEvent) => {
      armed = event.touches.length === 1 && !interactive(event.target);
      if (armed) { bypassUntil = 0; touchY = event.touches[0].clientY; lastY = window.scrollY; }
    };
    const touchMove = (event: TouchEvent) => {
      if (!armed || event.defaultPrevented || event.touches.length !== 1) return;
      const next = event.touches[0].clientY; move(touchY-next,event); touchY = next;
    };
    const key = (event: KeyboardEvent) => {
      if (event.defaultPrevented || interactive(event.target) || event.metaKey || event.ctrlKey || event.altKey) return;
      if (['Home','End','Escape'].includes(event.key)) { armed = false; bypassUntil = performance.now()+1000; return; }
      const delta = event.key === 'ArrowDown' ? 40 : event.key === 'ArrowUp' ? -40
        : event.key === 'PageDown' || event.key === ' ' && !event.shiftKey ? window.innerHeight*.9
          : event.key === 'PageUp' || event.key === ' ' && event.shiftKey ? -window.innerHeight*.9 : 0;
      if (delta) { bypassUntil = 0; move(delta,event); }
    };
    const scroll = () => {
      const requested = window.scrollY, allowed = armed ? constrain(lastY,requested) : requested;
      lastY = allowed; if (Math.abs(allowed-requested)>.5) moveTo(allowed);
    };
    const pointer = (event: PointerEvent) => {
      if (event.clientX >= document.documentElement.clientWidth) { armed = true; bypassUntil = 0; lastY = window.scrollY; }
      else if (interactive(event.target)) armed = false;
    };
    const unsubscribe = shown.on('change', () => { stalledSince = 0; });
    window.addEventListener('wheel',wheel,{passive:false,capture:true});
    window.addEventListener('touchstart',touchStart,{passive:true});
    window.addEventListener('touchmove',touchMove,{passive:false,capture:true});
    window.addEventListener('keydown',key,{capture:true});
    window.addEventListener('scroll',scroll,{passive:true});
    window.addEventListener('pointerdown',pointer,{passive:true});
    return () => {
      unsubscribe();
      window.removeEventListener('wheel',wheel,true); window.removeEventListener('touchstart',touchStart);
      window.removeEventListener('touchmove',touchMove,true); window.removeEventListener('keydown',key,true);
      window.removeEventListener('scroll',scroll); window.removeEventListener('pointerdown',pointer);
    };
  }, [track,shown,enabled,lenis]);
}
