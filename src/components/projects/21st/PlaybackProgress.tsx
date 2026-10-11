'use client';
// skyleen77 / Scroll Progress, 21st.dev 2920: left-origin spring-scaled bar.
// Adapted to the media clock instead of document scroll position.
import { useEffect, useRef } from 'react';
import { motion, useMotionValueEvent, useReducedMotion, useSpring, type MotionValue } from 'motion/react';
import styles from './ProjectCinema.module.css';
export function PlaybackProgress({ progress, id, title }: { progress: MotionValue<number>; id: string; title: string }) {
  const ref = useRef<HTMLDivElement>(null), reduced = useReducedMotion();
  const scaleX = useSpring(progress, { stiffness: 250, damping: 40, bounce: 0 });
  useEffect(() => { scaleX.jump(0); }, [id, scaleX]);
  useMotionValueEvent(progress, 'change', value => {
    ref.current?.setAttribute('aria-valuenow', String(Math.round(value * 100)));
    ref.current?.setAttribute('data-progress', value.toFixed(3));
  });
  return <div ref={ref} className={styles.progressTrack} role="progressbar" aria-label={`${title} — time until next project`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={0} data-progress="0">
    <motion.div className={styles.progressFill} style={{ scaleX: reduced ? progress : scaleX }} />
  </div>;
}
