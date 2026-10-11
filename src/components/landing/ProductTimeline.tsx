"use client";

import Image from "next/image";
import { SubtleLink } from "@/components/ui/SubtleAction";
import { motion, type MotionValue, useReducedMotion, useScroll, useTransform, useMotionValue, useMotionValueEvent } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useSiteContentMap } from "@/lib/useSiteContent";
import { localDestination } from "@/lib/localDestination";
import styles from "./ProductTimeline.module.css";

// 21st.dev Product Timeline, ID 26930 (Hyperiux Vault).
// Retains its horizontal storyline, alternating stems, line draw and masked
// milestone reveals. Motion replaces GSAP; mobile is an ordered vertical list.
const stages = [
  {
    days: "Days 01–10",
    title: "Client brief and site",
    copy: "The site and the brief are understood together before a model is selected or a custom design begins.",
  },
  {
    days: "Days 11–25",
    title: "Design and approvals",
    copy: "Design development, approvals, engineering and material planning are completed before manufacturing.",
  },
  {
    days: "Days 26–60",
    title: "Factory manufacturing",
    copy: "The approved home moves through factory manufacturing and quality inspection.",
  },
  {
    days: "Days 61–72",
    title: "Packing and transportation",
    copy: "The completed parts are packed and transported for assembly.",
  },
  {
    days: "Days 73–90",
    title: "Assembly and handover",
    copy: "Site assembly, interior completion and final handover close the process.",
  },
] as const;

function Milestone({ index, progress, animated, naturalReveal, content }: {
  index: number;
  progress: MotionValue<number>;
  animated: boolean;
  naturalReveal: boolean;
  content: Record<string, string>;
}) {
  const item = stages[index];
  const value = (name: "days" | "title" | "copy") => content[`home.timeline.stage-${index + 1}.${name}`] ?? item[name];
  // Match the retrieved Product Timeline: each stem and copy rises once as it
  // reaches the reading area, then remains visible. Overlapping windows let
  // the completed and current stages coexist as the track moves.
  const entryStart = 0.07 + index * 0.15;
  const entryEnd = entryStart + 0.1;
  const stemScale = useTransform(progress, [entryStart, entryEnd], [0, 1]);
  const copyY = useTransform(progress, [entryStart, entryEnd], ["32px", "0px"]);
  const copyOpacity = useTransform(progress, [entryStart, entryEnd], [0, 1]);

  return (
    <li className={`${styles.milestone} ${index % 2 === 0 ? styles.above : styles.below}`}>
      <motion.span aria-hidden="true" className={styles.stem} style={{ scaleY: animated ? stemScale : 1 }} />
      <motion.span aria-hidden="true" className={styles.dot} style={{ scale: animated ? stemScale : 1 }} />
      <motion.div
        className={styles.copy}
        initial={naturalReveal ? { y: 28, opacity: 0 } : false}
        whileInView={naturalReveal ? { y: 0, opacity: 1 } : undefined}
        viewport={{ once: true, amount: .5 }}
        transition={{ duration: .62, ease: [0.22, 1, 0.36, 1] }}
        style={animated ? { y: copyY, opacity: copyOpacity } : undefined}
      >
        <div className={styles.mask}>
          <span className={styles.number}>
            {value("days")}
          </span>
        </div>
        <div className={styles.mask}>
          <h3>{value("title")}</h3>
        </div>
        <p>{value("copy")}</p>
      </motion.div>
    </li>
  );
}

export default function ProductTimeline() {
  const content = useSiteContentMap();
  const value = (id: string, fallback: string) => content[id] ?? fallback;
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const [travel, setTravel] = useState(0);
  const [desktop, setDesktop] = useState(false);
  const animated = desktop && !reducedMotion;
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  // Keep a single JS MotionValue for the measured horizontal track and its
  // staged reveals. Native scroll timeline remapping can fade already-entered
  // paragraphs again when each stage has a different input interval.
  const progress = useMotionValue(0);
  useMotionValueEvent(scrollYProgress, "change", value => progress.set(value));
  const x = useTransform(progress, [0, 1], [0, -travel]);
  const lineScale = useTransform(progress, [0, 0.95], [0.08, 1]);
  const mediaScale = useTransform(progress, [0, 0.22, 1], [1.025, 1, 0.965]);
  const mediaY = useTransform(progress, [0, 1], [0, -18]);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;
    const query = window.matchMedia("(min-width: 1000px) and (min-height: 650px)");
    const measure = () => {
      setDesktop(query.matches);
      setTravel(Math.max(0, track.scrollWidth - viewport.clientWidth));
    };
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(track);
    query.addEventListener("change", measure);
    measure();
    return () => {
      observer.disconnect();
      query.removeEventListener("change", measure);
    };
  }, []);

  return (
    <section
      id="process"
      ref={sectionRef}
      className={styles.section}
      aria-labelledby="landing-process-title"
      data-pinned={animated || undefined}
      style={animated ? { height: `calc(100svh + ${travel}px)` } : undefined}
    >
      <div className={styles.viewport} ref={viewportRef}>
        <div className={styles.composition}>
          <div className={styles.heading}><h2 id="landing-process-title" className={styles.title} data-landing-heading>{value("home.timeline.heading-start", "A home in")} <em>{value("home.timeline.heading-emphasis", "90 days.")}</em></h2><SubtleLink href={localDestination(value("home.timeline.action-href", "/process"), "/process")} className={styles.processLink}>{value("home.timeline.action", "See the process")}</SubtleLink></div>
          <motion.div className={styles.track} ref={trackRef} style={{ x: animated ? x : 0 }}>
            <motion.div className={styles.image} style={{ scale: animated ? mediaScale : 1, y: animated ? mediaY : 0 }}>
              <Image
                src={value("home.timeline.image", "/assets/projects/real-v1/kioo-03.webp")}
                alt={value("home.timeline.image-alt", "A completed OKNO Kioo home surrounded by mature forest")}
                fill
                sizes="(min-width: 1000px) 38vw, (min-width: 600px) 45vw, 90vw"
                quality={90}
              />
              <span className={styles.mediaLabel}>{value("home.timeline.image-caption", "Day 90 · Ready for handover")}</span>
            </motion.div>
            <div className={styles.storyline}>
              <div aria-hidden="true" className={styles.axis}>
                <motion.span className={styles.activeAxis} style={{ scaleX: animated ? lineScale : 1 }} />
              </div>
              <ol className={styles.stages}>
                {stages.map((stage, index) => (
                  <Milestone key={stage.title} index={index} progress={progress} animated={animated} naturalReveal={!desktop && !reducedMotion} content={content} />
                ))}
              </ol>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
