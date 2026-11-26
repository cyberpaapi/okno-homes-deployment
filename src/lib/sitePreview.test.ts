import { afterEach, describe, expect, it, vi } from 'vitest';
import { announcePreviewReady, isEmbeddedSitePreview, PREVIEW_READY } from './sitePreview';

const parentDescriptor = Object.getOwnPropertyDescriptor(window, 'parent')!;
afterEach(() => {
  Object.defineProperty(window, 'parent', parentDescriptor);
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('preview readiness', () => {
  it('does not notify a parent on standalone pages', () => {
    const post = vi.spyOn(window, 'postMessage');
    expect(isEmbeddedSitePreview()).toBe(false);
    announcePreviewReady();
    expect(post).not.toHaveBeenCalled();
  });

  it.each([
    ['http://127.0.0.1:3134/admin', 'http://127.0.0.1:3134'],
    ['http://127.0.0.1:3140/', 'http://127.0.0.1:3140'],
    ['http://localhost:3140/', 'http://localhost:3140'],
  ])('notifies the actual trusted parent at %s', (referrer, targetOrigin) => {
    const postMessage = vi.fn();
    vi.stubGlobal('window', {
      parent: { postMessage },
      location: new URL('http://127.0.0.1:3134/about'),
    });
    vi.spyOn(document, 'referrer', 'get').mockReturnValue(referrer);
    announcePreviewReady();
    expect(postMessage).toHaveBeenCalledWith({ type: PREVIEW_READY }, targetOrigin);
  });

  it('does not direct readiness to an unrelated referrer', () => {
    const postMessage = vi.fn();
    vi.stubGlobal('window', {
      parent: { postMessage },
      location: new URL('https://okno.example/about'),
    });
    vi.spyOn(document, 'referrer', 'get').mockReturnValue('https://untrusted.example/');
    announcePreviewReady();
    expect(postMessage).toHaveBeenCalledWith({ type: PREVIEW_READY }, 'https://okno.example');
  });
});
