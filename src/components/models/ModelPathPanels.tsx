"use client";

// The split selector adapts Hover Expand by educalvolpz (21st.dev 28111),
// Reveal Text by isaiahBjork (2491), and the route handoff combines the
// Preloader (13967) with Morph Loading by jatin-yadav05 (4588).
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import styles from "./ModelPathPanels.module.css";
import { useSiteContentMap } from "@/lib/useSiteContent";

const paths = [
  {
    id: "signature",
    title: "Signature",
    label: "Enter the Signature Collection",
    image: "/models/selector/signature-blue-hour-v1.webp",
    alt: "Concept visualization of a compact timber and glass Signature home beside still water at blue hour",
    description: "Considered models, composed for your land.",
    action: "View Signature",
    mode: "Dark luxury",
  },
  {
    id: "bespoke",
    title: "Bespoke",
    label: "Begin a Bespoke home",
    image: "/models/bespoke/bespoke-pearl-exterior-v1.webp",
    alt: "Concept visualization of a luminous site-specific limestone and oak Bespoke residence",
    description: "One site. One brief. One original home.",
    action: "Begin Bespoke",
    mode: "Light luxury",
  },
] as const;

function RevealTitle({ children, delay }: { children: string; delay: number }) {
  const reduce = useReducedMotion();
  return (
    <span className={styles.titleClip} aria-label={children}>
      <motion.span aria-hidden="true" initial={reduce ? false : { y: "105%" }} animate={{ y: 0 }} transition={{ duration: reduce ? 0 : .78, delay, ease: [.22, 1, .36, 1] }}>
        {children}
      </motion.span>
    </span>
  );
}

export default function ModelPathPanels({ onReady }: { onReady?: () => void }) {
  const content = useSiteContentMap();
  const get = (id: string, fallback: string) => content[`models.selector.${id}`] ?? fallback;
  const currentPaths = paths.map(path => ({
    ...path,
    title: get(`${path.id}.title`, path.title),
    label: get(`${path.id}.label`, path.label),
    image: get(`${path.id}.image`, path.image),
    alt: get(`${path.id}.alt`, path.alt),
    description: get(`${path.id}.description`, path.description),
    action: get(`${path.id}.action`, path.action),
    mode: get(`${path.id}.mode`, path.mode),
  }));
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [leavingFor, setLeavingFor] = useState<(typeof paths)[number]["id"] | null>(null);
  const panelRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const loadedImages = useRef(new Set<string>());
  const navigationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (navigationTimer.current) clearTimeout(navigationTimer.current); }, []);

  const markLoaded = (id: string) => {
    loadedImages.current.add(id);
    if (loadedImages.current.size === paths.length) onReady?.();
  };

  const beginTransition = (event: React.MouseEvent<HTMLAnchorElement>, id: (typeof paths)[number]["id"]) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const destination = `/models/${id}`;
    try { sessionStorage.setItem("okno-model-destination", id); } catch {}
    document.documentElement.setAttribute("data-model-transition", id);
    if (reduceMotion) {
      router.push(destination);
      return;
    }
    setLeavingFor(id);
    navigationTimer.current = setTimeout(() => router.push(destination), 680);
  };

  function handleKeyDown(event: KeyboardEvent<HTMLAnchorElement>, index: number) {
    const direction = ["ArrowRight", "ArrowDown"].includes(event.key) ? 1 : ["ArrowLeft", "ArrowUp"].includes(event.key) ? -1 : 0;
    if (!direction) return;
    event.preventDefault();
    panelRefs.current[Math.max(0, Math.min(paths.length - 1, index + direction))]?.focus();
  }

  const transitionPath = currentPaths.find((path) => path.id === leavingFor);

  return (
    <section className={styles.panels} data-active={activeIndex === null ? "none" : paths[activeIndex].id} aria-label={get("accessible-label", "Choose how to build your OKNO home")}>
      {currentPaths.map((path, index) => (
        <motion.article
          key={path.id}
          className={styles.panel}
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : .72, delay: .06 + index * .08, ease: [.22, 1, .36, 1] }}
          onMouseEnter={() => !leavingFor && setActiveIndex(index)}
          onMouseLeave={() => setActiveIndex(null)}
          data-active={activeIndex === index}
          data-path={path.id} data-type-section={`models.selector-${path.id}`}
        >
          <Link
            href={`/models/${path.id}`}
            aria-label={path.label}
            className={styles.link}
            ref={(element) => { panelRefs.current[index] = element; }}
            onFocus={() => setActiveIndex(index)}
            onBlur={() => setActiveIndex(null)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            onClick={(event) => beginTransition(event, path.id)}
          >
            <Image src={path.image} alt={path.alt} fill sizes="(max-width: 700px) 100vw, 58vw" priority quality={90} className={styles.image} onLoad={() => markLoaded(path.id)} onError={() => markLoaded(path.id)} />
            <div className={styles.shade} aria-hidden="true" />
            <p className={styles.mode}>{path.mode}</p>
            <div className={styles.content}>
              <h2><RevealTitle delay={.14 + index * .08}>{path.title}</RevealTitle></h2>
              <div className={styles.meta}>
                <p>{path.description}</p>
                <span className={styles.action} data-models-magnetic><span>{path.action}</span><span className={styles.arrow} aria-hidden="true">↗</span></span>
              </div>
            </div>
          </Link>
        </motion.article>
      ))}
      <AnimatePresence>
        {transitionPath && (
          <motion.div
            key={transitionPath.id}
            role="status"
            aria-live="polite"
            aria-label={`Opening ${transitionPath.title}`}
            className={styles.transitionSheet}
            data-destination={transitionPath.id}
            initial={{ clipPath: "inset(100% 0 0 0 round 50% 50% 0 0)" }}
            animate={{ clipPath: "inset(0% 0 0 0 round 0% 0% 0 0)" }}
            transition={{ duration: .68, ease: [.65, 0, .35, 1] }}
          >
            <motion.div className={styles.transitionImage} initial={{ scale: 1.06 }} animate={{ scale: 1 }} transition={{ duration: 1.1, ease: [.22, 1, .36, 1] }}>
              <Image src={transitionPath.image} alt="" fill priority sizes="100vw" />
            </motion.div>
            <div className={styles.transitionShade} />
            <motion.div className={styles.transitionCopy} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .38, delay: .22 }}>
              <span>{transitionPath.mode}</span>
              <strong>{transitionPath.title}</strong>
              <i className={styles.morphLoader} aria-hidden="true">{[0, 1, 2, 3].map((item) => <b key={item} style={{ animationDelay: `${item * 90}ms` }} />)}</i>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
