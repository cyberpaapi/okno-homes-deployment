'use client';

import Image from 'next/image';
import { motion, useReducedMotion, useScroll } from 'motion/react';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import styles from './ProcessDetailTimeline.module.css';
import { useSiteContent, useSiteContentMap } from '@/lib/useSiteContent';

const phases = [
  {
    days: 'Days 01–10',
    title: 'Brief and site',
    copy: 'We read the land, access, orientation and your brief together, then define the right starting point for the home.',
    image: '/process/generated/photo-series-v1/site-survey.webp',
    alt: 'Visualized site survey in a tropical coastal clearing before construction',
  },
  {
    days: 'Days 11–25',
    title: 'Design and approvals',
    copy: 'Architecture, engineering, material decisions and approvals are resolved as one coordinated package before production.',
    image: '/process/generated/photo-series-v1/design-approvals.webp',
    alt: 'Visualized architectural plans, material samples and model of the proposed home',
  },
  {
    days: 'Days 26–60',
    title: 'Factory manufacturing',
    copy: 'The home is manufactured in controlled conditions, where structure, services and finishes can advance with precision.',
    image: '/process/generated/photo-series-v1/factory-panels.webp',
    alt: 'Visualized timber wall and floor panels being manufactured in a workshop',
  },
  {
    days: 'Days 61–72',
    title: 'Sequenced for site',
    copy: 'Finished elements are checked, protected and arranged in build order so site assembly begins with the right piece at the right time.',
    image: '/process/generated/photo-series-v1/site-staging.webp',
    alt: 'Visualized prefabricated panels staged beside the prepared site platform',
  },
  {
    days: 'Days 73–90',
    title: 'Assembly and handover',
    copy: 'The home is assembled, enclosed and completed on site, then reviewed as one finished whole before handover.',
    image: '/process/generated/photo-series-v1/completed-home.webp',
    alt: 'Visualized completed gabled modular home in its coastal landscape',
  },
] as const;

type Route = { width: number; height: number; path: string };
type Point = { x: number; y: number };

function surveyRoute(points: Point[]): string {
  if (points.length === 0) return '';

  const first = points[0];
  let path = `M ${first.x} ${Math.max(0, first.y - 90)} L ${first.x} ${first.y}`;

  for (let index = 0; index < points.length - 1; index += 1) {
    const from = points[index];
    const to = points[index + 1];
    const deltaX = to.x - from.x;
    const middleY = (from.y + to.y) / 2;

    if (Math.abs(deltaX) < 24) {
      path += ` L ${to.x} ${to.y}`;
      continue;
    }

    const direction = Math.sign(deltaX);
    const radius = Math.min(34, Math.abs(deltaX) / 4, (to.y - from.y) / 5);
    path += ` L ${from.x} ${middleY - radius}`;
    path += ` Q ${from.x} ${middleY} ${from.x + direction * radius} ${middleY}`;
    path += ` L ${to.x - direction * radius} ${middleY}`;
    path += ` Q ${to.x} ${middleY} ${to.x} ${middleY + radius}`;
    path += ` L ${to.x} ${to.y}`;
  }

  const last = points[points.length - 1];
  return `${path} L ${last.x} ${last.y + 90}`;
}

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

  const timelineRef = useRef<HTMLDivElement>(null);
  const markerRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [route, setRoute] = useState<Route | null>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: timelineRef, offset: ['start 68%', 'end 38%'] });

  const measureRoute = useCallback(() => {
    const timeline = timelineRef.current;
    if (!timeline) return;

    const bounds = timeline.getBoundingClientRect();
    const height = timeline.offsetHeight;
    if (bounds.width === 0 || height === 0) return;

    const points = markerRefs.current.slice(0, currentPhases.length).map((marker) => {
      if (!marker) return null;
      const box = marker.getBoundingClientRect();
      return {
        x: Math.round((box.left + box.width / 2 - bounds.left) * 10) / 10,
        y: Math.round((box.top + box.height / 2 - bounds.top) * 10) / 10,
      };
    });
    if (points.some((point) => point === null)) return;

    const next = {
      width: Math.round(bounds.width),
      height: Math.round(height),
      path: surveyRoute(points as Point[]),
    };
    setRoute((previous) => previous?.width === next.width && previous.height === next.height && previous.path === next.path ? previous : next);
  }, [currentPhases.length]);

  useLayoutEffect(() => {
    const timeline = timelineRef.current;
    if (!timeline) return;
    measureRoute();

    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measureRoute);
    observer?.observe(timeline);
    markerRefs.current.forEach((marker) => { if (marker) observer?.observe(marker); });
    const fontSet = document.fonts;
    void fontSet?.ready.then(measureRoute);
    window.addEventListener('resize', measureRoute, { passive: true });

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', measureRoute);
    };
  }, [measureRoute]);

  return (
    <section className={styles.section} aria-labelledby="process-detail-title">
      <header className={styles.intro}>
        <p>{eyebrow}</p>
        <h2 id="process-detail-title">{heading}</h2>
      </header>

      <div className={styles.timeline} ref={timelineRef}>
        {route && (
          <svg
            className={styles.route}
            viewBox={`0 0 ${route.width} ${route.height}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path className={styles.routeBase} d={route.path} />
            <motion.path
              className={styles.routeActive}
              d={route.path}
              style={{ pathLength: reducedMotion ? 1 : scrollYProgress }}
            />
          </svg>
        )}

        {currentPhases.map((phase, index) => (
          <article className={styles.phase} data-side={index % 2 === 0 ? 'left' : 'right'} key={index}>
            <div className={styles.stopHeader}>
              <span
                className={styles.marker}
                ref={(element) => { markerRefs.current[index] = element; }}
                aria-hidden="true"
              />
              <p>{phase.days}</p>
            </div>
            <div className={styles.imageWrap}>
              <Image src={phase.image} alt={phase.alt} fill sizes="(max-width: 700px) 84vw, (max-width: 1100px) 77vw, 72vw" />
            </div>
            <div className={styles.phaseCopy}>
              <h3>{phase.title}</h3>
              <p>{phase.copy}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
