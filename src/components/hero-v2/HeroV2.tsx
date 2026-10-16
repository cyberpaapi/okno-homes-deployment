"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useMotionValueEvent, useReducedMotion, useScroll, useSpring } from "motion/react";
import Link from "next/link";
import { SubtleLink } from "@/components/ui/SubtleAction";
import { heroV2EndingDefaults as endingDefaults } from "@/data/heroV2Ending";
import { localDestination } from "@/lib/localDestination";
import LandingExperience from "@/components/landing/LandingExperience";
import { useHeroReloadPosition } from "@/components/landing-options/useHeroReloadPosition";
import { createScrollVideoScrubber } from "@/lib/scrollVideoScrubber";
import { useSiteContent } from "@/lib/useSiteContent";
import { homeVariantAccessibleTitle } from "@/lib/homeVariantContent";
import type { ContentItem } from "@/lib/contentCollections";
import styles from "./HeroV2.module.css";

type Controller = { setTime(time: number): void; dispose(): void };
const noSubscribe = () => () => {};
const saveData = () => Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);
const serverSaveData = () => false;
export const v2FilmProgress = (progress: number) => Math.max(0, Math.min(1, progress / .9));

export default function HeroV2({ variant }: { variant?: ContentItem }) {
  const savedVideo = useSiteContent("hero-v2.opening.scroll-video", "");
  const savedPoster = useSiteContent("hero-v2.opening.start-image", "/hero-v2/nighttime-first.webp");
  const savedEnd = useSiteContent("hero-v2.opening.end-image", "/hero-v2/nighttime-last.webp");
  const savedTitle = useSiteContent("hero-v2.opening.accessible-title", "OKNO Modhomes");
  const savedHeading = useSiteContent("hero-v2.ending.heading", endingDefaults.endingHeading);
  const savedDescription = useSiteContent("hero-v2.ending.description", endingDefaults.endingDescription);
  const savedPrimaryLabel = useSiteContent("hero-v2.ending.primary-label", endingDefaults.endingPrimaryLabel);
  const savedPrimaryHref = useSiteContent("hero-v2.ending.primary-href", endingDefaults.endingPrimaryHref);
  const savedSecondaryLabel = useSiteContent("hero-v2.ending.secondary-label", endingDefaults.endingSecondaryLabel);
  const savedSecondaryHref = useSiteContent("hero-v2.ending.secondary-href", endingDefaults.endingSecondaryHref);
  const heading = variant?.fields.endingHeading || savedHeading;
  const description = variant?.fields.endingDescription ?? savedDescription;
  const primaryLabel = variant?.fields.endingPrimaryLabel || savedPrimaryLabel;
  const primaryHref = localDestination(variant?.fields.endingPrimaryHref || savedPrimaryHref, endingDefaults.endingPrimaryHref);
  const secondaryLabel = variant?.fields.endingSecondaryLabel || savedSecondaryLabel;
  const secondaryHref = localDestination(variant?.fields.endingSecondaryHref || savedSecondaryHref, endingDefaults.endingSecondaryHref);
  // An empty scroll-video selects the approved, independently decoded film.
  // Historical openingVideo/loopVideo fields never reintroduce an intro.
  const source = variant?.fields.scrollVideo ?? savedVideo;
  const legacyPoster = variant?.fields.poster === "/hero-v2/journey-poster.jpg";
  const poster = (!legacyPoster && variant?.fields.poster) || savedPoster;
  const end = variant?.fields.endImage || savedEnd;
  const title = homeVariantAccessibleTitle(variant, savedTitle).replace("OKNO Modhomes - from the city to Forza", "OKNO Modhomes");
  const section = useRef<HTMLElement>(null);
  const scrollTrack = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const controller = useRef<Controller | null>(null);
  const lastTime = useRef(790 / 24);
  const [ready, setReady] = useState(false);
  const [ending, setEnding] = useState(false);
  const endingRef = useRef(false);
  const [filmFinished, setFilmFinished] = useState(false);
  const finishedRef = useRef(false);
  const [unavailable, setUnavailable] = useState(false);
  const reduced = useReducedMotion();
  const economical = useSyncExternalStore(noSubscribe, saveData, serverSaveData);
  const still = Boolean(reduced) || economical || unavailable;
  const showEnding = still || (ending && filmFinished);
  const presented = useCallback((time: number) => {
    const finished = time >= lastTime.current - 1 / 48;
    if (finishedRef.current !== finished) { finishedRef.current = finished; setFilmFinished(finished); }
  }, []);
  useHeroReloadPosition(section);
  const { scrollYProgress } = useScroll({ target: scrollTrack, offset: ["start start", "end end"] });
  // Native document input plus one overdamped camera spring: no scroll queue,
  // wheel interception, or second smooth-scroll layer.
  const camera = useSpring(scrollYProgress, { stiffness: 160, damping: 30, mass: .72, restDelta: .0001 });
  const sync = useCallback(() => {
    const progress = v2FilmProgress(camera.get());
    controller.current?.setTime(progress * lastTime.current);
    const atEnd = progress >= 1;
    if (endingRef.current !== atEnd) { endingRef.current = atEnd; setEnding(atEnd); }
  }, [camera]);
  useMotionValueEvent(camera, "change", sync);

  useEffect(() => {
    if (still) return;
    const abort = new AbortController();
    let local: Controller | null = null;
    const loaded = () => { if (!abort.signal.aborted) setReady(true); };
    const failed = () => {
      if (abort.signal.aborted) return;
      abort.abort(); local?.dispose(); controller.current = null;
      setReady(false); setUnavailable(true);
    };
    const element = video.current;
    const nativeReady = () => {
      if (!element || !Number.isFinite(element.duration)) return;
      lastTime.current = Math.max(0, element.duration - 1 / 24);
      loaded(); sync();
    };
    if (source && element) {
      local = createScrollVideoScrubber(element, 24, presented);
      controller.current = local;
      element.addEventListener("loadeddata", nativeReady);
      if (element.readyState >= 2) nativeReady();
    } else {
      void import("@/lib/heroV2ImageScrubber").then(({ createHeroV2ImageScrubber, heroV2ImageDuration }) => {
        if (abort.signal.aborted || !canvas.current) return;
        lastTime.current = heroV2ImageDuration - 1 / 24;
        local = createHeroV2ImageScrubber(canvas.current, abort.signal, loaded, failed, presented);
        controller.current = local;
        if (!local) failed();
        else sync();
      }).catch(failed);
    }
    const home = (event: KeyboardEvent) => {
      if (event.key !== "Home" || (event.target instanceof Element && event.target.closest("input, textarea, select, [contenteditable=true]"))) return;
      camera.jump(0); window.scrollTo(0, 0); sync();
    };
    window.addEventListener("keydown", home);
    return () => {
      abort.abort(); local?.dispose(); controller.current = null;
      element?.removeEventListener("loadeddata", nativeReady);
      window.removeEventListener("keydown", home);
    };
  }, [source, still, camera, sync, presented]);

  return (
    <div className={styles.page}>
      <section ref={section} className={`${styles.sequence} ${still ? styles.still : ""}`} aria-label="Scroll through the cave and into the home">
        <div ref={scrollTrack} className={styles.scrollTrack} aria-hidden="true" />
        <div className={styles.scene} data-v2-scroll-only="true">
          {/* Matching endpoint stills remain visible while the renderer starts. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.film} src={ending && !still ? end : poster} alt="" fetchPriority="high" />
          {!still && (source
            ? <video ref={video} className={`${styles.film} ${ready ? styles.visible : styles.loading}`} src={source} poster={poster} muted playsInline preload="auto" aria-hidden="true" onError={() => setUnavailable(true)} />
            : <canvas ref={canvas} className={`${styles.film} ${ready ? styles.visible : styles.loading}`} width={1280} height={720} aria-hidden="true" data-film-renderer="lossless-images" />)}
          <h1 className={styles.visuallyHidden}>{title}</h1>
          <div className={`${styles.ending} ${showEnding ? styles.endingVisible : ""}`} data-type-section="hero-v2.ending" data-v2-ending aria-hidden={!showEnding} inert={!showEnding}>
            <div className={styles.endingContent}>
              <h2 className={styles.headline}>{heading}</h2>
              {description && <p className={styles.description}>{description}</p>}
              <div className={styles.actions}>
                <SubtleLink href={primaryHref} className={styles.primaryAction}>{primaryLabel}</SubtleLink>
                <Link href={secondaryHref} className={styles.secondaryAction}>{secondaryLabel}</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      <LandingExperience />
    </div>
  );
}
