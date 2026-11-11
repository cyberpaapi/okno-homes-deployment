'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  useMotionValueEvent,
  useMotionValue,
  useReducedMotion,
  useScroll,
} from 'motion/react';
import { ReactLenis } from 'lenis/react';
import type { VirtualScrollData } from 'lenis';
import LandingExperience from '@/components/landing/LandingExperience';
import ScrollJourneyFilm from './ScrollJourneyFilm';
import FilmLoadingStatus from './FilmLoadingStatus';
import { useHeroReloadPosition } from './useHeroReloadPosition';
import { useHeroFilmExit } from './useHeroFilmExit';
import { useSiteContent } from '@/lib/useSiteContent';
import { homeVariantAccessibleTitle } from '@/lib/homeVariantContent';
import { useLenisDocumentLock } from '@/lib/useLenisDocumentLock';
import { useHeroLoadingLock } from '@/lib/useHeroLoadingLock';
import { heroWheelDelta } from '@/lib/heroWheelSensitivity';
import { pageImageLoader } from '@/lib/pageImageLoader';
import type { ContentItem } from '@/lib/contentCollections';
import styles from './ForestEntryOption.module.css';
import heroFilm from '../../../config/hero-v1-video.json';

const FIRST_FRAME = '/assets/landing-options/forest-entry-intro-first-frame.jpg';
/** Owner feedback (11 November 2026): the woods traversal and the journey are one
 * scroll film. The earlier journey-only film (still the stored default in
 * published content) resolves to the merged film. */
const JOURNEY_VIDEO = heroFilm.source;
const LEGACY_JOURNEY_VIDEO = '/assets/landing-options/forest-entry-scroll-window-smooth-b6de05527e75.mp4';
const START = '/assets/landing-options/forest-entry-start-v2.jpg';
const END = '/assets/landing-options/forest-entry-window-finish.jpg';

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const range = (value: number, start: number, end: number) =>
  clamp((value - start) / (end - start));

