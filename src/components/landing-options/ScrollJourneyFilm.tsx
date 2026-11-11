'use client';

import { useEffect, useRef, useState } from 'react';
import { useMotionValueEvent, type MotionValue } from 'motion/react';
import { createScrollVideoScrubber } from '@/lib/scrollVideoScrubber';
import { downloadHeroMedia } from '@/lib/downloadHeroMedia';
import { isEmbeddedSitePreview } from '@/lib/sitePreview';
import { heroFilmLastTime, heroFilmProgress } from '@/lib/heroFilmScroll';
import heroFilm from '../../../config/hero-v1-video.json';

// The pose banks index the merged opening film (woods traversal + journey).
const indexedSource = heroFilm.source;
type Controller = { setTime(time: number): void; seek(time: number): void; dispose(): void };
export default function ScrollJourneyFilm({ src, poster, progress, className, onReady, onProgress, onLoadProgress }: {
  src: string; poster: string; progress: MotionValue<number>; className: string; onReady(ready: boolean): void; onProgress(progress: number): void; onLoadProgress?(progress: number | null): void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const controller = useRef<Controller | null>(null);
  const duration = useRef(heroFilm.packets.length / heroFilm.fps);
  const [nativeUrl, setNativeUrl] = useState<string | null>(null);
  const sync = () => controller.current?.setTime(heroFilmProgress(progress.get()) * heroFilmLastTime(duration.current));
  useMotionValueEvent(progress, 'change', sync);
  useEffect(() => {
    const abort = new AbortController();
    let local: Controller | null = null;
    let objectUrl: string | null = null;
    let fallingBack = false;
    onReady(false);
    onLoadProgress?.(0);
    const loading = (amount: number) => { if (!abort.signal.aborted) onLoadProgress?.(amount); };
    const failed = () => { if (!abort.signal.aborted) { onReady(false); onLoadProgress?.(null); } };
    const nativeFallback = async () => {
      if (fallingBack || abort.signal.aborted) return;
      fallingBack = true;
      local?.dispose(); local = null; controller.current = null;
      onReady(false); loading(0);
      try {
        const data = await downloadHeroMedia(src, abort.signal, loading);
        if (abort.signal.aborted) return;
        objectUrl = URL.createObjectURL(new Blob([data as BlobPart], { type: 'video/mp4' }));
        setNativeUrl(objectUrl);
      } catch { failed(); }
    };
    void (async () => {
      if (isEmbeddedSitePreview() || src !== indexedSource || !canvas.current || typeof createImageBitmap !== 'function') {
        await nativeFallback(); return;
      }
      const { createHeroImageScrubber, heroImageDuration, heroImageAsset } = await import('@/lib/heroImageScrubber');
      const asset = heroImageAsset();
      const data = await downloadHeroMedia(asset.source, abort.signal, loading, asset.bytes);
      if (abort.signal.aborted || !canvas.current) return;
      duration.current = heroImageDuration;
      local = createHeroImageScrubber(canvas.current, abort.signal, () => onReady(true), () => { void nativeFallback(); },
        time => onProgress(Math.min(1, time / Math.max(1 / 24, heroFilmLastTime(duration.current)))), undefined, data);
      if (!local) { await nativeFallback(); return; }
      controller.current = local;
      sync();
    })().catch(failed);
    return () => {
      abort.abort(); local?.dispose(); controller.current = null;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
    // sync reads the latest scroll position when the complete download is ready.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, progress, onReady, onProgress, onLoadProgress]);
  useEffect(() => {
    if (!nativeUrl || !video.current) return;
    const element = video.current;
    const scrubber = createScrollVideoScrubber(element, 24, time => onProgress(Math.min(1, time / Math.max(1 / 24, heroFilmLastTime(duration.current)))));
    controller.current = scrubber;
    const ready = () => {
      if (!Number.isFinite(element.duration) || element.duration <= 0 || element.readyState < 2) return;
      duration.current = element.duration;
      onReady(true); onProgress(0); sync();
    };
    element.addEventListener('loadeddata', ready);
    if (element.readyState >= 2) ready();
    return () => { element.removeEventListener('loadeddata', ready); scrubber.dispose(); controller.current = null; };
    // The blob URL exists only after the entire video has been downloaded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nativeUrl, progress, onReady, onProgress]);
  return nativeUrl
    ? <video ref={video} className={className} src={nativeUrl} poster={poster} muted playsInline preload="auto" aria-hidden="true" data-film-renderer="native" onError={() => { onReady(false); onLoadProgress?.(null); }} />
    : <canvas ref={canvas} className={className} width={1920} height={1080} aria-hidden="true" data-film-renderer="images" />;
}
