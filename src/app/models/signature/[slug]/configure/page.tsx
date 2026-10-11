import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CustomerStudio from "@/components/configurator/studio/CustomerStudio";
import CustomerUnavailable from "@/components/configurator/studio/CustomerUnavailable";
import { resolvePublishedConfiguration } from "@/data/configurator/studio/publishedCatalogue";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ variant?: string | string[] }>;
};
export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { slug } = await params;
  const configuration = resolvePublishedConfiguration(slug);
  return {
    title: configuration ? `Configure ${slug[0].toUpperCase() + slug.slice(1)} | OKNO` : "Configurator | OKNO",
    robots: { index: false, follow: true },
  };
}
export default async function Page({ params, searchParams }: Props) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const configuration = resolvePublishedConfiguration(slug, query.variant);
  if (!configuration) notFound();
  if (configuration.status === "unsupported-variant") {
    return <CustomerUnavailable slug={configuration.slug} availableVariant={configuration.catalogue.variant} requestedVariant={typeof query.variant === "string" ? query.variant : undefined} />;
  }
  return <CustomerStudio key={`${slug}-${configuration.catalogue.revision}`} catalogue={configuration.catalogue} />;
}
