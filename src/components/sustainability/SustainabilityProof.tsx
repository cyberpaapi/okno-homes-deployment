"use client";

import Image from "next/image";
import { previewImageLoader } from "@/lib/thumbnailImageLoader";
import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "motion/react";
import styles from "./SustainabilityProof.module.css";
import { useSiteContentMap } from "@/lib/useSiteContent";
import { useMediaQuery } from "@/lib/useMediaQuery";

type PressItem = {
  index?: number;
  source: string;
  date: string;
  title: string;
  image: string;
  alt: string;
  imageRange: [number, number];
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
    imageRange: [0, 0.01],
  },
  {
    source: "New Atlas",
    date: "26 JUN 2024",
    title: "A mirrored tiny house with a bed that slides under the stars.",
    image: "/sustainability/reflections-deck-bed-detail.jpg",
    alt: "Motorized bed extended onto the Reflections forest deck",
    imageRange: [0.27, 0.33],
  },
  {
    source: "HomeCrux",
    date: "03 JUL 2024",
    title: "A modular holiday home blurring indoor and outdoor.",
    image: "/sustainability/reflections-bedroom.jpg",
    alt: "Wood-lined Reflections bedroom opening toward the forest",
    imageRange: [0.43, 0.49],
  },
  {
    source: "Architecture+Design",
    date: "09 JUL 2024",
    title: "A home among the trees, where nature and the built meld as one.",
    image: "/sustainability/reflections-mirrored-deck.jpg",
    alt: "Mirrored glass facade and deck of the Reflections cabin among trees",
    imageRange: [0.59, 0.65],
  },
];

const projectFacts: ProjectFact[] = [
  { value: "300 sq ft", label: "A compact forest cabin in Chikmagalur, Karnataka." },
  { value: "Prefabricated", label: "A modular home designed for a remote forest site." },
  { value: "Aluminium composite", label: "A custom exterior envelope around the structure." },
  { value: "Motorized deck bed", label: "A king-size bed that extends outdoors." },
];

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const finalImageRange = [0.71, 0.77];
// Complete the opening before the photograph and reading panel enter.
const openingExit = 0.055;

function activePressAt(progress: number, phone: boolean) {
  if (progress >= (phone ? finalImageRange[1] : 0.85)) return -1;
  // Switch the reading panel when the incoming photograph becomes dominant.
  return pressItems.reduce((active, item, index) =>
    progress >= (item.imageRange[0] + item.imageRange[1]) / 2 ? index : active, 0);
}

function PressImage({ item, progress }: { item: PressItem; progress: MotionValue<number> }) {
  // Each photograph covers the previous one, which stays opaque underneath.
  // Independent fade-outs exposed the black stage between photographs.
  const opacity = useTransform(progress, item.imageRange, item.index === 0 ? [1, 1] : [0, 1]);

  return (
    <motion.div className={styles.imageLayer} data-press-image={(item.index ?? 0) + 1} style={{ opacity }}>
      <Image loader={previewImageLoader} src={item.image} alt={item.alt} fill sizes="(max-width: 1100px) 100vw, 62vw" quality={60} />
    </motion.div>
  );
}

