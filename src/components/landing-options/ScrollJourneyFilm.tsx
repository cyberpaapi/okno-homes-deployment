'use client';

import { useEffect, useRef, useState } from 'react';
import { useMotionValueEvent, type MotionValue } from 'motion/react';
import { createVideoScrubber } from '@/lib/videoScrubber';

const indexedSource = '/assets/landing-options/forest-entry-scroll-seekable-900p.mp4';
type Controller = { setTime(time: number): void; dispose(): void };
export default function ScrollJourneyFilm({ src, poster, progress, className, onReady }: {
  src: string; poster: string; progress: MotionValue<number>; className: string; onReady(ready: boolean): void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const controller = useRef<Controller | null>(null);
  const duration = useRef(481 / 24);
  const [native, setNative] = useState(false);
  const sync = () => controller.current?.setTime(Math.min(1,Math.max(0,(progress.get()-.3)/.665)) * duration.current);
  useMotionValueEvent(progress, 'change', sync);
  useEffect(() => {
    const abort = new AbortController();
    let local: Controller | null = null;
    const fallback = () => {
      if (abort.signal.aborted) return;
      abort.abort();
      local?.dispose();
      local = null;
      controller.current = null;
      setNative(true);
    };
    void (async () => {
      if (src !== indexedSource || !canvas.current) { fallback(); return; }
      const { createH264FrameScrubber, heroFilmDuration } = await import('@/lib/h264FrameScrubber');
      if (abort.signal.aborted) return;
      duration.current = heroFilmDuration;
      local = await createH264FrameScrubber(canvas.current, abort.signal, () => onReady(true), fallback);
      if (abort.signal.aborted) { local?.dispose(); return; }
      if (!local) { fallback(); return; }
      controller.current = local;
      sync();
    })().catch(fallback);
    return () => { abort.abort(); local?.dispose(); controller.current = null; };
    // sync reads the current Motion value, rather than capturing a scroll position.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, progress, onReady]);
  useEffect(() => {
    if (!native || !video.current) return;
    const element = video.current;
    const scrubber = createVideoScrubber(element);
    controller.current = scrubber;
    const ready = () => { duration.current = element.duration; onReady(true); sync(); };
    element.addEventListener('loadeddata',ready);
    if (element.readyState >= 2) ready();
    return () => { element.removeEventListener('loadeddata',ready); scrubber.dispose(); controller.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [native, src, progress, onReady]);
  return native
    ? <video ref={video} className={className} src={src} poster={poster} muted playsInline preload="auto" aria-hidden="true" data-film-renderer="native" onError={() => onReady(false)} />
    : <canvas ref={canvas} className={className} width={1920} height={1080} aria-hidden="true" data-film-renderer="frames" />;
}
