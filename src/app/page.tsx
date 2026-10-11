import HomeVariant from '@/components/landing/HomeVariant';
import { readPublicContent } from '@/lib/publicContent';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const { published } = await readPublicContent();
  const initialHero = published['home.publishing.hero'] || 'hero-v1';
  return <HomeVariant initialHero={initialHero} />;
}
