"use client";

import Image from "next/image";
import { motion, useTransform, type MotionValue } from "motion/react";
import type { CSSProperties } from "react";
import { useSiteContent } from "@/lib/useSiteContent";
import styles from "./ProcessDeliveryTimeline.module.css";

export type ProcessTimelineItem = {
  id: string;
  days: string;
  label: string;
  title: string;
  poster: string;
};

function TimelineItems({
  items,
  activeIndex,
}: {
  items: readonly ProcessTimelineItem[];
  activeIndex?: number;
}) {
  return (
    <ol>
      {items.map((item, index) => {
        const active = activeIndex === index;
        return (
          <li
            className={styles.milestone}
            data-active={active}
            aria-current={active ? "step" : undefined}
            key={item.id}
          >
            <span className={styles.thumbnail} aria-hidden="true">
              <Image src={item.poster} alt="" fill sizes="72px" />
            </span>
            <span className={styles.milestoneCopy}>
              <span>{item.days}</span>
              <em>{item.label}</em>
              <strong>{item.title}</strong>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * Vertical OKNO adaptation of 21st.dev Product Timeline by Hyperiux (26930).
 * The line draw and scroll-linked milestone reveal are retained while the
 * milestones become a visual rail beside the active Process film.
 */
export default function ProcessDeliveryTimeline({
  items,
  activeIndex,
  progress,
}: {
  items: readonly ProcessTimelineItem[];
  activeIndex: number;
  progress: MotionValue<number>;
}) {
  const heading = useSiteContent("process.sequence.rail-heading", "Build sequence");
  const summary = useSiteContent("process.sequence.rail-summary", "Land to handover");
  const ariaLabel = useSiteContent("process.sequence.rail-aria", "90-day home build schedule");
  const lineScale = useTransform(progress, [0, 1], [0, 1]);

  return (
    <aside className={styles.timeline} aria-label={ariaLabel}>
      <div className={styles.heading}>
        <h3>{heading}</h3>
        <p>{items[activeIndex] ? `${items[activeIndex].days} · ${items[activeIndex].label}` : summary}</p>
      </div>
      <div className={styles.track}>
        <span className={styles.trackBase} aria-hidden="true" />
        <motion.span
          className={styles.trackActive}
          style={{ "--timeline-progress": lineScale } as CSSProperties}
          aria-hidden="true"
        />
        <TimelineItems items={items} activeIndex={activeIndex} />
      </div>
    </aside>
  );
}

export function StaticProcessDeliveryTimeline({ items }: { items: readonly ProcessTimelineItem[] }) {
  const heading = useSiteContent("process.sequence.rail-heading", "Build sequence");
  const summary = useSiteContent("process.sequence.rail-summary", "Land to handover");
  const ariaLabel = useSiteContent("process.sequence.rail-aria", "90-day home build schedule");
  return (
    <aside
      className={`${styles.timeline} ${styles.staticTimeline}`}
      aria-label={ariaLabel}
    >
      <div className={styles.heading}>
        <h3>{heading}</h3>
        <p>{summary}</p>
      </div>
      <div className={styles.track}>
        <span className={styles.trackBase} aria-hidden="true" />
        <span className={styles.trackActive} aria-hidden="true" />
        <TimelineItems items={items} />
      </div>
    </aside>
  );
}
