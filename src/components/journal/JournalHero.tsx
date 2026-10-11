"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { JournalArrowLink } from "./JournalArrowLink";
import { JournalSourceMark } from "./JournalSourceMark";
import { ShaderBackground } from "./JournalShaderBackground";
import { JournalTextReveal } from "./JournalTextReveal";
import { useJournalEntries } from "@/lib/useJournalContent";
import { featuredJournalEntry } from "@/lib/journalCollections";
import { useSiteContent } from "@/lib/useSiteContent";
import { pressEntries } from "./journalData";
import styles from "./Journal.module.css";

export default function JournalHero() {
  const press = useJournalEntries().press;
  const featuredId = useSiteContent("journal.hero.featured-id", pressEntries[0].id);
  const featured = featuredJournalEntry(press, featuredId);
  const eyebrow = useSiteContent("journal.hero.eyebrow", "Press coverage");
  const actionVerb = useSiteContent("journal.press.action", "Read");
  const heading = useSiteContent("journal.hero.heading", "News from the practice.");
  const dek = useSiteContent("journal.hero.dek", "Press coverage and project notes from OKNO.");
  const reduced = useReducedMotion();
  return (
    <section className={styles.hero} aria-labelledby="journal-title">
      <ShaderBackground className={styles.heroShader} />
      <div className={styles.heroShade} aria-hidden="true" />
      <div className={styles.heroCopy}>
        <motion.p className={styles.eyebrow} initial={reduced ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : 0.6 }}>{eyebrow}</motion.p>
        <h1 id="journal-title"><JournalTextReveal text={heading} amount={0.1} /></h1>
        <motion.p className={styles.heroDek} initial={reduced ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : 0.65, delay: reduced ? 0 : 0.3 }}>{dek}</motion.p>
      </div>

      {featured && <motion.article className={styles.heroFeature} data-photo={Boolean(featured.image)} initial={reduced ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : 0.8, delay: reduced ? 0 : 0.25 }}>
        {featured.image && <div className={styles.heroImage}>
          <Image src={featured.image} alt={featured.imageAlt} fill priority sizes="(max-width: 760px) 92vw, 44vw" />
          <div className={styles.imageVeil} aria-hidden="true" />
        </div>}
        <div className={styles.heroFeatureCopy}>
          {(featured.source || featured.logo) && <p className={styles.featureSource}>
            <JournalSourceMark source={featured.source} logo={featured.logo} />
            {featured.source && <strong>{featured.source}</strong>}
          </p>}
          <h2>{featured.title}</h2>
          {(featured.date || featured.credit) && <div className={styles.featureMeta}>
            {featured.date && <span>{featured.date}</span>}
            {featured.credit && <span>{featured.credit}</span>}
          </div>}
        </div>
        <div className={styles.heroAction}>
          <JournalArrowLink href={featured.href} external={featured.external} label={`${actionVerb} ${featured.title}${featured.source ? ` at ${featured.source}` : ""}`} inverse />
        </div>
      </motion.article>}
    </section>
  );
}
