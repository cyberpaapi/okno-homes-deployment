import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { hydrateRoot, type Root } from 'react-dom/client';

const parentDescriptor = Object.getOwnPropertyDescriptor(window, 'parent')!;
const locationDescriptor = Object.getOwnPropertyDescriptor(window, 'location')!;

beforeEach(() => {
  vi.resetModules();
  vi.useFakeTimers();
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ status: 204, ok: true }));
});
afterEach(() => {
  cleanup();
  Object.defineProperty(window, 'parent', parentDescriptor);
  Object.defineProperty(window, 'location', locationDescriptor);
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

function embed() {
  const parent = { postMessage: vi.fn() };
  Object.defineProperty(window, 'parent', { configurable: true, value: parent });
  Object.defineProperty(window, 'location', { configurable: true, value: new URL('http://127.0.0.1:3134/about') });
  return parent;
}

function message(parent: ReturnType<typeof embed>, origin: string, data: object) {
  act(() => window.dispatchEvent(new MessageEvent('message', { source: parent as unknown as Window, origin, data })));
}

describe('embedded content transport', () => {
  it('hydrates a later boundary coherently when another subscriber already received an unsaved draft', async () => {
    const parent = embed();
    const { useSiteContent, useSiteContentMap, useSiteCollection } = await import('./useSiteContent');
    function ThemeBoundary() {
      const scalar = useSiteContent('hospitality.background', 'forest');
      const map = useSiteContentMap();
      const items = useSiteCollection('reviews', [{ id: 'published', fields: {} }]);
      return <main data-background={scalar} data-map-background={map['hospitality.background'] ?? 'forest'} data-items={items.map(item => item.id).join(',')}>Hospitality</main>;
    }
    const serverMarkup = renderToString(<ThemeBoundary />);
    renderHook(() => useSiteContent('another-boundary', 'source'));
    message(parent, 'http://127.0.0.1:3140', { type: 'OKNO_CMS_PREVIEW', values: { 'hospitality.background': 'pearl' }, collections: { reviews: [{ id: 'draft', fields: {} }] } });
    const container = document.createElement('div');
    container.innerHTML = serverMarkup;
    document.body.append(container);
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    let root: Root | undefined;
    try {
      await act(async () => { root = hydrateRoot(container, <ThemeBoundary />); });
      const main = container.querySelector('main')!;
      expect(main).toHaveAttribute('data-background', 'pearl');
      expect(main).toHaveAttribute('data-map-background', 'pearl');
      expect(main).toHaveAttribute('data-items', 'draft');
      expect(errors).not.toHaveBeenCalled();
      // Server snapshots stay stable even after the client receives private drafts.
      expect(renderToString(<ThemeBoundary />)).toBe(serverMarkup);
    } finally {
      act(() => root?.unmount());
      container.remove();
      errors.mockRestore();
    }
  });

  it('retains draft scalars and collections across a published refresh, then clears them together', async () => {
    const parent = embed();
    let revision = 1;
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async () => ({ status: 200, ok: true, json: async () => ({ revision, published: { title: `Published ${revision}`, untouched: `Revision ${revision}` }, publishedCollections: { reviews: [{ id: `published-${revision}`, fields: {} }] } }) })));
    const { useSiteContent, useSiteContentMap, useSiteCollectionsMap, useSiteCollection } = await import('./useSiteContent');
    const hook = renderHook(() => ({ scalar: useSiteContent('title', 'source'), map: useSiteContentMap(), collections: useSiteCollectionsMap(), items: useSiteCollection('reviews', []) }));
    await act(async () => { await Promise.resolve(); });
    message(parent, 'http://127.0.0.1:3140', { type: 'OKNO_CMS_PREVIEW', values: { title: 'Draft' }, collections: { reviews: [{ id: 'draft', fields: {} }] } });
    revision = 2;
    await act(async () => { await vi.advanceTimersByTimeAsync(15000); });
    expect(hook.result.current.scalar).toBe('Draft');
    expect(hook.result.current.map).toEqual({ title: 'Draft', untouched: 'Revision 2' });
    expect(hook.result.current.items.map(item => item.id)).toEqual(['draft']);
    expect(hook.result.current.collections.reviews.map(item => item.id)).toEqual(['draft']);
    message(parent, 'http://127.0.0.1:3140', { type: 'OKNO_CMS_PREVIEW', values: {}, collections: {} });
    expect(hook.result.current.scalar).toBe('Published 2');
    expect(hook.result.current.items.map(item => item.id)).toEqual(['published-2']);
    expect(hook.result.current.collections.reviews.map(item => item.id)).toEqual(['published-2']);
  });

  it.each(['http://127.0.0.1:3140', 'http://localhost:3140'])('accepts current drafts from the fixed local admin %s', async origin => {
    const parent = embed();
    const { useSiteContent } = await import('./useSiteContent');
    const hook = renderHook(() => useSiteContent('title', 'Published title'));
    message(parent, origin, { type: 'OKNO_CMS_PREVIEW', values: { title: 'Private draft' } });
    expect(hook.result.current).toBe('Private draft');
    message(parent, 'https://untrusted.example', { type: 'OKNO_CMS_PREVIEW', values: { title: 'Untrusted' } });
    expect(hook.result.current).toBe('Private draft');
    message(parent, origin, { type: 'OKNO_CMS_PREVIEW', values: {} });
    expect(hook.result.current).toBe('Published title');
  });

  it('replies to a readiness request after the receiver is installed', async () => {
    const parent = embed();
    const { useSiteContent } = await import('./useSiteContent');
    renderHook(() => useSiteContent('title', 'Published title'));
    parent.postMessage.mockClear();
    message(parent, 'http://localhost:3140', { type: 'OKNO_CMS_PREVIEW_REQUEST' });
    expect(parent.postMessage).toHaveBeenCalledWith({ type: 'OKNO_CMS_PREVIEW_READY' }, 'http://localhost:3140');
    parent.postMessage.mockClear();
    message(parent, 'https://untrusted.example', { type: 'OKNO_CMS_PREVIEW_REQUEST' });
    expect(parent.postMessage).not.toHaveBeenCalled();
  });

  it('rejects local admin messages on a deployed website', async () => {
    const parent = embed();
    Object.defineProperty(window, 'location', { configurable: true, value: new URL('https://okno.example/about') });
    const { useSiteContent } = await import('./useSiteContent');
    const hook = renderHook(() => useSiteContent('title', 'Published title'));
    message(parent, 'http://127.0.0.1:3140', { type: 'OKNO_CMS_PREVIEW', values: { title: 'Untrusted draft' } });
    expect(hook.result.current).toBe('Published title');
  });
});
