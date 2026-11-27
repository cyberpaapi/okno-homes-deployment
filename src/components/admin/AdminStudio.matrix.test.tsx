import { fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { adminPages, allContentFields, type ContentField, type ContentPage, type ContentSection } from '@/data/adminContent';
import { journalDefaultCollections } from '@/lib/journalCollections';
import { homeVariantDefaults } from '@/data/homeVariants';
import { isTypographySizeField } from '@/lib/typography';
import { PREVIEW_UPDATE } from '@/lib/sitePreview';
import AdminStudio from './AdminStudio';

// This contract exercises the real disconnected editor and source-default
// collections. It does not authenticate, upload, save, publish, load iframe
// content, or establish layout/physical-device acceptance. Collection mutations
// have separate CollectionEditor/ProjectsHospitalityEditors/GlobePinsEditor/
// JournalArticleCollectionEditor/SignatureModelPanel/ConfiguratorPrices tests.
const planTypographyRoles = new Set([
  'body-font', 'heading-font', 'heading-size', 'heading-mobile-size',
  'subheading-size', 'subheading-mobile-size', 'caption-size', 'caption-mobile-size',
]);
const legacyJournalIds = new Set([
  ...journalDefaultCollections()['journal.press'], ...journalDefaultCollections()['journal.notes'],
].map(item => item.id));
const footerLinkSections = new Set(['footer-homes', 'footer-explore', 'footer-okno']);

function flatten(pages: readonly ContentPage[]): ContentPage[] {
  return pages.flatMap(page => [page, ...flatten(page.children ?? [])]);
}
const registeredPages = flatten(adminPages);
const selectablePages = registeredPages.filter(page => page.id !== 'configurators' && (page.sections.length > 0 || !page.children?.length));

// Explicit exclusions describe the existing migration/deferment contract;
// unknown missing controls are failures rather than new implicit exceptions.
function excludedReason(page: ContentPage, section: ContentSection, field: ContentField, typography: boolean): string | null {
  if (page.id === 'configurators') return 'Deferred navigation editor; active model setup is inside SignatureModelPanel.';
  if (page.id === 'hero-v1' && section.id === 'opening') return 'V1 opening has one editing source in the home.variants collection.';
  if (page.id === 'journal' && (legacyJournalIds.has(section.id) || section.id.startsWith('post-'))) return 'Legacy story scalars are replaced by the ordered Journal collections.';
  if (page.id === 'projects' && section.id.startsWith('project-') && section.id !== 'project-library') return 'Legacy Project scalars are replaced by projects.records.';
  if (page.id === 'footer' && footerLinkSections.has(section.id) && !typography && !field.id.endsWith('.heading')) return 'Footer link scalars are replaced by ordered footer.links collections.';
  if (page.id === 'signature' && section.id.includes('-plan-')) {
    if (!typography) return 'Plan content is edited once through model-owned signature.plans controls.';
    if (!planTypographyRoles.has(field.id.split('.').at(-1)!)) return 'No public plan consumer for display/body-size/highlight controls; supported typography remains active.';
  }
  return null;
}
function fieldContract(page: ContentPage) {
  return page.sections.flatMap(section => [
    ...section.fields.map(field => ({ field, sectionId: section.id, reason: excludedReason(page, section, field, false) })),
    ...(section.typography ?? []).map(field => ({ field, sectionId: section.id, reason: excludedReason(page, section, field, true) })),
  ]);
}
function persistedOnlyReason(id: string): string | null {
  if (id === 'hero-v1.opening.ambient-video') return 'Retired ambient-loop scalar retained for saved-data compatibility.';
  if (/^projects\.[a-z0-9-]+\.(?:title|description|preview|image-\d+\.(?:src|alt)|film-\d+\.(?:src|poster|title))$/.test(id)) return 'Project migration scalar retained by the validator; projects.records owns the editor.';
  if (/^journal\.entry-[a-z0-9-]+\.(?:source|date|title|image|alt|credit|byline|summary|href|logo)$/.test(id)) return 'Press/note migration scalar retained by the validator; Journal collections own the editor.';
  if (/^journal\.post-[a-z0-9-]+\.(?:category|title|excerpt|image|alt|detail-image|detail-alt)$/.test(id)) return 'Article migration scalar retained by the validator; journal.articles owns the editor.';
  if (/^enquiry\.(?:home|hospitality|press)\.[a-z-]+\.option-\d+$/.test(id)) return 'Form option migration scalar retained by the validator; enquiry.options collections own the editor.';
  return null;
}

function selectPage(container: HTMLElement, page: ContentPage) {
  const nav = container.querySelector<HTMLElement>('#admin-page-nav')!;
  const label = page.children?.some(child => child.id !== 'configurators') ? `${page.label} overview` : page.label;
  const matches = Array.from(nav.querySelectorAll<HTMLButtonElement>('button')).filter(button => button.firstElementChild?.textContent === label);
  expect(matches, `navigation target ${page.id}`).toHaveLength(1);
  let group = matches[0].parentElement?.closest('details');
  while (group) {
    if (!group.open) fireEvent.click(group.querySelector('summary')!);
    group = group.parentElement?.closest('details') ?? null;
  }
  fireEvent.click(matches[0]);
  expect(matches[0]).toHaveAttribute('data-selected', 'true');
}
function idIndex(container: HTMLElement) {
  const index = new Map<string, HTMLElement[]>();
  container.querySelectorAll<HTMLElement>('[id]').forEach(node => index.set(node.id, [...(index.get(node.id) ?? []), node]));
  return index;
}
function actionName(node: HTMLElement): string {
  const labelledBy = node.getAttribute('aria-labelledby');
  if (labelledBy) return labelledBy.split(/\s+/).map(id => document.getElementById(id)?.textContent ?? '').join(' ').trim();
  if (node.hasAttribute('aria-label')) return node.getAttribute('aria-label')!.trim();
  const copy = node.cloneNode(true) as HTMLElement;
  copy.querySelectorAll('[aria-hidden="true"]').forEach(child => child.remove());
  return copy.textContent?.replace(/\s+/g, ' ').trim() ?? '';
}

beforeEach(() => {
  vi.spyOn(globalThis, 'fetch').mockImplementation(() => { throw new Error('Admin matrix prohibits network/CMS requests.'); });
});
afterEach(() => { vi.restoreAllMocks(); });

describe('admin matrix registry boundaries', () => {
  it('sends the unsaved Hospitality palette through the existing draft preview without a CMS request', () => {
    const { container } = render(<AdminStudio />);
    selectPage(container, registeredPages.find(page => page.id === 'hospitality')!);
    const group = container.querySelector('[id="hospitality.background"]')!;
    const radios = Array.from(group.querySelectorAll<HTMLButtonElement>('button[role="radio"]'));
    const frame = container.querySelector('iframe')!;
    const preview = vi.spyOn(frame.contentWindow!, 'postMessage');
    expect(radios[0]).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(radios[1]);
    expect(radios[1]).toHaveAttribute('aria-checked', 'true');
    expect(preview).toHaveBeenLastCalledWith(expect.objectContaining({ type: PREVIEW_UPDATE, values: expect.objectContaining({ 'hospitality.background': 'pearl' }) }), new URL(frame.src).origin);
    fireEvent.keyDown(radios[1], { key: 'Home' });
    expect(radios[0]).toHaveFocus();
    expect(radios[0]).toHaveAttribute('aria-checked', 'true');
    expect(preview).toHaveBeenLastCalledWith(expect.objectContaining({ type: PREVIEW_UPDATE, values: expect.objectContaining({ 'hospitality.background': 'forest' }) }), new URL(frame.src).origin);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('accounts explicitly for every registered scalar and excluded navigation page', () => {
    const located = new Set(registeredPages.flatMap(page => fieldContract(page).map(row => row.field.id)));
    for (const field of allContentFields()) {
      expect(located.has(field.id) || persistedOnlyReason(field.id), `Unexplained registry-only scalar: ${field.id}`).toBeTruthy();
    }
    expect(registeredPages.filter(page => !selectablePages.includes(page)).map(page => page.id).sort()).toEqual(['configurators', 'home']);
    expect(registeredPages.find(page => page.id === 'home')!.sections).toHaveLength(0); // hierarchy group, no editor page
    expect(selectablePages.some(page => page.id === 'testimonials')).toBe(true);
    expect(selectablePages.find(page => page.id === 'signature')!.sections.filter(section => section.id.includes('-plan-'))).toHaveLength(9);
  });
});

describe.each(selectablePages.map(page => ({ page, id: page.id })))('admin matrix $id', ({ page }) => {
  it('selects the page with the matching heading and both draft preview targets', () => {
    const { container } = render(<AdminStudio />);
    selectPage(container, page);
    expect(container.querySelector('main h1')?.textContent).toBe(page.label);
    const assertFrame = (title: string) => {
      const frames = container.querySelectorAll('iframe');
      expect(frames).toHaveLength(1);
      expect(frames[0]).toHaveAttribute('title', title);
      expect(frames[0].src).toBe(new URL(page.href, window.location.origin).href);
      expect(frames[0]).toHaveAttribute('loading', 'eager');
      expect(frames[0]).toHaveAttribute('allow', 'autoplay; fullscreen');
    };
    assertFrame(`${page.label} draft preview`);
    const openPage = container.querySelector<HTMLAnchorElement>('main header a')!;
    expect(openPage.href).toBe(new URL(page.href, window.location.origin).href);
    fireEvent.click(container.querySelector('#admin-site-tab')!);
    assertFrame(`${page.label} draft site preview`);
    expect(container.querySelector('#admin-site-tab')).toHaveAttribute('aria-selected', 'true');
    fireEvent.click(container.querySelector('#admin-content-tab')!);
    assertFrame(`${page.label} draft preview`);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('renders every active scalar once with its correct label/shape and disables disconnected saving', () => {
    const { container } = render(<AdminStudio />);
    selectPage(container, page);
    const ids = idIndex(container);
    const duplicates = [...ids].filter(([, nodes]) => nodes.length !== 1).map(([id]) => id);
    expect(duplicates, `${page.id}: duplicate DOM IDs`).toEqual([]);
    const rows = fieldContract(page);
    const active = rows.filter(row => !row.reason);
    expect(new Set(active.map(row => row.field.id)).size).toBe(active.length);
    for (const { field } of active) {
      const control = ids.get(field.id)?.[0];
      expect(control, `${page.id}: missing active ${field.id}`).toBeDefined();
      const label = ids.get(`${field.id}-label`)?.[0] as HTMLLabelElement;
      expect(label?.tagName, `${field.id}: label`).toBe('LABEL');
      expect(label.textContent, field.id).toBe(field.label);
      const dynamicSelect = field.id === 'home.publishing.hero' || field.id === 'journal.hero.featured-id';
      if (field.kind === 'choice' && !field.id.startsWith('typography.') && !dynamicSelect) {
        expect(control).toHaveAttribute('role', 'radiogroup');
        expect(control).toHaveAttribute('aria-labelledby', label.id);
        const radios = Array.from(control!.querySelectorAll<HTMLButtonElement>('button[role="radio"]'));
        expect(radios.map(radio => radio.textContent)).toEqual(field.options!.map(option => option.label));
        expect(radios.filter(radio => radio.getAttribute('aria-checked') === 'true')).toHaveLength(1);
        expect(radios[field.options!.findIndex(option => option.value === field.defaultValue)]).toHaveAttribute('aria-checked', 'true');
      } else {
        expect(label.htmlFor, field.id).toBe(field.id);
        expect(label.control, `${field.id}: activation target`).toBe(control);
        const native = control as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
        expect(native.value, field.id).toBe(field.defaultValue);
        if (dynamicSelect || field.kind === 'choice') {
          expect(native.tagName, field.id).toBe('SELECT');
          if (field.options) expect(Array.from((native as HTMLSelectElement).options).map(option => ({ value: option.value, label: option.label }))).toEqual(field.options);
          if (field.id === 'home.publishing.hero') expect(Array.from((native as HTMLSelectElement).options).map(option => option.value)).toEqual(homeVariantDefaults.map(item => item.id));
          if (field.id === 'journal.hero.featured-id') expect(Array.from((native as HTMLSelectElement).options).map(option => option.value)).toEqual(['none', ...journalDefaultCollections()['journal.press'].filter(item => item.fields.visibility !== 'hidden').map(item => item.id)]);
        } else if (isTypographySizeField(field.id)) {
          expect(native.tagName).toBe('INPUT');
          expect(native).toHaveAttribute('type', 'number');
          expect(native).toHaveAttribute('min', '6');
          expect(native).toHaveAttribute('max', '400');
          expect(native).toHaveAttribute('step', '0.1');
        } else if (field.kind === 'image' || field.kind === 'video') {
          expect(native.tagName).toBe('INPUT');
          expect(native).toHaveAttribute('aria-label', `${field.label} local path`);
        } else {
          expect(native.tagName, field.id).toBe('TEXTAREA');
        }
      }
    }
    for (const { field, reason } of rows.filter(row => row.reason)) {
      expect(ids.has(field.id), `${field.id} should be absent: ${reason}`).toBe(false);
    }
    const buttons = Array.from(container.querySelectorAll<HTMLButtonElement>('button'));
    expect(buttons.filter(button => !actionName(button)).map(button => button.outerHTML), `${page.id}: unnamed action`).toEqual([]);
    const saves = buttons.filter(button => /^Save(?:\s|$)/.test(actionName(button)));
    expect(saves.length, `${page.id}: expected draft/collection save actions`).toBeGreaterThan(0);
    saves.forEach(button => expect(button, actionName(button)).toBeDisabled());
    const publish = buttons.filter(button => /^Publish(?:\s|$)/.test(actionName(button)));
    expect(publish).toHaveLength(1);
    expect(publish[0]).toBeDisabled();
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});
