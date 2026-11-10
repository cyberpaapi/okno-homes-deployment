"use client";
// Client feedback (10 November 2026): Hospitality gets the same pop-up image as the
// Bespoke result section: a full-bleed photograph that opens as it enters, with a framed
// second photograph rising over it. Same scroll ranges as BespokeExperience.
import { useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { pageImageLoader } from "@/lib/pageImageLoader";
import { previewImageLoader } from "@/lib/thumbnailImageLoader";
import { useSiteContent } from "@/lib/useSiteContent";
import styles from "./HospitalityResult.module.css";

export function HospitalityResult() {
  const section = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const eyebrow = useSiteContent("hospitality.result.eyebrow", "The result");
  const heading = useSiteContent("hospitality.result.heading", "Guest-ready, and of its place.");
  const image = useSiteContent("hospitality.result.image", "/assets/projects/real-v1/rasa-vikarabad-01.webp");
  const alt = useSiteContent("hospitality.result.alt", "Rasa Vikarabad pool and pavilions at dusk");
  const cardImage = useSiteContent("hospitality.result.card-image", "/assets/projects/real-v1/rasa-vikarabad-04.webp");
  const cardAlt = useSiteContent("hospitality.result.card-alt", "Breakfast by the pool at Rasa Vikarabad");
  const { scrollYProgress } = useScroll({ target: section, offset: ["start end", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [90, -90]);
  const imageScale = useTransform(scrollYProgress, [0, .42], reduced ? [1, 1] : [1.08, 1]);
  const imageClip = useTransform(scrollYProgress, [0, .32], reduced ? ["inset(0% 0% 0% 0% round 0px)", "inset(0% 0% 0% 0% round 0px)"] : ["inset(42% 7% 0% 7% round 36px 36px 0 0)", "inset(0% 0% 0% 0% round 0px)"]);
  const cardY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [180, -140]);
  return (
    <section ref={section} className={styles.result} data-type-section="hospitality.result" aria-labelledby="hospitality-result-title" data-header-tone="dark">
      <div className={styles.sticky}>
        <motion.div className={styles.image} style={{ y: imageY, scale: imageScale, clipPath: imageClip }}>
          <Image loader={pageImageLoader} src={image} alt={alt} fill sizes="100vw" className={styles.cover} />
        </motion.div>
        <motion.figure className={styles.card} style={{ y: cardY }}>
          <Image loader={previewImageLoader} src={cardImage} alt={cardAlt} fill sizes="(max-width: 700px) 40vw, 34vw" className={styles.cover} />
        </motion.figure>
        <div className={styles.copy}>
          <p data-type-field="hospitality.result.eyebrow">{eyebrow}</p>
          <h2 id="hospitality-result-title" data-type-field="hospitality.result.heading">{heading}</h2>
        </div>
      </div>
    </section>
  );
}
