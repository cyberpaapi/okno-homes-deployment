import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

// Preserve Projects' quality=90 and crop-aware sizes; resize before delivery.
const projects = JSON.parse(await readFile('src/data/realProjectMedia.json', 'utf8'));
const covers = [...new Set(projects.map(project => project.gallery[Math.min(1, project.gallery.length - 1)].src))];
const manifest = {};
const assets = JSON.parse(await readFile('config/public-assets.json', 'utf8'));
sharp.concurrency(1);
sharp.cache(false);
await mkdir('public/project-images', { recursive: true });
for (const source of covers) {
  const bytes = await readFile(`public${source}`);
  const metadata = await sharp(bytes).metadata();
  // Changing the recipe creates fresh immutable URLs.
  const hash = createHash('sha256').update(bytes).update('okno-project-cover-v1-webp-quality90').digest('hex').slice(0, 16);
  manifest[source] = [];
  for (const width of [...new Set([384, 640, 828, 1080, 1280, 1920].map(value => Math.min(value, metadata.width)))]) {
    const url = `/project-images/${hash}-${width}.webp`;
    await sharp(bytes).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 90, effort: 5 }).toFile(`public${url}`);
    manifest[source].push({ width, src: url });
    assets[url] = (await stat(`public${url}`)).size;
  }
}
await writeFile('config/project-cover-images.json', JSON.stringify(manifest, null, 2) + '\n');
await writeFile('config/public-assets.json', JSON.stringify(assets, null, 2) + '\n');
console.log(`Prepared ${covers.length} Projects covers at quality 90.`);
