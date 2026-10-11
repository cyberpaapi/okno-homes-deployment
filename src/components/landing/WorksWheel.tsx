'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Image from 'next/image';
import { SubtleButton, SubtleLink } from '@/components/ui/SubtleAction';
import media from '@/data/realProjectMedia.json';
import styles from './WorksWheel.module.css';

// crafterui / 21st.dev 28371: retain the ring-to-drum geometry, bowed axis,
// front-plane setback, perspective and distance culling. See provenance doc.
const CARD_H = .38, CARD_MAX_W = .34, CARD_RATIO = 1.45;
const STEP = 40, DRUM = 2.22, LENS = 2.7, RING_R = 1.14, BOW = 1.82, CULL = 1.6;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const rad = (deg: number) => deg * Math.PI / 180;
const bowAt = (deg: number, bow: number) => -bow * (1 - Math.cos(rad(deg)));
function place(ringDeg: number, drumDeg: number, ringR: number, drumR: number, bow: number, m: number) {
  return `translateX(${m * bowAt(drumDeg, bow)}px) rotateZ(${(1 - m) * ringDeg}deg) translateY(${-(1 - m) * ringR}px) rotateX(${m * drumDeg}deg) translateZ(${m * drumR}px)`;
}
const COMPACT_QUERY = '(max-width: 767px), (max-height: 600px), (prefers-reduced-motion: reduce)';
const subscribeCompact = (notify: () => void) => {
  const query = window.matchMedia(COMPACT_QUERY);
  query.addEventListener('change', notify);
  return () => query.removeEventListener('change', notify);
};
const readCompact = () => window.matchMedia(COMPACT_QUERY).matches;
const serverCompact = () => false;

const orderedIDs = ['lakewood', 'forrest', 'kioo', 'kray-sangareddy', 'octapod-layana', 'rasa-vikarabad'];
const projects = orderedIDs.map(id => media.find(project => project.id === id)!);

