"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "motion/react";
import styles from "./SustainabilityProof.module.css";
import { useSiteContentMap } from "@/lib/useSiteContent";

type PressItem = {
  index?: number;
  source: string;
  date: string;
  title: string;
  image: string;
  alt: string;
  enter: number;
  imageRange: [number, number, number, number];
};

type ProjectFact = {
  value: string;
  label: string;
};

const pressItems: PressItem[] = [
  {
    source: "Architectural Digest",
    date: "10 JUN 2024",
    title: "A 300-square-foot holiday home that is one with nature.",
    image: "/sustainability/reflections-forest-exterior.jpg",
    alt: "Reflections cabin elevated among dense forest trees",
    enter: 0.2,
    imageRange: [0.1, 0.17, 0.25, 0.31],
  },
  {
    source: "New Atlas",
    date: "26 JUN 2024",
    title: "A mirrored tiny house with a bed that slides under the stars.",
    image: "/sustainability/reflections-deck-bed-detail.jpg",
    alt: "Motorized bed extended onto the Reflections forest deck",
    enter: 0.36,
    imageRange: [0.27, 0.33, 0.41, 0.47],
  },
  {
    source: "HomeCrux",
    date: "03 JUL 2024",
    title: "A modular holiday home blurring indoor and outdoor.",
    image: "/sustainability/reflections-bedroom.jpg",
    alt: "Wood-lined Reflections bedroom opening toward the forest",
    enter: 0.52,
    imageRange: [0.43, 0.49, 0.57, 0.63],
  },
  {
    source: "Architecture+Design",
    date: "09 JUL 2024",
    title: "A home among the trees, where nature and the built meld as one.",
    image: "/sustainability/reflections-mirrored-deck.jpg",
    alt: "Mirrored glass facade and deck of the Reflections cabin among trees",
    enter: 0.68,
    imageRange: [0.59, 0.65, 0.74, 0.8],
  },
];

const projectFacts: ProjectFact[] = [
  { value: "300 sq ft", label: "A compact forest cabin in Chikmagalur, Karnataka." },
  { value: "Prefabricated", label: "A modular home designed for a remote forest site." },
  { value: "Aluminium composite", label: "A custom exterior envelope around the structure." },
  { value: "Motorized deck bed", label: "A king-size bed that extends outdoors." },
];

const clamp = (value: number) => Math.min(1, Math.max(0, value));

function PressImage({ item, progress }: { item: PressItem; progress: MotionValue<number> }) {
  const opacity = useTransform(progress, item.imageRange, [0, 1, 1, 0]);

  return (
    <motion.div className={styles.imageLayer} style={{ opacity }}>
      <Image src={item.image} alt={item.alt} fill sizes="(max-width: 820px) 100vw, 62vw" quality={90} />
    </motion.div>
  );
}

function PressCitation({
  item,
  progress,
  reducedMotion,
}: {
  item: PressItem;
  progress: MotionValue<number>;
  reducedMotion: boolean;
}) {
  const opacity = useTransform(progress, [item.enter, item.enter + 0.045], [0, 1]);
  const y = useTransform(
    progress,
    [item.enter, item.enter + 0.055],
    reducedMotion ? [0, 0] : [14, 0],
  );

  return (
    <motion.article className={styles.pressCitation} data-type-section={`sustainability.press-${(item.index ?? 0) + 1}`} style={{ opacity, y }}>
      <div className={styles.citationMeta}>
        <strong>{item.source}</strong>
        <time>{item.date}</time>
      </div>
      <h4>{item.title}</h4>
    </motion.article>
  );
}

