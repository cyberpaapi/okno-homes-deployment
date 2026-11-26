import type { Metadata } from "next";
import TestimonialsExperience from "@/components/testimonials/TestimonialsExperience";
import { readPublicContent } from '@/lib/publicContent';
import { initialTestimonialItems, testimonialCollectionId } from '@/lib/testimonialCollections';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "OKNO — Testimonials",
  description: "Illustrative modular-home stories for the OKNO testimonials page preview.",
  robots: { index: false, follow: false },
};

export default async function TestimonialsPage() {
  const { published, publishedCollections } = await readPublicContent();
  return <TestimonialsExperience initialValues={published} initialItems={publishedCollections[testimonialCollectionId] ?? initialTestimonialItems} />;
}
