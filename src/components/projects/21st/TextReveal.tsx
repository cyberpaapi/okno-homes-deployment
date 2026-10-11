'use client';
// cnippet-dev / Text Reveal, 21st.dev demo 19727: slide preset + staggered segments.
import { motion, useReducedMotion } from 'motion/react';
import styles from './Elements.module.css';
export function TextReveal({ children, per = 'word' }: { children: string; per?: 'word' | 'char' }) {
  const reduced = useReducedMotion();
  const segments = per === 'char' ? [...children] : children.split(/(\s+)/);
  return <motion.span className={styles.reveal} aria-label={children} initial={reduced ? false : 'hidden'} animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: per === 'char' ? .03 : .05 } } }}>
    {segments.map((segment, index) => <span className={styles.segment} data-space={/^\s+$/.test(segment) || undefined} aria-hidden="true" key={`${index}-${segment}`}><motion.span variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: .6, ease: [.22, 1, .36, 1] } } }}>{segment}</motion.span></span>)}
  </motion.span>;
}
