"use client";

import Link from "next/link";
import styles from "./SustainabilityEnding.module.css";
import { useSiteContentMap } from "@/lib/useSiteContent";
import { localDestination } from "@/lib/localDestination";

export default function SustainabilityEnding() {
  const values = useSiteContentMap();
  const get = (key: string, fallback: string) => values[`sustainability.ending.${key}`] ?? fallback;
  return (
    <section  data-type-section="sustainability.ending"className={styles.ending} aria-labelledby="sustainability-ending-title">
      <div className={styles.statement}>
        <p data-type-field={"sustainability.ending.eyebrow"}>{get("eyebrow", "The next project")}</p>
        <h2 id="sustainability-ending-title" data-type-field={"sustainability.ending.heading-line-1"}>
          {get("heading-line-1", "Build with what")}<br />
          {get("heading-line-2", "the land ")}<span data-type-highlight data-type-field={"sustainability.ending.heading-emphasis"}>{get("heading-emphasis", "gives.")}</span>
        </h2>
        <Link href={localDestination(get("action-href", "/enquiry"), "/enquiry")} data-type-field={"sustainability.ending.action"}>
          {get("action", "Begin a conversation")} <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </section>
  );
}
