'use client';

import { motion, useMotionValueEvent, type MotionValue } from 'motion/react';
import { useRef, useState } from 'react';
import type { ProcessDayRange } from '@/lib/processDayRange';
import styles from './ProcessPhaseProgress.module.css';

/** Horizontal adaptation of Aceternity Timeline's connected scroll beam
 * (21st.dev demo 857, Manu Arora). Uses the existing presented phase motion. */
export default function ProcessPhaseProgress({ phases, progress }: {
  phases: readonly { days: ProcessDayRange; title: string }[];
  progress: MotionValue<number>;
}) {
  const resolveIndex = (value: number) => Math.max(0, Math.min(phases.length - 1, Math.round(value * (phases.length - 1))));
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
      <div className={styles.beam} aria-hidden="true">
        <motion.div className={styles.fill} style={{ scaleX: progress }} />
      </div>
      <ol className={styles.milestones} aria-label="Build day timeline">
        {phases.map((phase, index) => (
          <li
            key={phase.days.display}
            style={{ left: `${index / Math.max(1, phases.length - 1) * 100}%` }}
            aria-label={`${phase.days.display}: ${phase.title}`}
            aria-current={index === activeIndex ? 'step' : undefined}
            data-complete={index <= activeIndex}
          >
            <span className={styles.point} aria-hidden="true" />
            <span className={styles.dayLabel}>{phase.days.label}</span>
            <span className={styles.dayRange}>{phase.days.range}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
