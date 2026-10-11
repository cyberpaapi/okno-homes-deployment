"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useSiteCollectionsMap, useSiteContent } from "@/lib/useSiteContent";
import { homeVariantDefaults } from "@/data/homeVariants";

const HeroV1 = dynamic(() => import("@/components/landing-options/ForestEntryOption"));
const HeroV2 = dynamic(() => import("@/components/hero-v2/HeroV2"));

export default function HomeVariant({ initialHero, forcedId }: { initialHero: string; forcedId?: string }) {
  const selected = useSiteContent("home.publishing.hero", initialHero);
  const collections = useSiteCollectionsMap();
  const variants = collections["home.variants"] ?? homeVariantDefaults;
  const item = variants.find(variant => variant.id === (forcedId ?? selected));
  if (forcedId && !item) {
    return <main style={{ minHeight: "100svh", display: "grid", placeItems: "center", background: "#101712", color: "#f6f5ee", padding: "2rem", textAlign: "center" }}><div><h1>Hero variant unavailable</h1><p>This opening is not in the published collection.</p><Link href="/">Return to the homepage</Link></div></main>;
  }
  const template = item?.fields.template ?? "v1";
  const override = collections["home.variants"] ? item : undefined;
  return template === "v2" ? <HeroV2 variant={override} /> : <HeroV1 variant={override} />;
}
