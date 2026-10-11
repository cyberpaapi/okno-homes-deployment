"use client";

// Fixed-size semantic-link adaptation of 21st.dev Morphing Arrow Button by
// arunachalam, demo 3179. Only the arrow motion remains; the control never grows.
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import styles from "./Journal.module.css";

const MotionLink = motion.create(Link);

export function JournalArrowLink({ href, label, external = false, inverse = false, tabIndex }: { href: string; label: string; external?: boolean; inverse?: boolean; tabIndex?: number }) {
  const [active, setActive] = useState(false);
  const reduced = useReducedMotion();
  const transition = { duration: reduced ? 0 : 0.32, ease: [0.22, 1, 0.36, 1] as const };
  const shared = {
    href,
    "aria-label": label,
    className: styles.arrowLink,
    "data-active": active,
    "data-inverse": inverse,
    "data-journal-cursor-action": "",
    "data-cursor-media-action": "",
    "data-magnetic": "",
    tabIndex,
    onFocus: () => setActive(true),
    onBlur: () => setActive(false),
    onMouseEnter: () => setActive(true),
    onMouseLeave: () => setActive(false),
  };
  const content = (
    <motion.svg aria-hidden="true" viewBox="0 0 24 24" animate={{ x: active ? 2 : 0, y: active ? -2 : 0 }} transition={transition}>
      <path d="M6 18 18 6M9 6h9v9" />
    </motion.svg>
  );
  if (external) {
    return <motion.a {...shared} target="_blank" rel="noreferrer" whileTap={reduced ? undefined : { scale: 0.94 }}>{content}</motion.a>;
  }
  return <MotionLink {...shared} whileTap={reduced ? undefined : { scale: 0.94 }}>{content}</MotionLink>;
}
