import { readFile, writeFile } from 'node:fs/promises';
import { get, put } from '@vercel/blob';

// Operator-assisted browser verification. Private backups never enter reports.
const base = 'https://okno-homes-deployment.vercel.app';
const cycle = process.argv[3];
if (!['1', '2'].includes(cycle)) throw new Error('Choose cycle 1 or 2.');
const stem = `.okno-secrets/hero-v1-cycle-${cycle}`;
const key = (await readFile('.okno-secrets/admin-key.env', 'utf8')).trim().split('=', 2)[1];
const response = await fetch(`${base}/api/admin/content`, { headers: { Authorization: `Bearer ${key}` }, cache: 'no-store' });
if (!response.ok) throw new Error(`Owner authentication failed (${response.status}).`);
const current = await response.json();
const publicContent = async () => (await fetch(`${base}/api/site-content`, { cache: 'no-store' })).json();
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const fields = ['hero-v1.opening.tagline', 'hero-v1.opening.intro-last-frame', 'home.publishing.hero'];
const withoutQA = values => Object.fromEntries(Object.entries(values).filter(([id]) => !fields.includes(id)));
const withoutOpenings = values => Object.fromEntries(Object.entries(values).filter(([id]) => id !== 'home.variants'));
const action = process.argv[2];
if (action === 'backup') {
  if (Object.keys(current.draft).length || Object.keys(current.draftCollections).length) throw new Error('Owner drafts exist; refuse to disturb them.');
  await writeFile(`${stem}-original.json`, JSON.stringify(current), { flag: 'wx', mode: 0o600 });
  console.log(`Private cycle ${cycle} backup saved at revision ${current.revision}.`);
} else {
  const original = JSON.parse(await readFile(`${stem}-original.json`, 'utf8'));
  if (action === 'check-draft') {
    const live = await publicContent();
    if (!equal(live.published, original.published) || !equal(live.publishedCollections, original.publishedCollections)) throw new Error('Public content changed before Publish.');
    if (Object.keys(current.draft).some(id => !fields.includes(id)) || Object.keys(current.draftCollections).some(id => id !== 'home.variants')) throw new Error('Unrelated owner drafts exist.');
    if (!Object.keys(current.draft).length && !Object.keys(current.draftCollections).length) throw new Error('No saved QA draft.');
    await writeFile(`${stem}-expected.json`, JSON.stringify({ published: { ...current.published, ...current.draft }, publishedCollections: { ...current.publishedCollections, ...current.draftCollections } }), { flag: 'wx', mode: 0o600 });
    console.log('PASS: saved V1 draft persists; public content is unchanged.');
  } else {
    const expected = JSON.parse(await readFile(`${stem}-expected.json`, 'utf8'));
    if (!equal(withoutQA(current.published), withoutQA(original.published)) || !equal(withoutOpenings(current.publishedCollections), withoutOpenings(original.publishedCollections))) throw new Error('Owner content changed outside QA; refuse to overwrite.');
    if (!equal(current.published, expected.published) || !equal(current.publishedCollections, expected.publishedCollections) || Object.keys(current.draft).length || Object.keys(current.draftCollections).length) throw new Error('Publication differs from saved QA draft or owner edits appeared.');
    if (action === 'check-published') {
      const live = await publicContent();
      if (!equal(live.published, expected.published) || !equal(live.publishedCollections, expected.publishedCollections)) throw new Error('Public content differs from owner publication.');
      console.log(`PASS: cycle ${cycle} publication reaches the public API at revision ${live.revision}.`);
    } else if (action === 'restore') {
      process.loadEnvFile('.okno-secrets/vercel-production.env');
      const stored = await get('cms/content.json', { access: 'private', useCache: false, headers: { 'Accept-Encoding': 'identity' } });
      const etag = stored?.blob.etag;
      if (!stored?.stream || !etag || etag.startsWith('W/')) throw new Error('No strong conditional-write ETag.');
      const fresh = JSON.parse(await new Response(stored.stream).text());
      if (fresh.revision !== current.revision || fresh.draftRevision !== current.draftRevision) throw new Error('Concurrent owner edit; refuse restoration.');
      const restored = { ...fresh, published: original.published, draft: original.draft, publishedCollections: original.publishedCollections, draftCollections: original.draftCollections, revision: fresh.revision + 1, draftRevision: fresh.draftRevision + 1 };
      await put('cms/content.json', JSON.stringify(restored), { access: 'private', contentType: 'application/json', addRandomSuffix: false, cacheControlMaxAge: 0, ifMatch: etag });
      const live = await publicContent();
      if (!equal(live.published, original.published) || !equal(live.publishedCollections, original.publishedCollections)) throw new Error('Restoration differs from original content.');
      console.log(`PASS: cycle ${cycle} original fields/collections restored exactly at revision ${live.revision}.`);
    } else throw new Error('Use backup, check-draft, check-published or restore.');
  }
}
