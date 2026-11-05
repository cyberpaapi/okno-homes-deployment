import { describe, it, expect } from 'vitest';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { adminPages, allContentFields } from '@/data/adminContent';
import { typographyBindings, typographyCss, typographyValueError, validateTypographySizes, typeRoles, typographyFonts, isTypographySizeField } from './typography';

const bindings = typographyBindings(adminPages);
function files(directory: string): string[] { return readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? files(path.join(directory, entry.name)) : [path.join(directory, entry.name)]); }

describe('published typography contract', () => {
  it('pairs the supplied fonts by default while preserving explicit editor choices', () => {
    const css = typographyCss({}, [{ scope: 'home.timeline', fields: [] }]);
    expect(css).toContain('--type-font-body:var(--okno-font-body)');
    expect(css).toContain('--type-font-heading:var(--okno-font-heading)');
    expect(css).toContain('--type-font-highlight:var(--type-font-heading)');
    const custom = typographyCss({ 'typography.master-font': 'manrope', 'typography.section.home.timeline.heading-font': 'kento' }, [{ scope: 'home.timeline', fields: [] }]);
    expect(custom).toContain('--type-font-body:var(--type-font-master)');
    expect(custom).toContain('--type-font-heading:"Kento OKNO"');
    expect(typographyCss({ 'typography.section.home.timeline.body-font': 'bad-font' }, [{ scope: 'home.timeline', fields: [] }])).toBe(css);
  });
  it('registers optional numeric sizes and font choices for every editable section', () => {
    const fields = allContentFields().filter(field => field.id.startsWith('typography.'));
    expect(new Set(fields.map(field => field.id)).size).toBe(fields.length);
    expect(bindings.length).toBeGreaterThan(65);
    for (const field of fields) {
      for (const option of field.options ?? []) {
        const css = typographyCss({ [field.id]: option.value }, bindings);
        expect(css).not.toMatch(/undefined|NaN|javascript:/);
        if (field.id.endsWith('-font')) expect(css).toContain('--type-font-');
      }
      if (isTypographySizeField(field.id)) {
        expect(field.defaultValue).toBe('');
        expect(field.kind).toBe('text');
        expect(typographyCss({ [field.id]: '26.5' }, bindings)).toContain('26.5px');
      }
    }
    expect(fields.some(field => field.id.includes('typography.preset.') || field.id.endsWith('-preset'))).toBe(false);
    if (process.env.OKNO_WRITE_TYPE_BINDINGS) writeFileSync('src/data/typographySections.json', JSON.stringify(bindings, null, 2) + '\n');
    expect(JSON.parse(readFileSync('src/data/typographySections.json', 'utf8'))).toEqual(bindings);
  });
  it('rejects CSS injection and invalid numbers, and accepts blank resets and independent phone sizes', () => {
    for (const bad of ['0', '-1', '401', '20; color:red', 'calc(1px)', 'Infinity', '16.55']) expect(typographyValueError('typography.section.about.hero.body-size', bad)).toBeTruthy();
    expect(typographyValueError('typography.section.about.hero.body-size', '16.5')).toBeNull();
    expect(typographyValueError('typography.section.about.hero.body-size', '')).toBeNull();
    expect(typographyCss({ 'typography.master-font': 'x};body{display:none' }, bindings)).not.toContain('display:none');
    expect(() => validateTypographySizes({ 'typography.section.about.hero.body-size': '20', 'typography.section.about.hero.body-mobile-size': '40' })).not.toThrow();
    expect(() => validateTypographySizes({ 'typography.section.about.hero.body-size': '0' })).toThrow('6 to 400');
    expect(() => validateTypographySizes({})).not.toThrow();
    for (const font of typographyFonts) expect(typographyCss({ 'typography.master-font': font.value }, [])).toContain(font.family);
  });
  it('leaves authored sizes intact by default and ignores the superseded global presets', () => {
    const defaults = typographyCss({}, bindings);
    expect(defaults).not.toContain('--type-preset-');
    expect(defaults).not.toMatch(/--type-size-[a-z]+:\d/);
    expect(typographyCss({ 'typography.preset.body.mobile': '120', 'typography.section.about.hero.heading-preset': 'display' }, bindings)).toBe(defaults);
    const scope = bindings[0].scope;
    const css = typographyCss({ [`typography.section.${scope}.body-size`]: '22', [`typography.section.${scope}.body-mobile-size`]: '15' }, bindings);
    expect(css).toContain('--type-size-body:22px');
    expect(css).toContain('@media(max-width:700px)');
    expect(css).toContain('--type-size-body:15px');
  });
  it('keeps responsive role fallbacks and binds every editing section to real public source', () => {
    const sourceFiles = files('src').filter(file => file.endsWith('.tsx') && !/\.test\.|\/admin\//.test(file));
    const source = sourceFiles.map(file => readFileSync(file, 'utf8')).join('\n');
    const missing = bindings.filter(binding => !source.includes(`data-type-section="${binding.scope}"`) && !binding.fields.some(id => source.includes(`data-type-field={"${id}"}`)) && ![
      /^signature\.(?:forza|kray|gaze|tengo|trib|octapod)-(?:media|story|explore|plan-\d+)$/,
      /^bespoke\.decision-\d+$/, /^process\.stage-/, /^process\.detail-\d+$/,
      /^sustainability\.journey-/, /^sustainability\.press-\d+$/, /^sustainability\.fact-\d+$/,
      /^models\.selector-(?:signature|bespoke)$/, /^footer\.footer-(?:homes|explore|okno)$/,
      /^journal\.notes-intro$/,
      /^enquiry\.(?:home|hospitality|press)-tab$/,
    ].some(pattern => pattern.test(binding.scope)));
    expect(missing.map(binding => binding.scope)).toEqual([]);
    const styles = files('src').filter(file => file.endsWith('.css') && !/\/admin\//.test(file)).map(file => readFileSync(file, 'utf8')).join('\n');
    for (const role of typeRoles) expect(styles).toContain(`var(--type-size-${role},`);
    expect(styles).not.toMatch(/var\(--type-(?:display|heading|subheading|body|caption)\)/);
    expect(styles).toContain('var(--type-size-heading, var(--okno-figure))');
    expect(styles).toContain('var(--type-size-caption, var(--okno-label))');
  });
});
