import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AdminStudio from './AdminStudio';
import ForzaExperience from '@/components/models/ForzaExperience';
import { adminPages } from '@/data/adminContent';
import { signatureBaseModels, signatureModelDefaults, signaturePlanDefaults } from '@/lib/signatureCollections';
import { initialTestimonialItems, testimonialCollectionId } from '@/lib/testimonialCollections';
import { typographyBindings, typographyCss } from '@/lib/typography';

const cms = vi.hoisted(() => ({ values: {} as Record<string, string> }));
const upload = vi.hoisted(() => vi.fn(async () => ({ url: '/assets/projects/real-v1/lakewood-01.webp' })));
vi.mock('@/components/admin/uploadMedia', () => ({ uploadMedia: upload }));
vi.mock('@/lib/useSiteContent', () => ({ useSiteContentMap: () => cms.values, useSiteCollectionsMap: () => ({}), useSiteCollection: (_id: string, fallback: unknown) => fallback }));

beforeEach(() => {
  cms.values = {}; upload.mockClear();
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false, addEventListener() {}, removeEventListener() {} })));
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ revision: 1, draftRevision: 0, published: {}, draft: {}, publishedCollections: {}, draftCollections: {}, history: [] }) }));
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); document.documentElement.removeAttribute('data-site-typography'); });

function navigate(name: string) {
  const hierarchy = screen.getByLabelText('Website page hierarchy');
  fireEvent.click(within(hierarchy).getByRole('button', { name: new RegExp(`^${name}\\d+`) }));
}
function control(id: string) {
  const field = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
  expect(field, `Missing editor control ${id}`).not.toBeNull();
  return field;
}
function collectionFrame() {
  const frame = screen.getByTitle('Testimonials draft preview') as HTMLIFrameElement;
  return { frame, post: vi.spyOn(frame.contentWindow!, 'postMessage') };
}
function latestPreview(post: ReturnType<typeof collectionFrame>['post']) {
  return [...post.mock.calls].reverse().find(([message]) => message.type === 'OKNO_CMS_PREVIEW')?.[0] as { values: Record<string, string>; collections: Record<string, typeof initialTestimonialItems> };
}

