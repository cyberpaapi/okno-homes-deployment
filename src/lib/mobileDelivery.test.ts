import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import v1 from '../../config/hero-v1-mobile-frames.json';
import v2 from '../../config/hero-v2-mobile-frames.json';

describe('phone hero delivery integrity', () => {
  for (const [name, film, last, limit] of [['V1', v1, 576, 28_000_000], ['V2', v2, 790, 15_000_000]] as const) {
    it(`${name} delivers bounded, correctly indexed WebP poses including both endpoints`, () => {
      const data = readFileSync(`public${film.source}`);
      expect(data.length).toBe(film.bytes);
      expect(data.length).toBeLessThan(limit);
      expect(createHash('sha256').update(data).digest('hex')).toBe(film.sha256);
      expect(film.frames[0][2]).toBe(0);
      expect(film.frames.at(-1)![2]).toBe(last);
      let end = 0;
      film.frames.forEach(([offset, size, pose], index) => {
        expect(offset).toBe(end);
        expect(pose).toBe(index * 2);
        expect(data.subarray(offset + 8, offset + 12).toString()).toBe('WEBP');
        end = offset + size;
      });
      expect(end).toBe(data.length);
    });
  }
});
