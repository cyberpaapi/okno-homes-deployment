import type { ImageLoaderProps } from 'next/image';
import thumbnails from '../../config/thumbnail-images.json';

const variants: Record<string, { width: number; src: string }[]> = thumbnails;

function compactImage(src: string, width: number, maximum: number) {
  const requested = Math.min(width, maximum);
  const prepared = variants[src];
  if (prepared?.length) return (prepared.find(image => image.width >= requested) ?? prepared[prepared.length - 1]).src;
  // CMS replacements retain optimization, with caps valid for Next's image API.
  return `/_next/image?url=${encodeURIComponent(src)}&w=${requested}&q=60`;
}

/** Small cards and thumbnail strips never need a full-screen photograph. */
export function thumbnailImageLoader({ src, width }: ImageLoaderProps) {
  return compactImage(src, width, 480);
}

/** Larger editorial previews retain extra detail without gallery-size downloads. */
export function previewImageLoader({ src, width }: ImageLoaderProps) {
  return compactImage(src, width, 1080);
}
