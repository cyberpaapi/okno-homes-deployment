import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ComponentType, ReactNode } from 'react';
import type { ContentItem } from '@/lib/contentCollections';
import { initialTestimonialItems, testimonialCollectionId, testimonialDisclosureId } from '@/lib/testimonialCollections';

vi.mock('@/components/Header/Header', () => ({ default: () => <header>Site navigation</header> }));
vi.mock('@/components/projects/21st/SilkBackground', () => ({ SilkBackground: () => <div /> }));
vi.mock('@/components/ui/SubtleAction', () => ({ SubtleLink: ({ children, href, className }: { children: ReactNode; href: string; className?: string }) => <a href={href} className={className}>{children}</a> }));
const publication = vi.hoisted(() => ({ revision: 0, published: {} as Record<string, string>, publishedCollections: {} as Record<string, ContentItem[]> }));
vi.mock('@/lib/publicContent', () => ({ readPublicContent: vi.fn(async () => publication) }));

const parentDescriptor = Object.getOwnPropertyDescriptor(window, 'parent')!;
const locationDescriptor = Object.getOwnPropertyDescriptor(window, 'location')!;
let Page: ComponentType<{ initialItems?: ContentItem[]; initialValues?: Record<string, string> }>;
let viewport = 600;
const scrollTo = vi.fn(function (this: HTMLElement, options: ScrollToOptions) {
  this.scrollLeft = options.left ?? 0;
  this.dispatchEvent(new Event('scroll'));
});
const region = () => screen.getByRole('region', { name: 'Testimonial stories' });
const progress = () => document.querySelector('[data-testimonial-progress]')!;

beforeEach(async () => {
  vi.resetModules();
  vi.useFakeTimers();
  publication.revision = 0; publication.published = {}; publication.publishedCollections = {};
  viewport = 600;
  scrollTo.mockClear();
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ status: 200, ok: true, json: async () => publication }));
  vi.stubGlobal('matchMedia', vi.fn((query: string) => ({ matches: query.includes('max-width'), addEventListener() {}, removeEventListener() {} })));
  vi.stubGlobal('IntersectionObserver', class { constructor(private callback: (entries: object[]) => void) {} observe() { this.callback([{ isIntersecting: true, intersectionRatio: 1 }]); } unobserve() {} disconnect() {} });
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(() => viewport);
  vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockImplementation(function (this: HTMLElement) { return Math.max(viewport, this.querySelectorAll('[data-testimonial-card]').length * 300); });
  vi.spyOn(HTMLElement.prototype, 'offsetLeft', 'get').mockImplementation(function (this: HTMLElement) { return Array.from(this.parentElement?.children ?? []).indexOf(this) * 300; });
  Object.defineProperty(HTMLElement.prototype, 'scrollTo', { configurable: true, value: scrollTo });
  Page = (await import('./TestimonialsExperience')).default;
});
afterEach(() => {
  cleanup();
  Object.defineProperty(window, 'parent', parentDescriptor);
  Object.defineProperty(window, 'location', locationDescriptor);
  vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers();
});

function embed() {
  const parent = { postMessage: vi.fn() };
  Object.defineProperty(window, 'parent', { configurable: true, value: parent });
  Object.defineProperty(window, 'location', { configurable: true, value: new URL('http://127.0.0.1:3134/testimonials') });
  return parent;
}
function preview(parent: ReturnType<typeof embed>, values: Record<string, string>, items: ContentItem[], origin = 'http://127.0.0.1:3140') {
  act(() => window.dispatchEvent(new MessageEvent('message', { source: parent as unknown as Window, origin, data: { type: 'OKNO_CMS_PREVIEW', values, collections: { [testimonialCollectionId]: items } } })));
}