function PressCitation({
  item,
  active,
  progress,
  phone,
  reducedMotion,
}: {
  item: PressItem;
  active: boolean;
  progress: MotionValue<number>;
  phone: boolean;
  reducedMotion: boolean;
}) {
  // Restore the supplied release's cumulative citation reveal. Cards remain
  // readable on phones; their lift and tint follow the photograph's own phase.
  const enter = item.index === 0 ? 0.08 : item.imageRange[0];
  const opacity = useTransform(progress, [enter, enter + 0.055], phone ? [0.6, 1] : [0, 1]);
  const y = useTransform(progress, [enter, enter + 0.055], reducedMotion ? [0, 0] : [phone ? 10 : 14, 0]);
  const scale = useTransform(progress, [enter, enter + 0.055], phone && !reducedMotion ? [0.97, 1] : [1, 1]);

  return (
    <motion.article className={styles.pressCitation} data-type-section={`sustainability.press-${(item.index ?? 0) + 1}`} data-active={active} aria-current={active ? "true" : undefined} style={{ opacity, y, scale }}>
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
  const phone = useMediaQuery("(max-width: 700px)");
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
  const sceneRef = useRef<HTMLDivElement>(null);
  const [activePress, setActivePress] = useState(0);
  const reducedMotion = Boolean(useReducedMotion());
  const scrollYProgress = useMotionValue(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let frame = 0;
    const update = () => {
      const rect = track.getBoundingClientRect();
      const distance = Math.max(track.offsetHeight - (sceneRef.current?.offsetHeight ?? window.innerHeight), 1);
      // Phone facts follow in normal flow, so finish the photo sequence at
      // the end of this track rather than reserving a pinned paper viewport.
      const progress = clamp(-rect.top / distance) * (phone ? finalImageRange[1] : 1);
      scrollYProgress.set(progress);
      setActivePress(current => {
        const next = activePressAt(progress, phone);
        return current === next ? current : next;
      });
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
  }, [scrollYProgress, phone]);

  const openingOpacity = useTransform(
    scrollYProgress,
    [0, 0.02, openingExit],
    [1, 1, 0],
  );
  const openingY = useTransform(
    scrollYProgress,
    [0, openingExit],
    [0, 0],
  );
  const proofOpacity = useTransform(scrollYProgress, [openingExit, 0.1], [0, 1]);
  const pressOpacity = useTransform(
    scrollYProgress,
    // Keep the accumulated coverage visible until the white sheet replaces it.
    // The final bath photograph must not become an isolated, uncaptioned hold.
    [0, 0.75, 0.85],
    [1, 1, phone ? 1 : 0],
  );
  const sheetY = useTransform(
    scrollYProgress,
    [0.75, 0.85],
    reducedMotion ? ["0%", "0%"] : ["100%", "0%"],
  );
  const sheetOpacity = useTransform(
    scrollYProgress,
    reducedMotion ? [0.75, 0.76] : [0, 1],
    reducedMotion ? [0, 1] : [1, 1],
  );
  const sheetContentOpacity = useTransform(scrollYProgress, [0.78, 0.86], [0, 1]);
  const sheetContentY = useTransform(
    scrollYProgress,
    [0.78, 0.86],
    reducedMotion ? [0, 0] : [28, 0],
  );
  const finalImageOpacity = useTransform(scrollYProgress, finalImageRange, [0, 1]);

  const details = (
    <motion.section className={styles.detailsSheet} data-type-section="sustainability.facts-intro" style={phone ? undefined : { y: sheetY, opacity: sheetOpacity }} aria-labelledby="reflections-details-title">
          <motion.div className={styles.detailsInner} style={phone ? undefined : { opacity: sheetContentOpacity, y: sheetContentY }}>
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
  );

  return (
    <>
    <section ref={trackRef} className={styles.track} data-type-section="sustainability.proof" data-active-press={activePress < 0 ? "closing" : activePress + 1} aria-labelledby="press-proof-heading">
      <div ref={sceneRef} className={styles.stickyScene}>
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
                <Image loader={previewImageLoader}
                  src={get("final-image", "/sustainability/reflections-forest-bath.jpg")}
                  alt={get("final-alt", "Forest-facing deck and outdoor bath at the Reflections cabin")}
                  fill
                  sizes="(max-width: 1100px) 100vw, 62vw"
                  quality={60}
                />
              </motion.div>
            </div>
          </figure>

          <aside className={styles.proofSidebar}>
            <motion.div className={styles.pressStage} style={{ opacity: pressOpacity }}>
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
                    active={index === activePress}
                    progress={scrollYProgress}
                    phone={phone}
                    reducedMotion={reducedMotion}
                  />
                ))}
              </div>
            </motion.div>

          </aside>
        </motion.div>

        {!phone && details}

      </div>
    </section>
    {phone && details}
    </>
  );
}
