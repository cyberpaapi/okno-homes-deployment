"use client";

// Straight-line compositor adaptation of two retrieved 21st.dev components:
// Marquee 1198 supplies the duplicated continuous track; Marquee Along SVG
// Path 19091 supplies pointer capture, grab state and inertial drag.
import Image from "next/image";
import { thumbnailImageLoader } from "@/lib/thumbnailImageLoader";
import { useAnimationFrame, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { JournalArrowLink } from "./JournalArrowLink";
import { JournalSourceMark } from "./JournalSourceMark";
import type { JournalEntry } from "./journalData";
import styles from "./Journal.module.css";

function JournalCard({ entry, duplicate = false, actionVerb }: { entry: JournalEntry; duplicate?: boolean; actionVerb?: string }) {
  return (
    <article className={styles.storyCard} aria-hidden={duplicate || undefined} data-duplicate={duplicate || undefined} data-photo={Boolean(entry.image)}>
      {entry.image && <div className={styles.cardImage}>
        <Image loader={thumbnailImageLoader} draggable={false} src={entry.image} alt={duplicate ? "" : entry.imageAlt} fill sizes="(max-width: 640px) 82vw, 410px" />
        <div className={styles.cardVeil} aria-hidden="true" />
      </div>}
      <div className={styles.cardCopy}>
        {(entry.source || entry.logo) && <p className={styles.cardSource}>
          <JournalSourceMark source={entry.source} logo={entry.logo} />
          {entry.source && <strong>{entry.source}</strong>}
        </p>}
        <h3>{entry.title}</h3>
        {(entry.date || entry.credit) && <div className={styles.cardMeta}>
          {entry.date && <p className={styles.cardDate}>{entry.date}</p>}
          {entry.credit && <p className={styles.cardCredit}>{entry.credit}</p>}
        </div>}
      </div>
      <div className={styles.cardAction}>
        <JournalArrowLink
          href={entry.href}
          external={entry.external}
          inverse
          label={`${actionVerb || (entry.external ? "Read" : "View")} ${entry.title}${entry.external && entry.source ? ` at ${entry.source}` : ""}`}
          tabIndex={duplicate ? -1 : undefined}
        />
      </div>
    </article>
  );
}

export default function JournalMarquee({ caption, entries, direction = "left", actionVerb }: { caption: string; entries: JournalEntry[]; direction?: "left" | "right"; actionVerb?: string }) {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const firstGroup = useRef<HTMLDivElement>(null);
  const groupWidth = useRef(0);
  const offset = useRef(0);
  const visible = useRef(true);
  const hovered = useRef(false);
  const dragging = useRef(false);
  const lastX = useRef(0);
  const dragVelocity = useRef(0);
  const focused = useRef(false);
  const moved = useRef(false);
  const [dragActive, setDragActive] = useState(false);
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();

  const paintPosition = () => {
    const node = track.current;
    const width = groupWidth.current;
    if (!node) return;
    if (width > 0) {
      while (offset.current <= -width) offset.current += width;
      while (offset.current > 0) offset.current -= width;
    }
    node.style.transform = `translate3d(${offset.current.toFixed(3)}px, 0, 0)`;
  };

  useEffect(() => {
    const section = root.current;
    const node = track.current;
    const group = firstGroup.current;
    if (!section || !node || !group) return;
    const observer = new IntersectionObserver(([entry]) => { visible.current = entry?.isIntersecting ?? true; }, { rootMargin: "120px" });
    observer.observe(section);
    const measureAndPosition = () => {
      groupWidth.current = group.scrollWidth;
      if (direction === "right" && entries.length > 1 && offset.current === 0) offset.current = -groupWidth.current;
      paintPosition();
    };
    const resizeObserver = new ResizeObserver(measureAndPosition);
    resizeObserver.observe(group);
    measureAndPosition();
    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
    };
  }, [direction, entries.length]);

  useAnimationFrame((_, delta) => {
    if (entries.length < 2 || !track.current || reduced || paused || focused.current || !visible.current || dragging.current || document.visibilityState !== "visible") return;
    const frame = Math.min(delta, 32) / 16.667;
    if (Math.abs(dragVelocity.current) > 0.08) {
      offset.current += dragVelocity.current * frame;
      dragVelocity.current *= Math.pow(0.94, frame);
      paintPosition();
      return;
    }
    dragVelocity.current = 0;
    if (hovered.current) return;
    offset.current += (direction === "left" ? -1 : 1) * Math.min(delta, 32) * 0.035;
    paintPosition();
  });

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (entries.length < 2 || reduced || (event.target as Element).closest("a,button")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragging.current = true;
    dragVelocity.current = 0;
    moved.current = false;
    lastX.current = event.clientX;
    setDragActive(true);
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current || !track.current) return;
    const delta = event.clientX - lastX.current;
    if (Math.abs(delta) > 3) moved.current = true;
    offset.current += delta;
    dragVelocity.current = delta * 0.92;
    lastX.current = event.clientX;
    paintPosition();
  };
  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    dragging.current = false;
    setDragActive(false);
  };

  if (entries.length === 0) return null;

  return (
    <section ref={root} className={styles.marqueeWrap} data-type-section={direction === "left" ? "journal.press-intro" : "journal.notes-intro"} aria-label={caption} data-direction={direction} data-single={entries.length === 1}>
      <div className={styles.marqueeCaption}><p>{caption}</p>{entries.length > 1 && !reduced && <button type="button" onClick={() => setPaused(value => !value)} aria-label={`${paused ? 'Resume' : 'Pause'} ${caption.toLowerCase()} motion`}>{paused ? 'Resume motion' : 'Pause motion'}</button>}</div>
      <div
        className={styles.marqueeViewport}
        data-dragging={dragActive}
        onPointerEnter={(event) => { hovered.current = event.pointerType === 'mouse'; }}
        onPointerLeave={(event) => { hovered.current = false; endDrag(event); }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onFocusCapture={() => { focused.current = true; }}
        onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) focused.current = false; }}
        onClickCapture={(event) => { if (moved.current) { event.preventDefault(); event.stopPropagation(); moved.current = false; } }}
      >
        <div ref={track} className={styles.marqueeTrack} data-marquee-track>
          <div ref={firstGroup} className={styles.marqueeGroup}>{entries.map((entry) => <JournalCard key={entry.id} entry={entry} actionVerb={actionVerb} />)}</div>
          {entries.length > 1 && <div className={styles.marqueeGroup} aria-hidden="true">{entries.map((entry) => <JournalCard key={`${entry.id}-duplicate`} entry={entry} duplicate actionVerb={actionVerb} />)}</div>}
        </div>
      </div>
    </section>
  );
}
