"use client";

// Adapted from gaxocif204's 21st.dev Preloader, demo 13967.
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import OknoLogo from "@/components/Brand/OknoLogo";
import styles from "./ModelsEntrance.module.css";

export default function ModelsEntrance({ ready }: { ready: boolean }) {
  const [show, setShow] = useState(true);
  const [minimumElapsed, setMinimumElapsed] = useState(false);
  const [skip, setSkip] = useState(false);
  const reduced = useReducedMotion();

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
          initial={{ y: 0 }}
          exit={{ y: reduced ? 0 : "-105%", opacity: reduced ? 0 : 1, borderBottomLeftRadius: "50% 20%", borderBottomRightRadius: "50% 20%" }}
          transition={{ duration: reduced || skip ? 0 : 0.9, ease: [0.65, 0, 0.35, 1] }}
        >
          <motion.div exit={{ scale: reduced ? 1 : 4.5, opacity: 0 }} transition={{ duration: reduced || skip ? 0 : 0.75 }}>
            <OknoLogo variant="compact" priority />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
