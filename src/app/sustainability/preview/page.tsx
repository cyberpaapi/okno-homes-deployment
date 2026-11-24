import type { Metadata } from "next";
import SustainabilityFramingPreview from "@/components/sustainability/SustainabilityFramingPreview";

export const metadata: Metadata = {
  title: "Sustainability framing preview — OKNO",
  robots: { index: false, follow: false },
};

export default function FramingPreview() {
  return <SustainabilityFramingPreview />;
}
