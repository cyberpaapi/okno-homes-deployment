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
  { id: "sustainability", title: "Sustainability", detail: "certificate", icon: "badge" },
  { id: "move-in", title: "90 days move-in", detail: "guarantee", icon: "calendar" },
  { id: "warranty", title: "20 years", detail: "warranty", icon: "shield" },
  { id: "energy", title: "Energy-efficient", detail: "LED lights", icon: "bulb" },
  { id: "resilience", title: "Earthquake-storm", detail: "resistant", icon: "home" },
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
        <p data-type-field={"about.opening.line-two"}><span data-type-highlight data-type-field={"about.opening.line-one"}>{value("about.opening.line-one", "Revolutionise construction.")}</span>{" "}
          {value("about.opening.line-two", "Driving the world's transition to sustainable luxury living.")}
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
            <p className={styles.body} data-type-field={"about.vision.copy"}>{value("about.vision.copy", "As the world turns, it is startlingly apparent that construction, the way it is right now, is wreaking havoc on the environment. We at OKNO aim to be pioneers in sustainable construction for the world at large. We seek to innovate every day, putting people first and earning their trust through our passionate efforts.")}</p>
          </div>
        </div>
      </section>

      <section className={`${styles.chapter} ${styles.future}`} data-type-section="about.future" data-about-viewport-section>
        <div className={`${styles.inner} ${styles.split} ${styles.futureSplit}`}>
          <div className={styles.copy}>
            <h2 className={styles.heading} data-type-field={"about.future.title"}>{value("about.future.title", "Fabricating the Future")}</h2>
            <p className={styles.body} data-type-field={"about.future.copy"}>{value("about.future.copy", "Our homes, sculpted by esteemed architects, are symphonies of sophistication. With a fusion of eco-conscious design and bespoke craftsmanship, each residence exudes timeless grace. Discover the art of living at OKNO Modhomes, where elegance is eternalised.")}</p>
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
          <motion.figure className={`${styles.media} ${styles.foundersMedia}`} {...mediaEntrance}>
            <Image loader={pageImageLoader} src={value("about.founders.image", "/about/okno-founders.jpeg")}
              alt={value("about.founders.image-alt", "OKNO Modhomes founders")}
              fill sizes="(max-width: 840px) 100vw, 46vw" />
          </motion.figure>
          <div className={styles.copy}>
            <h2 className={styles.heading} data-type-field={"about.founders.title"}>{value("about.founders.title", "Meet our founders")}</h2>
            <p className={styles.body} data-type-field={"about.founders.copy"}>{value("about.founders.copy", "Our journey started with a simple idea: to make elegant housing solutions that care for our planet. We envisioned spaces where style meets sustainability, where every family can thrive in a cosy, eco-friendly haven. Guided by this vision, we crafted OKNO Modhomes, a place where elegant designs and green living unite. Each home we create reflects our passion for simplicity, blending sophistication with environmental consciousness. With us, you are not just getting a house; you are stepping into a lifestyle that values elegance, sustainability, and the warmth of a home. Welcome to OKNO Modhomes, where your dream living begins.")}</p>
          </div>
        </div>
      </section>

      <section className={`${styles.chapter} ${styles.why}`} data-type-section="about.assurances" data-about-viewport-section>
        <div className={styles.inner}>
          <h2 className={styles.heading} data-type-field={"about.assurances.title"}>{value("about.assurances.title", "Why OKNO?")}</h2>
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
            <h2 className={styles.heading} data-type-field={"about.fit.title"}>{value("about.fit.title", "A perfect fit. Everywhere, every time.")}</h2>
            <p className={styles.body} data-type-field={"about.fit.copy"}>{value("about.fit.copy", "Don't sweat the details; we've taken care of it all for you. Our walls, ceilings, floors, and everything in between are designed and precision-manufactured to work with one another from beginning to end. What you get is a cohesive aesthetic and perfect lines everywhere you look.")}</p>
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
