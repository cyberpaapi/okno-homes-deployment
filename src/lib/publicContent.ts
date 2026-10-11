import 'server-only';
import { unstable_cache } from 'next/cache';
import { readContent, type ContentSnapshot } from '@/lib/siteContentStore';
import { cloudStorageEnabled } from '@/lib/cloudStorage';
import seed from '../../config/content-seed.json';

export const PUBLIC_CONTENT_TAG = 'okno-published-content';
const publicSnapshot = (snapshot: Pick<ContentSnapshot, 'revision' | 'published' | 'publishedCollections'>) => ({
  revision: snapshot.revision,
  published: snapshot.published,
  publishedCollections: snapshot.publishedCollections,
});

// Visitor polling must not read the private Blob on every request. Only
// published fields enter the shared Data Cache. Authenticated Publish expires
// this tag immediately; drafts and CAS writes always read the current store.
const readCached = unstable_cache(async () => {
  try { return publicSnapshot(await readContent()); }
  catch {
    console.warn('OKNO public content storage unavailable; serving the verified release publication.');
    return publicSnapshot(seed);
  }
}, ['okno-publication-v1'], { tags: [PUBLIC_CONTENT_TAG], revalidate: 1800 });

export async function readPublicContent() {
  return cloudStorageEnabled() ? readCached() : publicSnapshot(await readContent());
}
