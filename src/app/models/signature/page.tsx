import type { Metadata } from "next";
import SignatureExperience from "@/components/models/SignatureExperience";
import { gazePrototype, oknoModels } from "@/data/models";

export const metadata: Metadata = {
  title: "Signature Models | OKNO",
  description:
    "Explore OKNO Signature models through a scroll-controlled product experience.",
};

export default function SignatureModelsPage() {
  const signatureModels = ["forza", "kray"]
    .map((slug) => oknoModels.find((model) => model.slug === slug))
    .filter((model): model is NonNullable<typeof model> => Boolean(model));

  signatureModels.push(gazePrototype);

  ["tengo", "trib", "octapod"].forEach((slug) => {
    const model = oknoModels.find((item) => item.slug === slug);
    if (model) signatureModels.push(model);
  });

  if (!signatureModels.length) return null;
  return <SignatureExperience models={signatureModels} />;
}