describe('Testimonials content studio', () => {
  it('offers mapped page copy, disclosure choice, six review records and only real typography roles', () => {
    render(<AdminStudio />); navigate('Testimonials');
    expect(control('testimonials.heading')).toHaveValue('Testimonials');
    expect(control('testimonials.closing.enquiry-label')).toHaveValue('Talk to OKNO');
    expect(control('testimonials.disclosure.visibility')).toHaveRole('radiogroup');
    expect(control('testimonials.disclosure.visibility')).toHaveAccessibleName('Show fictional-content disclosure');
    expect(document.querySelectorAll('input[id^="testimonials.reviews-"][id$="-name"]')).toHaveLength(6);
    expect(control('testimonials.reviews-weekend-retreat-quote')).toHaveRole('textbox');
    expect(control('testimonials.reviews-weekend-retreat-quote').tagName).toBe('TEXTAREA');
    expect(control('typography.section.testimonials.reviews.body-size')).toHaveRole('spinbutton');
    expect(document.getElementById('typography.section.testimonials.reviews.display-size')).toBeNull();
    expect(screen.getByText('Add review', { selector: 'button' })).toBeDisabled();
  });
  it('edits review content, uploads an image and previews the disclosure choice through existing controls', async () => {
    render(<AdminStudio passwordless />);
    await act(async () => {});
    expect(screen.getByText('Editor connected.')).toBeInTheDocument();
    navigate('Testimonials');
    const { frame, post } = collectionFrame();
    fireEvent.load(frame);
    const quote = control('testimonials.reviews-weekend-retreat-quote');
    fireEvent.change(quote, { target: { value: 'An edited fixture quote.' } });
    fireEvent.change(control('testimonials.reviews-weekend-retreat-name'), { target: { value: 'Fixture name' } });
    fireEvent.change(control('testimonials.reviews-weekend-retreat-locationLine1'), { target: { value: 'Fixture town' } });
    fireEvent.change(control('testimonials.reviews-weekend-retreat-locationLine2'), { target: { value: 'Fixture district' } });
    fireEvent.change(control('testimonials.reviews-weekend-retreat-imageAlt'), { target: { value: 'Fixture image description' } });
    expect(latestPreview(post).collections[testimonialCollectionId][0].fields).toMatchObject({ quote: 'An edited fixture quote.', name: 'Fixture name', locationLine1: 'Fixture town', locationLine2: 'Fixture district', imageAlt: 'Fixture image description' });
    const item = quote.closest('details')!;
    item.open = true;
    const imageInput = item.querySelector('input[type="file"]')!;
    await act(async () => { fireEvent.change(imageInput, { target: { files: [new File(['fixture'], 'house.webp', { type: 'image/webp' })] } }); });
    expect(upload).toHaveBeenCalledOnce();
    expect(control('testimonials.reviews-weekend-retreat-image')).toHaveValue('/assets/projects/real-v1/lakewood-01.webp');
    const disclosure = control('testimonials.disclosure.visibility');
    fireEvent.click(within(disclosure).getByRole('radio', { name: 'Hidden' }));
    expect(latestPreview(post).values['testimonials.disclosure.visibility']).toBe('hidden');
    expect(vi.mocked(fetch).mock.calls.every(([, options]) => !options?.method || options.method === 'GET')).toBe(true);
  });
  it('adds, removes, undoes and reorders review records without saving canonical content', async () => {
    render(<AdminStudio passwordless />);
    await act(async () => {});
    navigate('Testimonials');
    const { frame, post } = collectionFrame();
    fireEvent.load(frame);
    const item = control('testimonials.reviews-weekend-retreat-quote').closest('details')!;
    item.open = true;
    fireEvent.click(within(item).getByRole('button', { name: 'Move down' }));
    expect(latestPreview(post).collections[testimonialCollectionId].slice(0, 2).map(item => item.id)).toEqual(['family-space', 'weekend-retreat']);
    fireEvent.click(within(item).getByRole('button', { name: 'Remove' }));
    expect(document.getElementById('testimonials.reviews-weekend-retreat-name')).toBeNull();
    fireEvent.click(screen.getByText('Undo', { selector: 'button' }));
    expect(control('testimonials.reviews-weekend-retreat-name')).toHaveValue(initialTestimonialItems[0].fields.name);
    fireEvent.click(screen.getByText('Add review', { selector: 'button' }));
    expect(control('testimonials.reviews-new-review-name')).toHaveValue('');
    expect(latestPreview(post).collections[testimonialCollectionId]).toHaveLength(7);
    expect(vi.mocked(fetch).mock.calls.every(([, options]) => !options?.method || options.method === 'GET')).toBe(true);
  });
  it('restores all nine plan typography editors without scalar duplicates or unsupported roles', () => {
    const editor = render(<AdminStudio />);
    navigate('Signature models');
    const controls = Array.from(editor.container.querySelectorAll<HTMLInputElement>('input[id^="typography.section.signature."][id$=".caption-size"]')).filter(input => /-plan-\d+\.caption-size$/.test(input.id));
    expect(controls).toHaveLength(9);
    expect(editor.container.querySelector('[id^="models.signature.forza.variant-"]')).toBeNull();
    expect(document.getElementById('typography.section.signature.forza-plan-1.body-size')).toBeNull();
    const field = control('typography.section.signature.forza-plan-1.caption-size');
    expect(field).toHaveAccessibleName('Small text · desktop font size (px)');
  });
  it('previews an edited supported plan size through a connected isolated roster', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ revision: 1, draftRevision: 0, published: {}, draft: {}, publishedCollections: { 'signature.models': signatureModelDefaults.filter(model => model.id === 'forza'), 'signature.plans': signaturePlanDefaults().filter(plan => plan.fields.modelId === 'forza') }, draftCollections: {}, history: [] }) }));
    render(<AdminStudio passwordless />);
    await act(async () => {});
    navigate('Signature models');
    const field = control('typography.section.signature.forza-plan-1.caption-size');
    const frame = screen.getByTitle('Signature models draft preview') as HTMLIFrameElement;
    const post = vi.spyOn(frame.contentWindow!, 'postMessage');
    fireEvent.change(field, { target: { value: '26' } });
    cms.values = latestPreview(post).values;
    expect(cms.values['typography.section.signature.forza-plan-1.caption-size']).toBe('26');
  });
  it('applies the restored plan caption setting to the actual public Signature plan node', () => {
    cms.values = { 'typography.section.signature.forza-plan-1.caption-size': '26' };
    document.documentElement.setAttribute('data-site-typography', '');
    const publicView = render(<><style>{typographyCss(cms.values, typographyBindings(adminPages).filter(binding => binding.scope === 'signature.forza-plan-1'))}</style><ForzaExperience models={signatureBaseModels} /></>);
    const consumer = publicView.container.querySelector('[data-type-section="signature.forza-plan-1"]')!;
    expect(consumer).not.toBeNull();
    expect(getComputedStyle(consumer).getPropertyValue('--type-size-caption')).toBe('26px');
  });
});
