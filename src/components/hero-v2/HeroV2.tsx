"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import OknoLogo from "@/components/Brand/OknoLogo";
import LandingExperience from "@/components/landing/LandingExperience";
import { useSiteContent } from "@/lib/useSiteContent";
import { homeVariantAccessibleTitle } from "@/lib/homeVariantContent";
import type { ContentItem } from "@/lib/contentCollections";
import styles from "./HeroV2.module.css";

const JOURNEY_PLAYBACK_RATE = 1.25;
const LOOP_HANDOFF_MS = 420;

type OpeningPhase = "opening" | "playing" | "arrived";

export default function HeroV2({ variant }: { variant?: ContentItem }) {
  const savedJourneyVideo = useSiteContent("hero-v2.opening.journey-video", "/hero-v2/city-to-forza.mp4");
  const savedJourneyPoster = useSiteContent("hero-v2.opening.journey-poster", "/hero-v2/journey-poster.jpg");
  const savedIslandLoop = useSiteContent("hero-v2.opening.island-loop", "/hero-v2/forza-island-loop.mp4");
  const savedIslandPoster = useSiteContent("hero-v2.opening.island-poster", "/hero-v2/forza-island-poster.webp");
  const savedAccessibleTitle = useSiteContent("hero-v2.opening.accessible-title", "OKNO Modhomes - from the city to Forza");
  const journeyVideo = variant?.fields.openingVideo || savedJourneyVideo;
  const journeyPoster = variant?.fields.poster || savedJourneyPoster;
  const islandLoop = variant?.fields.loopVideo || savedIslandLoop;
  const islandPoster = variant?.fields.loopPoster || savedIslandPoster;
  const accessibleTitle = homeVariantAccessibleTitle(variant, savedAccessibleTitle);
  const sceneRef = useRef<HTMLDivElement>(null);
  const journeyRef = useRef<HTMLVideoElement>(null);
  const loopRef = useRef<HTMLVideoElement>(null);
  const loopRequested = useRef(false);
  const [phase, setPhase] = useState<OpeningPhase>("opening");
  const reduceMotion = useReducedMotion();
  const arrived = phase === "arrived" || Boolean(reduceMotion);

  const finishJourney = useCallback(() => {
    journeyRef.current?.pause();
    setPhase("arrived");
  }, []);

  // A reload begins with the opening film, even if the browser saved a lower scroll position.
  useEffect(() => {
    if (!window.location.hash) window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const scene = sceneRef.current;
    const journey = journeyRef.current;
    const loop = loopRef.current;
    if (!scene || !journey || !loop) return;

    if (reduceMotion) {
      journey.pause();
      loop.pause();
      return;
    }

    journey.playbackRate = JOURNEY_PLAYBACK_RATE;
    let visible = true;
    let loopMayPlay = false;
    const handoff = arrived
      ? window.setTimeout(() => {
          loopMayPlay = true;
          if (visible && !document.hidden) void loop.play().catch(() => undefined);
        }, LOOP_HANDOFF_MS)
      : null;

    const syncPlayback = () => {
      if (!visible || document.hidden) {
        journey.pause();
        loop.pause();
      } else if (arrived) {
        journey.pause();
        if (loopMayPlay) void loop.play().catch(() => undefined);
      } else {
        loop.pause();
        void journey.play().catch(finishJourney);
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncPlayback();
    }, { threshold: .01 });
    observer.observe(scene);
    document.addEventListener("visibilitychange", syncPlayback);
    syncPlayback();

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
      if (handoff !== null) window.clearTimeout(handoff);
      journey.pause();
      loop.pause();
    };
  }, [arrived, finishJourney, reduceMotion]);

  return (
    <div className={styles.page}>
      {!arrived && <button className={styles.skipFilm} type="button" onClick={finishJourney}>{variant?.fields.buttonLabel || "Skip the film and view Forza"}</button>}
      <section id="top" className={styles.sequence} aria-label="Journey from city to Forza island">
          <div id="forza-home" ref={sceneRef} className={styles.scene}>
            <div className={`${styles.filmWindow} ${phase !== "opening" ? styles.filmWindowOpen : ""}`} aria-hidden="true">
              <video
                ref={journeyRef}
                className={styles.film}
                src={journeyVideo}
                poster={journeyPoster}
                autoPlay={!reduceMotion}
                muted
                playsInline
                preload="auto"
                disablePictureInPicture
                onPlaying={() => setPhase((current) => current === "opening" ? "playing" : current)}
                onTimeUpdate={(event) => {
                  if (event.currentTarget.currentTime < 4 || loopRequested.current) return;
                  loopRequested.current = true;
                  const loop = loopRef.current;
                  if (loop) { loop.preload = "auto"; loop.load(); }
                }}
                onEnded={finishJourney}
                onError={finishJourney}
              />
            </div>
            <div className={`${styles.loopWindow} ${arrived ? styles.loopWindowVisible : ""}`} aria-hidden="true">
              <video ref={loopRef} className={styles.loopFilm} src={islandLoop} poster={islandPoster} muted loop playsInline preload="metadata" disablePictureInPicture />
            </div>
            <div className={`${styles.opening} ${phase !== "opening" ? styles.openingHidden : ""}`} aria-hidden="true">
              <div className={styles.openingMark}><OknoLogo priority /></div>
            </div>
            <h1 className={styles.visuallyHidden}>{accessibleTitle}</h1>
          </div>
      </section>
      <LandingExperience />
    </div>
  );
}
