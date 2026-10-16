import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { signatureAsset } from "@/data/configurator/signatureAssets";
import { gazePrototype, oknoModels } from "@/data/models";
import SuppliedConfigurator from "@/components/configurator/supplied/SuppliedConfigurator";

type Props = {
  params: Promise<{ slug: string }>;
};
export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `${signatureAsset(slug)?.name ?? "Studio Cabin"} Configurator | OKNO`,
    robots: { index: false, follow: true },
  };
}
export default async function Page({ params }: Props) {
  const { slug } = await params;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) notFound();
  const model = [...oknoModels, gazePrototype].find(model => model.slug === slug);
  if (!model) notFound();
  // Family geometry is labeled honestly; query plans never substitute another house.
  return <SuppliedConfigurator asset={signatureAsset(slug)} requestedName={model.name} />;
}
