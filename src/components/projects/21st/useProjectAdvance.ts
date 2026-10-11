'use client';
import { useEffect, useRef } from 'react';
import type { MotionValue } from 'motion/react';
// Photo clock preserves elapsed time while paused/offscreen/hidden. Films use
// their actual playback time and ended event, so buffering cannot skip a clip.
export function useProjectAdvance({ id, running, photoOnly, next, progress }: { id: string; running: boolean; photoOnly: boolean; next: () => void; progress?: MotionValue<number> }) {
  const elapsed = useRef(0);
  useEffect(() => { elapsed.current = 0;progress?.set(0); }, [id, progress]);
  useEffect(() => {
    if (!running || !photoOnly) return;
    let timer: ReturnType<typeof setTimeout> | undefined, ticker: ReturnType<typeof setInterval> | undefined, started: number | null = null;
    const stop = () => {
      clearTimeout(timer);clearInterval(ticker);
      if (started !== null) { elapsed.current = Math.min(7000, elapsed.current + performance.now() - started);started = null; }
    };
    const sync = () => {
      stop();
      if (document.hidden) return;
      started = performance.now();
      timer = setTimeout(() => { elapsed.current = 7000;started = null;progress?.set(1);clearInterval(ticker);next(); }, Math.max(0, 7000 - elapsed.current));
      ticker = setInterval(() => { if (started !== null) progress?.set(Math.min(1, (elapsed.current + performance.now() - started) / 7000)); }, 100);
    };
    sync();document.addEventListener('visibilitychange', sync);
    return () => { stop();document.removeEventListener('visibilitychange', sync); };
  }, [id, running, photoOnly, next, progress]);
}
