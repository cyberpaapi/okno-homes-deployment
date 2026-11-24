"use client";

import { useEffect, type RefObject } from "react";
import styles from "./Sustainability.module.css";

/** Preserve phone framing; the surrounding surface is CSS color, never media. */
export default function SustainabilitySurround({ viewport }: { viewport: RefObject<HTMLDivElement | null> }) {
  useEffect(() => {
    const stage = viewport.current;
    if (!stage) return;
    let disposed = false;
    const portrait = window.matchMedia("(max-width: 820px) and (orientation: portrait)");
    const measure = () => {
      if (disposed || !portrait.matches) return;
      const film = stage.querySelector<HTMLElement>("[data-sustainability-film]");
      const title = stage.querySelector<HTMLElement>("[data-sustainability-opening-title]");
      if (film && title && film.offsetHeight) {
        const centre = film.offsetTop;
        // Layout offsets ignore the heading's temporary entrance transform.
        let titleBottom = title.offsetHeight;
        let node: HTMLElement | null = title;
        while (node && node !== stage) {
          titleBottom += node.offsetTop;
          node = node.offsetParent as HTMLElement | null;
        }
        const oldTop = centre - film.offsetHeight * 1.06 / 2;
        const targetTop = titleBottom + Math.max(0, oldTop - titleBottom) / 2;
        const zoom = Math.max(1.06, Math.min(2.2, (centre - targetTop) * 2 / film.offsetHeight));
        stage.style.setProperty("--sustainability-fitted-zoom", String(zoom));
      }
    };
    const resize = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    resize?.observe(stage);
    const title = stage.querySelector("[data-sustainability-opening-title]");
    if (title) resize?.observe(title);
    portrait.addEventListener?.("change", measure);
    window.addEventListener("resize", measure);
    void document.fonts?.ready.then(() => { if (!disposed) measure(); });
    measure();
    return () => {
      disposed = true;
      resize?.disconnect();
      portrait.removeEventListener?.("change", measure);
      window.removeEventListener("resize", measure);
      stage.style.removeProperty("--sustainability-fitted-zoom");
    };
  }, [viewport]);
  return <div className={styles.colorSurround} aria-hidden="true" data-color-surround />;
}
