'use client';

import Image from 'next/image';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import { useRef } from 'react';
import styles from './ProcessDetailTimeline.module.css';
import { useSiteContent, useSiteContentMap } from '@/lib/useSiteContent';
import { processDetailPhases } from '@/data/processDetailPhases';
import { resolveProcessDayRange } from '@/lib/processDayRange';
import useProcessScrollGuard from './useProcessScrollGuard';

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

  const timelineRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ['start start', 'end end'],
  });
  // Settle on a complete phase instead of leaving one phase's photo beside
  // the next phase's text. Day/copy/image continue to travel as one article.
  const phaseProgress = useTransform(scrollYProgress, value => Math.round(value * 4) / 4);
  const smoothProgress = useSpring(phaseProgress, { stiffness: 120, damping: 26, mass: .8 });
  const trackX = useTransform(smoothProgress, [0, 1], ['0%', '-80%']);
  useProcessScrollGuard(timelineRef, smoothProgress, 'timeline', !reducedMotion);

  return (
    <section className={styles.section} aria-labelledby="process-detail-title">
      <header className={styles.intro}>
        <p>{eyebrow}</p>
        <h2 id="process-detail-title">{heading}</h2>
      </header>

      <div className={styles.timeline} ref={timelineRef} data-process-detail-timeline>
        <div className={styles.stage}>
          <motion.div className={styles.track} style={{ x: reducedMotion ? '0%' : trackX }}>
            {currentPhases.map((phase, index) => (
              <article className={styles.phase} data-process-phase={index + 1} key={index}>
                <div className={styles.phaseCopy}>
                  <p className={styles.days}>
                    <span className={styles.daysPrefix}>{phase.days.label}</span>
                    <span className={styles.daysRange}>{phase.days.range}</span>
                  </p>
                  <h3>{phase.title}</h3>
                  <p className={styles.phaseSummary}>{phase.copy}</p>
                </div>

                <div className={styles.phaseVisual}>
                  <motion.div
                    className={styles.imageWrap}
                    initial={index === 0 || reducedMotion ? false : { scale: 0.94, opacity: 0.88 }}
                    whileInView={reducedMotion ? undefined : { scale: 1, opacity: 1 }}
                    viewport={{ once: true, amount: 0.45 }}
                    transition={{ type: 'spring', stiffness: 160, damping: 20, mass: 0.9 }}
                  >
                    <Image
                      src={phase.image}
                      alt={phase.alt}
                      fill
                      loading="lazy"
                      sizes="(max-width: 700px) calc(100vw - 32px), (max-width: 1100px) 54vw, 53vw"
                    />
                  </motion.div>
                </div>
              </article>
            ))}
          </motion.div>
          <div className={styles.timelineLine} aria-hidden="true">
            <motion.span
              className={styles.timelineLineFill}
              style={{ scaleX: reducedMotion ? 1 : smoothProgress }}
            />
            <div className={styles.timelineTicks}>
              {processDetailPhases.map((phase) => <span className={styles.timelineTick} key={phase.days} />)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