export default function ForestEntryOption({ variant }: { variant?: ContentItem }) {
  const savedJourneyVideo = useSiteContent('hero-v1.opening.scroll-video', JOURNEY_VIDEO);
  const savedStartImage = useSiteContent('hero-v1.opening.start-image', START);
  const savedEndImage = useSiteContent('hero-v1.opening.end-image', END);
  const savedTagline = useSiteContent('hero-v1.opening.tagline', 'Homes for rare places.');
  const tagline = variant?.fields.tagline ?? savedTagline;
  const savedAccessibleTitle = useSiteContent('hero-v1.opening.accessible-title', 'OKNO Modhomes');
  const savedStartAlt = useSiteContent('hero-v1.opening.start-alt', 'A single illuminated Kioo home within dense forest at blue hour');
  const savedEndAlt = useSiteContent('hero-v1.opening.end-alt', 'The timber-lined interior of the Kioo home opening to the forest');
  const savedScrollCue = useSiteContent('hero-v1.opening.scroll-cue', 'Scroll to continue');
  const selectedJourney = variant?.fields.scrollVideo || savedJourneyVideo;
  const journeyVideo = selectedJourney === LEGACY_JOURNEY_VIDEO ? JOURNEY_VIDEO : selectedJourney;
  const startImage = variant?.fields.poster || savedStartImage;
  const endImage = variant?.fields.endImage || savedEndImage;
  const savedFirstFrame = useSiteContent('hero-v1.opening.intro-first-frame', FIRST_FRAME);
  const firstFrame = variant?.fields.introFirstFrame || savedFirstFrame;
  const accessibleTitle = homeVariantAccessibleTitle(variant, savedAccessibleTitle);
  const startAlt = variant?.fields.openingAlt || savedStartAlt;
  const endAlt = variant?.fields.endAlt || savedEndAlt;
  const sectionRef = useRef<HTMLElement>(null);
  const adjustHeroWheel = useCallback((data: VirtualScrollData) => {
    if (document.documentElement.dataset.heroLoading === 'true') return false;
    const hero = sectionRef.current;
    if (hero && data.event.type === 'wheel') {
      const bounds = hero.getBoundingClientRect();
      data.deltaY = heroWheelDelta(data.deltaY, data.event.type, bounds.top, bounds.bottom, window.innerHeight);
    }
    return true;
  }, []);
  useHeroReloadPosition(sectionRef);
  useLenisDocumentLock();
  const viewportRef = useRef<HTMLDivElement>(null);
  const [journeyReady, setJourneyReady] = useState(false);
  const [journeyLoading, setJourneyLoading] = useState<number | null>(0);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const reducedMotion = useReducedMotion();
  const animated = !reducedMotion;
  // Owner feedback (11 November 2026): the loading bar sits on the film's first
  // frame; once the film is ready a small mouse prompt asks for a scroll, and
  // scroll alone drives the film, forwards and back.
  const loaded = journeyReady;
  const loadingLocked = animated && !loaded;
  useHeroLoadingLock(loadingLocked);
  const presentedFilmProgress = useMotionValue(0);
  const presentFilm = useCallback((value: number) => presentedFilmProgress.set(value), [presentedFilmProgress]);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });
  // Lenis smooths the document once. A second spring and a chronological
  // playback queue make the camera continue after the visitor stops scrolling.
  const mediaProgress = scrollYProgress;
  useHeroFilmExit(sectionRef, presentedFilmProgress, animated);
  // The bar only ever moves forward, even when a stream reports a fresh phase.
  const trackJourneyLoading = useCallback((value: number | null) => setJourneyLoading(previous => value === null || previous === null ? value : value < 0 ? (previous > 0 ? previous : value) : Math.max(previous, value)), []);

  const syncMedia = (rawProgress: number) => {
    const progress = loadingLocked ? 0 : clamp(rawProgress);
    const viewport = viewportRef.current;

    if (viewport) {
      const cueOpacity = animated && loaded ? 1 - range(progress, .004, .02) : 0;
      const brandOpacity = animated && !loaded ? 1 : 0;
      const journeyOpacity = journeyReady ? 1 : 0;
      const endOpacity = !animated || presentedFilmProgress.get() >= 1 ? range(progress, .985, 1) : 0;
      viewport.style.setProperty('--cue-opacity', cueOpacity.toFixed(4));
      viewport.style.setProperty('--brand-opacity', brandOpacity.toFixed(4));
      viewport.style.setProperty('--journey-opacity', journeyOpacity.toFixed(4));
      viewport.style.setProperty('--end-opacity', endOpacity.toFixed(4));
      viewport.style.setProperty('--treatment-lift', range(progress, .82, .98).toFixed(4));
    }

  };

  useMotionValueEvent(mediaProgress, 'change', syncMedia);
  useMotionValueEvent(presentedFilmProgress, 'change', () => syncMedia(mediaProgress.get()));

  useEffect(() => {
    syncMedia(mediaProgress.get());
    // Motion owns the changing progress value; this only primes restored scroll positions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animated, journeyReady, loaded]);


  const page = (
    <div
      className={styles.option}
      data-route="landing-option-2"
      data-video-ready={journeyReady || undefined}
      data-static={!animated}
      data-journey-video={journeyVideo}
      data-film-ending="decoded"
    >
      <section
        ref={sectionRef}
        className={styles.sequence} data-type-section="hero-v1.opening"
        aria-label="A journey from the forest into an OKNO home"
        data-component="25482"
      >
        <h1 className={styles.srOnly}>{accessibleTitle}</h1>
        <div ref={viewportRef} className={styles.sticky}>
          <div className={styles.startFrame}>
            <Image
              src={animated ? firstFrame : startImage}
              loader={pageImageLoader}
              alt={animated ? '' : startAlt}
              fill
              priority
              sizes="100vw"
            />
          </div>
          <div className={styles.endFrame}>
            <Image
              src={endImage}
              loader={pageImageLoader}
              alt={endAlt}
              fill
              sizes="100vw"
            />
          </div>

          <div className={styles.brand} aria-label="OKNO Modhomes" data-type-field={"hero-v1.opening.tagline"}>
            {/* Client feedback (11 November 2026): the tagline no longer shows over the film; it stays for screen readers. */}
            {tagline && <p className={styles.srOnly} data-hero-v1-tagline data-type-field={"hero-v1.opening.tagline"}>{tagline}</p>}
            {animated && <FilmLoadingStatus ready={loaded} progress={journeyLoading} retry={() => { setJourneyLoading(0); setJourneyReady(false); setLoadAttempt(value => value + 1); }} />}
          </div>
          {animated && (
            <div className={styles.scrollCue} aria-hidden={!loaded} data-hero-scroll-cue>
              <span className={styles.mouse} aria-hidden="true"><span /></span>
              <p data-type-field={"hero-v1.opening.scroll-cue"}>{savedScrollCue}</p>
            </div>
          )}

          {animated && (
            <>
              <ScrollJourneyFilm
                key={`${journeyVideo}-${loadAttempt}`}
                src={journeyVideo}
                poster={firstFrame}
                progress={mediaProgress}
                className={`${styles.video} ${styles.journeyVideo}`}
                onReady={setJourneyReady}
                onProgress={presentFilm}
                onLoadProgress={trackJourneyLoading}
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
  return reducedMotion ? page : <ReactLenis root options={{ lerp: .18, wheelMultiplier: 1, virtualScroll: adjustHeroWheel, prevent: node => !!node.closest('[role="dialog"], [data-lenis-prevent]') }}>{page}</ReactLenis>;
}
