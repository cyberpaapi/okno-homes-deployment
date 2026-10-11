import type { ImageLoaderProps } from 'next/image';
import photographs from '../../config/page-images.json';

type Variant = { width: number; src: string };
const variants: Record<string, Variant[]> = photographs;

/** Static photographs avoid a cold image-conversion request. CMS uploads stay live. */
export function pageImageLoader({ src, width, quality }: ImageLoaderProps) {
  const prepared = variants[src];
  if (prepared?.length) return (prepared.find(image => image.width >= width) ?? prepared[prepared.length - 1]).src;
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality ?? 75}`;
}
