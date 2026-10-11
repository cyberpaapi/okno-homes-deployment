"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { OknoModel } from "@/data/models";
import ForzaExperience from "./ForzaExperience";

function LinkedExperience({ models }: { models: OknoModel[] }) {
  const search = useSearchParams();
  return <ForzaExperience
    key={search.toString()}
    models={models}
    initialModelSlug={search.get("model") ?? "forza"}
    initialDetailsOpen={search.get("details") === "1"}
    initialVariantId={search.get("variant")}
  />;
}

export default function SignatureExperience({ models }: { models: OknoModel[] }) {
  // Keep the static page shell; query-specific selection resolves on the client.
  return <Suspense fallback={<ForzaExperience models={models} />}><LinkedExperience models={models} /></Suspense>;
}