export default function WorksWheel() {
  const compact = useSyncExternalStore(subscribeCompact, readCompact, serverCompact);
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const wheel = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const ringLabel = useRef<HTMLDivElement>(null);
  const activeLabel = useRef<HTMLDivElement>(null);
  const select = useRef<(index: number) => void>(() => {});
  const turn = useRef(0);
  const target = useRef(0);
  const [active, setActive] = useState(0);
  const swipe = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (compact) return;
    const container = section.current, surface = stage.current;
    if (!container || !surface) return;
    let frame = 0, visible = true;
    let metrics = { cardW: 0, cardH: 0, ringR: 0, ringScale: 1, drumR: 0, bow: 0 };
    const draw = () => {
      frame = 0;
      if (!visible || document.hidden) return;
      const gap = target.current - turn.current;
      turn.current = Math.abs(gap) < .0005 ? target.current : turn.current + gap * .16;
      const m = clamp(turn.current, 0, 1), pos = Math.max(0, turn.current - 1);
      const { ringR, ringScale, drumR, bow } = metrics;
      if (wheel.current) wheel.current.style.transform = `translateZ(${-m * drumR}px)`;
      cards.current.forEach((card, i) => {
        if (!card) return;
        const d = i - pos;
        card.style.transform = place(d * (360 / projects.length), d * STEP, ringR, drumR, bow, m);
        card.style.opacity = m > .5 && Math.abs(d) > CULL ? '0' : '1';
        card.style.zIndex = String(Math.round(100 - Math.abs(d) * 2));
        const face = card.firstElementChild as HTMLElement;
        face.style.transform = `scale(${lerp(ringScale, 1, m)})`;
      });
      if (ringLabel.current) ringLabel.current.style.opacity = String(1 - m);
      if (activeLabel.current) activeLabel.current.style.opacity = String(m);
      const near = clamp(Math.round(pos), 0, projects.length - 1);
      setActive(prev => prev === near ? prev : near);
      if (Math.abs(target.current - turn.current) >= .0005) frame = requestAnimationFrame(draw);
    };
    const wake = () => { if (!frame && visible && !document.hidden) frame = requestAnimationFrame(draw); };
    const readScroll = () => {
      const travel = container.offsetHeight - surface.offsetHeight;
      if (travel <= 0) return;
      target.current = clamp(-container.getBoundingClientRect().top / travel, 0, 1) * projects.length;
      wake();
    };
    const measure = () => {
      const cardW = Math.min(surface.clientHeight * CARD_H * CARD_RATIO, surface.clientWidth * CARD_MAX_W);
      const cardH = cardW / CARD_RATIO, ringR = cardH * RING_R;
      metrics = { cardW, cardH, ringR, ringScale: clamp((((2 * Math.PI * ringR) / projects.length) * .82) / (cardW || 1), .16, 1), drumR: cardH * DRUM, bow: cardH * BOW };
      surface.style.perspective = `${cardH * LENS}px`;
      surface.style.setProperty('--wheel-card-width', `${cardW}px`);
      surface.style.setProperty('--wheel-card-height', `${cardH}px`);
      readScroll();
      wake();
    };
    select.current = index => {
      const value = clamp(index, 0, projects.length - 1) + 1;
      const top = window.scrollY + container.getBoundingClientRect().top;
      window.scrollTo({ top: top + value / projects.length * (container.offsetHeight - surface.offsetHeight), behavior: 'instant' });
      target.current = value;
      wake();
    };
    const resize = new ResizeObserver(measure);
    resize.observe(surface); resize.observe(container);
    const intersection = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      if (visible) readScroll();
      else { cancelAnimationFrame(frame); frame = 0; }
    });
    intersection.observe(container);
    const visibility = () => {
      if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
      else readScroll();
    };
    window.addEventListener('scroll', readScroll, { passive: true });
    document.addEventListener('visibilitychange', visibility);
    measure();
    return () => {
      cancelAnimationFrame(frame); resize.disconnect(); intersection.disconnect();
      window.removeEventListener('scroll', readScroll);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [compact]);

  const go = (index: number) => {
    const next = clamp(index, 0, projects.length - 1);
    if (compact) setActive(next);
    else select.current(next);
  };
  const project = projects[active];
  return <section id="projects-preview" ref={section} className={styles.section} data-compact={compact} aria-label="Built projects">
    <div className={styles.sticky}>
      <div ref={stage} className={styles.stage} role="region" aria-label="Project wheel" tabIndex={0}
        onKeyDown={event => {
          if (event.target !== event.currentTarget) return;
          const next = event.key === 'ArrowDown' || event.key === 'ArrowRight' ? active + 1 : event.key === 'ArrowUp' || event.key === 'ArrowLeft' ? active - 1 : event.key === 'Home' ? 0 : event.key === 'End' ? projects.length - 1 : null;
          if (next === null) return;
          event.preventDefault(); go(next);
        }}
        onPointerDown={event => { if (compact) swipe.current = { x: event.clientX, y: event.clientY }; }}
        onPointerCancel={() => { swipe.current = null; }}
        onPointerUp={event => {
          const start = swipe.current; swipe.current = null;
          if (!start || !compact) return;
          const dx = event.clientX - start.x, dy = event.clientY - start.y;
          if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) go(active + (dx < 0 ? 1 : -1));
        }}>
        <div ref={wheel} className={styles.wheel} aria-hidden={!compact} data-landing-media>
          {projects.map((item, i) => <div key={item.id} ref={node => { cards.current[i] = node; }} className={styles.card} data-active={i === active}>
            <div className={styles.face}>
              <Image src={item.gallery[0].src} alt={compact && i === active ? item.gallery[0].alt : ''} fill sizes="(max-width: 767px) 100vw, 35vw" draggable={false} />
            </div>
          </div>)}
        </div>
        <div ref={ringLabel} className={styles.ringLabel}><h2 data-landing-heading>Built by OKNO.</h2></div>
      </div>
      <div ref={activeLabel} className={styles.activeLabel} aria-live="polite"><h3>{project.title}</h3></div>
      <div className={styles.controls}>
        <SubtleButton className={styles.arrow} disabled={active === 0} aria-label="Previous project" onClick={() => go(active - 1)}>Previous</SubtleButton>
        <SubtleButton className={styles.arrow} disabled={active === projects.length - 1} aria-label="Next project" onClick={() => go(active + 1)}>Next</SubtleButton>
        <SubtleLink className={styles.action} href={`/projects/${project.id}`} aria-label={`View ${project.title}`} data-cursor-media-action>View project</SubtleLink>
      </div>
    </div>
  </section>;
}
