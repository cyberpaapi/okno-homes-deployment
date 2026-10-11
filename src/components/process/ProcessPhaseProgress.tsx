'use client';

import { motion, useMotionValueEvent, type MotionValue } from 'motion/react';
import { useRef, useState } from 'react';
import styles from './ProcessPhaseProgress.module.css';

/** Controlled step-state adaptation of 21st.dev Stepper 03 by shadcnspace
 * (demo 28558). Read-only: film/timeline movement never becomes a button. */
export default function ProcessPhaseProgress({ titles, progress }: {
  titles: readonly string[];
  progress: MotionValue<number>;
}) {
  const resolveIndex = (value: number) => Math.max(0, Math.min(titles.length - 1, Math.round(value * (titles.length - 1))));
  const [activeIndex, setActiveIndex] = useState(() => resolveIndex(progress.get()));
  const presentedIndex = useRef(activeIndex);
  useMotionValueEvent(progress, 'change', value => {
    const next = resolveIndex(value);
    if (presentedIndex.current !== next) {
      presentedIndex.current = next;
      setActiveIndex(next);
    }
  });

  return (
    <div className={styles.progress} data-process-phase-progress>
      <span className={styles.count} aria-hidden="true">
        {String(activeIndex + 1).padStart(2, '0')}<span> / {String(titles.length).padStart(2, '0')}</span>
      </span>
      <ol className={styles.steps} aria-label="Build phases">
        {titles.map((title, index) => (
          <li key={index} aria-label={title} aria-current={index === activeIndex ? 'step' : undefined} data-complete={index < activeIndex}>
            <motion.span
              initial={false}
              animate={{ scaleX: index <= activeIndex ? 1 : 0 }}
              transition={{ duration: .28, ease: [0.22, 1, 0.36, 1] }}
            />
          </li>
        ))}
      </ol>
      <span className={styles.title}>{titles[activeIndex]}</span>
    </div>
  );
}
