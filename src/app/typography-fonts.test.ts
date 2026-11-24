import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { inflateSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import publicAssets from '../../config/public-assets.json';
import { criticalFontFiles } from '@/components/SiteTypography/FontPreloads';

const root = join(__dirname, '..', '..');
const css = ['src/app/typography-scale.css', 'src/app/globals.css'].map(file => readFileSync(join(root, file), 'utf8')).join('\n');
const faces = [...css.matchAll(/@font-face\s*\{([^}]*)\}/g)].map(match => match[1]);
const face = (body: string, key: string) => body.match(new RegExp(`${key}:\\s*([^;]+);`))?.[1].trim();

// Read retained WOFF/TrueType tables directly, without a browser or additional
// font dependency. Layout metrics must not change when only glyphs grow taller.
function fontTables(file: string) {
  const bytes = readFileSync(join(root, 'public/fonts', file));
  const woff = bytes.toString('ascii', 0, 4) === 'wOFF';
  const count = bytes.readUInt16BE(woff ? 12 : 4);
  const tables = new Map<string, Buffer>();
  for (let index = 0; index < count; index += 1) {
    const start = (woff ? 44 : 12) + index * (woff ? 20 : 16);
    const name = bytes.toString('ascii', start, start + 4);
    const offset = bytes.readUInt32BE(start + (woff ? 4 : 8));
    const length = bytes.readUInt32BE(start + (woff ? 8 : 12));
    const data = bytes.subarray(offset, offset + length);
    tables.set(name, woff && length < bytes.readUInt32BE(start + 12) ? inflateSync(data) : data);
  }
  return tables;
}

describe('site font faces', () => {
  it('serve every referenced font file and list it in the public asset inventory', () => {
    const urls = [...css.matchAll(/url\(['"]?(\/fonts\/[^'")]+)['"]?\)/g)].map(match => match[1]);
    expect(urls.length).toBeGreaterThan(10);
    for (const url of new Set(urls)) {
      expect(existsSync(join(root, 'public', url)), url).toBe(true);
      expect(Object.hasOwn(publicAssets, url), url).toBe(true);
    }
  });

  it('maps every requested Kento weight to exactly one real cut', () => {
    const kento = faces.filter(body => face(body, 'font-family') === '"Kento OKNO"');
    const ranges = kento.map(body => face(body, 'font-weight')!.split(/\s+/).map(Number)).sort((a, b) => a[0] - b[0]);
    expect(ranges).toEqual([[100, 349], [350, 699], [700, 1000]]);
    for (const body of kento) expect(face(body, 'src')).toMatch(/\.woff2'\) format\('woff2'\), url\('\/fonts\/kento-\w+\.woff'\)/);
  });

  it('keeps symbol and currency fallbacks in both brand stacks', () => {
    for (const family of ['kento', 'govandi']) {
      const stack = css.match(new RegExp(`--okno-font-${family}:\\s*([^;]+);`))?.[1] ?? '';
      expect(stack).toContain('"OKNO Symbols"');
      expect(stack).toContain('"OKNO Rupee"');
    }
  });

  it('opts only public pages into taller company faces and retains all original cuts', () => {
    const publicRule = css.match(/html:has\(\[data-site-header\]\[data-public-site="true"\]\)\s*\{([^}]+)\}/)?.[1] ?? '';
    expect(publicRule).toContain('--okno-font-kento: "Kento OKNO 108"');
    expect(publicRule).toContain('--okno-font-govandi: "Govandi OKNO 108"');
    expect(publicRule).not.toMatch(/font-size|line-height|letter-spacing|transform/);
    for (const family of ['Kento OKNO', 'Kento OKNO 108']) {
      expect(faces.filter(body => face(body, 'font-family') === `"${family}"`).map(body => face(body, 'font-weight'))).toEqual(['100 349', '350 699', '700 1000']);
    }
  });

  it('preserves horizontal advances, kerning and line metrics in public derivatives', () => {
    for (const [original, derived] of [
      ['kento-light.woff', 'kento-h108-light.woff'],
      ['kento-regular.woff', 'kento-h108-regular.woff'],
      ['kento-bold.woff', 'kento-h108-bold.woff'],
      ['govandi-adhiwan-regular.ttf', 'govandi-adhiwan-h108-regular.ttf'],
    ]) {
      const before = fontTables(original);
      const after = fontTables(derived);
      for (const table of ['hmtx', 'hhea', 'OS/2', 'GPOS', 'GSUB']) {
        expect(after.get(table), `${derived}: ${table}`).toEqual(before.get(table));
      }
      expect(after.get('glyf'), `${derived}: outlines change`).not.toEqual(before.get('glyf'));
    }
  });

  it('preloads the two first-paint faces that exist on disk', () => {
    for (const file of criticalFontFiles) expect(existsSync(join(root, 'public', file)), file).toBe(true);
  });
});
