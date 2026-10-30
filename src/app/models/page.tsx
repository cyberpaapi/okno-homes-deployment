import type { Metadata } from "next";
import ModelsEntry from "@/components/models/ModelsEntry";

export const metadata: Metadata = {
  title: "Models | OKNO Modhomes",
  description:
    "Choose a precisely resolved Collection home, or begin a one-of-one Bespoke home with OKNO.",
};

export default function ModelsPage() {
  return (
    <>
      <ModelsEntry />
    </>
  );
}
