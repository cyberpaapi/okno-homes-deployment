"use client";

import { useEffect, useRef } from "react";
import styles from "./LandingCursor.module.css";

const CONTROL = '[data-landing-magnetic], [data-cursor-media-action], header a, header button, nav a, nav button, a, button, [role="button"]';
const NATIVE = 'input, textarea, select, option, iframe, [contenteditable="true"], [data-cursor-native]';
const SIZE = 16;

export default function LandingCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let enabled = fine.matches && !reduced.matches;
    let shown = false;
    let interactive = false;
    let raf = 0;
    let pointer = { x: -100, y: -100 };
    let current = { ...pointer };

    const hide = () => {
      shown = false;
      cursor.style.opacity = '0';
      cursor.dataset.mode = 'hidden';
      cursor.dataset.visible = 'false';
      document.documentElement.removeAttribute('data-landing-cursor');
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const frame = () => {
      raf = 0;
      if (!shown || !enabled) return;
      current.x += (pointer.x - current.x) * .24;
      current.y += (pointer.y - current.y) * .24;
      const scale = interactive ? 1.45 : 1;
      cursor.style.transform = `translate3d(${current.x - SIZE / 2}px, ${current.y - SIZE / 2}px, 0) scale(${scale})`;
      if (Math.hypot(pointer.x - current.x, pointer.y - current.y) > .08) raf = requestAnimationFrame(frame);
    };

    const schedule = () => {
      if (!raf && shown && enabled) raf = requestAnimationFrame(frame);
    };

    const move = (event: Pick<PointerEvent, 'target' | 'pointerType' | 'clientX' | 'clientY'>) => {
      if (!enabled || event.pointerType === 'touch' || event.pointerType === 'pen') {
        hide();
        return;
      }
      const node = event.target instanceof Element ? event.target : null;
      if (!node || node.closest(NATIVE)) {
        hide();
        return;
      }

      pointer = { x: event.clientX, y: event.clientY };
      interactive = Boolean(node.closest(CONTROL));
      cursor.dataset.mode = interactive ? 'interactive' : 'fluid';
      cursor.dataset.visible = 'true';
      if (!shown) {
        current = { ...pointer };
        shown = true;
      }
      cursor.style.opacity = '1';
      document.documentElement.setAttribute('data-landing-cursor', 'true');
      schedule();
    };

    const updateAvailability = () => {
      enabled = fine.matches && !reduced.matches;
      if (!enabled) hide();
    };
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === 'Tab' || event.key === 'Escape') hide();
    };
    const leave = () => hide();
    const scroll = () => {
      if (!shown) return;
      const node = document.elementFromPoint(pointer.x, pointer.y);
      if (!node) leave();
      else move({ target: node, pointerType: 'mouse', clientX: pointer.x, clientY: pointer.y });
    };

    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('keydown', keyboard);
    window.addEventListener('scroll', scroll, { passive: true, capture: true });
    window.addEventListener('blur', leave);
    document.addEventListener('mouseleave', leave);
    fine.addEventListener('change', updateAvailability);
    reduced.addEventListener('change', updateAvailability);
    return () => {
      hide();
      window.removeEventListener('pointermove', move);
      window.removeEventListener('keydown', keyboard);
      window.removeEventListener('scroll', scroll, true);
      window.removeEventListener('blur', leave);
      document.removeEventListener('mouseleave', leave);
      fine.removeEventListener('change', updateAvailability);
      reduced.removeEventListener('change', updateAvailability);
    };
  }, []);

  return <div ref={cursorRef} className={styles.cursor} aria-hidden="true" data-testid="landing-cursor" data-mode="hidden" />;
}
