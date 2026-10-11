"use client";

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useMotionValueEvent, type MotionValue } from 'motion/react';
import { createVideoScrubber } from '@/lib/videoScrubber';
import { ProcessPlayhead, processFilmProgress } from '@/lib/processScrub';
import { PROCESS_END_TIME, PROCESS_FPS, processFinishOpacity, processPresentationPackets } from '@/lib/processChapters';

type Controller = { setTime(time: number): void; dispose(): void };
type Props = {
  hq: string; mobile: string; poster: string; label: string; className: string;
  progress: MotionValue<number>; onReady(ready: boolean): void; onProgress(progress: number): void;
};

export default function ScrollProcessFilm({ hq, mobile, poster, label, className, progress, onReady, onProgress }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const surface = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const finish = useRef<HTMLImageElement>(null);
  const originalFilm = useRef(false);
  const controller = useRef<Controller | null>(null);
  const playhead = useRef(new ProcessPlayhead());
  const endTime = useRef(PROCESS_END_TIME);
  const wake = useRef(() => {});
  const [nativeSource, setNativeSource] = useState<string | null>(null);
  const present = useCallback((time: number) => {
    if (finish.current) finish.current.style.opacity = String(originalFilm.current ? processFinishOpacity(time) : 0);
    onProgress(Math.min(1, time / endTime.current));
  }, [onProgress]);
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
    const target = () => processFilmProgress(progress.get()) * endTime.current;
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
    originalFilm.current = source === '/process/process-master.hq.mp4' || source === '/process/process-master.scrub.mp4';
    if (finish.current) finish.current.style.opacity = '0';
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
      // Bound decoding as well as seeking: cache lookahead cannot expose the
      // discarded outro while a late frame is still being decoded.
      const cut = { ...film, packets: processPresentationPackets(film.packets) };
      endTime.current = PROCESS_END_TIME;
      local = await createIndexedFrameScrubber(cut, canvas.current, abort.signal, () => onReady(true), fallback, present);
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
  }, [hq, mobile, progress, onReady, present]);

  useEffect(() => {
    if (!nativeSource || !video.current) return;
    const element = video.current;
    const scrubber = createVideoScrubber(element, 30);
    const original = nativeSource === '/process/process-master.hq.mp4' || nativeSource === '/process/process-master.scrub.mp4';
    controller.current = scrubber;
    const ready = () => {
      endTime.current = original ? Math.min(PROCESS_END_TIME, element.duration - 1 / PROCESS_FPS) : Math.max(0, element.duration - 1 / PROCESS_FPS);
      onReady(true); wake.current();
    };
    const presented = () => present(element.currentTime);
    element.addEventListener('loadeddata', ready);
    element.addEventListener('seeked', presented);
    if (element.readyState >= 2) ready();
    return () => { element.removeEventListener('loadeddata', ready); element.removeEventListener('seeked', presented); scrubber.dispose(); controller.current = null; };
  }, [nativeSource, onReady, present]);

  return <div ref={surface} style={{ position: 'absolute', inset: 0 }}>{nativeSource
    ? <video ref={video} className={className} src={nativeSource} poster={poster} muted playsInline preload="auto" aria-label={label} data-process-master-video data-film-renderer="native" onError={() => onReady(false)} />
    : <canvas ref={canvas} className={className} width={1920} height={1080} role="img" aria-label={label} data-process-master-video data-film-renderer="frames" />}
    <picture>
      <source media="(max-width: 1023px)" srcSet="/process/process-final-house-mobile.webp" />
      <Image ref={finish} src="/process/process-final-house.webp" alt="" aria-hidden="true" fill unoptimized loading="eager" className={className} data-process-finish style={{ opacity: 0, pointerEvents: 'none' }} />
    </picture>
  </div>;
}
