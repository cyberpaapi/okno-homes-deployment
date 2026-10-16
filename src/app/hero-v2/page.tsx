import type { Metadata } from "next";
import HomeVariant from "@/components/landing/HomeVariant";

export const metadata: Metadata = {
  title: "OKNO Modhomes | Nighttime journey",
  description: "Scroll from the cave into the home, then discover OKNO Signature, Bespoke, and the thinking behind each home.",
};

export default function HeroV2Page() {
  return <HomeVariant initialHero="hero-v2" forcedId="hero-v2" />;
}
