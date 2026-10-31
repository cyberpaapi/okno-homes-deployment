import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

// Separate derivatives: thumbnail delivery must never reduce gallery originals.
const pages = JSON.parse(await readFile('config/page-images.json', 'utf8'));
const covers = JSON.parse(await readFile('config/project-cover-images.json', 'utf8'));
const sources = [...new Set([...Object.keys(pages), ...Object.keys(covers)])].sort();
const manifest = {};
const publicAssets = JSON.parse(await readFile('config/public-assets.json', 'utf8'));
await mkdir('public/thumbnail-images', { recursive: true });
sharp.concurrency(1);
sharp.cache(false);
for (const source of sources) {
  const bytes = await readFile(`public${source}`);
  const metadata = await sharp(bytes).metadata();
  // Encoding settings are part of the immutable URL identity.
  const hash = createHash('sha256').update(bytes).update('thumbnail-webp-q60-v1').digest('hex').slice(0, 16);
  const widths = [...new Set([128, 256, 384, 480, 640, 960].map(width => Math.min(width, metadata.width)))];
  manifest[source] = [];
  for (const width of widths) {
    const src = `/thumbnail-images/${hash}-${width}.webp`;
    await sharp(bytes).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 60, effort: 5 }).toFile(`public${src}`);
    manifest[source].push({ width, src });
    publicAssets[src] = (await stat(`public${src}`)).size;
  }
}
await writeFile('config/thumbnail-images.json', `${JSON.stringify(manifest, null, 2)}\n`);
await writeFile('config/public-assets.json', `${JSON.stringify(publicAssets, null, 2)}\n`);
console.log(`Prepared compact thumbnails for ${sources.length} photographs; originals and gallery derivatives retained.`);
