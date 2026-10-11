'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import {
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from 'motion/react';
import { ReactLenis } from 'lenis/react';
import LandingExperience from '@/components/landing/LandingExperience';
import { useSiteContent } from '@/lib/useSiteContent';
import { homeVariantAccessibleTitle } from '@/lib/homeVariantContent';
import type { ContentItem } from '@/lib/contentCollections';
import styles from './ForestEntryOption.module.css';

const INTRO_VIDEO = '/assets/landing-options/forest-entry-intro-15s.mp4';
const AMBIENT_VIDEO = '/assets/landing-options/forest-entry-ambient-loop.mp4';
const INTRO_LAST_FRAME = '/assets/landing-options/forest-entry-intro-last-frame.png';
const JOURNEY_VIDEO = '/assets/landing-options/forest-entry-scroll-seekable-900p.mp4';
const START = '/assets/landing-options/forest-entry-start-v2.jpg';
const END = '/assets/landing-options/forest-entry-end-v2.jpg';

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
  const savedAmbientVideo = useSiteContent('hero-v1.opening.ambient-video', AMBIENT_VIDEO);
  const savedJourneyVideo = useSiteContent('hero-v1.opening.scroll-video', JOURNEY_VIDEO);
  const savedStartImage = useSiteContent('hero-v1.opening.start-image', START);
  const savedEndImage = useSiteContent('hero-v1.opening.end-image', END);
  const savedIntroLastFrame = useSiteContent('hero-v1.opening.intro-last-frame', INTRO_LAST_FRAME);
  const savedAccessibleTitle = useSiteContent('hero-v1.opening.accessible-title', 'OKNO Modhomes');
  const savedStartAlt = useSiteContent('hero-v1.opening.start-alt', 'A single illuminated Kioo home within dense forest at blue hour');
  const savedEndAlt = useSiteContent('hero-v1.opening.end-alt', 'The timber-lined interior of the Kioo home opening to the forest');
  const introVideo = variant?.fields.openingVideo || savedIntroVideo;
  const ambientVideo = variant?.fields.loopVideo || savedAmbientVideo;
  const journeyVideo = variant?.fields.scrollVideo || savedJourneyVideo;
  const startImage = variant?.fields.poster || savedStartImage;
  const endImage = variant?.fields.endImage || savedEndImage;
  const introLastFrame = variant?.fields.introLastFrame || savedIntroLastFrame;
  const accessibleTitle = homeVariantAccessibleTitle(variant, savedAccessibleTitle);
  const startAlt = variant?.fields.openingAlt || savedStartAlt;
  const endAlt = variant?.fields.endAlt || savedEndAlt;
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const introVideoRef = useRef<HTMLVideoElement>(null);
  const ambientVideoRef = useRef<HTMLVideoElement>(null);
  const journeyVideoRef = useRef<HTMLVideoElement>(null);
  const introFinished = useRef(false);
  const leftIntroZone = useRef(false);
  const targetTime = useRef(0);
  const seekFrame = useRef(0);
  const lastSeekAt = useRef(0);
  const [introComplete, setIntroComplete] = useState(false);
  const [journeyReady, setJourneyReady] = useState(false);
  const reducedMotion = useReducedMotion();
  const saveData = useDataSaver();
  const animated = !reducedMotion && !saveData;
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });
  // Lenis already eases the physical scroll. A second spring makes the film
  // trail far behind the actual position, then jump forward once seeking ends.
  const mediaProgress = scrollYProgress;

  const flushJourneySeek = (now: number) => {
    seekFrame.current = 0;
    const video = journeyVideoRef.current;
    if (!video || video.seeking || !Number.isFinite(video.duration) || video.duration <= 0) return;

    const target = Math.min(video.duration - .035, Math.max(0, targetTime.current));
    const difference = Math.abs(video.currentTime - target);
    if (difference <= 1 / 30) return;
    if (now - lastSeekAt.current < 33) {
      seekFrame.current = window.requestAnimationFrame(flushJourneySeek);
      return;
    }

    // Exact seeks preserve the authored frames; fastSeek can visibly jump to a
    // neighboring keyframe during a fast wheel gesture.
    video.currentTime = target;
    lastSeekAt.current = now;
  };

  const queueJourneySeek = () => {
    if (!seekFrame.current) seekFrame.current = window.requestAnimationFrame(flushJourneySeek);
  };

  const finishIntro = () => {
    if (introFinished.current) return;
    introFinished.current = true;
    setIntroComplete(true);
    const ambient = ambientVideoRef.current;
    if (ambient) ambient.currentTime = 0;
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
      const ambientOpacity = introFinished.current ? 1 - range(progress, .3, .36) : 0;
      const journeyOpacity = range(progress, .3, .36);
      const endOpacity = range(progress, .975, 1);
      viewport.style.setProperty('--intro-opacity', introOpacity.toFixed(4));
      viewport.style.setProperty('--ambient-opacity', ambientOpacity.toFixed(4));
      viewport.style.setProperty('--journey-opacity', journeyOpacity.toFixed(4));
      viewport.style.setProperty('--end-opacity', endOpacity.toFixed(4));
      viewport.style.setProperty('--treatment-lift', range(progress, .82, .98).toFixed(4));
    }

    const ambient = ambientVideoRef.current;
    const shouldPlayAmbient = animated && !document.hidden && introFinished.current && progress < .39;
    viewport?.classList.toggle(styles.ambientLive, shouldPlayAmbient);
    if (ambient) {
      if (shouldPlayAmbient && ambient.paused) void ambient.play().catch(() => {});
      else if (!shouldPlayAmbient && !ambient.paused) ambient.pause();
    }

    const journey = journeyVideoRef.current;
    if (animated && journey && Number.isFinite(journey.duration) && journey.duration > 0) {
      targetTime.current = range(progress, .3, .965) * (journey.duration - .035);
      queueJourneySeek();
    }
  };

  useMotionValueEvent(mediaProgress, 'change', syncMedia);

  useEffect(() => {
    // Browsers may pause a backgrounded video without a scroll update. Resume
    // the visible loop when the landing regains focus instead of leaving a still.
    const syncAmbientVisibility = () => {
      const ambient = ambientVideoRef.current;
      const shouldPlay = animated && !document.hidden && introFinished.current && clamp(mediaProgress.get()) < .39;
      viewportRef.current?.classList.toggle(styles.ambientLive, shouldPlay);
      if (shouldPlay && ambient?.paused) void ambient.play().catch(() => {});
      else if (!shouldPlay && ambient && !ambient.paused) ambient.pause();
    };

    document.addEventListener('visibilitychange', syncAmbientVisibility);
    window.addEventListener('focus', syncAmbientVisibility);
    window.addEventListener('pageshow', syncAmbientVisibility);
    return () => {
      document.removeEventListener('visibilitychange', syncAmbientVisibility);
      window.removeEventListener('focus', syncAmbientVisibility);
      window.removeEventListener('pageshow', syncAmbientVisibility);
    };
  }, [animated, mediaProgress]);

  useEffect(() => {
    const video = journeyVideoRef.current;
    if (!animated || !video) return;

    const markReady = () => {
      if (Number.isFinite(video.duration) && video.duration > 0) setJourneyReady(true);
    };

    if (video.readyState >= 1) markReady();
    else video.addEventListener('loadedmetadata', markReady, { once: true });

    return () => video.removeEventListener('loadedmetadata', markReady);
  }, [animated]);

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

  useEffect(() => () => {
    if (seekFrame.current) window.cancelAnimationFrame(seekFrame.current);
  }, []);

  const page = (
    <div
      className={styles.option}
      data-route="landing-option-2"
      data-video-ready={journeyReady || undefined}
      data-journey-video={journeyVideo}
      data-ambient-video={ambientVideo}
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
              <video
                ref={ambientVideoRef}
                className={`${styles.video} ${styles.ambientVideo}`}
                src={ambientVideo}
                poster={introLastFrame}
                loop
                muted
                playsInline
                preload="auto"
                aria-hidden="true"
              />
              <div className={styles.ambientAtmosphere} aria-hidden="true">
                <span className={styles.fogBankFar} />
                <span className={styles.fogBankNear} />
                <span className={styles.firefly} />
                <span className={styles.firefly} />
                <span className={styles.firefly} />
                <span className={styles.firefly} />
                <span className={styles.firefly} />
                <span className={styles.firefly} />
              </div>
              <video
                ref={journeyVideoRef}
                className={`${styles.video} ${styles.journeyVideo}`}
                src={journeyVideo}
                poster={startImage}
                muted
                playsInline
                preload="auto"
                aria-hidden="true"
                onLoadedMetadata={event => {
                  event.currentTarget.pause();
                  targetTime.current =
                    range(mediaProgress.get(), .3, .965) *
                    Math.max(0, event.currentTarget.duration - .035);
                  event.currentTarget.currentTime = targetTime.current;
                  setJourneyReady(true);
                }}
                onSeeked={queueJourneySeek}
                onError={() => setJourneyReady(false)}
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
  return reducedMotion ? page : <ReactLenis root options={{ lerp: .24, wheelMultiplier: 1 }}>{page}</ReactLenis>;
}
