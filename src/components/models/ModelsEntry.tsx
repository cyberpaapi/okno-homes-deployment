"use client";

import { useEffect, useRef, useState } from "react";
import ModelPathPanels from "./ModelPathPanels";
import ModelsEntrance from "./ModelsEntrance";
import ModelsHeader from "./ModelsHeader";
import { MotionConfig, motion, useReducedMotion } from "motion/react";
import styles from "./ModelsEntry.module.css";
import { useSiteContent } from "@/lib/useSiteContent";

export default function ModelsEntry() {
  const titleStart = useSiteContent("models.selector.heading-start", "Two ways");
  const titleEnd = useSiteContent("models.selector.heading-end", "to begin.");
  const intro = useSiteContent("models.selector.intro", "A collection, or one of one.");
  const prefersReducedMotion = useReducedMotion();
  const [mediaReady, setMediaReady] = useState(false);
  const pageRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;
    let frame = 0;
    const syncBackground = () => {
      window.cancelAnimationFrame(frame);
      if (document.hidden) {
        page.dataset.animationState = "paused";
        return;
      }
      page.dataset.animationState = "reset";
      frame = window.requestAnimationFrame(() => { page.dataset.animationState = "running"; });
    };
    syncBackground();
    document.addEventListener("visibilitychange", syncBackground);
    window.addEventListener("pageshow", syncBackground);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", syncBackground);
      window.removeEventListener("pageshow", syncBackground);
    };
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <ModelsEntrance ready={mediaReady} />
      <main ref={pageRef} className={styles.page} data-route="models">
        <ModelsHeader />
        <section className={styles.introduction} data-type-section="models.selector">
          <motion.h1
            initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .75, ease: [.22, 1, .36, 1] }}
          >
            {titleStart} <span data-type-highlight data-type-field={"models.selector.heading-end"}>{titleEnd}</span>
          </motion.h1>
          <motion.p
            className={styles.introCopy}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
           data-type-field={"models.selector.intro"}>
            {intro}
          </motion.p>
        </section>
        <ModelPathPanels onReady={() => setMediaReady(true)} />
      </main>
    </MotionConfig>
  );
}
