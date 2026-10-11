"use client";

import Link from "next/link";
import styles from "./SustainabilityEnding.module.css";
import { useSiteContentMap } from "@/lib/useSiteContent";
import { localDestination } from "@/lib/localDestination";

export default function SustainabilityEnding() {
  const values = useSiteContentMap();
  const get = (key: string, fallback: string) => values[`sustainability.ending.${key}`] ?? fallback;
  return (
    <section className={styles.ending} aria-labelledby="sustainability-ending-title">
      <div className={styles.statement}>
        <p>{get("eyebrow", "The next project")}</p>
        <h2 id="sustainability-ending-title">
          {get("heading-line-1", "Build with what")}<br />
          {get("heading-line-2", "the land ")}<span>{get("heading-emphasis", "gives.")}</span>
        </h2>
        <Link href={localDestination(get("action-href", "/enquiry"), "/enquiry")}>
          {get("action", "Begin a conversation")} <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </section>
  );
}
