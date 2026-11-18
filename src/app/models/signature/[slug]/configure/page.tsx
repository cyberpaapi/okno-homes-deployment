import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { signatureAsset } from "@/data/configurator/signatureAssets";
import { readPublicContent } from "@/lib/publicContent";
import { oknoModels, gazePrototype } from "@/data/models";
import { signatureModelDefaults, signaturePlanDefaults } from "@/lib/signatureCollections";
import { pricingCollection } from '@/lib/configuratorPricing';
import ModelConfigurator from "@/components/configurator/antigravity/ModelConfigurator";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ variant?: string | string[] }>;
};
export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { slug } = await params;
  const publication = await readPublicContent();
  const name = publication.publishedCollections["signature.models"]?.find(model => model.id === slug)?.fields.name;
  return {
    title: `${name ?? signatureAsset(slug)?.name ?? slug} Configurator | OKNO`,
    robots: { index: false, follow: true },
  };
}
export default async function Page({ params, searchParams }: Props) {
  const { slug } = await params;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) notFound();
  const publication = await readPublicContent();
  const roster = publication.publishedCollections["signature.models"] ?? signatureModelDefaults;
  const legacy = [...oknoModels, gazePrototype].find(model => model.slug === slug);
  const model = roster.find(model => model.id === slug) ?? (legacy ? { id: slug, fields: { name: legacy.name } } : undefined);
  if (!model) notFound();
  // Family geometry is labeled honestly; query plans never substitute another house.
  const variant = (await searchParams)?.variant;
  return <ModelConfigurator slug={slug} roster={roster.some(item => item.id === slug) ? roster : [...roster, model]}
    initialPrices={publication.publishedCollections[pricingCollection] ?? []}
    initialPlans={publication.publishedCollections['signature.plans'] ?? signaturePlanDefaults(publication.published)}
    variant={typeof variant === 'string' ? variant : undefined} />;
}
