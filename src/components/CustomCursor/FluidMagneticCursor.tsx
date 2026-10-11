"use client";

// Performance-focused adaptation of jahed's Fluid Magnetic Cursor,
// retrieved from 21st.dev component 9314. The cursor keeps the source's
// magnetic centre lock and liquid size morph without GSAP's permanent ticker.
import { motion, useMotionValue, useSpring, type MotionStyle } from "motion/react";
import { useEffect, useRef, useState } from "react";
import styles from "./FluidMagneticCursor.module.css";

const DEFAULT_NATIVE = "input,textarea,select,[contenteditable]:not([contenteditable='false']),iframe,video,[data-cursor='native'],[data-cursor='lens']";

function isImageSurface(target: Element | null) {
  if (!target) return false;
  if (target.closest('[data-models-magnetic],[data-cursor-media-action]')) return false;
  if (target.closest("img,picture")) return true;
  const interactive = target.closest("a[href],button,[role='button']");
  return Boolean(interactive?.querySelector("img,picture"));
}

type Props = {
  htmlAttribute: string;
  magneticSelector: string;
  nativeSelector?: string;
  testId?: string;
  color?: string;
  baseSize?: number;
  maxWidth?: number;
  maxHeight?: number;
  onlyOnTargets?: boolean;
};

export function FluidMagneticCursor({
  htmlAttribute,
  magneticSelector,
  nativeSelector = DEFAULT_NATIVE,
  testId,
  color = "#f4fbff",
  baseSize = 25,
  maxWidth = 112,
  maxHeight = 66,
  onlyOnTargets = false,
}: Props) {
  const [enabled, setEnabled] = useState(false);
  const cursor = useRef<HTMLElement>(null);
  const activeElement = useRef<HTMLElement | null>(null);
  const x = useMotionValue(-100), y = useMotionValue(-100);
  const width = useMotionValue(baseSize), height = useMotionValue(baseSize);
  const scale = useMotionValue(1);
  const springX = useSpring(x, { stiffness: 1120, damping: 58, mass: .15 });
  const springY = useSpring(y, { stiffness: 1120, damping: 58, mass: .15 });
  const springWidth = useSpring(width, { stiffness: 720, damping: 45, mass: .18 });
  const springHeight = useSpring(height, { stiffness: 720, damping: 45, mass: .18 });
  const springScale = useSpring(scale, { stiffness: 850, damping: 42, mass: .16 });

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      const nextEnabled = fine.matches && !reduced.matches;
      if (!nextEnabled) {
        document.documentElement.removeAttribute(htmlAttribute);
        document.documentElement.removeAttribute(`${htmlAttribute}-visible`);
      }
      setEnabled(nextEnabled);
    };
    sync(); fine.addEventListener("change", sync); reduced.addEventListener("change", sync);
    return () => { fine.removeEventListener("change", sync); reduced.removeEventListener("change", sync); };
  }, [htmlAttribute]);

  useEffect(() => {
    const node = cursor.current;
    const visibleAttribute = `${htmlAttribute}-visible`;
    if (!enabled || !node) {
      document.documentElement.removeAttribute(htmlAttribute);
      document.documentElement.removeAttribute(visibleAttribute);
      return;
    }
    const resetMagnet = () => {
      activeElement.current = null;
      node.dataset.active = "false";
      width.set(baseSize); height.set(baseSize);
    };
    const hide = () => {
      document.documentElement.removeAttribute(htmlAttribute);
      document.documentElement.removeAttribute(visibleAttribute);
      node.dataset.visible = "false";
      resetMagnet();
    };
    const move = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const candidate = target?.closest(magneticSelector);
      if (onlyOnTargets && !candidate) { hide(); return; }
      const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (!fine.matches || reduced.matches || event.pointerType !== "mouse" || document.hidden || target?.closest(nativeSelector) || isImageSurface(target)) { hide(); return; }
      document.documentElement.setAttribute(htmlAttribute, "true");
      document.documentElement.setAttribute(visibleAttribute, "true");
      node.dataset.visible = "true";
      const magnet = candidate instanceof HTMLElement ? candidate : null;
      if (magnet) {
        if (activeElement.current !== magnet) {
          activeElement.current = magnet;
          const rect = magnet.getBoundingClientRect();
          x.set(rect.left + rect.width / 2); y.set(rect.top + rect.height / 2);
          width.set(Math.min(maxWidth, Math.max(baseSize + 10, rect.width + 18)));
          height.set(Math.min(maxHeight, Math.max(baseSize + 10, rect.height + 18)));
          node.dataset.active = "true";
        }
        return;
      }
      if (activeElement.current) resetMagnet();
      x.set(event.clientX); y.set(event.clientY);
    };
    const down = () => scale.set(.82), up = () => scale.set(1);
    const key = (event: KeyboardEvent) => { if (event.key === "Tab") hide(); };
    const onScroll = () => { if (activeElement.current) hide(); };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down, { passive: true });
    window.addEventListener("pointerup", up, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("blur", hide);
    window.addEventListener("keydown", key);
    document.documentElement.addEventListener("pointerleave", hide);
    document.addEventListener("visibilitychange", hide);
    return () => {
      hide(); document.documentElement.removeAttribute(htmlAttribute);
      window.removeEventListener("pointermove", move); window.removeEventListener("pointerdown", down); window.removeEventListener("pointerup", up); window.removeEventListener("scroll", onScroll); window.removeEventListener("blur", hide); window.removeEventListener("keydown", key); document.documentElement.removeEventListener("pointerleave", hide); document.removeEventListener("visibilitychange", hide);
    };
  }, [baseSize, enabled, height, htmlAttribute, magneticSelector, maxHeight, maxWidth, nativeSelector, onlyOnTargets, scale, width, x, y]);

  if (!enabled) return null;
  const cursorStyle: MotionStyle & { "--fluid-cursor-color": string } = { x: springX, y: springY, width: springWidth, height: springHeight, scale: springScale, "--fluid-cursor-color": color };
  return <motion.i ref={cursor} data-testid={testId} data-visible="false" data-active="false" className={styles.blob} aria-hidden="true" style={cursorStyle} />;
}
