'use client';

import Image from 'next/image';
import { previewImageLoader } from '@/lib/thumbnailImageLoader';
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import { useEffect, useRef, type CSSProperties } from 'react';
import styles from './ProcessDetailTimeline.module.css';
import { useSiteContent, useSiteContentMap } from '@/lib/useSiteContent';
import { processDetailPhases } from '@/data/processDetailPhases';
import { resolveProcessDayRange } from '@/lib/processDayRange';
import useProcessScrollGuard from './useProcessScrollGuard';
import ProcessPhaseProgress from './ProcessPhaseProgress';
import { useMediaQuery } from '@/lib/useMediaQuery';

// The original 500svh range selects the final phase after 350svh of travel.
// Retain those phase positions, then allow 12svh before releasing the stage.
const PHONE_TIMELINE_SVH = 100 + 350 + 12;

export function phoneTimelineTravelRatio(height: number, viewport: number) {
  const travel = height - viewport;
  const originalTravel = height * 500 / PHONE_TIMELINE_SVH - viewport;
  return travel > 0 && originalTravel > 0 ? travel / originalTravel : 1;
}

// Keep editable titles intact while giving every phone phase the same two-line
// rhythm. Split at the word boundary nearest the middle, never shrink one title.
function titleLines(title: string) {
  const spaces = Array.from(title.matchAll(/\s+/g));
  if (!spaces.length) return [title];
  const split = spaces.reduce((nearest, match) =>
    Math.abs(match.index! - title.length / 2) < Math.abs(nearest.index! - title.length / 2) ? match : nearest);
  return [title.slice(0, split.index).trim(), title.slice(split.index! + split[0].length).trim()];
}

function Phase({ phase, index, phone, reducedMotion }: {
  phase: { days: ReturnType<typeof resolveProcessDayRange>; title: string; copy: string; image: string; alt: string };
  index: number;
  phone: boolean;
  reducedMotion: boolean;
}) {
  return <article
    className={styles.phase}
    data-process-phase={index + 1}
    data-type-section={`process.detail-${index + 1}`}
  >
    <div className={styles.phaseCopy}>
      <p className={styles.days}>
        <span className={styles.daysPrefix}>{phase.days.label}</span>
        <span className={styles.daysRange}>{phase.days.range}</span>
      </p>
      <h3 aria-label={phase.title}>{titleLines(phase.title).map((line, lineIndex) => <span className={styles.titleLine} key={lineIndex}>{line}{lineIndex === 0 ? ' ' : ''}</span>)}</h3>
      <p className={styles.phaseSummary}>{phase.copy}</p>
    </div>
    <div className={styles.phaseVisual}>
      <motion.div
        className={styles.imageWrap}
        initial={index === 0 || reducedMotion || phone ? false : { scale: .94, opacity: .88 }}
        whileInView={reducedMotion || phone ? undefined : { scale: 1, opacity: 1 }}
        viewport={{ once: true, amount: .45 }}
        transition={{ type: 'spring', stiffness: 160, damping: 20, mass: .9 }}
      >
        <Image loader={previewImageLoader} src={phase.image} alt={phase.alt} fill loading="lazy"
          sizes="(max-width: 700px) calc(100vw - 40px), (max-width: 1100px) 54vw, 53vw" />
      </motion.div>
    </div>
  </article>;
}

export default function ProcessDetailTimeline() {
  const values = useSiteContentMap();
  const eyebrow = useSiteContent('process.details.eyebrow', 'What happens within the 90 days');
  const heading = useSiteContent('process.details.heading', 'From brief to handover.');
  const currentPhases = processDetailPhases.map((phase, index) => ({
    days: resolveProcessDayRange(values[`process.details.phase-${index + 1}.days`] ?? phase.days, phase.days),
    title: values[`process.details.phase-${index + 1}.title`] ?? phase.title,
    copy: values[`process.details.phase-${index + 1}.copy`] ?? phase.copy,
    image: values[`process.details.phase-${index + 1}.image`] ?? phase.image,
    alt: values[`process.details.phase-${index + 1}.alt`] ?? phase.alt,
  }));

  const phone = useMediaQuery('(max-width: 700px)');
  const timelineRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const shortViewport = useMediaQuery('(max-height: 620px)');
  const travelRatio = useMotionValue(1);
  useEffect(() => {
    const timeline = timelineRef.current;
    if (!phone || reducedMotion || shortViewport || !timeline) {
      travelRatio.set(1);
      return;
    }
    // svh can differ from the current viewport when browser chrome collapses.
    // Measure only on layout/viewport changes, never during a scroll update.
    const measure = () => travelRatio.set(phoneTimelineTravelRatio(
      timeline.offsetHeight, document.documentElement.clientHeight,
    ));
    measure();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(timeline);
    window.addEventListener('resize', measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [phone, reducedMotion, shortViewport, travelRatio]);
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ['start start', 'end end'],
  });
  // Settle on a complete phase instead of leaving one phase's photo beside
  // the next phase's text. Day/copy/image continue to travel as one article.
  const phaseProgress = useTransform(() => Math.round(scrollYProgress.get() * travelRatio.get() * 4) / 4);
  const smoothProgress = useSpring(phaseProgress, { stiffness: phone ? 85 : 120, damping: phone ? 24 : 26, mass: .8 });
  const trackX = useTransform(smoothProgress, [0, 1], ['0%', '-80%']);
  useProcessScrollGuard(timelineRef, smoothProgress, 'timeline', !reducedMotion);

  const introduction = (mobile: boolean) => <header className={`${styles.intro} ${mobile ? styles.mobileIntro : styles.desktopIntro}`} aria-hidden={mobile ? !phone : phone} data-type-section="process.details">
    <p data-type-field="process.details.eyebrow">{eyebrow}</p>
    <h2 id={mobile ? "process-detail-mobile-title" : "process-detail-title"} data-type-field="process.details.heading">{heading}</h2>
  </header>;

  return (
    <section className={styles.section} aria-labelledby={phone ? "process-detail-mobile-title" : "process-detail-title"}>
      {introduction(false)}
      <div className={styles.timeline} ref={timelineRef} data-process-detail-timeline
        style={{ '--process-phone-timeline-height': `${PHONE_TIMELINE_SVH}svh` } as CSSProperties}>
        <div className={styles.stage}>
          {introduction(true)}
          <div className={styles.trackViewport}><motion.div className={styles.track} style={{ x: reducedMotion ? '0%' : trackX }}>
            {currentPhases.map((phase, index) => <Phase key={index} phase={phase} index={index}
              phone={phone} reducedMotion={Boolean(reducedMotion)} />)}
          </motion.div></div>
          <ProcessPhaseProgress phases={currentPhases} progress={smoothProgress} />
        </div>
      </div>
    </section>
  );
}
