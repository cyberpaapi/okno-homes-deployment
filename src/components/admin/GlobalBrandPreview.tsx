"use client";

// Placement preview uses the retrieved 21st.dev Field with Textarea 26101
// labeled-field grouping and Nested Bordered Accordion 24854 section context.
import Image from "next/image";
import styles from "./GlobalBrandPreview.module.css";

const original = "/assets/projects/brand/okno-modhomes-white.svg";

export default function GlobalBrandPreview({ values }: { values: Record<string, string> }) {
  const light = values["brand.logo.light"] || original;
  const customDark = values["brand.logo.dark"];
  const dark = customDark || light;
  const compact = values["brand.logo.compact"] || light;
  const icon = values["brand.logo.icon"] || "/favicon.ico";
  return <section className={styles.preview} aria-label="Global Brand placement preview">
    <div className={styles.heading}><strong>Placement preview</strong><span>The original file keeps its proportions in every placement.</span></div>
    <div className={styles.grid}>
      <div className={`${styles.placement} ${styles.forest}`}><span>Dark Header / Footer</span><Image src={light} alt="" width={467} height={156} unoptimized /></div>
      <div className={`${styles.placement} ${styles.ivory}`}><span>Light Header / Footer</span><Image src={dark} alt="" width={467} height={156} unoptimized className={customDark ? undefined : styles.darkFallback} /></div>
      <div className={`${styles.placement} ${styles.entrance}`}><span>Entrance mark</span><Image src={compact} alt="" width={467} height={156} unoptimized /></div>
      <div className={`${styles.placement} ${styles.browser}`}><span>Browser icon</span><Image src={icon} alt="" width={64} height={64} unoptimized /></div>
    </div>
  </section>;
}
