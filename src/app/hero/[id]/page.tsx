import HomeVariant from "@/components/landing/HomeVariant";

export const dynamic = "force-dynamic";

export default async function HeroVariantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <HomeVariant initialHero={id} forcedId={id} />;
}
