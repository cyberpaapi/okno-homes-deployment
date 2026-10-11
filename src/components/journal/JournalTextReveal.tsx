"use client";

// Adapted from 21st.dev Text Reveal by ddoemonn, demo 23571.
import { Fragment, useMemo, useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

const EASE = [0.23, 1, 0.32, 1] as const;
const HIDDEN = { opacity: 0, y: 10, filter: "blur(8px)" } as const;
const SHOWN = { opacity: 1, y: 0, filter: "blur(0px)" } as const;

export function JournalTextReveal({ text, className = "", amount = 0.35 }: { text: string; className?: string; amount?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount });
  const reduced = useReducedMotion();
  const words = useMemo(() => text.trim().split(/\s+/), [text]);
  const step = words.length > 1 ? Math.min(0.055, 1 / (words.length - 1)) : 0;

  return (
    <span ref={ref} className={className}>
      <span style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0, 0, 0, 0)", whiteSpace: "nowrap", border: 0 }}>{text}</span>
      <span aria-hidden="true">
        {words.map((word, index) => (
          <Fragment key={`${word}-${index}`}>
            {index > 0 ? " " : null}
            <motion.span
              className="inline-block whitespace-nowrap align-baseline"
              initial={reduced ? false : HIDDEN}
              animate={inView ? SHOWN : HIDDEN}
              transition={reduced ? { duration: 0 } : { duration: 0.6, ease: EASE, delay: index * step }}
            >
              {word}
            </motion.span>
          </Fragment>
        ))}
      </span>
    </span>
  );
}
