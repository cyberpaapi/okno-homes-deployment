"use client";

import JournalArchive from "./JournalArchive";
import JournalHero from "./JournalHero";
import JournalMarquee from "./JournalMarquee";
import PublicationMarquee from "./PublicationMarquee";
import { useJournalEntries } from "@/lib/useJournalContent";
import { useSiteContent } from "@/lib/useSiteContent";
import styles from "./Journal.module.css";

export default function JournalExperience() {
  const { press, notes } = useJournalEntries();
  const eyebrow = useSiteContent("journal.press.eyebrow", "Press coverage");
  const heading = useSiteContent("journal.press.heading", "Published stories and project records.");
  const pressCaption = useSiteContent("journal.press.caption", "In the press");
  const pressAction = useSiteContent("journal.press.action", "Read");
  const notesCaption = useSiteContent("journal.notes.caption", "From the archive");
  const notesAction = useSiteContent("journal.notes.action", "View");
  return (
    <div className={styles.journalContainer} data-type-field={"journal.press.caption"}>
      <JournalHero />
      {press.length > 0 && <section className={styles.pressIntro} data-type-section="journal.press-intro" aria-labelledby="press-title">
        <p data-type-field={"journal.press.eyebrow"}>{eyebrow}</p>
        <h2 id="press-title" data-type-field={"journal.press.heading"}>{heading}</h2>
      </section>}
      <JournalMarquee caption={pressCaption} entries={press} direction="left" actionVerb={pressAction} />
      <PublicationMarquee />
      <JournalMarquee caption={notesCaption} entries={notes} direction="right" actionVerb={notesAction} />
      <JournalArchive />
    </div>
  );
}
