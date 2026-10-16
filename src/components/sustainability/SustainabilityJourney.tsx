"use client";

import Header from "@/components/Header/Header";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import styles from "./Sustainability.module.css";
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
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.58, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.05 },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.24, ease: [0.4, 0, 1, 1] },
  },
};

const lineVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.72, ease: [0.16, 1, 0.3, 1] },
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
    let targetJourneyProgress = 0;
    let smoothedJourneyProgress = 0;
    let previousScrubTime = performance.now();
    const compactViewport = window.matchMedia("(max-width: 820px)");
    const journeyVideo = journeyVideoRef.current;
    const journeyEnabled = Boolean(journeyVideo && !prefersReducedMotion && !compactViewport.matches);
    const sourceFrameRate = 24;
    const sourceFrameDuration = 1 / sourceFrameRate;

    const syncJourneyFrame = (now: number) => {
      if (!journeyVideo || !journeyEnabled) {
        scrubFrame = 0;
        return;
      }

      const elapsed = Math.min((now - previousScrubTime) / 1000, 0.05);
      previousScrubTime = now;
      const damping = 1 - Math.exp(-elapsed * 5.2);
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
      const distance = Math.max(track.offsetHeight - window.innerHeight, 1);
      const progress = clamp(-rect.top / distance);
      const nextScene = sceneFromProgress(progress);

      setScene((current) => (current === nextScene ? current : nextScene));

      viewport.style.setProperty(
        "--hero-content-opacity",
        (1 - range(progress, 0.04, 0.115)).toFixed(4),
      );
      viewport.style.setProperty("--fog-treatment", range(progress, 0.785, 0.87).toFixed(4));

      if (prefersReducedMotion || compactViewport.matches) {
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
    };
  }, [prefersReducedMotion]);

  const story = scene in storyScenes ? storyScenes[scene as keyof typeof storyScenes] : null;
  const storyTitle = story ? get(`${scene}.title`, story.title) : "";
  const fogVisible = scene === "fog";

  return (
    <div className={styles.page}>
      <section ref={trackRef} className={styles.scrollTrack} aria-label={get("accessible-label", "OKNO sustainability journey")}>
        <div ref={viewportRef} className={styles.stickyViewport} data-scene={scene}>
          <div className={styles.mediaStage} aria-hidden="true">
            <div className={styles.sharedPoster} style={{ backgroundImage: `url("${get("shared-poster", "/sustainability/shared-poster.png")}")` }} />
            <video
              ref={idleVideoRef}
              className={`${styles.mediaVideo} ${styles.idleVideo}`}
              src={get("idle-video", "/sustainability/hero-idle.mp4")}
              poster={get("shared-poster", "/sustainability/shared-poster.png")}
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
              poster={get("shared-poster", "/sustainability/shared-poster.png")}
              muted
              playsInline
              preload="auto"
            />
            <video
              ref={fogVideoRef}
              className={`${styles.mediaVideo} ${styles.fogVideo}`}
              src={get("fog-video", "/sustainability/fog-loop.mp4")}
              poster={get("fog-poster", "/sustainability/fog-poster.png")}
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
              <h1 data-type-field={"sustainability.journey.hero-line-1"}>{get("hero-line-1", "Build less")}<br />{get("hero-line-2", "against the ")}<span data-type-highlight data-type-field={"sustainability.journey.hero-emphasis"}>{get("hero-emphasis", "land.")}</span></h1>
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
            <AnimatePresence initial={false}>
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
            aria-hidden={!fogVisible}
          >
            <motion.div
              className={styles.evidenceHeading}
              initial={false}
              animate={{ opacity: fogVisible ? 1 : 0, y: fogVisible ? 0 : 20 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              <h2 data-type-field={"sustainability.journey.proof-line-1"}>{get("proof-line-1", "The material")}<br /><span data-type-highlight data-type-field={"sustainability.journey.proof-line-2"}>{get("proof-line-2", "truth.")}</span></h2>
            </motion.div>
            <motion.p
              className={styles.evidenceCopy}
              initial={false}
              animate={{ opacity: fogVisible ? 1 : 0, y: fogVisible ? 0 : 16 }}
              transition={{ duration: 0.65, delay: fogVisible ? 0.08 : 0, ease: [0.22, 1, 0.36, 1] }}
             data-type-field={"sustainability.journey.proof-copy"}>
              {get("proof-copy", "Site, structure and making are considered as one continuous decision—so the home can belong to the landscape instead of competing with it.")}
            </motion.p>
          </section>
        </div>
      </section>
    </div>
  );
}
