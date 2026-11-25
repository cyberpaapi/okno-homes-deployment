"use client";

import { pageImageLoader } from "@/lib/pageImageLoader";
import Header from "@/components/Header/Header";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import styles from "./Sustainability.module.css";
import SustainabilitySurround from "./SustainabilitySurround";
import MobileJourneyFilm, { type MobileJourneyHandle } from "./MobileJourneyFilm";
import { sustainabilitySurround } from "./surroundPalette";
import { useSiteContentMap } from "@/lib/useSiteContent";
import {
  mobileMedia, phoneMediaQuery, phoneMediaSnapshot,
  serverMediaSnapshot, subscribeToPhoneMedia,
} from "./mobileMedia";

type SceneId = "hero" | "site" | "canopy" | "production" | "longevity" | "fog";

type StoryScene = {
  title: string;
};

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const range = (value: number, start: number, end: number) =>
  clamp((value - start) / (end - start));

const storyScenes: Record<"site" | "canopy" | "production" | "longevity", StoryScene> = {
  site: {
    title: "Read the site before drawing the home.",
  },
  canopy: {
    title: "Keep what already works.",
  },
  production: {
    title: "Move precision work off the land.",
  },
  longevity: {
    title: "Design for a longer life.",
  },
};

const narrativeVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.05 },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.35, ease: [0.4, 0, 1, 1] },
  },
};

const lineVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.95, ease: [0.16, 1, 0.3, 1] },
  },
};

function sceneFromProgress(progress: number): SceneId {
  if (progress < 0.13) return "hero";
  if (progress < 0.31) return "site";
  if (progress < 0.49) return "canopy";
  if (progress < 0.67) return "production";
  if (progress < 0.82) return "longevity";
  return "fog";
}

function StoryTitle({ title }: { title: string }) {
  const finalSpace = title.lastIndexOf(" ");
  if (finalSpace < 0) return title;
  return (
    <>
      {title.slice(0, finalSpace + 1)}
      <span data-type-highlight>{title.slice(finalSpace + 1)}</span>
    </>
  );
}

