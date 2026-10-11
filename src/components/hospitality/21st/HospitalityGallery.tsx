"use client";

import Image from "next/image";
import { pageImageLoader } from "@/lib/pageImageLoader";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./HospitalityGallery.module.css";
import type { SelectedHospitalityProject } from '@/data/hospitalitySelectedWork';

export type HospitalityProject = SelectedHospitalityProject;

function Arrow({ direction = "next" }: { direction?: "next" | "previous" | "open" }) {
  const previous = direction === "previous";
  const open = direction === "open";

  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path
        d={open ? "M5 15 15 5M8 5h7v7" : previous ? "M16 10H4m0 0 5-5m-5 5 5 5" : "M4 10h12m0 0-5-5m5 5-5 5"}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function HospitalityGallery({ projects }: { projects: HospitalityProject[] }) {
  const root = useRef<HTMLElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: root, offset: ["start end", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 82, damping: 24, mass: 0.34 });
  const rotateX = useTransform(progress, [0, 0.42], [18, 0]);
  const scale = useTransform(progress, [0, 0.42], [0.97, 1]);
  const middleY = useTransform(progress, [0, 1], [72, -56]);
  const selected = selectedId === null ? -1 : projects.findIndex(project => project.id === selectedId);
  const selectedProject = selected < 0 ? null : projects[selected];
  const viewerOpen = selectedProject !== null;

  const step = useCallback((delta: number) => {
    setSelectedId((current) => {
      if (current === null || !projects.length) return null;
      const index = projects.findIndex(project => project.id === current);
      return projects[((Math.max(0, index) + delta + projects.length) % projects.length)].id;
    });
  }, [projects]);

  useEffect(() => {
    if (!viewerOpen) return;
    const previousOverflow = document.body.style.overflow;
    const returnFocus = opener.current;
    const viewer = document.querySelector<HTMLElement>("[data-hospitality-viewer]");
    const backgroundNodes = Array.from(document.body.children).filter((node): node is HTMLElement => (
      node instanceof HTMLElement && node !== viewer && !node.contains(viewer)
    ));
    const previousInert = backgroundNodes.map((node) => [node, node.inert] as const);

    document.body.style.overflow = "hidden";
    backgroundNodes.forEach((node) => { node.inert = true; });
    const frame = requestAnimationFrame(() => {
      dialog.current?.querySelector<HTMLButtonElement>("button")?.focus();
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedId(null);
      if (event.key === "ArrowLeft") step(-1);
      if (event.key === "ArrowRight") step(1);
      if (event.key === "Tab" && dialog.current) {
        const focusable = Array.from(dialog.current.querySelectorAll<HTMLElement>(
          "button:not([disabled]), a[href], [tabindex]:not([tabindex='-1'])",
        )).filter((node) => !node.hasAttribute("hidden"));
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!first || !last) return;
        if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      previousInert.forEach(([node, inert]) => { node.inert = inert; });
      window.removeEventListener("keydown", onKeyDown);
      returnFocus?.focus({ preventScroll: true });
    };
  }, [step, viewerOpen]);

  const viewer = typeof document !== "undefined" ? createPortal(
    <AnimatePresence>
      {selectedProject ? (
        <motion.div
          className={styles.backdrop}
          data-hospitality-viewer
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.28 }}
          onClick={() => setSelectedId(null)}
        >
          <div ref={dialog} className={styles.dialog} role="dialog" aria-modal="true" aria-label={`${selectedProject.name} photograph`} tabIndex={-1}>
            <motion.figure
              className={styles.frame}
              initial={reducedMotion ? false : { opacity: 0, y: 18, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.992 }}
              transition={{ duration: reducedMotion ? 0 : 0.46, ease: [0.16, 1, 0.3, 1] }}
              onClick={(event) => event.stopPropagation()}
            >
              <Image loader={pageImageLoader} src={selectedProject.image} alt={selectedProject.alt} fill sizes="94vw" priority />
              <figcaption>{selectedProject.name}</figcaption>
            </motion.figure>
            <button className={styles.close} type="button" onClick={() => setSelectedId(null)} aria-label="Close photograph">Close</button>
            <div className={styles.navigation} onClick={(event) => event.stopPropagation()}>
              {projects.length > 1 && <button type="button" onClick={() => step(-1)} aria-label="Previous project"><Arrow direction="previous" /></button>}
              <span>{String(selected + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}</span>
              {projects.length > 1 && <button type="button" onClick={() => step(1)} aria-label="Next project"><Arrow /></button>}
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  ) : null;

  return (
    <>
      <section ref={root} className={styles.gallery} aria-label="Hospitality project photography">
        <motion.div
          className={styles.grid}
          data-count={Math.min(projects.length, 3)}
          style={{ rotateX: reducedMotion ? 0 : rotateX, scale: reducedMotion ? 1 : scale }}
        >
          {Array.from({ length: Math.min(projects.length, 3) }, (_, column) => (
            <motion.div
              className={styles.column}
              key={column}
              style={{ y: reducedMotion || column !== 1 ? 0 : middleY }}
            >
              {projects.filter((_, index) => index % 3 === column).map((project) => {
                return (
                  <motion.button
                    type="button"
                    className={styles.card}
                    key={project.id}
                    onClick={(event) => { opener.current = event.currentTarget; setSelectedId(project.id); }}
                    whileHover={reducedMotion ? undefined : { y: -4 }}
                    transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                    aria-label={`View ${project.name} photography`}
                    data-magnetic-ignore
                  >
                    <span className={styles.image}>
                      <Image loader={pageImageLoader} src={project.image} alt={project.alt} fill sizes="(max-width: 560px) 92vw, (max-width: 760px) 46vw, 30vw" />
                    </span>
                    <span className={styles.shade} aria-hidden="true" />
                    <span className={styles.name}>{project.name}</span>
                    <span className={styles.open} data-magnetic aria-hidden="true"><Arrow direction="open" /></span>
                  </motion.button>
                );
              })}
            </motion.div>
          ))}
        </motion.div>
      </section>
      {viewer}
    </>
  );
}
