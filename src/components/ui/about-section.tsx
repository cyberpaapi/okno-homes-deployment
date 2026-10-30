"use client";

import Image from "next/image";
import { useRef } from "react";
import { pageImageLoader } from "@/lib/pageImageLoader";
import { BadgeCheck, CalendarClock, House, Lightbulb, ShieldCheck, type LucideIcon } from "lucide-react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { SilkBackground } from "@/components/projects/21st/SilkBackground";
import { TextReveal } from "@/components/about/TextReveal";
import { useSiteContentMap } from "@/lib/useSiteContent";
import styles from "./AboutSection.module.css";

const assuranceIconComponents: Record<string, LucideIcon> = {
  badge: BadgeCheck,
  calendar: CalendarClock,
  shield: ShieldCheck,
  bulb: Lightbulb,
  home: House,
};

type Assurance = { id: string; title: string; detail: string; icon: string };

const assurances: Assurance[] = [
  { id: "sustainability", title: "Sustainability", detail: "certified", icon: "badge" },
  { id: "move-in", title: "90-day", detail: "handover", icon: "calendar" },
  { id: "warranty", title: "20-year", detail: "warranty", icon: "shield" },
  { id: "energy", title: "One team", detail: "design to handover", icon: "home" },
  { id: "resilience", title: "Engineered", detail: "for earthquake and storm", icon: "home" },
];

