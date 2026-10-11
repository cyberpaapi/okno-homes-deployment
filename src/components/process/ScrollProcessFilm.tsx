"use client";

import { useEffect, useRef, useState } from 'react';
import { useMotionValueEvent, type MotionValue } from 'motion/react';
import { createVideoScrubber } from '@/lib/videoScrubber';
import { ProcessPlayhead, processFilmProgress } from '@/lib/processScrub';

type Controller = { setTime(time: number): void; dispose(): void };
type Props = {
  hq: string; mobile: string; poster: string; label: string; className: string;
  progress: MotionValue<number>; onReady(ready: boolean): void; onProgress(progress: number): void;
};

export default function ScrollProcessFilm({ hq, mobile, poster, label, className, progress, onReady, onProgress }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const surface = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const controller = useRef<Controller | null>(null);
  const playhead = useRef(new ProcessPlayhead());
  const duration = useRef(769 / 30);
  const wake = useRef(() => {});
  const [nativeSource, setNativeSource] = useState<string | null>(null);
  useMotionValueEvent(progress, 'change', () => wake.current());

  useEffect(() => {
    const abort = new AbortController();
    let local: Controller | null = null;
    let frame = 0;
    let previous = 0;
    let visible = true;
    let disposed = false;
    playhead.current = new ProcessPlayhead();
    onReady(false);
    const target = () => processFilmProgress(progress.get()) * Math.max(0, duration.current - 1 / 30);
    const tick = (now: number) => {
      frame = 0;
      if (disposed || document.hidden || !visible || !controller.current) { previous = 0; return; }
      const next = playhead.current.step(target(), previous ? (now - previous) / 1000 : 1 / 60);
      previous = now;
      controller.current.setTime(next);
      if (Math.abs(next - target()) > .001) frame = requestAnimationFrame(tick);
      else previous = 0;
    };
    const queue = () => {
      // Explicit End/history navigation may skip the film. Prepare its real
      // ending offscreen so reverse entry starts at the ending, not a stale
      // early frame. Visible playback keeps the accepted damped reversal.
      if (!disposed && !visible && controller.current && progress.get() >= .94) {
        previous = 0;
        playhead.current.reset(target());
        controller.current.setTime(target());
        return;
      }
      if (!disposed && !document.hidden && visible && !frame && controller.current) frame = requestAnimationFrame(tick);
    };
    wake.current = queue;
    const visibility = () => { previous = 0; queue(); };
    document.addEventListener('visibilitychange', visibility);
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; previous = 0; queue(); });
    if (surface.current) observer.observe(surface.current);
    const source = window.innerWidth >= 1024 ? hq : mobile;
    const fallback = () => {
      if (disposed) return;
      abort.abort();
      local?.dispose();
      local = null;
      controller.current = null;
      setNativeSource(source);
    };
    void (async () => {
      if (source !== '/process/process-master.hq.mp4' && source !== '/process/process-master.scrub.mp4') { fallback(); return; }
      const [{ createIndexedFrameScrubber }, { default: film }] = await Promise.all([
        import('@/lib/indexedFrameScrubber'),
        source.endsWith('.hq.mp4') ? import('../../../config/process-video-hq.json') : import('../../../config/process-video-scrub.json'),
      ]);
      if (abort.signal.aborted || !canvas.current) return;
      duration.current = film.packets.length / film.fps;
      local = await createIndexedFrameScrubber(film, canvas.current, abort.signal, () => onReady(true), fallback, time => onProgress(time / duration.current));
      if (abort.signal.aborted) { local?.dispose(); return; }
      if (!local) { fallback(); return; }
      controller.current = local;
      queue();
    })().catch(fallback);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener('visibilitychange', visibility);
      abort.abort(); local?.dispose(); controller.current = null; wake.current = () => {};
    };
  }, [hq, mobile, progress, onReady, onProgress]);

  useEffect(() => {
    if (!nativeSource || !video.current) return;
    const element = video.current;
    const scrubber = createVideoScrubber(element, 30);
    controller.current = scrubber;
    const ready = () => { duration.current = element.duration; onReady(true); wake.current(); };
    const presented = () => onProgress(element.currentTime / duration.current);
    element.addEventListener('loadeddata', ready);
    element.addEventListener('seeked', presented);
    if (element.readyState >= 2) ready();
    return () => { element.removeEventListener('loadeddata', ready); element.removeEventListener('seeked', presented); scrubber.dispose(); controller.current = null; };
  }, [nativeSource, onReady, onProgress]);

  return <div ref={surface} style={{ position: 'absolute', inset: 0 }}>{nativeSource
    ? <video ref={video} className={className} src={nativeSource} poster={poster} muted playsInline preload="auto" aria-label={label} data-process-master-video data-film-renderer="native" onError={() => onReady(false)} />
    : <canvas ref={canvas} className={className} width={1920} height={1080} role="img" aria-label={label} data-process-master-video data-film-renderer="frames" />}</div>;
}
