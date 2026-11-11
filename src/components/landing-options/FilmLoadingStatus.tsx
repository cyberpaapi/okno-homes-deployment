'use client';

import { useEffect, useRef } from 'react';
import styles from './ForestEntryOption.module.css';

/** Ease real download progress in quick/slow bursts; never invent downloaded bytes. */
export default function FilmLoadingStatus({ ready, progress, retry }: { ready: boolean; progress: number | null; retry(): void }) {
  const barRef = useRef<HTMLProgressElement>(null);
  const rhythmStarted = useRef<number | null>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar || progress === null) return;
    // Unknown size: show the indeterminate bar until real progress arrives, but
    // never wipe progress already shown.
    if (progress < 0) { if (!(bar.value > 0)) bar.removeAttribute('value'); return; }
    if (ready || (progress === 0 && !bar.hasAttribute('value'))) {
      bar.value = ready ? 1 : 0;
      rhythmStarted.current = null;
      return;
    }
    // Reserve completion for decoded readiness, not merely downloaded bytes.
    // Never move backwards: a re-render or a new download phase must not empty the bar.
    const target = Math.max(bar.value, Math.min(.995, Math.max(0, progress)));
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduced.matches) { bar.value = target; return; }
    rhythmStarted.current ??= performance.now();
    let previous = performance.now();
    let frame = 0;
    const advance = (now: number) => {
      const elapsed = Math.min(64, now - previous) / 1000;
      previous = now;
      const phase = (now - rhythmStarted.current!) % 1800;
      const gain = phase < 320 || (phase >= 1000 && phase < 1320) ? 7 : .45;
      const gap = target - bar.value;
      bar.value = gap <= .001 ? target : Math.min(target, bar.value + (gap * gain + .006) * elapsed);
      if (bar.value < target) frame = requestAnimationFrame(advance);
    };
    frame = requestAnimationFrame(advance);
    return () => cancelAnimationFrame(frame);
  }, [ready, progress]);

  return <div className={styles.journeyLoading} data-journey-loading={ready ? 'ready' : progress === null ? 'unavailable' : 'loading'}>
    {progress !== null && <progress ref={barRef} className={styles.loadingBar} max={1} value={ready ? 1 : undefined} aria-label="Loading experience" />}
    <span role="status">{ready ? 'Scroll to explore' : progress === null ? 'Experience could not load' : 'Loading experience'}</span>
    {progress === null && <button className={styles.retryLoading} onClick={retry}>Retry loading</button>}
  </div>;
}
