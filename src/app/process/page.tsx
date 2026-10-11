import type { Metadata } from "next";
import ProcessJourney from "@/components/process/ProcessJourney";

export const metadata: Metadata = {
  title: "Process | OKNO Modhomes",
  description:
    "Follow an OKNO home from the client brief and site through design, manufacturing, transport, assembly and final handover.",
};

export default function ProcessPage() {
  return <ProcessJourney />;
}
