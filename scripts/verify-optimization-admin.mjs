import { readFile, writeFile } from 'node:fs/promises';
import { get, put } from '@vercel/blob';

const base = 'https://okno-homes-deployment.vercel.app';
const backup = '.okno-secrets/optimization-admin-original.json';
const key = (await readFile('.okno-secrets/admin-key.env', 'utf8')).trim().split('=', 2)[1];
const response = await fetch(`${base}/api/admin/content`, { headers: { Authorization: `Bearer ${key}` }, cache: 'no-store' });
if (!response.ok) throw new Error(`Owner authentication failed (${response.status}).`);
const current = await response.json();
const action = process.argv[2];
const allowed = ['about.opening.title', 'about.opening.image'];
const publicContent = async () => (await fetch(`${base}/api/site-content`, { cache: 'no-store' })).json();
if (action === 'backup') {
  if (Object.keys(current.draft).length || Object.keys(current.draftCollections).length) throw new Error('Owner drafts exist; do not publish or disturb them.');
  await writeFile(backup, JSON.stringify(current), { flag: 'wx', mode: 0o600 });
  console.log(`Private backup saved. Published revision ${current.revision}, draft revision ${current.draftRevision}.`);
} else if (action === 'check-draft') {
  const original = JSON.parse(await readFile(backup, 'utf8'));
  const live = await publicContent();
  if (JSON.stringify(live.published) !== JSON.stringify(original.published)) throw new Error('Public content changed before Publish.');
  if (!allowed.every(id => typeof current.draft[id] === 'string')) throw new Error('Text and photograph drafts were not both saved.');
  await writeFile('.okno-secrets/optimization-admin-expected.json', JSON.stringify(Object.fromEntries(allowed.map(id => [id, current.draft[id]]))), { flag: 'wx', mode: 0o600 });
  console.log('PASS: both saved drafts persisted; public content is unchanged.');
} else if (action === 'check-published') {
  const live = await publicContent();
  if (!allowed.every(id => live.published[id] === current.published[id] && live.published[id])) throw new Error('Public snapshot differs from published text/image.');
  if (!current.published['about.opening.image'].startsWith('/api/site-media/')) throw new Error('Uploaded image was not published.');
  const image = await fetch(base + current.published['about.opening.image']);
  if (!image.ok || !image.headers.get('content-type')?.startsWith('image/')) throw new Error('Published cloud photograph is unavailable.');
  console.log('PASS: owner publication reaches public content and durable image delivery.');
} else if (action === 'restore') {
  const original = JSON.parse(await readFile(backup, 'utf8'));
  const expected = JSON.parse(await readFile('.okno-secrets/optimization-admin-expected.json', 'utf8'));
  const withoutQA = entries => Object.fromEntries(Object.entries(entries).filter(([id]) => !allowed.includes(id)));
  if (JSON.stringify(withoutQA(current.published)) !== JSON.stringify(withoutQA(original.published)) ||
      Object.keys(current.draft).some(id => !allowed.includes(id)) ||
      JSON.stringify(current.publishedCollections) !== JSON.stringify(original.publishedCollections) ||
      Object.keys(current.draftCollections).length) throw new Error('Owner content changed during QA; refuse to overwrite it.');
  if (allowed.some(id => (current.published[id] !== original.published[id] && current.published[id] !== expected[id]) || (current.draft[id] !== undefined && current.draft[id] !== expected[id]))) throw new Error('Owner changed a QA field; refuse to overwrite it.');
  process.loadEnvFile('.okno-secrets/vercel-production.env');
  const stored = await get('cms/content.json', { access: 'private', useCache: false, headers: { 'Accept-Encoding': 'identity' } });
  if (!stored?.stream || !stored.etag || stored.etag.startsWith('W/')) throw new Error('No strong ETag for conditional restoration.');
  const fresh = JSON.parse(await new Response(stored.stream).text());
  if (fresh.revision !== current.revision || fresh.draftRevision !== current.draftRevision) throw new Error('Concurrent edit detected before restoration.');
  const restored = { ...fresh, published: original.published, draft: original.draft, publishedCollections: original.publishedCollections, draftCollections: original.draftCollections, revision: fresh.revision + 1, draftRevision: fresh.draftRevision + 1 };
  await put('cms/content.json', JSON.stringify(restored), { access: 'private', contentType: 'application/json', addRandomSuffix: false, cacheControlMaxAge: 0, ifMatch: stored.etag });
  const live = await publicContent();
  if (JSON.stringify(live.published) !== JSON.stringify(original.published) || JSON.stringify(live.publishedCollections) !== JSON.stringify(original.publishedCollections)) throw new Error('Restored public content differs from backup.');
  console.log('PASS: all original published fields/collections restored exactly; revisions advance and owner changes are protected.');
} else throw new Error('Use backup, check-draft, check-published or restore.');
