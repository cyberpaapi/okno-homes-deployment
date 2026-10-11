"use client";

import AboutSection from "@/components/ui/about-section";
import Header from "../Header/Header";

export default function AboutExperience() {
  return (
    <main data-route="about" className="min-h-screen overflow-x-clip bg-[#0b140f]">
      <Header tone="dark" />
      <AboutSection />
    </main>
  );
}
