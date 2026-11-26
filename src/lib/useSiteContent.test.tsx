import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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
