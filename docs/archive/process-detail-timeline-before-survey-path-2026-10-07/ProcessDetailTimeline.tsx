'use client';

import Image from 'next/image';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useRef, type CSSProperties } from 'react';
import styles from './ProcessDetailTimeline.module.css';
import { useSiteContent, useSiteContentMap } from '@/lib/useSiteContent';

const phases = [
  {
    days: 'Days 01–10',
    title: 'Brief and site',
    copy: 'We read the land, access, orientation and your brief together, then define the right starting point for the home.',
    image: '/process/land-poster.webp',
    alt: 'The site and surrounding land being read before design begins',
  },
  {
    days: 'Days 11–25',
    title: 'Design and approvals',
    copy: 'Architecture, engineering, material decisions and approvals are resolved as one coordinated package before production.',
    image: '/process/design-lock-poster.webp',
    alt: 'Architectural design being resolved into a buildable home',
  },
  {
    days: 'Days 26–60',
    title: 'Factory manufacturing',
    copy: 'The home is manufactured in controlled conditions, where structure, services and finishes can advance with precision.',
    image: '/process/factory-manufacturing-hd.png',
    alt: 'Wall and floor elements being manufactured in the factory',
  },
  {
    days: 'Days 61–72',
    title: 'Sequenced for site',
    copy: 'Finished elements are checked, protected and arranged in build order so site assembly begins with the right piece at the right time.',
    image: '/process/generated/process-panel-base-v1.webp',
    alt: 'Prepared structural elements arranged on the completed base',
  },
  {
    days: 'Days 73–90',
    title: 'Assembly and handover',
    copy: 'The home is assembled, enclosed and completed on site, then reviewed as one finished whole before handover.',
    image: '/process/generated/process-panel-complete-v1.webp',
    alt: 'The fully completed OKNO home in its landscape',
  },
] as const;

export default function ProcessDetailTimeline() {
  const values = useSiteContentMap();
  const eyebrow = useSiteContent('process.details.eyebrow', 'What happens within the 90 days');
  const heading = useSiteContent('process.details.heading', 'From brief to handover.');
  const currentPhases = phases.map((phase, index) => ({
    days: values[`process.details.phase-${index + 1}.days`] ?? phase.days,
    title: values[`process.details.phase-${index + 1}.title`] ?? phase.title,
    copy: values[`process.details.phase-${index + 1}.copy`] ?? phase.copy,
    image: values[`process.details.phase-${index + 1}.image`] ?? phase.image,
    alt: values[`process.details.phase-${index + 1}.alt`] ?? phase.alt,
  }));
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start 78%', 'end 34%'] });
  const beamProgress = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section className={styles.section} ref={sectionRef} aria-labelledby="process-detail-title">
      <header className={styles.intro}>
        <p>{eyebrow}</p>
        <h2 id="process-detail-title">{heading}</h2>
      </header>

      <div className={styles.timeline}>
        <span className={styles.line} aria-hidden="true" />
        <motion.span
          className={styles.lineActive}
          style={{ '--detail-progress': beamProgress } as CSSProperties}
          aria-hidden="true"
        />

        {currentPhases.map((phase, index) => (
          <motion.article
            className={styles.phase}
            key={phase.days}
            initial={reducedMotion ? false : { opacity: 0, transform: 'translate3d(0, 30px, 0)' }}
            whileInView={{ opacity: 1, transform: 'translate3d(0, 0, 0)' }}
            viewport={{ once: true, amount: .24 }}
            transition={{ duration: reducedMotion ? 0 : .62, delay: reducedMotion ? 0 : index * .025, ease: [.23, 1, .32, 1] }}
          >
            <div className={styles.dayColumn}>
              <p>{phase.days}</p>
              <span>{String(index + 1).padStart(2, '0')}</span>
            </div>
            <span className={styles.marker} aria-hidden="true" />
            <div className={styles.phaseBody}>
              <div className={styles.imageWrap}>
                <Image src={phase.image} alt={phase.alt} fill sizes="(max-width: 700px) 92vw, (max-width: 1100px) 68vw, 58vw" />
              </div>
              <div className={styles.phaseCopy}>
                <h3>{phase.title}</h3>
                <p>{phase.copy}</p>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
