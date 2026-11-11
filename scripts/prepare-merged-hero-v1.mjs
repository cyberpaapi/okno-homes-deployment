// Builds the Hero V1 scroll-film pose banks from the merged opening film
// (intro woods traversal + journey, 11 November 2026). Every second frame plus
// the last one, as independently decodable WebP poses, desktop and mobile.
// Usage: node scripts/prepare-merged-hero-v1.mjs /assets/landing-options/<merged>.mp4
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync, renameSync, openSync, writeSync, closeSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';

sharp.concurrency(1);
sharp.cache(false);
const source = process.argv[2];
if (!source) throw new Error('Pass the merged film path under public/.');
const probe = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-count_frames', '-show_entries', 'stream=nb_read_frames', '-of', 'json', `public${source}`]).toString());
const total = Number(probe.streams[0].nb_read_frames);
const last = total - 1;
const work = mkdtempSync(join(tmpdir(), 'hero-v1-'));
try {
  execFileSync('ffmpeg', ['-v', 'error', '-i', `public${source}`, '-vf', `select='not(mod(n\\,2))+eq(n\\,${last})'`, '-vsync', 'vfr', '-start_number', '0', join(work, '%04d.png')]);
  const pngs = readdirSync(work).filter(name => name.endsWith('.png')).sort();
  const indices = pngs.map((_, position) => Math.min(position * 2, last));
  if (indices.at(-1) !== last) indices[indices.length - 1] = last;
  for (const [variant, width, quality] of [['desktop', 1920, 80], ['mobile', 1280, 84]]) {
    const height = width * 9 / 16;
    const temporary = `public/hero-v1-${variant}.tmp`;
    const fd = openSync(temporary, 'w');
    const hash = createHash('sha256');
    const frames = [];
    let bytes = 0;
    for (let index = 0; index < pngs.length; index++) {
      const encoded = await sharp(readFileSync(join(work, pngs[index]))).resize(width, height).webp({ quality, effort: 4 }).toBuffer();
      writeSync(fd, encoded);
      hash.update(encoded);
      frames.push([bytes, encoded.length, indices[index]]);
      bytes += encoded.length;
    }
    closeSync(fd);
    const sha256 = hash.digest('hex');
    const name = variant === 'desktop' ? `forest-entry-frames-${sha256.slice(0, 12)}.bin` : `hero-v1-mobile-${sha256.slice(0, 12)}.bin`;
    renameSync(temporary, `public/assets/landing-options/${name}`);
    const descriptor = { source: `/assets/landing-options/${name}`, sha256, bytes, width, height, fps: 24, sourceFrames: total, sampleStride: 2, frames };
    if (variant === 'desktop') Object.assign(descriptor, { originalSource: source, originalSha256: createHash('sha256').update(readFileSync(`public${source}`)).digest('hex') });
    writeFileSync(variant === 'desktop' ? 'config/hero-v1-frames.json' : 'config/hero-v1-mobile-frames.json', JSON.stringify(descriptor));
    console.log(`${variant}: ${frames.length} poses, ${bytes} bytes, ${width}×${height}`);
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}
