"use client";

// Adapted from gaxocif204's 21st.dev Preloader, demo 13967.
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import OknoLogo from "@/components/Brand/OknoLogo";
import { useMediaQuery } from "@/lib/useMediaQuery";
import styles from "./ModelsEntrance.module.css";

export default function ModelsEntrance({ ready }: { ready: boolean }) {
  const [show, setShow] = useState(true);
  const [minimumElapsed, setMinimumElapsed] = useState(false);
  const [skip, setSkip] = useState(false);
  const reduced = useReducedMotion();
  const compact = useMediaQuery("(max-width: 700px)");

  useEffect(() => {
    let seen = false;
    try { seen = sessionStorage.getItem("okno-models-selector-entered") === "1"; } catch {}
    const minimum = window.setTimeout(() => {
      setMinimumElapsed(true);
      setSkip(seen);
      if (seen || window.matchMedia("(prefers-reduced-motion: reduce)").matches) setShow(false);
    }, seen ? 0 : 420);
    const deadline = window.setTimeout(() => setShow(false), 2800);
    return () => { window.clearTimeout(minimum); window.clearTimeout(deadline); };
  }, []);

  useEffect(() => {
    if (!ready || !minimumElapsed) return;
    const timer = window.setTimeout(() => {
      setShow(false);
      try { sessionStorage.setItem("okno-models-selector-entered", "1"); } catch {}
    }, 0);
    return () => window.clearTimeout(timer);
  }, [ready, minimumElapsed]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          role="status"
          aria-label="Loading OKNO models"
          className={styles.loader}
          initial={compact ? { opacity: 1 } : { transform: "translate3d(0, 0, 0)" }}
          exit={compact ? { opacity: 0 } : { transform: reduced ? "translate3d(0, 0, 0)" : "translate3d(0, -105%, 0)", opacity: reduced ? 0 : 1 }}
          transition={{ duration: reduced || skip ? 0 : compact ? 0.3 : 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div initial={compact ? { opacity: 1 } : { transform: "scale(1)" }} exit={compact ? { opacity: 0 } : { transform: reduced ? "scale(1)" : "scale(1.6)", opacity: 0 }} transition={{ duration: reduced || skip ? 0 : compact ? 0.3 : 0.45, ease: [0.22, 1, 0.36, 1] }}>
            <OknoLogo variant="compact" priority />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
