import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchFrameRange } from './fetchFrameRange';

const valid = () => ({ status: 206, headers: new Headers({ 'content-range': 'bytes 0-3/8' }), arrayBuffer: async () => new Uint8Array([1, 2, 3, 4]).buffer });
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

describe('bounded frame delivery', () => {
  it('cancels an ignored range body and bypasses the partial cache on recovery', async () => {
    const cancel = vi.fn();
    const fetch = vi.fn().mockResolvedValueOnce({ status: 200, body: { cancel } }).mockResolvedValueOnce(valid());
    vi.stubGlobal('fetch', fetch);
    expect(await fetchFrameRange('/film.bin', 0, 3, 8, new AbortController().signal)).toEqual(new Uint8Array([1, 2, 3, 4]));
    expect(cancel).toHaveBeenCalledOnce();
    expect(fetch.mock.calls.map(([, options]) => options.cache)).toEqual(['force-cache', 'reload']);
  });

  it('times out stalled requests and stops after one retry', async () => {
    vi.useFakeTimers();
    const signals: AbortSignal[] = [];
    const fetch = vi.fn((_url, { signal }: { signal: AbortSignal }) => new Promise((_resolve, reject) => {
      signals.push(signal);
      signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
    }));
    vi.stubGlobal('fetch', fetch);
    const result = fetchFrameRange('/film.bin', 0, 3, 8, new AbortController().signal);
    const assertion = expect(result).rejects.toThrow('Frame request timed out');
    await vi.advanceTimersByTimeAsync(12000);
    await assertion;
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(signals.every(signal => signal.aborted)).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('cancels route-exit work without starting another request', async () => {
    const parent = new AbortController();
    const fetch = vi.fn((_url, { signal }: { signal: AbortSignal }) => new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
    }));
    vi.stubGlobal('fetch', fetch);
    const result = fetchFrameRange('/film.bin', 0, 3, 8, parent.signal);
    const assertion = expect(result).rejects.toMatchObject({ name: 'AbortError' });
    parent.abort();
    await assertion;
    expect(fetch).toHaveBeenCalledOnce();
  });

  it('rejects truncated cached and network bodies', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ...valid(), arrayBuffer: async () => new ArrayBuffer(2) })));
    await expect(fetchFrameRange('/film.bin', 0, 3, 8, new AbortController().signal)).rejects.toThrow('Incomplete frame range');
  });
});
