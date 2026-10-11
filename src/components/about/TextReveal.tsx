"use client";

import { type CSSProperties } from "react";
import styles from "./TextReveal.module.css";

type TextRevealProps = {
  text: string;
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
};

/**
 * Adapted from kuratlielia's 21st.dev Text Reveal: each word rises through
 * a feathered clip and sharpens on mount. All words remain readable without JS.
 */
export function TextReveal({ text, as = "h2", className }: TextRevealProps) {
  const Tag = as;
  const words = text.trim().split(/\s+/).filter(Boolean);
  const step = Math.min(0.085, 0.55 / Math.max(words.length, 1));

  return (
    <Tag className={`${styles.reveal} ${className ?? ""}`}>
      <span className={styles.srOnly}>{text}</span>
      {words.map((word, index) => (
        <span className={styles.unit} aria-hidden="true" key={`${word}-${index}`}>
          <span className={styles.clip}>
            <span
              className={styles.word}
              style={{ "--reveal-delay": `${index * step}s` } as CSSProperties}
            >
              {word}
            </span>
          </span>
        </span>
      ))}
    </Tag>
  );
}
