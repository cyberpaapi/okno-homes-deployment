"use client";

import { pageImageLoader } from "@/lib/pageImageLoader";
import Header from "@/components/Header/Header";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import styles from "./Sustainability.module.css";
import SustainabilitySurround from "./SustainabilitySurround";
import { sustainabilitySurround } from "./surroundPalette";
import { useSiteContentMap } from "@/lib/useSiteContent";

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
  const fogVideoRef = useRef<HTMLVideoElement>(null);
  const fogStartedRef = useRef(false);
  const idleWasPausedRef = useRef(false);
  const [scene, setScene] = useState<SceneId>("hero");
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const track = trackRef.current;
    const viewport = viewportRef.current;
    if (!track || !viewport) return;

    let frame = 0;
    let scrubFrame = 0;
    let revealFrame = 0;
    let desktopReveal = 0;
    let desktopRevealTarget = 0;
    let revealInitialized = false;
    let targetJourneyProgress = 0;
    let smoothedJourneyProgress = 0;
    let previousScrubTime = performance.now();
    const compactViewport = window.matchMedia("(max-width: 820px)");
    const journeyVideo = journeyVideoRef.current;
    const journeyEnabled = Boolean(journeyVideo && !prefersReducedMotion);
    const sourceFrameRate = 24;
    const sourceFrameDuration = 1 / sourceFrameRate;

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
      if (!journeyVideo || !journeyEnabled) {
        scrubFrame = 0;
        return;
      }

      const elapsed = Math.min((now - previousScrubTime) / 1000, 0.05);
      previousScrubTime = now;
      const damping = 1 - Math.exp(-elapsed * (compactViewport.matches ? 10 : 5.2));
      smoothedJourneyProgress +=
        (targetJourneyProgress - smoothedJourneyProgress) * damping;

      let frameCaughtUp = true;
      if (Number.isFinite(journeyVideo.duration) && journeyVideo.duration > 0) {
        const usableDuration = Math.max(journeyVideo.duration - sourceFrameDuration, 0);
        const rawTime = smoothedJourneyProgress * usableDuration;
        const nextTime =
          Math.round(rawTime * sourceFrameRate) / sourceFrameRate;

        if (
          !journeyVideo.seeking &&
          Math.abs(journeyVideo.currentTime - nextTime) >= sourceFrameDuration * 0.5
        ) {
          journeyVideo.currentTime = nextTime;
          frameCaughtUp = false;
        } else if (journeyVideo.seeking) {
          frameCaughtUp = false;
        }
      }

      const settled =
        Math.abs(targetJourneyProgress - smoothedJourneyProgress) < 0.0004 &&
        frameCaughtUp;

      if (settled) {
        smoothedJourneyProgress = targetJourneyProgress;
        scrubFrame = 0;
        return;
      }

      scrubFrame = window.requestAnimationFrame(syncJourneyFrame);
    };

    const requestJourneySync = () => {
      if (!journeyEnabled || scrubFrame) return;
      previousScrubTime = performance.now();
      scrubFrame = window.requestAnimationFrame(syncJourneyFrame);
    };

    const handleJourneyMetadata = () => {
      if (!journeyVideo) return;
      journeyVideo.pause();
      requestJourneySync();
    };

    if (journeyVideo) {
      journeyVideo.pause();
      journeyVideo.addEventListener("loadedmetadata", handleJourneyMetadata);
    }

    const update = () => {
      const rect = track.getBoundingClientRect();
      const distance = Math.max(track.offsetHeight - viewport.offsetHeight, 1);
      const progress = clamp(-rect.top / distance);
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
        const journeyOut = 1 - range(progress, 0.755, 0.845);
        const fogOpacity = range(progress, 0.765, 0.85);

        viewport.style.setProperty("--idle-opacity", idleOpacity.toFixed(4));
        viewport.style.setProperty("--journey-opacity", (journeyIn * journeyOut).toFixed(4));
        viewport.style.setProperty("--fog-opacity", fogOpacity.toFixed(4));
        targetJourneyProgress = range(progress, 0.12, 0.785);
        requestJourneySync();
      }

      const idleVideo = idleVideoRef.current;
      if (idleVideo) {
        if (progress > 0.16 && !idleVideo.paused) {
          idleVideo.pause();
          idleWasPausedRef.current = true;
        } else if (progress < 0.12 && idleVideo.paused && idleWasPausedRef.current) {
          void idleVideo.play().catch(() => undefined);
          idleWasPausedRef.current = false;
        }
      }

      const fogVideo = fogVideoRef.current;
      if (fogVideo) {
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
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      journeyVideo?.removeEventListener("loadedmetadata", handleJourneyMetadata);
      if (frame) window.cancelAnimationFrame(frame);
      if (scrubFrame) window.cancelAnimationFrame(scrubFrame);
      if (revealFrame) window.cancelAnimationFrame(revealFrame);
    };
  }, [prefersReducedMotion]);

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
            <div className={styles.sharedPoster} style={{ backgroundImage: `url("${pageImageLoader({ src: get("shared-poster", "/sustainability/shared-poster.png"), width: 1200 })}")` }} />
            <video
              ref={idleVideoRef}
              className={`${styles.mediaVideo} ${styles.idleVideo}`}
              src={get("idle-video", "/sustainability/hero-idle.mp4")}
              poster={pageImageLoader({ src: get("shared-poster", "/sustainability/shared-poster.png"), width: 1200 })}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
            />
            <video
              ref={journeyVideoRef}
              className={`${styles.mediaVideo} ${styles.journeyVideo}`}
              src={get("scroll-video", "/sustainability/scroll-journey.mp4")}
              poster={pageImageLoader({ src: get("shared-poster", "/sustainability/shared-poster.png"), width: 1200 })}
              muted
              playsInline
              preload="auto"
            />
            <video
              ref={fogVideoRef}
              className={`${styles.mediaVideo} ${styles.fogVideo}`}
              src={get("fog-video", "/sustainability/fog-loop.mp4")}
              poster={pageImageLoader({ src: get("fog-poster", "/sustainability/fog-poster.png"), width: 1200 })}
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
