import type { ContentField, ContentPage, ContentSection } from '@/data/adminContent';

export const typeRoles = ['display', 'heading', 'subheading', 'body', 'caption'] as const;
export type TypeRole = typeof typeRoles[number];
export const typeRoleLabels: Record<TypeRole, string> = { display: 'Large titles', heading: 'Headings', subheading: 'Subheadings', body: 'Body text', caption: 'Small text' };
export const typographyFonts = [
  { value: 'geist', label: 'Geist OKNO · Sustainability', family: '"Geist OKNO", Arial, sans-serif' },
  { value: 'manrope', label: 'Manrope', family: '"Manrope OKNO", Arial, sans-serif' },
  { value: 'bodoni', label: 'Bodoni Moda', family: '"Bodoni OKNO", Georgia, serif' },
  { value: 'system', label: 'System sans serif', family: 'Arial, Helvetica, sans-serif' },
  { value: 'serif', label: 'System serif', family: 'Georgia, "Times New Roman", serif' },
] as const;
export const defaultTypographyFont = typographyFonts[1];
const fontChoices = typographyFonts.map(({ value, label }) => ({ value, label }));
const sectionFontChoices = [{ value: 'inherit', label: 'Use master font' }, ...fontChoices];

export function visibleTextField(field: ContentField) {
  return field.kind === 'text' && !/\.(?:[^.]*alt|href|url|[^.]*accessible[^.]*|[^.]*aria[^.]*|[^.]*navigation-label|model-id|slug|logo|icon|latitude|longitude)$/.test(field.id) && !/destination|description.*image|image.*description|accessib|local path|coordinate|browser icon/i.test(field.label) && !field.id.startsWith('brand.') && field.id !== 'home.publishing.hero' && !/^footer\.social\./.test(field.id);
}
export function sectionScope(pageId: string, sectionId: string) {
  return `${/^hero-v[12]$/.test(pageId) && !['opening', 'ending'].includes(sectionId) ? 'home' : pageId}.${sectionId}`;
}
export function sectionTypographyFields(scope: string): ContentField[] {
  const prefix = `typography.section.${scope}`;
  return [
    ...(['body', 'heading', 'highlight'] as const).map(role => ({ id: `${prefix}.${role}-font`, label: `${role[0].toUpperCase()}${role.slice(1)} font`, kind: 'choice' as const, defaultValue: 'inherit', options: sectionFontChoices })),
    ...typeRoles.flatMap(role => (['desktop', 'mobile'] as const).map(size => ({
      id: `${prefix}.${role}${size === 'mobile' ? '-mobile' : ''}-size`,
      label: `${typeRoleLabels[role]} · ${size === 'mobile' ? 'phone' : 'desktop'} font size (px)`,
      kind: 'text' as const, defaultValue: '',
      help: `Optional number from 6 to 400. Leave blank to keep this section's original responsive size. ${size === 'mobile' ? 'Phone applies at widths of 700px and below.' : 'Desktop applies above 700px.'}`,
    }))),
  ];
}
export const masterTypographySection: ContentSection = {
  id: 'typography', label: 'Master font', note: 'The master font applies across the website, including Signature and Bespoke. Logo artwork stays unchanged. Each page keeps its original responsive text sizes. Optional numeric size overrides live inside each section.',
  fields: [
    { id: 'typography.master-font', label: 'Master font', kind: 'choice', defaultValue: defaultTypographyFont.value, options: fontChoices },
  ],
};
export function withTypography(pages: readonly ContentPage[]): ContentPage[] {
  return pages.map(page => ({ ...page, sections: [
    ...(page.id === 'shared' ? [masterTypographySection] : []),
    ...page.sections.map(section => ({ ...section, typography: page.id !== 'configurators' && (section.fields.some(visibleTextField) || page.id === 'projects' && ['globe-pins', 'project-library'].includes(section.id)) ? sectionTypographyFields(sectionScope(page.id, section.id)) : undefined })),
  ], children: page.children ? withTypography(page.children) : undefined }));
}
export type TypographyBinding = { scope: string; fields: string[] };
export function typographyBindings(pages: readonly ContentPage[]): TypographyBinding[] {
  const bindings = new Map<string, Set<string>>();
  function visit(page: ContentPage) {
    for (const section of page.sections) {
      if (!section.typography?.length) continue;
      const scope = sectionScope(page.id, section.id);
      const fields = bindings.get(scope) ?? new Set<string>();
      section.fields.filter(visibleTextField).filter(field => !field.id.startsWith('typography.')).forEach(field => fields.add(field.id));
      bindings.set(scope, fields);
    }
    page.children?.forEach(visit);
  }
  pages.forEach(visit);
  return [...bindings].map(([scope, fields]) => ({ scope, fields: [...fields] }));
}
function fontFamily(value: string | undefined) { return typographyFonts.find(font => font.value === value)?.family; }
export function isTypographySizeField(id: string) {
  return /^typography\.section\.[a-z0-9.-]+\.(?:display|heading|subheading|body|caption)(?:-mobile)?-size$/.test(id);
}
function numericSize(value: string | undefined) {
  return value && typographyValueError('typography.section.any.body-size', value) === null ? `${Number(value)}px` : 'initial';
}
export function typographyCss(values: Record<string, string>, bindings: TypographyBinding[]) {
  const root = [`--type-font-master:${fontFamily(values['typography.master-font']) ?? defaultTypographyFont.family}`];
  const rules = [`html[data-site-typography]{${root.join(';')}}`];
  const phoneRules: string[] = [];
  for (const binding of bindings) {
    const prefix = `typography.section.${binding.scope}`;
    const declarations: string[] = [];
    for (const role of ['body', 'heading', 'highlight']) {
      const family = fontFamily(values[`${prefix}.${role}-font`]);
      // Reset at every section boundary so a nested section never inherits its parent's override.
      declarations.push(`--type-font-${role}:${family ?? (role === 'highlight' ? 'var(--type-font-heading, var(--type-font-master))' : 'var(--type-font-master)')}`);
    }
    for (const role of typeRoles) {
      // An invalid custom property makes var() use each declaration's authored
      // fallback, including its original clamps and media-query sizes.
      declarations.push(`--type-size-${role}:${numericSize(values[`${prefix}.${role}-size`])}`);
    }
    const selectors = [`[data-type-section="${binding.scope}"]`, ...binding.fields.map(id => `[data-type-field="${id}"]`)];
    rules.push(`html[data-site-typography] :is(${selectors.join(',')}){${declarations.join(';')}}`);
    const phone = typeRoles.map(role => `--type-size-${role}:${numericSize(values[`${prefix}.${role}-mobile-size`])}`);
    phoneRules.push(`html[data-site-typography] :is(${selectors.join(',')}){${phone.join(';')}}`);
  }
  rules.push(`@media(max-width:700px){${phoneRules.join('\n')}}`);
  return rules.join('\n');
}
export function typographyValueError(id: string, value: string): string | null | undefined {
  if (!isTypographySizeField(id)) return undefined;
  if (value === '') return null;
  return /^\d+(?:\.\d)?$/.test(value) && Number(value) >= 6 && Number(value) <= 400 ? null : 'Enter a size from 6 to 400 pixels (up to one decimal place), or leave blank for the original size.';
}
export function validateTypographySizes(values: Record<string, string>) {
  for (const [id, value] of Object.entries(values)) {
    const error = typographyValueError(id, value);
    if (error) throw new Error(error);
  }
}
