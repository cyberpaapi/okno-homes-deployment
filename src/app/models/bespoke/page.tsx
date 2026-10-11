import type { Metadata } from "next";
import BespokeExperience from "@/components/models/BespokeExperience";

export const metadata: Metadata = {
  title: "Bespoke Models | OKNO",
  description:
    "Begin with your land and brief, then follow a commissioned architectural journey to one original OKNO home.",
};

export default function BespokeModelsPage() {
  return <BespokeExperience />;
}
