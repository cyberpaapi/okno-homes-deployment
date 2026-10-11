import type { Metadata } from "next";
import SustainabilityJourney from "@/components/sustainability/SustainabilityJourney";
import SustainabilityProof from "@/components/sustainability/SustainabilityProof";
import SustainabilityEnding from "@/components/sustainability/SustainabilityEnding";

export const metadata: Metadata = {
  title: "Sustainability — OKNO Modhomes",
  description:
    "Explore OKNO's site-first approach to land, materials, controlled production and evidence-led environmental design.",
};

export default function SustainabilityPage() {
  return (
    <main data-route="sustainability">
      <SustainabilityJourney />
      <SustainabilityProof />
      <SustainabilityEnding />
    </main>
  );
}
