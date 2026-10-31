import { describe, expect, it } from 'vitest';
import { thumbnailImageLoader, previewImageLoader } from './thumbnailImageLoader';
import { pageImageLoader } from './pageImageLoader';

const source = '/assets/projects/real-v1/kioo-01.webp';

describe('thumbnail image delivery', () => {
  it('caps high-density card requests without reducing the article/gallery rendition', () => {
    expect(thumbnailImageLoader({ src: source, width: 1920 })).toMatch(/\/thumbnail-images\/.*-480\.webp$/);
    expect(previewImageLoader({ src: source, width: 1920 })).toMatch(/\/thumbnail-images\/.*-960\.webp$/);
    expect(pageImageLoader({ src: source, width: 1920 })).toMatch(/\/page-images\/.*-1920\.webp$/);
    expect(thumbnailImageLoader({ src: source, width: 128 })).toMatch(/-128\.webp$/);
  });

  it('also optimizes replacement CMS images with allowed widths and lower quality', () => {
    const src = '/api/site-media/example.webp';
    expect(thumbnailImageLoader({ src, width: 1920 })).toBe('/_next/image?url=%2Fapi%2Fsite-media%2Fexample.webp&w=480&q=60');
    expect(previewImageLoader({ src, width: 1920 })).toContain('&w=1080&q=60');
    expect(pageImageLoader({ src, width: 1920, quality: 90 })).toContain('&w=1920&q=90');
  });
});
