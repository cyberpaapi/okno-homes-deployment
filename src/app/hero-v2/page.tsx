import type { Metadata } from "next";
import HomeVariant from "@/components/landing/HomeVariant";

export const metadata: Metadata = {
  title: "OKNO Modhomes | Forza and beyond",
  description: "Travel from the city to Forza, then discover OKNO Signature, Bespoke, and the thinking behind each home.",
};

export default function HeroV2Page() {
  return <HomeVariant initialHero="hero-v2" forcedId="hero-v2" />;
}
