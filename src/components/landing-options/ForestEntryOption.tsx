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
import { useHeroAutoplay } from '@/lib/useHeroAutoplay';
import { heroWheelDelta } from '@/lib/heroWheelSensitivity';
import { pageImageLoader } from '@/lib/pageImageLoader';
import { downloadHeroMedia } from '@/lib/downloadHeroMedia';
import type { ContentItem } from '@/lib/contentCollections';
import styles from './ForestEntryOption.module.css';
import introDelivery from '../../../config/hero-v1-intro.json';

const INTRO_VIDEO = '/assets/landing-options/forest-entry-intro-15s.mp4';
const INTRO_LAST_FRAME = '/assets/landing-options/forest-entry-intro-last-frame.png';
const INTRO_FIRST_FRAME = '/assets/landing-options/forest-entry-intro-first-frame.jpg';
const JOURNEY_VIDEO = '/assets/landing-options/forest-entry-scroll-window-smooth-b6de05527e75.mp4';
const START = '/assets/landing-options/forest-entry-start-v2.jpg';
const END = '/assets/landing-options/forest-entry-window-finish.jpg';
/** Native length of the approved journey film; autoplay advances it at 1x. */
const JOURNEY_SECONDS = 24;
const JOURNEY_BYTES = 47573337;

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const range = (value: number, start: number, end: number) =>
  clamp((value - start) / (end - start));

