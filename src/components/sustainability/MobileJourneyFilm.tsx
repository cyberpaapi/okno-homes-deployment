"use client";

import { useEffect, useImperativeHandle, useRef, useState, type Ref } from "react";
import type { IndexedFilm } from "@/lib/indexedFrameScrubber";
import { mobileMedia } from "./mobileMedia";

export type MobileJourneyHandle = {
  setTime(time: number): void;
  setActive(active: boolean): void;
};
type Scrubber = { setTime(time: number): void; dispose(): void };
type Props = { ref: Ref<MobileJourneyHandle>; className: string; onPresent(time: number): void };

/** One phone film decoder: original AVC packets, with a native fallback. */
export default function MobileJourneyFilm({ ref, className, onPresent }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const controller = useRef<Scrubber | null>(null);
  const requestedTime = useRef(0);
  const present = useRef(onPresent);
  const forceNative = useRef(false);
  const [active, setActive] = useState(true);
  const [nativeSource, setNativeSource] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const [nativeReady, setNativeReady] = useState(false);
  useEffect(() => { present.current = onPresent; }, [onPresent]);

  useImperativeHandle(ref, () => ({
    setTime(time) {
      requestedTime.current = Math.min((mobileMedia.journeyFrames - 1) / mobileMedia.frameRate, Math.max(0, time));
      controller.current?.setTime(requestedTime.current);
    },
    setActive(next) {
      if (!next && video.current && video.current.readyState >= 2) {
        try {
          const context = canvas.current?.getContext("2d", { alpha: false });
          if (context) { context.drawImage(video.current, 0, 0, 1080, 1920); setCanvasReady(true); }
        } catch { /* Retain the preceding valid canvas if a native frame is unavailable. */ }
      }
      if (!next) setNativeReady(false);
      setActive(next);
    },
  }), []);

  useEffect(() => {
    if (!active) return;
    let disposed = false;
    const abort = new AbortController();
    let local: Scrubber | null = null;
    let fallingBack = false;
    const node = canvas.current;
    const debug = new URLSearchParams(window.location.search).has("media-debug");
    const stats = { renderer: "frames", presentations: 0, presentedTime: null as number | null, targetTime: 0,
      latencyMs: [] as number[], displayGapMs: [] as number[], cacheFrames: 0 };
    let previousDraw = 0;
    const sample = (values: number[], value: number) => { values.push(Math.round(value * 10) / 10); if (values.length > 60) values.shift(); };
    const presented = (time: number) => {
      if (disposed) return;
      setCanvasReady(true);
      present.current(time);
      if (debug && node) {
        const now = performance.now();
        stats.presentations++;
        stats.presentedTime = time;
        stats.targetTime = requestedTime.current;
        stats.cacheFrames = Number(node.dataset.scrubCacheFrames || 0);
        sample(stats.latencyMs, Number(node.dataset.scrubLastMs || node.dataset.scrubLoadMs || 0));
        if (previousDraw) sample(stats.displayGapMs, now - previousDraw);
        previousDraw = now;
        node.dataset.mediaDebug = JSON.stringify(stats);
      }
    };
    const fallback = () => {
      if (disposed || fallingBack) return;
      fallingBack = true;
      forceNative.current = true;
      // Close the packet decoder before binding the native source. The canvas
      // keeps its last painted frame while that source prepares its target.
      abort.abort();
      local?.dispose();
      local = null;
      controller.current = null;
      setNativeSource(true);
    };
    if (forceNative.current || typeof VideoDecoder === "undefined") fallback();
    else void (async () => {
      const [{ createIndexedFrameScrubber }, { default: film }] = await Promise.all([
        import("@/lib/indexedFrameScrubber"), import("../../../config/sustainability-mobile-video.json"),
      ]);
      if (disposed || !node) return;
      local = await createIndexedFrameScrubber(film as IndexedFilm, node, abort.signal, () => {}, fallback, presented,
        undefined, { cacheLimit: 24, boundedPresentation: true, preserveFrame: true, reverseKeyframesFirst: true });
      if (disposed || fallingBack) { local?.dispose(); return; }
      if (!local) { fallback(); return; }
      controller.current = local;
      local.setTime(requestedTime.current);
    })().catch(fallback);
    return () => {
      disposed = true;
      abort.abort();
      local?.dispose();
      controller.current = null;
    };
  }, [active]);

  useEffect(() => {
    if (!nativeSource || !active || !video.current) return;
    const element = video.current;
    let disposed = false;
    let raf = 0;
    let videoFrame = 0;
    let pending: number | null = null;
    const queue = () => { if (!disposed && !raf && !document.hidden && pending === null) raf = requestAnimationFrame(seek); };
    const announce = (time: number) => {
      if (disposed || pending !== null || element.readyState < 2 || element.seeking ||
        Math.abs(element.currentTime - requestedTime.current) >= 0.5 / mobileMedia.frameRate) return;
      setNativeReady(true);
      present.current(time);
    };
    const seek = () => {
      raf = 0;
      if (disposed || document.hidden || pending !== null || element.seeking || element.readyState < 2) return;
      const time = requestedTime.current + 0.25 / mobileMedia.frameRate;
      if (Math.abs(element.currentTime - time) < 0.5 / mobileMedia.frameRate) { announce(element.currentTime); return; }
      pending = time;
      element.currentTime = time;
    };
    const complete = () => {
      if (disposed || element.seeking || element.readyState < 2) return;
      pending = null;
      announce(element.currentTime);
      queue();
    };
    const observe = (_now: number, metadata: VideoFrameCallbackMetadata) => {
      if (disposed) return;
      complete();
      announce(metadata.mediaTime);
      videoFrame = element.requestVideoFrameCallback(observe);
    };
    const native: Scrubber = { setTime: queue, dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      if (videoFrame) element.cancelVideoFrameCallback?.(videoFrame);
      element.removeEventListener("loadeddata", complete);
      element.removeEventListener("seeked", complete);
      element.pause();
      element.removeAttribute("src");
      element.load();
    } };
    controller.current = native;
    element.addEventListener("loadeddata", complete);
    element.addEventListener("seeked", complete);
    if (element.requestVideoFrameCallback) videoFrame = element.requestVideoFrameCallback(observe);
    queue();
    return () => { native.dispose(); controller.current = null; };
  }, [active, nativeSource]);

  return <>
    <canvas ref={canvas} className={className} width={1080} height={1920} aria-hidden="true"
      data-mobile-journey-film data-film-renderer="frames"
      style={{ visibility: canvasReady && !nativeReady ? "visible" : "hidden" }} />
    {nativeSource && active && <video ref={video} className={className} src={mobileMedia.journey} muted playsInline preload="auto"
      data-mobile-journey-film data-film-renderer="native" style={{ visibility: nativeReady ? "visible" : "hidden" }} />}
  </>;
}
