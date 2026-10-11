import HomeVariant from '@/components/landing/HomeVariant';
import { readContent } from '@/lib/siteContentStore';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const { published } = await readContent();
  const initialHero = published['home.publishing.hero'] || 'hero-v1';
  return <HomeVariant initialHero={initialHero} />;
}