export default function SustainabilityProof() {
  const values = useSiteContentMap();
  const get = (key: string, fallback: string) => values[`sustainability.proof.${key}`] ?? fallback;
  const currentPress = pressItems.map((item, index) => ({
    index,
    ...item,
    source: get(`press-${index + 1}.source`, item.source),
    date: get(`press-${index + 1}.date`, item.date),
    title: get(`press-${index + 1}.title`, item.title),
    image: get(`press-${index + 1}.image`, item.image),
    alt: get(`press-${index + 1}.alt`, item.alt),
  }));
  const currentFacts = projectFacts.map((item, index) => ({
    ...item,
    value: get(`fact-${index + 1}.value`, item.value),
    label: get(`fact-${index + 1}.label`, item.label),
  }));
  const trackRef = useRef<HTMLElement>(null);
  const reducedMotion = Boolean(useReducedMotion());
  const scrollYProgress = useMotionValue(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let frame = 0;
    const update = () => {
      const rect = track.getBoundingClientRect();
      const distance = Math.max(track.offsetHeight - window.innerHeight, 1);
      scrollYProgress.set(clamp(-rect.top / distance));
      frame = 0;
    };
    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [scrollYProgress]);

  const openingOpacity = useTransform(
    scrollYProgress,
    [0, 0.035, 0.11, 0.17],
    [0, 1, 1, 0],
  );
  const openingY = useTransform(
    scrollYProgress,
    [0, 0.17],
    reducedMotion ? [0, 0] : [22, -28],
  );
  const proofOpacity = useTransform(scrollYProgress, [0.15, 0.22], [0, 1]);
  const pressOpacity = useTransform(
    scrollYProgress,
    [0.14, 0.2, 0.78, 0.84],
    [0, 1, 1, 0],
  );
  const pressY = useTransform(
    scrollYProgress,
    [0.14, 0.21, 0.78, 0.84],
    reducedMotion ? [0, 0, 0, 0] : [22, 0, 0, -18],
  );
  const sheetY = useTransform(
    scrollYProgress,
    [0.82, 0.9],
    reducedMotion ? ["0%", "0%"] : ["100%", "0%"],
  );
  const sheetOpacity = useTransform(
    scrollYProgress,
    reducedMotion ? [0.84, 0.85] : [0, 1],
    reducedMotion ? [0, 1] : [1, 1],
  );
  const sheetContentOpacity = useTransform(scrollYProgress, [0.86, 0.93], [0, 1]);
  const sheetContentY = useTransform(
    scrollYProgress,
    [0.86, 0.93],
    reducedMotion ? [0, 0] : [28, 0],
  );
  const finalImageOpacity = useTransform(scrollYProgress, [0.75, 0.82], [0, 1]);

  return (
    <section ref={trackRef} className={styles.track} data-type-section="sustainability.proof" aria-labelledby="press-proof-heading">
      <div className={styles.stickyScene}>
        <div className={styles.blackField} aria-hidden="true" />

        <motion.div className={styles.opening} style={{ opacity: openingOpacity, y: openingY }}>
          <h2 id="press-proof-heading" data-type-field={"sustainability.proof.opening-line-1"}>
            {get("opening-line-1", "The land leads.")}<br />
            {get("opening-line-2", "The home ")}<span data-type-highlight data-type-field={"sustainability.proof.opening-emphasis"}>{get("opening-emphasis", "follows.")}</span>
          </h2>
        </motion.div>

        <motion.div className={styles.proofLayout} style={{ opacity: proofOpacity }}>
          <figure className={styles.featureFrame}>
            <div className={styles.imageStack}>
              {currentPress.map((item, index) => (
                <PressImage key={index} item={item} progress={scrollYProgress} />
              ))}
              <motion.div
                className={`${styles.imageLayer} ${styles.finalImage}`}
                style={{ opacity: finalImageOpacity }}
              >
                <Image
                  src={get("final-image", "/sustainability/reflections-forest-bath.jpg")}
                  alt={get("final-alt", "Forest-facing deck and outdoor bath at the Reflections cabin")}
                  fill
                  sizes="(max-width: 820px) 100vw, 62vw"
                  quality={90}
                />
              </motion.div>
              <span className={styles.photoCredit} data-type-field={"sustainability.proof.final-credit"}>{get("final-credit", "Photography · Inclined Studio")}</span>
            </div>
          </figure>

          <aside className={styles.proofSidebar}>
            <motion.div className={styles.pressStage} style={{ opacity: pressOpacity, y: pressY }}>
              <div className={styles.sideCopy}>
                <h3 data-type-field={"sustainability.proof.press-heading"}>{get("press-heading", "Reflections travelled beyond the forest.")}</h3>
                <p>{get("model-note", "Reflections, built on our Kioo model.")}</p>
                <p data-type-field={"sustainability.proof.press-copy"}>{get("press-copy", "Four publications found different stories in the same compact home.")}</p>
              </div>

              <div className={styles.pressRail} aria-label="Press coverage">
                {currentPress.map((item, index) => (
                  <PressCitation
                    key={index}
                    item={item}
                    progress={scrollYProgress}
                    reducedMotion={reducedMotion}
                  />
                ))}
              </div>
            </motion.div>

          </aside>
        </motion.div>

        <motion.section className={styles.detailsSheet} data-type-section="sustainability.facts-intro" style={{ y: sheetY, opacity: sheetOpacity }} aria-labelledby="reflections-details-title">
          <motion.div className={styles.detailsInner} style={{ opacity: sheetContentOpacity, y: sheetContentY }}>
            <h3 id="reflections-details-title" data-type-field={"sustainability.proof.facts-heading"}>{get("facts-heading", "What the coverage points back to.")}</h3>
            <ul className={styles.factGrid}>
              {currentFacts.map((item, index) => (
                <li key={index} data-type-section={`sustainability.fact-${index + 1}`}>
                  <i aria-hidden="true" />
                  <span><strong>{item.value}</strong><small>{item.label}</small></span>
                </li>
              ))}
            </ul>
            <p className={styles.closingLine} data-type-field={"sustainability.proof.facts-close"}>{get("facts-close", "A compact home can still make a large architectural argument.")}</p>
          </motion.div>
        </motion.section>
      </div>
    </section>
  );
}
