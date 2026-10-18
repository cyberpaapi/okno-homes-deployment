import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => { vi.resetModules(); vi.useFakeTimers(); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.useRealTimers(); });

describe('public content request recovery', () => {
  it('keeps source content visible and retries after a stalled refresh', async () => {
    const fetch = vi.fn()
      .mockImplementationOnce((_url, { signal }: { signal: AbortSignal }) => new Promise((_resolve, reject) => {
        signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
      }))
      .mockResolvedValue({ status: 200, ok: true, json: async () => ({ revision: 5, published: { title: 'Published title' }, publishedCollections: {} }) });
    vi.stubGlobal('fetch', fetch);
    const { useSiteContent } = await import('./useSiteContent');
    const hook = renderHook(() => useSiteContent('title', 'Source title'));
    expect(hook.result.current).toBe('Source title');
    await act(async () => { await vi.advanceTimersByTimeAsync(15000); });
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(hook.result.current).toBe('Published title');
    hook.unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('aborts a refresh when the last subscriber leaves and reconnects cleanly', async () => {
    const signals: AbortSignal[] = [];
    vi.stubGlobal('fetch', vi.fn((_url, { signal }: { signal: AbortSignal }) => new Promise((_resolve, reject) => {
      signals.push(signal);
      signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
    })));
    const { useSiteContent } = await import('./useSiteContent');
    const first = renderHook(() => useSiteContent('title', 'Source title'));
    first.unmount();
    expect(signals[0].aborted).toBe(true);
    const second = renderHook(() => useSiteContent('title', 'Source title'));
    expect(signals).toHaveLength(2);
    await act(async () => { await Promise.resolve(); });
    expect(signals[1].aborted).toBe(false);
    second.unmount();
  });
});
