"use client";

import Image from "next/image";
import { useSiteContentMap } from "@/lib/useSiteContent";
import styles from "./OknoLogo.module.css";

type Props = {
  className?: string;
  priority?: boolean;
  tone?: "light" | "dark";
  variant?: "wordmark" | "compact";
};

const originalWordmark = "/assets/projects/brand/okno-modhomes-white.svg";

/** One published brand source for the header, footer and page entrances. */
export default function OknoLogo({ className, priority = false, tone = "light", variant = "wordmark" }: Props) {
  const values = useSiteContentMap();
  const light = values["brand.logo.light"] || originalWordmark;
  const customDark = values["brand.logo.dark"];
  const compact = values["brand.logo.compact"];
  const src = tone === "dark" && customDark ? customDark : variant === "compact" && compact ? compact : light;
  const needsDarkFilter = tone === "dark" && !customDark;
  return (
    <Image
      src={src}
      alt=""
      width={467}
      height={156}
      priority={priority}
      className={`${styles.logo}${className ? ` ${className}` : ""}`}
      data-tone={needsDarkFilter ? "dark" : "light"}
    />
  );
}
