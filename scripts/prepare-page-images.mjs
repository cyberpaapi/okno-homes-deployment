import { readdir, readFile, writeFile, mkdir, stat, unlink } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import sharp from 'sharp';

// Precompute only the accepted photographs used by this performance pass.
// Uploaded CMS images deliberately retain the authenticated media pipeline.
const roots = ['src/components/journal', 'src/components/hospitality', 'src/components/ui/about-section.tsx'];
async function sources(entry) {
  if ((await stat(entry)).isFile()) return [entry];
  return (await Promise.all((await readdir(entry)).map(name => sources(path.join(entry, name))))).flat();
}
const files = (await Promise.all(roots.map(sources))).flat().filter(file => /\.(tsx|ts)$/.test(file) && !file.includes('.test.'));
const paths = new Set();
for (const file of files) {
  for (const match of (await readFile(file, 'utf8')).matchAll(/["'](\/[^"']+\.(?:png|jpe?g|webp))["']/g)) paths.add(match[1]);
}
// Hospitality's viewer resolves its accepted selection from the project catalogue.
const projects = JSON.parse(await readFile('src/data/realProjectMedia.json', 'utf8'));
for (const project of projects) if (project.gallery[0]) paths.add(project.gallery[0].src);
const output = 'public/page-images';
await mkdir(output, { recursive: true });
const manifest = {};
for (const src of [...paths].sort()) {
  const bytes = await readFile(`public${src}`);
  const metadata = await sharp(bytes).metadata();
  const hash = createHash('sha256').update(bytes).digest('hex').slice(0, 16);
  const widths = [...new Set([384, 640, 828, 1080, 1280, 1920].map(width => Math.min(width, metadata.width)))];
  manifest[src] = [];
  for (const width of widths) {
    const url = `/page-images/${hash}-${width}.webp`;
    await sharp(bytes).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 75, effort: 5 }).toFile(`public${url}`);
    manifest[src].push({ width, src: url });
  }
}
await writeFile('config/page-images.json', `${JSON.stringify(manifest, null, 2)}\n`);
const retained = new Set(Object.values(manifest).flat().map(image => path.basename(image.src)));
for (const name of await readdir(output)) if (/^[a-f0-9]{16}-\d+\.webp$/.test(name) && !retained.has(name)) await unlink(path.join(output, name));
const publicAssets = JSON.parse(await readFile('config/public-assets.json', 'utf8'));
for (const url of Object.keys(publicAssets)) if (url.startsWith('/page-images/')) delete publicAssets[url];
for (const variants of Object.values(manifest)) for (const variant of variants) publicAssets[variant.src] = (await stat(`public${variant.src}`)).size;
await writeFile('config/public-assets.json', `${JSON.stringify(publicAssets, null, 2)}\n`);
console.log(`Prepared ${Object.keys(manifest).length} photographs for static CDN delivery.`);
