'use client';

// 21st.dev 9902, daiwiikharihar: keep its explicit line sequencing while using
// a clean rise-and-focus entrance. The source's colored cover was removed: it
// obscured the headline at narrow breakpoints and looked like a solid panel.
import { motion, useInView, useReducedMotion } from 'motion/react';
import { useRef } from 'react';
import styles from './TextBlock.module.css';

export default function TextBlock({ lines }: { lines: string[] }) {
  const ref = useRef<HTMLSpanElement>(null);
  const visible = useInView(ref, { once: true, amount: .4 });
  const reduced = useReducedMotion();
  return <span ref={ref} className={styles.block} data-component="9902" data-landing-heading>
    <span className={styles.accessible}>{lines.join(' ')}</span>
    <span aria-hidden="true">{lines.map((line, index) => <motion.span
      className={styles.line}
      data-text-line
      key={line}
      initial={reduced ? false : { y: '0.42em', opacity: 0, filter: 'blur(7px)' }}
      animate={reduced || !visible ? undefined : { y: 0, opacity: 1, filter: 'blur(0px)' }}
      transition={{ duration: .72, delay: index * .09, ease: [0.22, 1, 0.36, 1] }}
    >{line}</motion.span>)}</span>
  </span>;
}
