"use client";

import { useState } from "react";
import { useReducedMotion } from "motion/react";
import { Pause, Play } from "lucide-react";
import JournalArchive from "./JournalArchive";
import JournalHero from "./JournalHero";
import JournalMarquee from "./JournalMarquee";
import PublicationMarquee from "./PublicationMarquee";
import { useJournalEntries } from "@/lib/useJournalContent";
import { useSiteContent } from "@/lib/useSiteContent";
import styles from "./Journal.module.css";

export default function JournalExperience() {
  const { press, notes } = useJournalEntries();
  const [paused, setPaused] = useState(false);
  const reducedMotion = useReducedMotion();
  const eyebrow = useSiteContent("journal.press.eyebrow", "Press coverage");
  const heading = useSiteContent("journal.press.heading", "Published stories and project records.");
  const pressCaption = useSiteContent("journal.press.caption", "In the press");
  const pressAction = useSiteContent("journal.press.action", "Read");
  const notesCaption = useSiteContent("journal.notes.caption", "From the archive");
  const notesAction = useSiteContent("journal.notes.action", "View");
  const motionControl = (press.length > 1 || notes.length > 1) && !reducedMotion ? (
    <button
      type="button"
      className={styles.motionToggle}
      onClick={() => setPaused(value => !value)}
      aria-label={paused ? "Play journal motion" : "Pause journal motion"}
      aria-pressed={paused}
      aria-controls={[press.length > 0 && "journal-press-reel", notes.length > 0 && "journal-notes-reel"].filter(Boolean).join(" ")}
    >
      {paused ? <Play size={16} strokeWidth={1.8} aria-hidden="true" /> : <Pause size={16} strokeWidth={1.8} aria-hidden="true" />}
    </button>
  ) : null;
  return (
    <div className={styles.journalContainer} data-motion-paused={paused} data-type-field={"journal.press.caption"}>
      <JournalHero />
      {press.length > 0 && <section className={styles.pressIntro} data-type-section="journal.press-intro" aria-labelledby="press-title">
        <p data-type-field={"journal.press.eyebrow"}>{eyebrow}</p>
        <h2 id="press-title" data-type-field={"journal.press.heading"}>{heading}</h2>
      </section>}
      <JournalMarquee id="journal-press-reel" caption={pressCaption} entries={press} direction="left" actionVerb={pressAction} paused={paused} control={motionControl} />
      <PublicationMarquee />
      <JournalMarquee id="journal-notes-reel" caption={notesCaption} entries={notes} direction="right" actionVerb={notesAction} paused={paused} control={press.length === 0 ? motionControl : undefined} />
      <JournalArchive />
    </div>
  );
}