export default function ForestEntryOption({ variant }: { variant?: ContentItem }) {
  const savedIntroVideo = useSiteContent('hero-v1.opening.intro-video', INTRO_VIDEO);
  const savedJourneyVideo = useSiteContent('hero-v1.opening.scroll-video', JOURNEY_VIDEO);
  const savedStartImage = useSiteContent('hero-v1.opening.start-image', START);
  const savedEndImage = useSiteContent('hero-v1.opening.end-image', END);
  const savedIntroLastFrame = useSiteContent('hero-v1.opening.intro-last-frame', INTRO_LAST_FRAME);
  const savedTagline = useSiteContent('hero-v1.opening.tagline', 'Homes for rare places.');
  const tagline = variant?.fields.tagline ?? savedTagline;
  const savedAccessibleTitle = useSiteContent('hero-v1.opening.accessible-title', 'OKNO Modhomes');
  const savedStartAlt = useSiteContent('hero-v1.opening.start-alt', 'A single illuminated Kioo home within dense forest at blue hour');
  const savedEndAlt = useSiteContent('hero-v1.opening.end-alt', 'The timber-lined interior of the Kioo home opening to the forest');
  const selectedIntro = variant?.fields.openingVideo || savedIntroVideo;
  const introVideo = selectedIntro === INTRO_VIDEO ? introDelivery.source : selectedIntro;
  const journeyVideo = variant?.fields.scrollVideo || savedJourneyVideo;
  const startImage = variant?.fields.poster || savedStartImage;
  const endImage = variant?.fields.endImage || savedEndImage;
  const introLastFrame = variant?.fields.introLastFrame || savedIntroLastFrame;
  const savedIntroFirstFrame = useSiteContent('hero-v1.opening.intro-first-frame', INTRO_FIRST_FRAME);
  const introFirstFrame = variant?.fields.introFirstFrame || savedIntroFirstFrame;
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
  const introVideoRef = useRef<HTMLVideoElement>(null);
  const introFinished = useRef(false);
  const [introComplete, setIntroComplete] = useState(false);
  const [introReady, setIntroReady] = useState(false);
  const [introLoad, setIntroLoad] = useState(0);
  const [journeyReady, setJourneyReady] = useState(false);
  const [journeyLoading, setJourneyLoading] = useState<number | null>(0);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const reducedMotion = useReducedMotion();
  const animated = !reducedMotion;
  // Client feedback (11 November 2026): the loading bar sits on the intro's first
  // frame; the intro plays only once both films are loaded, then hands straight
  // to the scroll film, which plays by itself and follows scroll both ways.
  const loaded = journeyReady && (introReady || introComplete);
  const loadingLocked = animated && (!loaded || !introComplete);
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
  const filmSeconds = useCallback(() => JOURNEY_SECONDS, []);
  useHeroAutoplay(sectionRef, animated && journeyReady && introComplete, filmSeconds);

  const finishIntro = () => {
    if (introFinished.current) return;
    introFinished.current = true;
    setIntroComplete(true);
    syncMedia(mediaProgress.get());
  };

  const syncMedia = (rawProgress: number) => {
    const progress = loadingLocked ? 0 : clamp(rawProgress);
    const viewport = viewportRef.current;
    const intro = introVideoRef.current;
    if (intro && animated && progress > .005) {
      if (!introFinished.current) { intro.pause(); finishIntro(); }
      // The hidden intro must not keep downloading its 22 MB body while the
      // visitor scrubs the film. Ordinary reversal keeps the static base;
      // only a fresh page load mounts the autoplay intro again.
      if (intro.hasAttribute('src')) { intro.removeAttribute('src'); intro.load(); }
    }

    if (viewport) {
      const introOpacity = 1 - range(progress, .005, .03);
      const stillOpacity = introFinished.current ? 1 - range(progress, 0, .03) : 0;
      const brandOpacity = animated && !loaded ? 1 : 0;
      const journeyOpacity = journeyReady ? 1 : 0;
      const endOpacity = !animated || presentedFilmProgress.get() >= 1 ? range(progress, .985, 1) : 0;
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

  // The intro is read completely before the loader clears, so it can never
  // stall mid-shot; the scroll film loads in parallel and shares the bar.
  useEffect(() => {
    const video = introVideoRef.current;
    if (!animated || !video || introFinished.current) return;
    const abort = new AbortController();
    let objectUrl: string | null = null;
    const ready = () => { if (!abort.signal.aborted && video.readyState >= 2) setIntroReady(true); };
    const skip = () => { if (abort.signal.aborted) return; setIntroLoad(1); setIntroReady(true); finishIntro(); };
    video.addEventListener('loadeddata', ready);
    video.addEventListener('error', skip);
    void downloadHeroMedia(introVideo, abort.signal, value => { if (!abort.signal.aborted) setIntroLoad(Math.max(0, value)); }).then(data => {
      if (abort.signal.aborted) return;
      objectUrl = URL.createObjectURL(new Blob([data as BlobPart], { type: 'video/mp4' }));
      video.src = objectUrl;
      video.load();
    }).catch(skip);
    return () => {
      abort.abort();
      video.removeEventListener('loadeddata', ready);
      video.removeEventListener('error', skip);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
    // finishIntro only flips refs/state; restarting the download would replay the intro.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animated, introVideo, loadAttempt]);

  useEffect(() => {
    const video = introVideoRef.current;
    if (!animated || !video || !loaded || introFinished.current) return;
    const tunePlayback = () => { video.playbackRate = 1.75; };
    video.addEventListener('playing', tunePlayback);
    tunePlayback();
    video.muted = true;
    video.currentTime = 0;
    void video.play().catch(() => { video.pause(); finishIntro(); });
    return () => video.removeEventListener('playing', tunePlayback);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animated, loaded]);

  useEffect(() => {
    syncMedia(mediaProgress.get());
    // Motion owns the changing progress value; this only primes restored scroll positions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animated, journeyReady, introComplete, loaded]);

  const loadingProgress = journeyLoading === null ? null
    : journeyLoading < 0 ? -1
    : (journeyLoading * JOURNEY_BYTES + introLoad * introDelivery.bytes) / (JOURNEY_BYTES + introDelivery.bytes);

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
              src={animated ? introFirstFrame : startImage}
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

          <div className={styles.introStill}>
            <Image src={introLastFrame} loader={pageImageLoader} alt="" fill sizes="100vw" />
          </div>
          <div className={styles.brand} aria-label="OKNO Modhomes" data-type-field={"hero-v1.opening.tagline"}>
            {/* Client feedback (11 November 2026): the tagline no longer shows over the film; it stays for screen readers. */}
            {tagline && <p className={styles.srOnly} data-hero-v1-tagline data-type-field={"hero-v1.opening.tagline"}>{tagline}</p>}
            {animated && <FilmLoadingStatus ready={loaded} progress={loadingProgress} retry={() => { setJourneyLoading(0); setJourneyReady(false); setIntroLoad(0); setLoadAttempt(value => value + 1); }} />}
          </div>

          {animated && (
            <>
              <video
                ref={introVideoRef}
                className={`${styles.video} ${styles.introVideo} ${introComplete ? styles.introComplete : ''}`}
                poster={introFirstFrame}
                muted
                playsInline
                preload="auto"
                aria-hidden="true"
                onEnded={() => {
                  finishIntro();
                }}
              />
              <ScrollJourneyFilm
                key={`${journeyVideo}-${loadAttempt}`}
                src={journeyVideo}
                poster={startImage}
                progress={mediaProgress}
                className={`${styles.video} ${styles.journeyVideo}`}
                onReady={setJourneyReady}
                onProgress={presentFilm}
                onLoadProgress={setJourneyLoading}
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
