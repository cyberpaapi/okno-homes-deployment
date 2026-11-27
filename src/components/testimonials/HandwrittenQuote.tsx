"use client";

import { Fragment, useLayoutEffect, useMemo, useRef, type CSSProperties } from "react";
import styles from "./HandwrittenQuote.module.css";

// Adapted from crafterui / Handwritten Response, 21st.dev demo31227,
// component17344: proportional word timing and left-to-right ink clips.
// Retrieved source: docs/21st-source/31227.tsx.txt. No annotation parsing,
// external font request, streaming effect or additional animation dependency.
export type QuoteInkEntry = { startedAt: number; complete: boolean };
export type QuoteInkRegistry = Map<string, QuoteInkEntry>;

const MAX_DURATION = 1350;
const MAX_CHARACTERS = 700;
const MAX_WORDS = 100;
const SPACE = /^\s+$/u;

type InkPart = { text: string; delay: number; duration: number };

export function HandwrittenQuote({ text, reviewId, registry, reducedMotion = false, suspended = false, interrupted = false }: {
  text: string;
  reviewId: string;
  /** One registry for this mounted page, shared by its equivalent rail cycles. */
  registry: QuoteInkRegistry;
  reducedMotion?: boolean;
  suspended?: boolean;
  /** A genuine user gesture, rather than the rail's automatic movement. */
  interrupted?: boolean;
}) {
  const root = useRef<HTMLParagraphElement>(null);
  const key = `${reviewId}\u0000${text}`;
  const state = useRef({ reducedMotion, suspended, interrupted });
  useLayoutEffect(() => { state.current = { reducedMotion, suspended, interrupted }; });

  const { parts, duration, eligible } = useMemo(() => {
    const quote = `“${text}”`;
    if (!text.trim() || text.length > MAX_CHARACTERS) return { parts: [] as InkPart[], duration: 0, eligible: false };
    const tokens = quote.split(/(\s+)/u).filter(Boolean);
    // Unbroken strings keep native overflow-wrap instead of a large word box.
    if (tokens.filter(part => !SPACE.test(part)).length > MAX_WORDS || tokens.some(part => !SPACE.test(part) && part.length > 44)) {
      return { parts: [] as InkPart[], duration: 0, eligible: false };
    }
    const perCharacter = Math.min(24, MAX_DURATION / quote.length);
    let cursor = 0;
    const parts = tokens.map(part => {
      const next = { text: part, delay: cursor * perCharacter, duration: part.length * perCharacter };
      cursor += part.length;
      return next;
    });
    return { parts, duration: cursor * perCharacter, eligible: true };
  }, [text]);

  useLayoutEffect(() => {
    const element = root.current;
    if (!element || !eligible || typeof IntersectionObserver === "undefined" || typeof CSS === "undefined" || !CSS.supports?.("clip-path", "inset(0)") || !document.fonts?.load) return;
    let visible = false;
    let fontReady = false;
    let disposed = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let active = false;

    const finish = () => {
      if (timer !== undefined) clearTimeout(timer);
      timer = undefined;
      if (active) {
        const record = registry.get(key);
        if (record) record.complete = true;
      }
      active = false;
      element.dataset.quoteInk = "complete";
      element.style.removeProperty("--ink-elapsed");
    };

    const remember = (record: QuoteInkEntry) => {
      // Keep the current100 reviews and a bounded edit history. Active records
      // are never evicted, so equivalent cycle copies retain the same phase.
      if (!registry.has(key) && registry.size >= 200) {
        for (const [oldKey, old] of registry) {
          if (old.complete) { registry.delete(oldKey); break; }
        }
        if (registry.size >= 200) return false;
      }
      registry.set(key, record);
      return true;
    };

    const present = () => {
      if (disposed || !visible) return;
      const status = state.current;
      const existing = registry.get(key);
      if (existing?.complete) { finish(); return; }
      if (status.interrupted) {
        remember({ startedAt: performance.now(), complete: true });
        finish();
        return;
      }
      if (status.reducedMotion || status.suspended || document.hidden || !fontReady) {
        if (active) finish();
        return;
      }
      if (active) return;
      const now = performance.now();
      const record = existing ?? { startedAt: now, complete: false };
      const elapsed = Math.max(0, now - record.startedAt);
      if (elapsed >= duration) {
        record.complete = true;
        remember(record);
        finish();
        return;
      }
      if (!remember(record)) return;
      active = true;
      element.style.setProperty("--ink-elapsed", `${elapsed}ms`);
      element.dataset.quoteInk = "writing";
      timer = setTimeout(finish, duration - elapsed + 30);
    };

    const onVisibility = () => { if (document.hidden) finish(); else present(); };
    const onSuspend = () => {
      if (state.current.interrupted && visible) present();
      else if (state.current.suspended || state.current.reducedMotion) finish();
      else present();
    };
    // Parent state changes dispatch through this local callback below, without
    // resetting the shared start time or reconnecting observers for every step.
    element.addEventListener("okno-quote-state", onSuspend);
    document.addEventListener("visibilitychange", onVisibility);


    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio >= .25;
      if (visible) present();
      else if (active) finish();
    }, { threshold: [0, .25] });
    observer.observe(element);

    // Animate only when the requested face actually resolves. A failed font,
    // missing Font Loading API or rejected request leaves ordinary readable ink.
    const fonts = document.fonts;
    if (fonts?.load) {
      const computed = getComputedStyle(element);
      const descriptor = `${computed.fontStyle || "normal"} ${computed.fontWeight || "400"} ${computed.fontSize || "30px"} ${computed.fontFamily || '"OKNO Handwriting"'}`;
      void fonts.load(descriptor, text.slice(0, 120)).then(faces => {
        if (disposed || !faces.length) return;
        fontReady = true;
        present();
      }).catch(() => { /* The quote stays fully readable, with no hidden default. */ });
    }

    return () => {
      disposed = true;
      observer.disconnect();
      element.removeEventListener("okno-quote-state", onSuspend);
      document.removeEventListener("visibilitychange", onVisibility);
      finish();
    };
  }, [key, registry, eligible, duration, text]);

  useLayoutEffect(() => {
    root.current?.dispatchEvent(new Event("okno-quote-state"));
  }, [reducedMotion, suspended, interrupted]);

  return <p ref={root} className={styles.quote} data-quote-ink="readable" data-quote-review={reviewId}>
    {eligible ? parts.map((part, index) => SPACE.test(part.text)
      ? <Fragment key={index}>{part.text}</Fragment>
      : <span key={index} className={styles.word} data-ink-word style={{
          "--ink-delay": `${part.delay}ms`,
          "--ink-duration": `${part.duration}ms`,
        } as CSSProperties}>{part.text}</span>) : `“${text}”`}
  </p>;
}
