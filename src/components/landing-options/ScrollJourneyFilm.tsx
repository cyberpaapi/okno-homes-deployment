'use client';

import { useEffect, useRef, useState } from 'react';
import { useMotionValueEvent, type MotionValue } from 'motion/react';
import { createSequentialVideoScrubber } from '@/lib/sequentialVideoScrubber';
import { isEmbeddedSitePreview } from '@/lib/sitePreview';
import { heroFilmLastTime, heroFilmProgress } from '@/lib/heroFilmScroll';

const indexedSource = '/assets/landing-options/forest-entry-scroll-window-smooth-b6de05527e75.mp4';
type Controller = { setTime(time: number): void; seek(time: number): void; dispose(): void };
export default function ScrollJourneyFilm({ src, poster, progress, className, onReady, onProgress }: {
  src: string; poster: string; progress: MotionValue<number>; className: string; onReady(ready: boolean): void; onProgress(progress: number): void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const controller = useRef<Controller | null>(null);
  const duration = useRef(577 / 24);
  const [native, setNative] = useState(false);
  const sync = () => {
    const surface = canvas.current ?? video.current;
    const rect = surface?.getBoundingClientRect();
    const time = heroFilmProgress(progress.get()) * heroFilmLastTime(duration.current);
    if (rect && (rect.bottom <= 0 || rect.top >= window.innerHeight) || progress.get() <= .3) controller.current?.seek(time);
    else controller.current?.setTime(time);
  };
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
      if (isEmbeddedSitePreview() || src !== indexedSource || !canvas.current) { fallback(); return; }
      const { createH264FrameScrubber, heroFilmDuration } = await import('@/lib/h264FrameScrubber');
      if (abort.signal.aborted) return;
      duration.current = heroFilmDuration;
      local = await createH264FrameScrubber(canvas.current, abort.signal, () => onReady(true), fallback, {
        sequential: true,
        maxPresentationFps: 60,
        onPresented: time => onProgress(Math.min(1,time/Math.max(1/24,heroFilmLastTime(duration.current)))),
      });
      if (abort.signal.aborted) { local?.dispose(); return; }
      if (!local) { fallback(); return; }
      controller.current = local;
      sync();
    })().catch(fallback);
    return () => { abort.abort(); local?.dispose(); controller.current = null; };
    // sync reads the current Motion value, rather than capturing a scroll position.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, progress, onReady, onProgress]);
  useEffect(() => {
    if (!native || !video.current) return;
    const element = video.current;
    const scrubber = createSequentialVideoScrubber(element,24,time => onProgress(Math.min(1,time/Math.max(1/24,heroFilmLastTime(duration.current)))),60);
    controller.current = scrubber;
    const ready = () => { duration.current = element.duration; onReady(true); onProgress(0); sync(); };
    element.addEventListener('loadeddata',ready);
    if (element.readyState >= 2) ready();
    return () => { element.removeEventListener('loadeddata',ready); scrubber.dispose(); controller.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [native, src, progress, onReady, onProgress]);
  return native
    ? <video ref={video} className={className} src={src} poster={poster} muted playsInline preload="auto" aria-hidden="true" data-film-renderer="native" onError={() => onReady(false)} />
    : <canvas ref={canvas} className={className} width={1920} height={1080} aria-hidden="true" data-film-renderer="frames" />;
}
