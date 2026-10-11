"use client";

import { motion, useReducedMotion } from "motion/react";
import styles from "./ProcessTextReveal.module.css";

type Props = {
  as?: "h1" | "h2";
  text: string;
};

/**
 * Adapted from bookmarked 21st.dev component 2491, Reveal Text.
 * It retains per-token sequencing while replacing hover imagery and the
 * decorative colour sweep with a quiet masked rise suitable for long copy.
 */
export default function ProcessTextReveal({ as = "h1", text }: Props) {
  const reducedMotion = useReducedMotion();
  const Heading = as === "h2" ? motion.h2 : motion.h1;

  return (
    <Heading className={styles.heading} aria-label={text}>
      {text.split(" ").map((word, index) => (
        <span className={styles.mask} aria-hidden="true" key={`${word}-${index}`}>
          <motion.span
            initial={reducedMotion ? false : { transform: "translate3d(0, 105%, 0)", opacity: 0 }}
            animate={{ transform: "translate3d(0, 0, 0)", opacity: 1 }}
            transition={{
              duration: reducedMotion ? 0 : 0.72,
              delay: reducedMotion ? 0 : index * 0.055,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </Heading>
  );
}
