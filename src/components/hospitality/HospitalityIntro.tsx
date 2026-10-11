"use client";

import { useState } from "react";
import Image from "next/image";
import { pageImageLoader } from "@/lib/pageImageLoader";
import { motion, useReducedMotion } from "motion/react";
import { MagneticLink } from "../projects/21st/Magnetic";
import { useSiteContentMap } from "@/lib/useSiteContent";
import { localDestination } from "@/lib/localDestination";
import styles from "./HospitalityIntro.module.css";

export function HospitalityIntro({ enquiryHref }: { enquiryHref: string }) {
  const values = useSiteContentMap();
  const get = (key: string, fallback: string) => values[`hospitality.opening.${key}`] ?? fallback;
  const heading = get("heading", "Built to welcome. Designed to scale.");
  const reducedMotion = useReducedMotion();
  const [imageReady, setImageReady] = useState(false);

  return (
    <section className={styles.stage} aria-labelledby="hospitality-title" data-header-tone="dark">
      <h1
        id="hospitality-title"
        className={styles.title}
        aria-label={heading}
      >
        {heading.trim().split(/\s+/).map((word, index) => (
          <motion.span
            key={`${word}-${index}`}
            aria-hidden="true"
            initial={reducedMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reducedMotion ? 0 : 0.68,
              delay: reducedMotion ? 0 : 0.08 + index * 0.075,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {word}
          </motion.span>
        ))}
      </h1>

      <figure className={styles.media} data-image-ready={imageReady}>
        <div className={styles.imageFrame}>
          <Image loader={pageImageLoader}
            src={get("image", "/assets/projects/real-v1/lakewood-08.webp")}
            alt={get("alt", "Lakewood hospitality buildings reflected in water at dusk")}
            fill
            priority
            sizes="(max-width: 720px) 100vw, 92vw"
            onLoad={() => setImageReady(true)}
            onError={() => setImageReady(true)}
          />
          <span className={styles.shade} aria-hidden="true" />
        </div>
        {!reducedMotion && (
          <motion.span
            className={styles.revealCurtain}
            aria-hidden="true"
            initial={{ y: "0%" }}
            animate={imageReady ? { y: "-101%" } : { y: "0%" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          />
        )}
        <motion.figcaption
          className={styles.caption}
          initial={{ opacity: 0, y: 16 }}
          animate={imageReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: reducedMotion ? 0.2 : 0.55, delay: reducedMotion ? 0 : 0.42, ease: [0.16, 1, 0.3, 1] }}
        >
          <p>{get("caption", "One architectural language, coordinated across every residence and shared space.")}</p>
          <MagneticLink href={localDestination(get("action-href", enquiryHref), enquiryHref)} className={styles.cta} data-magnetic>
            {get("action", "Begin a project")} <span aria-hidden="true">↗</span>
          </MagneticLink>
        </motion.figcaption>
      </figure>
    </section>
  );
}
