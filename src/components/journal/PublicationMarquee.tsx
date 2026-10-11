"use client";

// Full-bleed adaptation of the bookmarked 21st.dev Marquee by lukacho,
// demo 1198—the same source whose demo carries technology wordmarks.
import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { JournalSourceMark } from "./JournalSourceMark";
import styles from "./Journal.module.css";
import { useJournalEntries } from "@/lib/useJournalContent";
import { uniqueJournalPublishers } from "@/lib/journalCollections";
import { useSiteContent } from "@/lib/useSiteContent";

export default function PublicationMarquee() {
  const publishers = uniqueJournalPublishers(useJournalEntries().press);
  const accessibleLabel = useSiteContent("journal.publications.accessible-label", "Publications covering OKNO");
  const root = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const reduced = useReducedMotion();
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry?.isIntersecting ?? true), { rootMargin: "100px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const renderPublisher = (publisher: (typeof publishers)[number], index: number) => (
    <span className={styles.publicationItem} key={`${publisher.id}-${index}`}>
      <JournalSourceMark source={publisher.source} logo={publisher.logo} monochrome />
      {publisher.source}
    </span>
  );
  if (publishers.length === 0) return null;
  return (
    <div ref={root} className={styles.publicationMarquee} data-paused={reduced || !visible || publishers.length < 2} data-single={publishers.length === 1} aria-label={accessibleLabel}>
      <div className={styles.publicationTrack}>
        <div className={styles.publicationGroup}>{publishers.map(renderPublisher)}</div>
        {publishers.length > 1 && <div className={styles.publicationGroup} aria-hidden="true" inert>{publishers.map(renderPublisher)}</div>}
      </div>
    </div>
  );
}
