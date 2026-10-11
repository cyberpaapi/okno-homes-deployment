"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { useMotionValue } from "motion/react";
import { ChapterGesture, chapterBoundary, chapterEnd, PROCESS_FPS } from "@/lib/processChapters";

type Playback = "opening" | "loading" | "playing" | "paused" | "blocked" | "finished";

export function useChapterPlayback(trackRef: RefObject<HTMLElement | null>, videoRef: RefObject<HTMLVideoElement | null>, sourceIdentity: string) {
  const [state, setState] = useState<{ chapter: number; playback: Playback; revealed: boolean }>({ chapter: 0, playback: "opening", revealed: false });
  const progress = useMotionValue(0);
  const actions = useRef({ next: () => {}, previous: () => {}, leave: () => {} });

  useEffect(() => {
    const video = videoRef.current;
    const track = trackRef.current;
    if (!video || !track) return;
    let chapter = 0;
    let playback: Playback = "opening";
    let locked = false;
    let revealed = false;
    let released = false;
    let disposed = false;
    let touchY = 0;
    let touchMayAdvance = false;
    let frame = 0;
    let frameIsVideo = false;
    let playAttempt = 0;
    let resumeCurrent = false;
    const gesture = new ChapterGesture();
    const anchor = () => track.getBoundingClientRect().top + window.scrollY + window.innerHeight * .55;
    const pinned = () => locked && !released;
    const publish = () => { if (!disposed) setState({ chapter, playback, revealed }); };
    const stopMonitor = () => {
      if (!frame) return;
      if (frameIsVideo) video.cancelVideoFrameCallback(frame);
      else cancelAnimationFrame(frame);
      frame = 0;
    };
    const hold = (atEnd = true) => {
      ++playAttempt;
      video.pause();
      stopMonitor();
      playback = "paused";
      gesture.reset(performance.now());
      if (atEnd) progress.set((chapter + 1) / 6);
      publish();
    };
    const monitor = (_now: number, metadata?: VideoFrameCallbackMetadata) => {
      frame = 0;
      if (disposed || playback !== "playing") return;
      const time = metadata?.mediaTime ?? video.currentTime;
      const start = chapterBoundary(chapter, video.duration);
      const end = chapterEnd(chapter, video.duration);
      progress.set((chapter + Math.max(0, Math.min(1, (time - start) / Math.max(1 / PROCESS_FPS, end - start)))) / 6);
      if (time >= end - 1 / (PROCESS_FPS * 2)) {
        hold();
        // One correction per stop; never seek repeatedly while playing.
        if (video.currentTime > end + 1 / PROCESS_FPS) video.currentTime = end;
        return;
      }
      frameIsVideo = typeof video.requestVideoFrameCallback === "function";
      frame = frameIsVideo ? video.requestVideoFrameCallback(monitor) : requestAnimationFrame(monitor);
    };
    const play = () => {
      if (disposed || document.hidden || !pinned()) return;
      const attempt = ++playAttempt;
      if (video.readyState < 2) { playback = "loading"; publish(); return; }
      playback = "playing";
      video.playbackRate = 1;
      publish();
      void video.play().then(() => {
        if (disposed || attempt !== playAttempt || !pinned() || document.hidden) { video.pause(); return; }
        revealed = true;
        publish();
        stopMonitor();
        monitor(performance.now());
      }).catch(() => {
        if (disposed || attempt !== playAttempt) return;
        playback = "blocked";
        publish();
      });
    };
    const leave = (direction = 1) => {
      ++playAttempt;
      locked = false;
      released = true;
      video.pause();
      stopMonitor();
      playback = "finished";
      publish();
      const top = track.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: direction < 0 ? Math.max(0, top - 1) : top + track.offsetHeight, behavior: "smooth" });
    };
    const advance = (direction: number) => {
      if (!pinned() || playback === "playing" || playback === "loading") return;
      if (direction < 0) {
        resumeCurrent = false;
        if (chapter === 0) { leave(-1); return; }
        --chapter;
        video.currentTime = chapterEnd(chapter, video.duration);
        hold();
      } else if (playback === "blocked" || resumeCurrent) { resumeCurrent = false; play(); }
      else if (chapter === 5) leave();
      else {
        ++chapter;
        // Continue directly from the held frame. Seeking even a few milliseconds
        // at every cut flushes the decoder and can flash a loading state.
        play();
      }
    };
    const onScroll = () => {
      const rect = track.getBoundingClientRect();
      if (released) {
        if (window.scrollY < anchor() - 80) {
          released = false; revealed = false; chapter = 0; playback = "opening";
          video.currentTime = 0; progress.set(0); publish();
        }
        return;
      }
      // A full-page wheel/PageDown gesture can jump past the sticky interval.
      // Catch that crossing while any of the short film track is still visible.
      if (!locked && !document.hidden && rect.top <= -window.innerHeight * .55 && rect.bottom > 0) {
        locked = true; gesture.reset(performance.now()); play();
      }
      if (pinned() && Math.abs(window.scrollY - anchor()) > 1) window.scrollTo({ top: anchor(), behavior: "instant" });
    };
    const interactive = (target: EventTarget | null) => target instanceof Element && !!target.closest("a,button,input,select,textarea,[contenteditable=true],[role=dialog]");
    const onWheel = (event: WheelEvent) => {
      if (!pinned() || event.ctrlKey || interactive(event.target) || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      event.preventDefault();
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1);
      const direction = gesture.push(delta, performance.now(), playback === "playing" || playback === "loading");
      if (direction) advance(direction);
    };
    const onKey = (event: KeyboardEvent) => {
      if (!pinned() || interactive(event.target) || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === "Escape" || event.key === "End") { event.preventDefault(); leave(); return; }
      if (event.key === "Home") { event.preventDefault(); leave(-1); return; }
      const direction = ["ArrowDown", "PageDown", " "].includes(event.key) ? (event.shiftKey ? -1 : 1) : ["ArrowUp", "PageUp"].includes(event.key) ? -1 : 0;
      if (!direction) return;
      event.preventDefault();
      if (!event.repeat) advance(direction);
    };
    const onTouchStart = (event: TouchEvent) => {
      touchY = event.touches[0]?.clientY ?? 0;
      touchMayAdvance = pinned() && playback !== "playing" && playback !== "loading";
    };
    const onTouchMove = (event: TouchEvent) => {
      if (pinned() && !interactive(event.target) && event.touches.length === 1) event.preventDefault();
    };
    const onTouchEnd = (event: TouchEvent) => {
      if (!pinned() || !touchMayAdvance || interactive(event.target)) return;
      const delta = touchY - (event.changedTouches[0]?.clientY ?? touchY);
      if (Math.abs(delta) > 40) advance(Math.sign(delta));
    };
    const onReady = () => { if (playback === "loading") play(); };
    const onWaiting = () => {
      if (pinned() && playback === "playing") { playback = "loading"; stopMonitor(); publish(); }
    };
    const onVisibility = () => {
      if (document.hidden && (playback === "playing" || playback === "loading")) {
        resumeCurrent = true;
        hold(false);
      }
    };
    const onError = () => { if (pinned()) { hold(); playback = "blocked"; publish(); } };
    const onEnded = () => { if (playback === "playing") hold(); };
    actions.current = { next: () => advance(1), previous: () => advance(-1), leave: () => leave() };
    progress.set(0);
    video.pause();
    video.load();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    video.addEventListener("canplay", onReady);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("error", onError);
    video.addEventListener("ended", onEnded);
    document.addEventListener("visibilitychange", onVisibility);
    onScroll();
    return () => {
      disposed = true; ++playAttempt; locked = false; stopMonitor(); video.pause();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      video.removeEventListener("canplay", onReady);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("error", onError);
      video.removeEventListener("ended", onEnded);
      document.removeEventListener("visibilitychange", onVisibility);
      actions.current = { next: () => {}, previous: () => {}, leave: () => {} };
    };
  }, [progress, sourceIdentity, trackRef, videoRef]);

  return { ...state, progress, next: () => actions.current.next(), previous: () => actions.current.previous(), leave: () => actions.current.leave() };
}
