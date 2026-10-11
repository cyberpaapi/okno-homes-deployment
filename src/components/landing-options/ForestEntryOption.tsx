'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  useMotionValueEvent,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
} from 'motion/react';
import { ReactLenis } from 'lenis/react';
import LandingExperience from '@/components/landing/LandingExperience';
import OknoLogo from '@/components/Brand/OknoLogo';
import ScrollJourneyFilm from './ScrollJourneyFilm';
import { useHeroReloadPosition } from './useHeroReloadPosition';
import useHeroFilmScrollGuard from './useHeroFilmScrollGuard';
import { useSiteContent } from '@/lib/useSiteContent';
import { homeVariantAccessibleTitle } from '@/lib/homeVariantContent';
import type { ContentItem } from '@/lib/contentCollections';
import styles from './ForestEntryOption.module.css';

const INTRO_VIDEO = '/assets/landing-options/forest-entry-intro-15s.mp4';
const INTRO_LAST_FRAME = '/assets/landing-options/forest-entry-intro-last-frame.png';
const JOURNEY_VIDEO = '/assets/landing-options/forest-entry-scroll-window-smooth-b6de05527e75.mp4';
const START = '/assets/landing-options/forest-entry-start-v2.jpg';
const END = '/assets/landing-options/forest-entry-window-finish.jpg';

type NetworkInformation = { saveData?: boolean };

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const range = (value: number, start: number, end: number) =>
  clamp((value - start) / (end - start));

function useDataSaver() {
  const [saveData] = useState(() => {
    if (typeof navigator === 'undefined') return false;
    const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
    return Boolean(connection?.saveData);
  });
  return saveData;
}

