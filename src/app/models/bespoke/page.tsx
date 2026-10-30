import type { Metadata } from "next";
import BespokeExperience from "@/components/models/BespokeExperience";

export const metadata: Metadata = {
  title: "Bespoke Models | OKNO",
  description:
    "Calibrated to your land, your life and your investment. A one-of-one home by OKNO.",
};

export default function BespokeModelsPage() {
  return <BespokeExperience />;
}
