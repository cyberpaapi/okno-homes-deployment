import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import publicAssets from '../../config/public-assets.json';
import { criticalFontFiles } from '@/components/SiteTypography/FontPreloads';

const root = join(__dirname, '..', '..');
const css = ['src/app/typography-scale.css', 'src/app/globals.css'].map(file => readFileSync(join(root, file), 'utf8')).join('\n');
const faces = [...css.matchAll(/@font-face\s*\{([^}]*)\}/g)].map(match => match[1]);
const face = (body: string, key: string) => body.match(new RegExp(`${key}:\\s*([^;]+);`))?.[1].trim();

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
    for (const role of ['heading', 'body']) {
      const stack = css.match(new RegExp(`--okno-font-${role}:\\s*([^;]+);`))?.[1] ?? '';
      expect(stack).toContain('"OKNO Symbols"');
      expect(stack).toContain('"OKNO Rupee"');
    }
  });

  it('preloads the two first-paint faces that exist on disk', () => {
    for (const file of criticalFontFiles) expect(existsSync(join(root, 'public', file)), file).toBe(true);
  });
});
