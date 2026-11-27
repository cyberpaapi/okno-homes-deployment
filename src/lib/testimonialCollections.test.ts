import { describe, expect, it } from 'vitest';
import { testimonials } from '@/data/testimonials';
import { initialTestimonialItems, testimonialsFromItems, testimonialSectionStyle } from './testimonialCollections';

describe('testimonial publication mapping', () => {
  it('preserves all six approved preview records and their stable order', () => {
    expect(testimonialsFromItems(initialTestimonialItems)).toEqual(testimonials.map(review => Object.fromEntries(Object.entries(review).filter(([key]) => key !== 'status'))));
    expect(initialTestimonialItems).toHaveLength(6);
  });
  it('keeps an explicit empty collection empty and incomplete drafts honest', () => {
    expect(testimonialsFromItems([])).toEqual([]);
    expect(testimonialsFromItems([{ id: 'new-review', fields: { name: 'New name' } }])).toEqual([
      { id: 'new-review', name: 'New name', quote: '', location: ['', ''], image: { src: '', alt: '' } },
    ]);
    for (const image of ['partly typed path', 'https://example.com/house.webp', '//example.com/house.webp', '/private/../house.webp']) expect(testimonialsFromItems([{ id: 'draft', fields: { image } }])[0].image.src).toBe('');
  });
  it('uses registered font choices without replacing approved defaults or accepting CSS injection', () => {
    expect(testimonialSectionStyle({}, 'reviews')).toMatchObject({ '--testimonial-body-font': '"Manrope OKNO", Arial, sans-serif', '--testimonial-heading-font': '"Manrope OKNO", Arial, sans-serif' });
    expect(testimonialSectionStyle({}, 'introduction')).toHaveProperty('--testimonial-heading-font', 'var(--okno-font-kento)');
    expect(testimonialSectionStyle({ 'typography.master-font': 'govandi', 'typography.section.testimonials.reviews.heading-font': 'kento', 'typography.section.testimonials.reviews.highlight-font': 'system' }, 'reviews')).toMatchObject({
      '--testimonial-body-font': 'var(--okno-font-govandi)', '--testimonial-heading-font': 'var(--okno-font-kento)', '--testimonial-highlight-font': 'Arial, Helvetica, sans-serif',
    });
    expect(testimonialSectionStyle({ 'typography.section.testimonials.reviews.body-font': 'red;display:none' }, 'reviews')).toEqual(testimonialSectionStyle({}, 'reviews'));
  });
  it('uses handwriting only for default quotes and honours saved review and master font choices', () => {
    expect(testimonialSectionStyle({}, 'reviews')).toHaveProperty('--testimonial-quote-font', '"OKNO Handwriting", "Manrope OKNO", Arial, sans-serif');
    expect(testimonialSectionStyle({}, 'introduction')).toHaveProperty('--testimonial-quote-font', '"Manrope OKNO", Arial, sans-serif');
    expect(testimonialSectionStyle({ 'typography.master-font': 'govandi' }, 'reviews')).toHaveProperty('--testimonial-quote-font', 'var(--okno-font-govandi)');
    expect(testimonialSectionStyle({ 'typography.master-font': 'govandi', 'typography.section.testimonials.reviews.body-font': 'system' }, 'reviews')).toHaveProperty('--testimonial-quote-font', 'Arial, Helvetica, sans-serif');
    expect(testimonialSectionStyle({ 'typography.master-font': 'govandi', 'typography.section.testimonials.reviews.body-font': 'inherit' }, 'reviews')).toHaveProperty('--testimonial-quote-font', 'var(--okno-font-govandi)');
  });
});
