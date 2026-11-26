import type { CSSProperties } from 'react';
import type { ContentItem } from './contentCollections';
import { testimonials, type SampleTestimonial } from '@/data/testimonials';
import { typographyFonts } from './typography';

export const testimonialCollectionId = 'testimonials.reviews';
export const testimonialDisclosureId = 'testimonials.disclosure.visibility';
export const testimonialPageDefaults = {
  heading: 'Testimonials',
  introduction: 'The brief, the build and the everyday details that make a home work.',
  disclosure: 'Preview: names, quotes and locations are fictional. OKNO project photos are illustrative.',
  closingHeading: 'What would home look like for you?',
  closingBody: 'Start with a Signature home, or shape a bespoke brief around your land and the way you live.',
  enquiryLabel: 'Talk to OKNO',
  modelsLabel: 'Explore our homes',
} as const;

export const initialTestimonialItems: ContentItem[] = testimonials.map(review => ({
  id: review.id,
  fields: {
    quote: review.quote, name: review.name,
    locationLine1: review.location[0], locationLine2: review.location[1],
    image: review.image.src, imageAlt: review.image.alt,
  },
}));

export type Testimonial = Omit<SampleTestimonial, 'status'>;

function previewImage(value = '') {
  return value.startsWith('/') && !value.startsWith('//') && !/[\\?#]/.test(value) && !value.includes('..') && /\.(?:png|jpe?g|webp|avif|gif)$/i.test(value) ? value : '';
}

/** Empty and unfinished drafts stay empty; they never borrow another review's identity. */
export function testimonialsFromItems(items: ContentItem[]): Testimonial[] {
  return items.map(item => ({
    id: item.id,
    quote: item.fields.quote ?? '', name: item.fields.name ?? '',
    location: [item.fields.locationLine1 ?? '', item.fields.locationLine2 ?? ''],
    image: { src: previewImage(item.fields.image), alt: item.fields.imageAlt ?? '' },
  }));
}

/** Use the existing registered font choices while retaining this page's approved
 * Manrope reading face when no administrator has selected an override. */
export function testimonialSectionStyle(values: Record<string, string>, section: 'introduction' | 'reviews' | 'disclosure' | 'closing'): CSSProperties {
  const selectedFont = (role: 'body' | 'heading' | 'highlight', fallback: string) => {
    const sectionChoice = values[`typography.section.testimonials.${section}.${role}-font`];
    const choice = sectionChoice && sectionChoice !== 'inherit' ? sectionChoice : values['typography.master-font'];
    return choice && choice !== 'okno' ? typographyFonts.find(font => font.value === choice)?.family ?? fallback : fallback;
  };
  const body = selectedFont('body', '"Manrope OKNO", Arial, sans-serif');
  const heading = selectedFont('heading', section === 'reviews' ? '"Manrope OKNO", Arial, sans-serif' : 'var(--okno-font-kento)');
  return {
    '--testimonial-body-font': body,
    '--testimonial-heading-font': heading,
    '--testimonial-highlight-font': selectedFont('highlight', body),
  } as CSSProperties;
}
