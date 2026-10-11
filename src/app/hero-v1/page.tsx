import type { Metadata } from "next";
import HomeVariant from "@/components/landing/HomeVariant";

export const metadata: Metadata = {
  title: "OKNO Modhomes | Hero V1",
  description: "The original forest-to-home OKNO landing experience.",
};

export default function HeroV1Page() {
  return <HomeVariant initialHero="hero-v1" forcedId="hero-v1" />;
}
