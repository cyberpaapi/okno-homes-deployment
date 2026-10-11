import { readFile, writeFile, rename } from 'node:fs/promises';
const base = 'http://127.0.0.1:3134';
const key = (await readFile('.okno-secrets/admin-key.env', 'utf8')).trim().split('=', 2)[1];
const headers = { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
const stem = '.okno-secrets/process-cover-original.json';
const file = '.okno-content/content.json';
const request = async (method = 'GET', body) => {
  const response = await fetch(`${base}/api/admin/content`, { method, headers, body: body && JSON.stringify(body), cache: 'no-store' });
  if (!response.ok) throw new Error(`Local CMS returned ${response.status}: ${await response.text()}`);
  return response.json();
};
const current = await request();
if (process.argv[2] === 'stage') {
  if (Object.keys(current.draft).length || Object.keys(current.draftCollections).length) throw new Error('Owner drafts exist; refuse publication.');
  await writeFile(stem, JSON.stringify(current), { flag: 'wx', mode: 0o600 });
  const draft = await request('PATCH', { id: 'process.opening.cover', value: '/process/land-poster.webp', revision: current.revision, draftRevision: current.draftRevision });
  const before = await (await fetch(`${base}/api/site-content`, { cache: 'no-store' })).json();
  if (before.published['process.opening.cover'] !== current.published['process.opening.cover']) throw new Error('Draft leaked publicly.');
  const published = await request('PUT', { revision: draft.revision, draftRevision: draft.draftRevision });
  const after = await (await fetch(`${base}/api/site-content`, { cache: 'no-store' })).json();
  if (after.published['process.opening.cover'] !== '/process/land-poster.webp') throw new Error('Cover publication did not propagate.');
  console.log(`PASS: cover draft private; published at revision ${published.revision}. Verify the already-open browser cover.`);
} else if (process.argv[2] === 'restore') {
  const original = JSON.parse(await readFile(stem, 'utf8'));
  const withoutCover = value => Object.fromEntries(Object.entries(value).filter(([id]) => id !== 'process.opening.cover'));
  if (JSON.stringify(withoutCover(current.published)) !== JSON.stringify(withoutCover(original.published)) || JSON.stringify(current.publishedCollections) !== JSON.stringify(original.publishedCollections) || Object.keys(current.draft).length || Object.keys(current.draftCollections).length) throw new Error('Concurrent owner change; refuse restoration.');
  if (current.published['process.opening.cover'] !== '/process/land-poster.webp') throw new Error('Cover changed after QA; refuse restoration.');
  const fresh = JSON.parse(await readFile(file, 'utf8'));
  if (fresh.revision !== current.revision || fresh.draftRevision !== current.draftRevision) throw new Error('Concurrent owner change.');
  await writeFile(`${file}.process-restore`, JSON.stringify({ ...fresh, published: original.published, draft: original.draft, publishedCollections: original.publishedCollections, draftCollections: original.draftCollections, revision: fresh.revision + 1, draftRevision: fresh.draftRevision + 1 }, null, 2), { mode: 0o600 });
  await rename(`${file}.process-restore`, file);
  const restored = await (await fetch(`${base}/api/site-content`, { cache: 'no-store' })).json();
  if (JSON.stringify(restored.published) !== JSON.stringify(original.published) || JSON.stringify(restored.publishedCollections) !== JSON.stringify(original.publishedCollections)) throw new Error('Restoration mismatch.');
  console.log('PASS: original published fields and collections restored exactly; revisions advanced.');
} else throw new Error('Use stage or restore. Local-only representative cover check; no cloud writes.');
