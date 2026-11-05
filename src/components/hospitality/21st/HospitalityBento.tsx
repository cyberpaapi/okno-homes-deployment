"use client";

// Content adaptation of kinfe123's bookmarked 21st.dev Bento, component 6541.
// The original two-large / three-small six-column geometry is retained.
import Image from "next/image";
import { previewImageLoader } from "@/lib/thumbnailImageLoader";
import { useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useSiteContentMap } from "@/lib/useSiteContent";
import styles from "./HospitalityBento.module.css";

const cards = [
  { eyebrow: "Estate scale", value: "5+", title: "Residences, one coordinated brief.", image: "/assets/projects/real-v1/octapod-layana-01.webp", className: styles.wide },
  { eyebrow: "Time to revenue", value: "Parallel", title: "Built off-site while your land is prepared, so you open sooner.", image: "/assets/projects/real-v1/forrest-01.webp", className: styles.wide },
  { eyebrow: "Site", value: "Studied", title: "Terrain, access, utilities and resilience resolved first.", image: "/assets/projects/real-v1/lakewood-01.webp", className: styles.third },
  { eyebrow: "Finish", value: "Two", title: "Delivered guest-ready, Operational.", image: "/assets/projects/real-v1/kioo-01.webp", className: styles.third },
  { eyebrow: "Aftercare", value: "Ongoing", title: "Warranty, handover and long-term care.", image: "/assets/projects/real-v1/rasa-vikarabad-01.webp", className: styles.third },
] as const;

type BentoCardContent = { eyebrow: string; value: string; title: string; image: string; alt: string; className: string };

function BentoCard({ card, index }: { card: BentoCardContent; index: number }) {
  const cardRef = useRef<HTMLElement>(null);
  const inView = useInView(cardRef, { once: true, amount: 0.12 });
  const reducedMotion = useReducedMotion();
  const [imageReady, setImageReady] = useState(false);

  return (
    <motion.article
      ref={cardRef}
      className={`${styles.card} ${card.className}`}
      data-image-ready={imageReady}
      initial={reducedMotion ? false : { opacity: 0.72, y: 18 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0.72, y: 18 }}
      transition={{
        duration: reducedMotion ? 0 : 0.58,
        delay: reducedMotion ? 0 : (index < 2 ? index : index - 2) * 0.06,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <div className={styles.media}>
        <Image loader={previewImageLoader}
          src={card.image}
          alt={card.alt}
          fill
          sizes="(max-width: 620px) 100vw, (max-width: 1000px) 50vw, 33vw"
          onLoad={() => setImageReady(true)}
          onError={() => setImageReady(true)}
        />
      </div>
      <div className={styles.fade} aria-hidden="true" />
      <div className={styles.copy}>
        <p>{card.eyebrow}</p>
        <strong data-figure={/^\d/.test(card.value.trim())}>{card.value}</strong>
        <h3>{card.title}</h3>
      </div>
    </motion.article>
  );
}

export function HospitalityBento() {
  const values = useSiteContentMap();
  const currentCards = cards.map((card, index) => {
    const get = (field: "eyebrow" | "value" | "title" | "image", fallback = card[field]) => values[`hospitality.bento.${index + 1}.${field}`] ?? fallback;
    return { ...card, eyebrow: get("eyebrow"), value: get("value"), title: get("title"), image: get("image"), alt: values[`hospitality.bento.${index + 1}.alt`] ?? "" };
  });
  return <div className={styles.grid}>{currentCards.map((card, index) => <BentoCard key={index} card={card} index={index} />)}</div>;
}