describe('Testimonials CMS consumers', () => {
  it('seeds SSR from published values and preserves explicit empty reviews without changing robots', async () => {
    publication.published = { 'testimonials.heading': 'Published stories', [testimonialDisclosureId]: 'hidden' };
    publication.publishedCollections = { [testimonialCollectionId]: [] };
    const { default: route, metadata } = await import('@/app/testimonials/page');
    const element = await route();
    expect(element.props.initialItems).toEqual([]);
    expect(element.props.initialValues).toEqual(publication.published);
    render(element);
    await act(async () => {});
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Published stories');
    expect(within(region()).queryAllByRole('listitem')).toHaveLength(0);
    expect(document.querySelector('[data-type-section="testimonials.disclosure"]')).toBeNull();
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
  it('accepts trusted draft copy, reviews and disclosure choices, with no hidden notice wrapper or margins', async () => {
    const parent = embed();
    render(<Page />);
    await act(async () => {});
    expect(parent.postMessage).toHaveBeenCalledWith({ type: 'OKNO_CMS_PREVIEW_READY' }, 'http://127.0.0.1:3134');
    expect(within(region()).getAllByRole('listitem')).toHaveLength(6);
    const updated = [{ id: 'approved-review', fields: { quote: 'A real fixture quote', name: 'Approved fixture name', locationLine1: 'Town', locationLine2: 'District', image: '/assets/projects/real-v1/lakewood-01.webp', imageAlt: 'Fixture house' } }];
    preview(parent, { 'testimonials.heading': 'Your stories', 'testimonials.introduction': 'Edited introduction', 'testimonials.closing.heading': 'Start a brief', 'testimonials.closing.body': 'Edited invitation', 'testimonials.closing.enquiry-label': 'Enquire now', 'testimonials.closing.models-label': 'View models', [testimonialDisclosureId]: 'hidden' }, updated);
    expect(screen.getByRole('heading', { level: 1, name: 'Your stories' })).toBeInTheDocument();
    expect(screen.getByText('Edited introduction')).toBeInTheDocument();
    expect(region().querySelector('blockquote')).toHaveTextContent('“A real fixture quote”');
    expect(screen.getByText('Approved fixture name')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Fixture house' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Enquire now' })).toHaveAttribute('href', '/enquiry');
    expect(screen.getByRole('link', { name: 'View models' })).toHaveAttribute('href', '/models');
    expect(document.querySelector('[data-type-section="testimonials.disclosure"]')).toBeNull();
    expect(region().previousElementSibling).toHaveAttribute('id'); // only the existing visually-hidden help remains
    preview(parent, { [testimonialDisclosureId]: 'shown', 'testimonials.disclosure.copy': 'Edited disclosure' }, updated);
    expect(screen.getByText('Edited disclosure')).toHaveAttribute('data-type-section', 'testimonials.disclosure');
    preview(parent, { [testimonialDisclosureId]: 'hidden' }, [], 'https://untrusted.example');
    expect(screen.getByText('Edited disclosure')).toBeInTheDocument();
  });
  it('ignores draft messages outside a trusted embedded admin and displays published changes only', async () => {
    publication.published = { 'testimonials.heading': 'Public heading' };
    publication.publishedCollections = { [testimonialCollectionId]: initialTestimonialItems.slice(0, 2) };
    render(<Page />);
    await act(async () => {});
    act(() => window.dispatchEvent(new MessageEvent('message', { source: window, origin: window.location.origin, data: { type: 'OKNO_CMS_PREVIEW', values: { 'testimonials.heading': 'Private heading' }, collections: { [testimonialCollectionId]: [] } } })));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Public heading');
    expect(within(region()).getAllByRole('listitem')).toHaveLength(2);
  });
  it.each([0, 1, 6])('keeps %i reviews safe when the rail cannot advance', async count => {
    if (count === 6) viewport = 1800;
    render(<Page initialItems={initialTestimonialItems.slice(0, count)} />);
    await act(async () => {});
    for (const name of ['Previous testimonial', 'Next testimonial', 'Automatic testimonial rotation']) expect(screen.getByRole('button', { name })).toBeDisabled();
    expect(progress()).toHaveAttribute('data-running', 'false');
    expect(within(region()).queryAllByRole('listitem')).toHaveLength(count);
  });
  it('remeasures, clamps and restarts a fresh clock after reviews are edited or removed', async () => {
    const parent = embed();
    render(<Page />);
    await act(async () => {});
    fireEvent.keyDown(region(), { key: 'End' });
    act(() => vi.advanceTimersByTime(736));
    fireEvent.pointerDown(screen.getByRole('heading', { level: 1 }));
    act(() => vi.advanceTimersByTime(180));
    expect(region().scrollLeft).toBe(3300);
    const oldProgress = progress();
    preview(parent, {}, initialTestimonialItems.slice(0, 3));
    expect(region().scrollLeft).toBe(900);
    expect(progress()).not.toBe(oldProgress);
    act(() => vi.advanceTimersByTime(180));
    expect(progress()).toHaveAttribute('data-running', 'true');
    preview(parent, {}, []);
    expect(region().scrollLeft).toBe(0);
    expect(progress()).toHaveAttribute('data-running', 'false');
    expect(screen.queryByText(initialTestimonialItems[0].fields.name)).not.toBeInTheDocument();
    preview(parent, {}, [{ id: 'incomplete', fields: { name: 'Draft only' } }]);
    expect(screen.getByText('Draft only')).toBeInTheDocument();
    expect(within(region()).queryByRole('img')).not.toBeInTheDocument();
  });
  it('keeps the six-second countdown alive through unchanged public polls and later global revisions', async () => {
    render(<Page />);
    await act(async () => {});
    const clock = progress();
    publication.revision = 1;
    publication.publishedCollections = { [testimonialCollectionId]: initialTestimonialItems.map(item => ({ ...item, fields: { ...item.fields } })) };
    await act(async () => { await vi.advanceTimersByTimeAsync(15000); });
    expect(progress()).toBe(clock);
    expect(progress()).toHaveAttribute('data-running', 'true');
    fireEvent(progress(), new Event('webkitAnimationEnd', { bubbles: true }));
    act(() => vi.advanceTimersByTime(736));
    expect(region().scrollLeft).toBe(2100);
  });
  it('connects real quote, name, location and page font consumers to the registered choices', async () => {
    render(<Page initialValues={{ 'typography.section.testimonials.introduction.heading-font': 'govandi', 'typography.section.testimonials.reviews.body-font': 'system', 'typography.section.testimonials.reviews.heading-font': 'kento', 'typography.section.testimonials.reviews.highlight-font': 'govandi' }} />);
    await act(async () => {});
    expect(document.querySelector('[data-type-section="testimonials.introduction"]')).toHaveStyle({ '--testimonial-heading-font': 'var(--okno-font-govandi)' });
    expect(document.querySelector('[data-type-section="testimonials.reviews"]')).toHaveStyle({ '--testimonial-body-font': 'Arial, Helvetica, sans-serif', '--testimonial-heading-font': 'var(--okno-font-kento)', '--testimonial-highlight-font': 'var(--okno-font-govandi)' });
    expect(region().querySelector('blockquote p')).toHaveTextContent(initialTestimonialItems[0].fields.quote);
    expect(region().querySelector('figcaption p')).toHaveTextContent(initialTestimonialItems[0].fields.name);
    expect(region().querySelector('figcaption p:last-child')).toHaveTextContent(initialTestimonialItems[0].fields.locationLine1);
  });
});
