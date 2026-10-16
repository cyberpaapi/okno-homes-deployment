import { open, readFile, writeFile, rename } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

// Sequential conversion bounds RAM. Approved desktop bytes remain untouched.
sharp.concurrency(1);
sharp.cache(false);
for (const version of ['v1', 'v2']) {
  const original = JSON.parse(await readFile(`config/hero-${version}-frames.json`, 'utf8'));
  const input = original.parts ? original.parts : [{ source: original.source }];
  const handles = await Promise.all(input.map(part => open(`public${part.source}`, 'r')));
  const partBytes = original.partBytes ?? original.bytes;
  const temporary = `public/hero-${version}-mobile.tmp`;
  const output = await open(temporary, 'w');
  const frames = [];
  const hash = createHash('sha256');
  const width = version === 'v1' ? 1280 : 960;
  const height = width * 9 / 16;
  let bytes = 0;
  try {
    for (let index = 0; index < original.frames.length; index++) {
      if (version === 'v2' && index % 2 && index !== original.frames.length - 1) continue;
      const [offset, length, sourceIndex] = original.frames[index];
      const data = Buffer.alloc(length);
      let received = 0;
      while (received < length) {
        const globalOffset = offset + received;
        const part = Math.floor(globalOffset / partBytes);
        const local = globalOffset % partBytes;
        const size = Math.min(length - received, partBytes - local);
        const read = await handles[part].read(data, received, size, local);
        if (read.bytesRead !== size) throw new Error('Incomplete original frame');
        received += size;
      }
      const encoded = await sharp(data).resize(width, height).webp({ quality: 84, effort: 4 }).toBuffer();
      await output.write(encoded);
      hash.update(encoded);
      frames.push([bytes, encoded.length, sourceIndex]);
      bytes += encoded.length;
    }
  } finally {
    await output.close();
    await Promise.all(handles.map(handle => handle.close()));
  }
  const sha256 = hash.digest('hex');
  const source = `/assets/landing-options/hero-${version}-mobile-${sha256.slice(0, 12)}.bin`;
  await rename(temporary, `public${source}`);
  const descriptor = { source, sha256, bytes, width, height, fps: original.fps, sourceFrames: original.sourceFrames, sampleStride: 2, frames };
  if (version === 'v2') Object.assign(descriptor, { parts: [{ source, bytes, sha256 }], partBytes: Math.ceil(bytes / (512 * 1024)) * 512 * 1024 });
  await writeFile(`config/hero-${version}-mobile-frames.json`, JSON.stringify(descriptor));
  console.log(`${version}: ${original.bytes} → ${bytes} bytes; ${frames.length} poses; ${width}×${height}`);
}
