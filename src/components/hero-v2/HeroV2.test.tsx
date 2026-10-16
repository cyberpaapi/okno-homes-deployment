import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { homeVariantDefaults } from '@/data/homeVariants';
import { allContentFields } from '@/data/adminContent';

// Contract checks protect the owner's explicit no-intro boundary and prevent
// the retired city/loop media from returning through CMS defaults.
describe('V2 media contract', () => {
  it('uses only the approved scroll bundle and matching endpoint stills by default', () => {
    const v2 = homeVariantDefaults.find(item => item.id === 'hero-v2')!;
    expect(v2.fields.scrollVideo).toBe('');
    expect(v2.fields.poster).toBe('/hero-v2/nighttime-first.webp');
    expect(v2.fields.endImage).toBe('/hero-v2/nighttime-last.webp');
    expect(v2.fields.openingVideo).toBeUndefined(); expect(v2.fields.loopVideo).toBeUndefined();
    const source = readFileSync('src/components/hero-v2/HeroV2.tsx', 'utf8');
    expect(source).not.toMatch(/\bautoPlay\b|\.play\(|preventDefault\(/);
    expect(source).toContain('<LandingExperience />');
    const fields = allContentFields().filter(field => field.id.startsWith('hero-v2.'));
    expect(fields.map(field => field.id)).not.toContain('hero-v2.opening.island-loop');
    expect(fields.find(field => field.id === 'hero-v2.opening.scroll-video')?.defaultValue).toBe('');
  });
});