export default function AboutSection() {
  const content = useSiteContentMap();
  const value = (id: string, fallback: string) => content[id] ?? fallback;
  const reduceMotion = useReducedMotion();
  const paperRef = useRef<HTMLDivElement>(null);
  const paperVisible = useInView(paperRef, { margin: "-20% 0px -20% 0px" });
  const mediaEntrance = reduceMotion ? {} : {
    initial: { opacity: 0.84, y: 18 },
    whileInView: { opacity: 1, y: 0 },
    whileHover: { y: -5 },
    viewport: { once: true, amount: 0.18 },
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
  };

  return (
    <div className={styles.page} data-about-surface="silk">
      <div className={styles.ambient} data-about-21st="24383" aria-hidden="true">
        <SilkBackground paused={paperVisible} maxPixels={520_000} fps={24} interactive={false} />
      </div>

      <section className={styles.hero} data-type-section="about.opening" data-about-viewport-section>
        <div className={styles.heroInner}>
          <div data-about-21st="kuratlielia/text-reveal" data-type-field={"about.opening.title"}>
            <TextReveal as="h1" text={value("about.opening.title", "About OKNO")} className={styles.heroTitle} />
          </div>
          <figure className={`${styles.media} ${styles.heroMedia}`}>
            <Image loader={pageImageLoader}
              src={value("about.opening.image", "/about/storyboard/about-film-frame-01.png")}
              alt={value("about.opening.image-alt", "An OKNO home in a natural landscape at dusk")}
              fill priority sizes="(max-width: 1440px) 100vw, 1440px"
            />
          </figure>
        </div>
      </section>

      <section className={styles.manifesto} data-type-section="about.opening" aria-label="Our purpose" data-about-viewport-section>
        <p data-type-field={"about.opening.line-two"}><span data-type-highlight data-type-field={"about.opening.line-one"}>{value("about.opening.line-one", "We build for the places people love most,")}</span>{" "}
          {value("about.opening.line-two", "with the precision those places deserve.")}
        </p>
      </section>

      <section id="vision" data-type-section="about.vision" className={`${styles.chapter} ${styles.vision}`} data-about-viewport-section>
        <div className={`${styles.inner} ${styles.split} ${styles.visionSplit}`}>
          <motion.figure className={`${styles.media} ${styles.visionMedia}`} {...mediaEntrance}>
            <Image loader={pageImageLoader} src={value("about.vision.image", "/models/forza/interiors/forza-living.webp")}
              alt={value("about.vision.image-alt", "An OKNO living space opening toward a natural landscape")}
              fill sizes="(max-width: 840px) 100vw, 46vw" />
          </motion.figure>
          <div className={styles.copy}>
            <h2 className={styles.heading} data-type-field={"about.vision.title"}>{value("about.vision.title", "Our vision")}</h2>
            <p className={styles.body} data-type-field={"about.vision.copy"}>{value("about.vision.copy", "Building in beautiful places has always been slow, uncertain and hard on the land. We exist to change that. OKNO designs and makes homes off-site, then places them with care, so a remote site can hold a considered home without months of disruption around it.")}</p>
          </div>
        </div>
      </section>

      <section className={`${styles.chapter} ${styles.future}`} data-type-section="about.future" data-about-viewport-section>
        <div className={`${styles.inner} ${styles.split} ${styles.futureSplit}`}>
          <div className={styles.copy}>
            <h2 className={styles.heading} data-type-field={"about.future.title"}>{value("about.future.title", "Made, then placed.")}</h2>
            <p className={styles.body} data-type-field={"about.future.copy"}>{value("about.future.copy", "Every OKNO home is drawn by architects and made by craftspeople working side by side. Structure, services and finishes are resolved together, so what arrives on your land is complete, considered and built to last.")}</p>
          </div>
          <motion.figure className={`${styles.media} ${styles.landscapeMedia}`} {...mediaEntrance}>
            <Image loader={pageImageLoader} src={value("about.future.image", "/about/storyboard/about-film-frame-02.png")}
              alt={value("about.future.image-alt", "A precision-fabricated OKNO home")}
              fill sizes="(max-width: 840px) 100vw, 54vw" />
          </motion.figure>
        </div>
      </section>

      <div ref={paperRef} className={styles.paperInterlude} data-about-paper>
      <section id="founders" data-type-section="about.founders" className={`${styles.chapter} ${styles.founders}`} data-about-viewport-section>
        <div className={`${styles.inner} ${styles.split} ${styles.foundersSplit}`}>
          <div><motion.figure className={`${styles.media} ${styles.foundersMedia}`} {...mediaEntrance}>
            <Image loader={pageImageLoader} src={value("about.founders.image", "/about/okno-founders.jpeg")}
              alt={value("about.founders.image-alt", "OKNO Modhomes founders")}
              fill sizes="(max-width: 840px) 100vw, 46vw" />
          </motion.figure><div className={styles.founderCaptions}><p>{value("about.founders.left-caption", "Harshit Puram · Co-founder")}</p><p>{value("about.founders.right-caption", "Parikshit Linga · Co-founder")}</p></div></div>
          <div className={styles.copy}>
            <h2 className={styles.heading} data-type-field={"about.founders.title"}>{value("about.founders.title", "The founders")}</h2>
            <p className={styles.body} data-type-field={"about.founders.copy"}>{value("about.founders.copy", "Harshit Puram and Parikshit Linga founded OKNO on a simple conviction: a home in a remarkable place should not take years of compromise to build. They brought architecture and making together under one practice, so that design intent survives all the way to the site. Today OKNO works with private clients and hospitality owners who want something rare, and want it built with certainty.")}</p>
          </div>
        </div>
      </section>

      <section className={`${styles.chapter} ${styles.why}`} data-type-section="about.assurances" data-about-viewport-section>
        <div className={styles.inner}>
          <h2 className={styles.heading} data-type-field={"about.assurances.title"}>{value("about.assurances.title", "What we stand behind.")}</h2>
          <ul aria-label="OKNO commitments" className={styles.assuranceList}>
            {assurances.map(({ id, title, detail, icon }, index) => {
              const Icon = assuranceIconComponents[value(`about.assurances.${id}-icon`, icon)] ?? assuranceIconComponents[icon];
              return (
              <motion.li key={id} className={styles.assurance}
                initial={reduceMotion ? false : { opacity: 0.75, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: reduceMotion ? 0 : 0.62, delay: reduceMotion ? 0 : index * 0.065, ease: [0.16, 1, 0.3, 1] }}>
                <Icon data-about-icon strokeWidth={1.45} aria-hidden="true" />
                <p><span data-type-field={`about.assurances.${id}-title`}>{value(`about.assurances.${id}-title`, title)}</span><span data-type-field={`about.assurances.${id}-detail`}>{value(`about.assurances.${id}-detail`, detail)}</span></p>
              </motion.li>
              );
            })}
          </ul>
        </div>
      </section>
      </div>

      <section className={`${styles.chapter} ${styles.fit}`} data-type-section="about.fit" data-about-viewport-section>
        <div className={`${styles.inner} ${styles.split} ${styles.fitSplit}`}>
          <div className={styles.copy}>
            <h2 className={styles.heading} data-type-field={"about.fit.title"}>{value("about.fit.title", "Precise, by design.")}</h2>
            <p className={styles.body} data-type-field={"about.fit.copy"}>{value("about.fit.copy", "Walls, ceilings and floors are designed and made to fit one another exactly. The result is clean lines, quiet junctions and nothing left to chance.")}</p>
          </div>
          <motion.figure className={`${styles.media} ${styles.landscapeMedia}`} {...mediaEntrance}>
            <Image loader={pageImageLoader} src={value("about.fit.image", "/about/storyboard/about-film-frame-03.png")}
              alt={value("about.fit.image-alt", "The timber facade and entrance of an OKNO home")}
              fill sizes="(max-width: 840px) 100vw, 54vw" />
          </motion.figure>
        </div>
      </section>
    </div>
  );
}