export default function ForestEntryOption({ variant }: { variant?: ContentItem }) {
  const savedIntroVideo = useSiteContent('hero-v1.opening.intro-video', INTRO_VIDEO);
  const savedJourneyVideo = useSiteContent('hero-v1.opening.scroll-video', JOURNEY_VIDEO);
  const savedStartImage = useSiteContent('hero-v1.opening.start-image', START);
  const savedEndImage = useSiteContent('hero-v1.opening.end-image', END);
  const savedIntroLastFrame = useSiteContent('hero-v1.opening.intro-last-frame', INTRO_LAST_FRAME);
  const savedTagline = useSiteContent('hero-v1.opening.tagline', 'Live better, live modular.');
  const tagline = variant?.fields.tagline ?? savedTagline;
  const savedAccessibleTitle = useSiteContent('hero-v1.opening.accessible-title', 'OKNO Modhomes');
  const savedStartAlt = useSiteContent('hero-v1.opening.start-alt', 'A single illuminated Kioo home within dense forest at blue hour');
  const savedEndAlt = useSiteContent('hero-v1.opening.end-alt', 'The timber-lined interior of the Kioo home opening to the forest');
  const introVideo = variant?.fields.openingVideo || savedIntroVideo;
  const journeyVideo = variant?.fields.scrollVideo || savedJourneyVideo;
  const startImage = variant?.fields.poster || savedStartImage;
  const endImage = variant?.fields.endImage || savedEndImage;
  const introLastFrame = variant?.fields.introLastFrame || savedIntroLastFrame;
  const accessibleTitle = homeVariantAccessibleTitle(variant, savedAccessibleTitle);
  const startAlt = variant?.fields.openingAlt || savedStartAlt;
  const endAlt = variant?.fields.endAlt || savedEndAlt;
  const sectionRef = useRef<HTMLElement>(null);
  useHeroReloadPosition(sectionRef);
  const viewportRef = useRef<HTMLDivElement>(null);
  const introVideoRef = useRef<HTMLVideoElement>(null);
  const introFinished = useRef(false);
  const leftIntroZone = useRef(false);
  const [introComplete, setIntroComplete] = useState(false);
  const [journeyReady, setJourneyReady] = useState(false);
  const reducedMotion = useReducedMotion();
  const saveData = useDataSaver();
  const animated = !reducedMotion && !saveData;
  const presentedFilmProgress = useMotionValue(0);
  const presentFilm = useCallback((value: number) => presentedFilmProgress.set(value), [presentedFilmProgress]);
  useHeroFilmScrollGuard(sectionRef, presentedFilmProgress, animated);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });
  // Match ProcessJourney's weighted, non-bouncing visual response. The film
  // and its fades follow one progress value instead of separate animations.
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 160,
    damping: 30,
    mass: .72,
    restDelta: .0002,
    skipInitialAnimation: true,
  });
  const mediaProgress = reducedMotion ? scrollYProgress : smoothProgress;

  const finishIntro = () => {
    if (introFinished.current) return;
    introFinished.current = true;
    setIntroComplete(true);
    syncMedia(mediaProgress.get());
  };

  const syncMedia = (rawProgress: number) => {
    const progress = clamp(rawProgress);
    const viewport = viewportRef.current;
    const intro = introVideoRef.current;
    if (progress > .1) leftIntroZone.current = true;
    if (intro && animated && progress <= .005 && leftIntroZone.current && introFinished.current) {
      leftIntroZone.current = false;
      introFinished.current = false;
      setIntroComplete(false);
      intro.currentTime = 0;
      void intro.play().catch(() => {});
    }
    if (intro && progress > .1 && !introFinished.current) {
      intro.pause();
      finishIntro();
    }

    if (viewport) {
      const introOpacity = 1 - range(progress, .04, .16);
      const stillOpacity = introFinished.current ? 1 - range(progress, .3, .36) : 0;
      const brandOpacity = !animated ? 1 : introFinished.current ? 1 - range(progress, .04, .16) : 0;
      const journeyOpacity = range(progress, .3, .36);
      const endOpacity = !animated || presentedFilmProgress.get() >= 1 ? range(progress, .975, 1) : 0;
      viewport.style.setProperty('--intro-opacity', introOpacity.toFixed(4));
      viewport.style.setProperty('--still-opacity', stillOpacity.toFixed(4));
      viewport.style.setProperty('--brand-opacity', brandOpacity.toFixed(4));
      viewport.style.setProperty('--journey-opacity', journeyOpacity.toFixed(4));
      viewport.style.setProperty('--end-opacity', endOpacity.toFixed(4));
      viewport.style.setProperty('--treatment-lift', range(progress, .82, .98).toFixed(4));
    }

  };

  useMotionValueEvent(mediaProgress, 'change', syncMedia);
  useMotionValueEvent(presentedFilmProgress, 'change', () => syncMedia(mediaProgress.get()));

  useEffect(() => {
    const video = introVideoRef.current;
    if (!animated || !video) return;

    let frame = 0;
    const tunePlayback = () => {
      frame = 0;
      if (!Number.isFinite(video.duration) || video.duration <= 0 || video.paused || video.ended) return;

      const progress = clamp(video.currentTime / video.duration);
      const sCurve = progress * progress * progress * (progress * (progress * 6 - 15) + 10);
      video.playbackRate = 2.15 - sCurve * 1.43;
      frame = window.requestAnimationFrame(tunePlayback);
    };
    const startTuning = () => {
      if (!frame) frame = window.requestAnimationFrame(tunePlayback);
    };

    video.addEventListener('play', startTuning);
    startTuning();
    return () => {
      video.removeEventListener('play', startTuning);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [animated]);

  useEffect(() => {
    syncMedia(mediaProgress.get());
    // Motion owns the changing progress value; this only primes restored scroll positions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animated, journeyReady]);

  const page = (
    <div
      className={styles.option}
      data-route="landing-option-2"
      data-video-ready={journeyReady || undefined}
      data-static={!animated}
      data-journey-video={journeyVideo}
    >
      <section
        ref={sectionRef}
        className={styles.sequence}
        aria-label="A journey from the forest into an OKNO home"
        data-component="25482"
      >
        <h1 className={styles.srOnly}>{accessibleTitle}</h1>
        <div ref={viewportRef} className={styles.sticky}>
          <div className={styles.startFrame}>
            <Image
              src={startImage}
              alt={startAlt}
              fill
              priority
              sizes="100vw"
            />
          </div>
          <div className={styles.endFrame}>
            <Image
              src={endImage}
              alt={endAlt}
              fill
              sizes="100vw"
            />
          </div>

          <div className={styles.introStill}>
            <Image src={introLastFrame} alt="" fill sizes="100vw" priority />
          </div>
          <div className={styles.brand} aria-label="OKNO Modhomes">
            <OknoLogo className={styles.wordmark} />
            {tagline && <p data-hero-v1-tagline>{tagline}</p>}
          </div>

          {animated && (
            <>
              <video
                ref={introVideoRef}
                className={`${styles.video} ${styles.introVideo} ${introComplete ? styles.introComplete : ''}`}
                src={introVideo}
                poster={startImage}
                autoPlay
                muted
                playsInline
                preload="auto"
                aria-hidden="true"
                onEnded={() => {
                  finishIntro();
                }}
              />
              <ScrollJourneyFilm
                key={journeyVideo}
                src={journeyVideo}
                poster={startImage}
                progress={mediaProgress}
                className={`${styles.video} ${styles.journeyVideo}`}
                onReady={setJourneyReady}
                onProgress={presentFilm}
              />
            </>
          )}

          <div className={styles.grade} aria-hidden="true" />
        </div>
      </section>
      <LandingExperience />
    </div>
  );

  // Smooth Scroll, 21st.dev 2836. Touch and reduced-motion keep native scroll.
  // A shorter document tail keeps the Process spring responsive on reversal.
  return reducedMotion ? page : <ReactLenis root options={{ lerp: .18, wheelMultiplier: 1 }}>{page}</ReactLenis>;
}