export default function SustainabilityJourney() {
  const values = useSiteContentMap();
  const get = (key: string, fallback: string) => values[`sustainability.journey.${key}`] ?? fallback;
  const trackRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const idleVideoRef = useRef<HTMLVideoElement>(null);
  const journeyVideoRef = useRef<HTMLVideoElement>(null);
  const mobileJourneyRef = useRef<MobileJourneyHandle>(null);
  const mobilePresentationRef = useRef<(time: number) => void>(() => {});
  const mobilePresented = useCallback((time: number) => mobilePresentationRef.current(time), []);
  const fogVideoRef = useRef<HTMLVideoElement>(null);
  const fogStartedRef = useRef(false);
  const idleWasPausedRef = useRef(false);
  const [scene, setScene] = useState<SceneId>("hero");
  const prefersReducedMotion = useReducedMotion();
  // SSR leaves movies unbound. The responsive poster is already correct before
  // hydration, and a phone never starts downloading the desktop movies.
  const phoneMedia = useSyncExternalStore<boolean | null>(subscribeToPhoneMedia, phoneMediaSnapshot, serverMediaSnapshot);
  const moviesEnabled = phoneMedia !== null && !prefersReducedMotion;

  useEffect(() => {
    const track = trackRef.current;
    const viewport = viewportRef.current;
    if (!track || !viewport || phoneMedia === null) return;

    let frame = 0;
    let scrubFrame = 0;
    let revealFrame = 0;
    let desktopReveal = 0;
    let desktopRevealTarget = 0;
    let revealInitialized = false;
    let targetJourneyProgress = 0;
    let smoothedJourneyProgress = 0;
    let previousScrubTime = performance.now();
    let mobileFrameInitialized = false;
    let mobileEndpointReady = false;
    let mobilePresentedTime: number | null = null;
    let mobileEndpointSince: number | null = null;
    let mobileFogWarmed = false;
    let mobileFogWanted = false;
    let mobileFogPlaying = false;
    let fogPlayPending: Promise<void> | null = null;
    let fogPlayGeneration = 0;
    let fogPendingGeneration = 0;
    let fogPlayBlocked = false;
    let stageVisible = true;
    let disposed = false;
    const compactViewport = window.matchMedia("(max-width: 820px)");
    const idleVideo = idleVideoRef.current;
    const journeyVideo = journeyVideoRef.current;
    const fogVideo = fogVideoRef.current;
    const journeyEnabled = Boolean((phoneMedia ? mobileJourneyRef.current : journeyVideo) && !prefersReducedMotion);
    const sourceFrameRate = phoneMedia ? mobileMedia.frameRate : 24;
    const sourceFrameDuration = 1 / sourceFrameRate;
    const fogDebug = phoneMedia && new URLSearchParams(window.location.search).has("media-debug")
      ? { warmAt: null as number | null, readyAt: null as number | null, playAt: null as number | null,
        playingAt: null as number | null, endpointAt: null as number | null, endpointPresentedAt: null as number | null,
        loads: 0, plays: 0, resets: 0 } : null;
    const publishFogDebug = () => {
      if (fogDebug && fogVideo) fogVideo.dataset.fogDebug = JSON.stringify({ ...fogDebug,
        pending: fogPlayPending !== null, wanted: mobileFogWanted, playing: mobileFogPlaying,
        readyState: fogVideo.readyState, seeking: fogVideo.seeking });
    };
    fogStartedRef.current = false;
    idleWasPausedRef.current = false;

    const canAnimate = () => !prefersReducedMotion && !document.hidden && stageVisible;

    // Desktop exchanges complete after crossing the boundary even if scrolling
    // stops. Phones keep their accepted continuously scrubbed text timeline.
    const setDesktopReveal = (target: number, immediate: boolean) => {
      if (immediate) {
        if (revealFrame) window.cancelAnimationFrame(revealFrame);
        revealFrame = 0;
        desktopReveal = target;
        desktopRevealTarget = target;
        viewport.style.setProperty("--final-reveal", target.toFixed(5));
        return;
      }
      if (target === desktopRevealTarget) return;
      desktopRevealTarget = target;
      if (revealFrame) window.cancelAnimationFrame(revealFrame);
      const from = desktopReveal;
      let started: number | null = null;
      const advance = (now: number) => {
        started ??= now;
        const elapsed = range(now - started, 0, 1100);
        const eased = elapsed * elapsed * (3 - 2 * elapsed);
        desktopReveal = from + (target - from) * eased;
        viewport.style.setProperty("--final-reveal", desktopReveal.toFixed(5));
        revealFrame = elapsed < 1 ? window.requestAnimationFrame(advance) : 0;
      };
      revealFrame = window.requestAnimationFrame(advance);
    };

    const syncJourneyFrame = (now: number) => {
      scrubFrame = 0;
      if (!journeyEnabled || (phoneMedia && !canAnimate())) return;
      const elapsed = Math.min((now - previousScrubTime) / 1000, 0.05);
      previousScrubTime = now;
      const damping = 1 - Math.exp(-elapsed * (compactViewport.matches ? 10 : 5.2));
      smoothedJourneyProgress += (targetJourneyProgress - smoothedJourneyProgress) * damping;
      // Quantization plus asymptotic damping must not hold the phone's last
      // few frames after the real scroll endpoint has already been reached.
      if (phoneMedia && targetJourneyProgress === 1 && mobileEndpointSince !== null &&
        now - mobileEndpointSince >= 120) smoothedJourneyProgress = 1;
      let frameCaughtUp = true;
      if (phoneMedia) {
        const time = Math.round(smoothedJourneyProgress * (mobileMedia.journeyFrames - 1)) / sourceFrameRate;
        mobileJourneyRef.current?.setTime(time);
      } else if (journeyVideo && Number.isFinite(journeyVideo.duration) && journeyVideo.duration > 0) {
        const rawTime = smoothedJourneyProgress * Math.max(journeyVideo.duration - sourceFrameDuration, 0);
        const nextTime = Math.round(rawTime * sourceFrameRate) / sourceFrameRate;
        if (!journeyVideo.seeking && Math.abs(journeyVideo.currentTime - nextTime) >= sourceFrameDuration * 0.5) {
          journeyVideo.currentTime = nextTime;
          frameCaughtUp = false;
        } else if (journeyVideo.seeking) frameCaughtUp = false;
      }
      if (Math.abs(targetJourneyProgress - smoothedJourneyProgress) < 0.0004 && frameCaughtUp) {
        smoothedJourneyProgress = targetJourneyProgress;
        return;
      }
      scrubFrame = window.requestAnimationFrame(syncJourneyFrame);
    };
    const requestJourneySync = () => {
      if (disposed || !journeyEnabled || scrubFrame || (phoneMedia && !canAnimate())) return;
      previousScrubTime = performance.now();
      scrubFrame = window.requestAnimationFrame(syncJourneyFrame);
    };
    mobilePresentationRef.current = (time) => {
      if (disposed) return;
      mobilePresentedTime = time;
      const endpoint = Math.abs(time - (mobileMedia.journeyFrames - 1) / sourceFrameRate) < sourceFrameDuration * 0.5;
      if (fogDebug && endpoint && fogDebug.endpointPresentedAt === null) fogDebug.endpointPresentedAt = performance.now();
      if (endpoint !== mobileEndpointReady) {
        mobileEndpointReady = endpoint;
        requestUpdate();
      }
    };

    const handleJourneyMetadata = () => {
      if (!journeyVideo) return;
      journeyVideo.pause();
      requestJourneySync();
    };
    const handleLoopData = () => { if (!disposed) requestUpdate(); };
    const fogHasFrame = () => Boolean(fogVideo && fogVideo.readyState >= 2 && !fogVideo.seeking);
    const confirmFogPlaying = (generation: number) => {
      if (disposed || generation !== fogPlayGeneration || !mobileFogWanted || !canAnimate() ||
        !fogHasFrame() || fogVideo?.paused) return;
      mobileFogPlaying = true;
      if (fogDebug && fogDebug.playingAt === null) fogDebug.playingAt = performance.now();
      publishFogDebug();
      requestUpdate();
    };
    const handleFogData = () => {
      if (disposed) return;
      fogPlayBlocked = false;
      if (fogDebug && fogHasFrame() && fogDebug.readyAt === null) fogDebug.readyAt = performance.now();
      publishFogDebug();
      requestUpdate();
    };
    const handleFogPlaying = () => {
      if (!mobileFogWanted || !canAnimate()) { fogVideo?.pause(); return; }
      confirmFogPlaying(fogPlayPending ? fogPendingGeneration : fogPlayGeneration);
    };
    const handleFogWaiting = () => { mobileFogPlaying = false; requestUpdate(); };
    const syncMobileFog = (progress: number) => {
      if (!fogVideo || !phoneMedia || prefersReducedMotion) return;
      if (!mobileFogWarmed && progress >= 0.35 && canAnimate()) {
        mobileFogWarmed = true;
        fogVideo.preload = "auto";
        if (fogDebug) { fogDebug.warmAt = performance.now(); fogDebug.loads++; }
        fogVideo.load();
        publishFogDebug();
      }
      const wanted = canAnimate() && progress >= 0.785 && mobileEndpointReady;
      if (!wanted) {
        if (mobileFogWanted) fogPlayGeneration++;
        mobileFogWanted = false;
        mobileFogPlaying = false;
        fogVideo.pause();
        // Nearby reversal pauses in place. A real return to the preceding
        // scene resets once, after any outstanding native seek completes.
        if (progress < 0.72 && fogStartedRef.current && !fogVideo.seeking) {
          if (fogVideo.currentTime > 0.001) {
            fogVideo.currentTime = 0;
            if (fogDebug) fogDebug.resets++;
          }
          fogStartedRef.current = false;
        }
        publishFogDebug();
        return;
      }
      mobileFogWanted = true;
      if (!fogHasFrame() || fogPlayPending || fogPlayBlocked || (mobileFogPlaying && !fogVideo.paused)) return;
      const generation = fogPlayGeneration;
      fogPendingGeneration = generation;
      fogStartedRef.current = true;
      if (fogDebug) { fogDebug.playAt = performance.now(); fogDebug.plays++; }
      const attempt = fogVideo.play();
      fogPlayPending = attempt;
      publishFogDebug();
      void attempt.then(() => {
        if (disposed) return;
        if (generation === fogPlayGeneration) confirmFogPlaying(generation);
        else if (!mobileFogWanted) fogVideo.pause();
      }).catch(() => {
        if (!disposed && generation === fogPlayGeneration) fogPlayBlocked = true;
      }).finally(() => {
        if (disposed || fogPlayPending !== attempt) return;
        fogPlayPending = null;
        publishFogDebug();
        if (generation !== fogPlayGeneration && mobileFogWanted) requestUpdate();
      });
    };

    if (journeyVideo) {
      journeyVideo.pause();
      journeyVideo.addEventListener("loadedmetadata", handleJourneyMetadata);
    }
    // A muted play request can reject while a source is still opening. Retry
    // only when its active loop gains data, retaining its matching poster.
    if (phoneMedia) {
      idleVideo?.addEventListener("loadeddata", handleLoopData);
      idleVideo?.addEventListener("canplay", handleLoopData);
      for (const event of ["loadeddata", "canplay", "seeked"]) fogVideo?.addEventListener(event, handleFogData);
      fogVideo?.addEventListener("playing", handleFogPlaying);
      fogVideo?.addEventListener("waiting", handleFogWaiting);
    }

    const update = () => {
      const rect = track.getBoundingClientRect();
      const distance = Math.max(track.offsetHeight - viewport.offsetHeight, 1);
      const progress = clamp(-rect.top / distance);
      if (phoneMedia && !mobileFrameInitialized) {
        // Reloads and breakpoint changes start at the current scroll position.
        smoothedJourneyProgress = range(progress, 0.12, 0.785);
        mobileFrameInitialized = true;
      }
      if (phoneMedia) {
        if (progress >= 0.785) mobileEndpointSince ??= performance.now();
        else mobileEndpointSince = null;
        if (fogDebug && mobileEndpointSince !== null && fogDebug.endpointAt === null) fogDebug.endpointAt = mobileEndpointSince;
        mobileEndpointReady = mobilePresentedTime !== null &&
          Math.abs(mobilePresentedTime - (mobileMedia.journeyFrames - 1) / sourceFrameRate) < sourceFrameDuration * 0.5;
        mobileJourneyRef.current?.setActive(canAnimate());
        syncMobileFog(progress);
      }
      const nextScene = sceneFromProgress(progress);
      const surround = sustainabilitySurround(progress);
      viewport.style.setProperty("--surround-top", surround.top);
      viewport.style.setProperty("--surround-bottom", surround.bottom);

      setScene((current) => (current === nextScene ? current : nextScene));

      viewport.style.setProperty(
        "--hero-content-opacity",
        (1 - range(progress, 0.04, 0.115)).toFixed(4),
      );
      viewport.style.setProperty("--fog-treatment", range(progress, 0.785, 0.87).toFixed(4));
      viewport.style.setProperty("--chapter-presence", range(progress, 0.10, 0.13).toFixed(5));
      // One reversible scroll timeline: gather first, then exchange titles.
      const gather = range(progress, 0.70, 0.84);
      const easedGather = gather * gather * (3 - 2 * gather);
      viewport.style.setProperty("--final-presence", range(progress, 0.67, 0.70).toFixed(5));
      viewport.style.setProperty("--final-gather", (prefersReducedMotion ? 1 : easedGather).toFixed(5));
      viewport.style.setProperty("--final-copy-opacity", range(progress, 0.68, 0.74).toFixed(5));
      if (compactViewport.matches) {
        // Cancel a desktop handoff when resizing into the accepted compact view.
        setDesktopReveal(range(progress, 0.84, 0.91), true);
      } else {
        // A small reversal band prevents oscillation at the exchange boundary.
        const revealTarget = progress >= 0.84 ? 1 : progress < 0.82 ? 0 : desktopRevealTarget;
        setDesktopReveal(revealTarget, Boolean(prefersReducedMotion) || !revealInitialized);
      }
      revealInitialized = true;

      if (prefersReducedMotion) {
        viewport.style.setProperty("--idle-opacity", progress < 0.75 ? "1" : "0");
        viewport.style.setProperty("--journey-opacity", "0");
        viewport.style.setProperty("--fog-opacity", progress >= 0.75 ? "1" : "0");
      } else {
        const idleOpacity = 1 - range(progress, 0.055, 0.145);
        const journeyIn = range(progress, 0.07, 0.145);
        // Phone fog begins at the actual scroll endpoint, never while the
        // portrait camera is still moving toward its final composition.
        const journeyOut = phoneMedia
          ? mobileEndpointReady && mobileFogPlaying && fogHasFrame() ? 1 - range(progress, 0.785, 0.85) : 1
          : 1 - range(progress, 0.755, 0.845);
        const fogOpacity = phoneMedia
          ? mobileEndpointReady && mobileFogPlaying && fogHasFrame() ? range(progress, 0.785, 0.85) : 0
          : range(progress, 0.765, 0.85);

        viewport.style.setProperty("--idle-opacity", idleOpacity.toFixed(4));
        viewport.style.setProperty("--journey-opacity", (journeyIn * journeyOut).toFixed(4));
        viewport.style.setProperty("--fog-opacity", fogOpacity.toFixed(4));
        targetJourneyProgress = range(progress, 0.12, 0.785);
        requestJourneySync();
      }

      if (phoneMedia || prefersReducedMotion) {
        const play = (video: HTMLVideoElement | null) => {
          if (video?.paused) void video.play().catch(() => undefined);
        };
        if (canAnimate() && progress < 0.16) play(idleVideo);
        else idleVideo?.pause();
        if (phoneMedia && !prefersReducedMotion) {
          // Phone fog playback and readiness are coordinated before opacity.
        } else if (canAnimate() && progress >= 0.785 && mobileEndpointReady) {
          play(fogVideo);
          fogStartedRef.current = true;
        } else {
          fogVideo?.pause();
          if (progress < 0.785 && fogStartedRef.current) {
            if (fogVideo) fogVideo.currentTime = 0;
            fogStartedRef.current = false;
          }
        }
      } else if (idleVideo) {
        if (progress > 0.16 && !idleVideo.paused) {
          idleVideo.pause();
          idleWasPausedRef.current = true;
        } else if (progress < 0.12 && idleVideo.paused && idleWasPausedRef.current) {
          void idleVideo.play().catch(() => undefined);
          idleWasPausedRef.current = false;
        }
      }

      if (fogVideo && !phoneMedia && !prefersReducedMotion) {
        if (progress >= 0.745 && !fogStartedRef.current) {
          fogVideo.currentTime = 0;
          void fogVideo.play().catch(() => undefined);
          fogStartedRef.current = true;
        } else if (progress < 0.72 && fogStartedRef.current) {
          fogVideo.pause();
          fogVideo.currentTime = 0;
          fogStartedRef.current = false;
        }
      }

      frame = 0;
    };

    const requestUpdate = () => {
      if (!disposed && !frame) frame = window.requestAnimationFrame(update);
    };

    const visibility = typeof IntersectionObserver === "undefined" || !phoneMedia ? null : new IntersectionObserver(([entry]) => {
      stageVisible = entry.isIntersecting;
      requestUpdate();
    });
    visibility?.observe(track);
    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    document.addEventListener("visibilitychange", requestUpdate);
    return () => {
      disposed = true;
      fogPlayGeneration++;
      visibility?.disconnect();
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      document.removeEventListener("visibilitychange", requestUpdate);
      journeyVideo?.removeEventListener("loadedmetadata", handleJourneyMetadata);
      idleVideo?.removeEventListener("loadeddata", handleLoopData);
      idleVideo?.removeEventListener("canplay", handleLoopData);
      for (const event of ["loadeddata", "canplay", "seeked"]) fogVideo?.removeEventListener(event, handleFogData);
      fogVideo?.removeEventListener("playing", handleFogPlaying);
      fogVideo?.removeEventListener("waiting", handleFogWaiting);
      idleVideo?.pause();
      journeyVideo?.pause();
      fogVideo?.pause();
      if (frame) window.cancelAnimationFrame(frame);
      if (scrubFrame) window.cancelAnimationFrame(scrubFrame);
      if (revealFrame) window.cancelAnimationFrame(revealFrame);
      mobilePresentationRef.current = () => {};
    };
  }, [phoneMedia, prefersReducedMotion]);

  // Measure layout anchors only on layout changes, never during a scroll paint.
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const measure = () => {
      const heading = viewport.querySelector<HTMLElement>("[data-final-heading]");
      const copy = viewport.querySelector<HTMLElement>("[data-final-copy]");
      const source = viewport.querySelector<HTMLElement>("[data-final-origin]");
      if (!heading || !copy || !source) return;
      const top = (element: HTMLElement) => {
        let value = 0, node: HTMLElement | null = element;
        while (node && node !== viewport) { value += node.offsetTop; node = node.offsetParent as HTMLElement | null; }
        return value;
      };
      viewport.style.setProperty("--final-heading-travel", `${top(source) - top(heading)}px`);
      const bottomInset = Math.max(32, Math.min(82, viewport.clientHeight * .055));
      viewport.style.setProperty("--final-copy-travel", `${Math.max(0, viewport.clientHeight - bottomInset - top(copy) - copy.offsetHeight)}px`);
    };
    const resize = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    resize?.observe(viewport);
    const content = viewport.querySelector("[data-final-content]");
    if (content) resize?.observe(content);
    window.addEventListener("resize", measure);
    let disposed = false;
    void document.fonts?.ready.then(() => { if (!disposed) measure(); });
    measure();
    return () => { disposed = true; resize?.disconnect(); window.removeEventListener("resize", measure); };
  }, []);

  const story = scene !== "longevity" && scene in storyScenes ? storyScenes[scene as keyof typeof storyScenes] : null;
  const storyTitle = story ? get(`${scene}.title`, story.title) : "";
  const finalVisible = scene === "longevity" || scene === "fog";

  return (
    <div className={styles.page}>
      <section ref={trackRef} className={styles.scrollTrack} aria-label={get("accessible-label", "OKNO sustainability journey")}>
        <div ref={viewportRef} className={styles.stickyViewport} data-scene={scene}>
          <SustainabilitySurround viewport={viewportRef} />
          <div className={styles.mediaStage} aria-hidden="true" data-sustainability-film>
            <picture className={styles.sharedPoster}>
              <source media={phoneMediaQuery} srcSet={mobileMedia.heroPoster} />
              {/* Native picture selection supplies the correct pre-hydration frame. */}
              <img className={styles.posterImage} src={pageImageLoader({ src: get("shared-poster", "/sustainability/shared-poster.png"), width: 1200 })} alt="" />
            </picture>
            <div className={styles.mobileFogPoster} />
            <video
              key={`idle-${phoneMedia}-${Boolean(prefersReducedMotion)}`}
              ref={idleVideoRef}
              className={`${styles.mediaVideo} ${styles.idleVideo}`}
              src={moviesEnabled ? phoneMedia ? mobileMedia.idle : get("idle-video", "/sustainability/hero-idle.mp4") : undefined}
              poster={phoneMedia === null ? undefined : phoneMedia ? mobileMedia.heroPoster : pageImageLoader({ src: get("shared-poster", "/sustainability/shared-poster.png"), width: 1200 })}
              autoPlay={moviesEnabled && !phoneMedia}
              loop
              muted
              playsInline
              preload={moviesEnabled ? "metadata" : "none"}
            />
            {phoneMedia && moviesEnabled ? <MobileJourneyFilm ref={mobileJourneyRef}
              className={`${styles.mediaVideo} ${styles.journeyVideo}`} onPresent={mobilePresented} /> : (
            <video
              key={`journey-${phoneMedia}-${Boolean(prefersReducedMotion)}`}
              ref={journeyVideoRef}
              className={`${styles.mediaVideo} ${styles.journeyVideo}`}
              src={moviesEnabled ? phoneMedia ? mobileMedia.journey : get("scroll-video", "/sustainability/scroll-journey.mp4") : undefined}
              poster={phoneMedia === null ? undefined : phoneMedia ? mobileMedia.journeyPoster : pageImageLoader({ src: get("shared-poster", "/sustainability/shared-poster.png"), width: 1200 })}
              muted
              playsInline
              preload={moviesEnabled ? "auto" : "none"}
            />
            )}
            <video
              key={`fog-${phoneMedia}-${Boolean(prefersReducedMotion)}`}
              ref={fogVideoRef}
              className={`${styles.mediaVideo} ${styles.fogVideo}`}
              src={moviesEnabled ? phoneMedia ? mobileMedia.fog : get("fog-video", "/sustainability/fog-loop.mp4") : undefined}
              poster={phoneMedia === null ? undefined : phoneMedia ? mobileMedia.fogPoster : pageImageLoader({ src: get("fog-poster", "/sustainability/fog-poster.png"), width: 1200 })}
              loop
              muted
              playsInline
              preload="none"
            />
            <div className={styles.baseTreatment} />
            <div className={styles.fogTreatment} />
            <div className={styles.filmGrain} />
          </div>

          <Header currentHref="/sustainability" />

          <section
            className={styles.heroContent} data-type-section="sustainability.journey"
            aria-label={get("proof-label", "The material truth")}
            aria-hidden={scene !== "hero"}
          >
            <motion.div
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className={styles.heroTitle}
            >
              <h1 data-type-field={"sustainability.journey.hero-line-1"} data-sustainability-opening-title>{get("hero-line-1", "Build less")}<br />{get("hero-line-2", "against the ")}<span data-type-highlight data-type-field={"sustainability.journey.hero-emphasis"}>{get("hero-emphasis", "land.")}</span></h1>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className={styles.heroIntro}
            >
              <p data-type-field={"sustainability.journey.hero-copy"}>
                {get("hero-copy", "An OKNO home begins with what is already there—the slope, the trees, the light and the path water takes.")}
              </p>
            </motion.div>
          </section>

          <div className={styles.scanField} aria-hidden="true">
            <div className={`${styles.scanMarker} ${styles.scanOne}`}>
              <span className={styles.scanCorners} />
            </div>
            <div className={`${styles.scanMarker} ${styles.scanTwo}`}>
              <span className={styles.scanCorners} />
            </div>
            <div className={`${styles.scanMarker} ${styles.scanThree}`}>
              <span className={styles.scanCorners} />
            </div>
          </div>

          <div id="journey" className={styles.storyStage}>
            <div className={styles.storyPanel} data-final-origin aria-hidden="true" />
            <AnimatePresence initial={false} mode="wait">
              {story && (
                <motion.article
                  key={scene}
                  className={styles.storyPanel} data-type-section={`sustainability.journey-${scene}`}
                  variants={narrativeVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <motion.h2 variants={lineVariants}><StoryTitle title={storyTitle} /></motion.h2>
                </motion.article>
              )}
            </AnimatePresence>
          </div>

          <section
            className={styles.evidenceStage} data-type-section="sustainability.material-truth"
            aria-label={get("proof-label", "The material truth")}
            aria-hidden={!finalVisible}
          >
            <div className={styles.evidenceContent} data-final-content>
              <div className={styles.evidenceHeading} data-final-heading>
                <h2 className={styles.finalTitle} data-type-field={"sustainability.journey.proof-line-1"}>{get("proof-line-1", "The material")}<br /><span data-type-highlight data-type-field={"sustainability.journey.proof-line-2"}>{get("proof-line-2", "truth.")}</span></h2>
                <h2 className={styles.gatherTitle} aria-hidden="true"><StoryTitle title={get("longevity.title", storyScenes.longevity.title)} /></h2>
              </div>
              <p className={styles.evidenceCopy} data-final-copy data-type-field={"sustainability.journey.proof-copy"}>
                {get("proof-copy", "Site, structure and making are considered as one continuous decision—so the home can belong to the landscape instead of competing with it.")}
              </p>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
