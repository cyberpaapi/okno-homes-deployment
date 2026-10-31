import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import optimizedFilm from '../../config/hero-v2-optimized-frames.json';
import film from '../../config/hero-v2-frames.json';
import { createHeroV2ImageScrubber } from './heroV2ImageScrubber';

const parts = film.parts.map(part => readFileSync('public' + part.source));
function setup() {
  vi.useFakeTimers();
  const close = vi.fn(), draw = vi.fn();
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation((() => ({ drawImage: draw })) as unknown as typeof HTMLCanvasElement.prototype.getContext);
  const decode = vi.fn(async () => ({ close }));
  vi.stubGlobal('createImageBitmap', decode);
  const fetch = vi.fn(async (url: string, options: { headers: { Range: string } }) => {
    const data = parts[film.parts.findIndex(part => part.source === url)];
    const [start, end] = options.headers.Range.match(/\d+/g)!.map(Number);
    return { status: 206, headers: { get: () => `bytes ${start}-${end}/${data.length}` }, arrayBuffer: async () => Uint8Array.from(data.subarray(start, end + 1)).buffer };
  });
  vi.stubGlobal('fetch', fetch);
  return { close, draw, decode, fetch };
}
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
describe('V2 lossless scroll-only delivery', () => {
  it('preloads every desktop pose in a smaller pack and seeks without further requests', async () => {
    const data = readFileSync('public' + optimizedFilm.source);
    expect(createHash('sha256').update(data).digest('hex')).toBe(optimizedFilm.sha256);
    expect(optimizedFilm.frames.map(frame => frame[2])).toEqual(film.frames.map(frame => frame[2]));
    expect([optimizedFilm.width, optimizedFilm.height]).toEqual([film.width, film.height]);
    expect(data.length).toBeLessThan(film.bytes * .12);
    const mocks = setup(), canvas = document.createElement('canvas'), abort = new AbortController();
    const ready = vi.fn(), failed = vi.fn();
    const scrubber = createHeroV2ImageScrubber(canvas, abort.signal, ready, failed, vi.fn(), new Uint8Array(data))!;
    await vi.advanceTimersByTimeAsync(80);
    for (const time of [25, 4, 790/24]) { scrubber.setTime(time); await vi.advanceTimersByTimeAsync(80); }
    expect(canvas.dataset.scrubPresentedTime).toBe((790/24).toFixed(4));
    expect(mocks.fetch).not.toHaveBeenCalled();
    expect(ready).toHaveBeenCalledOnce(); expect(failed).not.toHaveBeenCalled();
    abort.abort();
  });
  it('retains every approved pose, with fingerprinted bounded shards and exact endpoint files', () => {
    expect([film.width, film.height, film.fps, film.sourceFrames, film.sampleStride, film.frames.length]).toEqual([1280, 720, 24, 791, 1, 791]);
    expect(film.lossless).toBe(true);
    expect(film.masterSha256).toBe('2401bc8e660968f498d2c494c70d12ea8ff0bb9a54479d81f18dd1705e241698');
    parts.forEach((data, i) => {
      expect(data.length).toBe(film.parts[i].bytes);
      expect(data.length).toBeLessThanOrEqual(16 * 1024 * 1024);
      expect(createHash('sha256').update(data).digest('hex')).toBe(film.parts[i].sha256);
    });
    const frame = (i: number) => {
      const [offset, size] = film.frames[i];
      const part = Math.floor(offset / film.partBytes), local = offset % film.partBytes;
      return local + size <= parts[part].length ? parts[part].subarray(local, local + size) : Buffer.concat([parts[part].subarray(local), parts[part + 1].subarray(0, size - (parts[part].length - local))]);
    };
    film.frames.forEach((entry, i) => { expect(entry[2]).toBe(i); expect(frame(i).subarray(8, 12).toString()).toBe('WEBP'); });
    expect(frame(0)).toEqual(readFileSync('public' + film.first));
    expect(frame(790)).toEqual(readFileSync('public' + film.last));
  });
  it('coalesces rapid input, reverses, holds at idle, and releases bounded caches', async () => {
    const mocks = setup(), canvas = document.createElement('canvas'), abort = new AbortController();
    const ready = vi.fn(), failed = vi.fn();
    const scrubber = createHeroV2ImageScrubber(canvas, abort.signal, ready, failed, vi.fn())!;
    await vi.advanceTimersByTimeAsync(40);
    scrubber.setTime(26); scrubber.setTime(4); await vi.advanceTimersByTimeAsync(80);
    expect(canvas.dataset.scrubPresentedTime).toBe('4.0000');
    const count = mocks.draw.mock.calls.length;
    await vi.advanceTimersByTimeAsync(2000); expect(mocks.draw).toHaveBeenCalledTimes(count);
    for (const time of [8, 16, 24, 30, 12, 3]) { scrubber.setTime(time); await vi.advanceTimersByTimeAsync(80); }
    expect(Number(canvas.dataset.scrubByteCache)).toBeLessThanOrEqual(16 * 1024 * 1024);
    expect(Number(canvas.dataset.scrubCacheFrames)).toBeLessThanOrEqual(28);
    mocks.decode.mockClear(); mocks.decode.mockImplementation(() => new Promise<never>(() => {}));
    scrubber.setTime(790 / 24); await vi.advanceTimersByTimeAsync(30);
    expect(canvas.dataset.scrubPresentedTime).toBe('32.9167');
    scrubber.setTime(0); await vi.advanceTimersByTimeAsync(30);
    expect(canvas.dataset.scrubPresentedTime).toBe('0.0000');
    expect(mocks.decode).not.toHaveBeenCalled(); expect(ready).toHaveBeenCalledOnce(); expect(failed).not.toHaveBeenCalled();
    abort.abort(); expect(mocks.close).toHaveBeenCalled();
  });
  it('does not serialize a current pose behind a slow obsolete range', async () => {
    const mocks=setup(),canvas=document.createElement('canvas'),abort=new AbortController();
    const original=mocks.fetch.getMockImplementation()!;
    let stalled=false;
    const slowOffset=film.frames[96][0];
    const slowPart=film.parts[Math.floor(slowOffset/film.partBytes)].source;
    const slowStart=Math.floor((slowOffset%film.partBytes)/(512*1024))*512*1024;
    mocks.fetch.mockImplementation(async(url,options)=>{
      const start=Number(options.headers.Range.match(/\d+/)![0]);
      if(stalled && url===slowPart && start===slowStart) return new Promise<never>(()=>{});
      return original(url,options);
    });
    const scrubber=createHeroV2ImageScrubber(canvas,abort.signal,vi.fn(),vi.fn(),vi.fn())!;
    await vi.advanceTimersByTimeAsync(40);
    stalled=true; scrubber.setTime(4); await vi.advanceTimersByTimeAsync(10);
    scrubber.setTime(12); await vi.advanceTimersByTimeAsync(80);
    expect(canvas.dataset.scrubPresentedTime).toBe('12.0000'); abort.abort();
  });

  it('rejects broken range delivery and ignores decodes completing after disposal', async () => {
    const mocks = setup(), canvas = document.createElement('canvas'), abort = new AbortController();
    let resolve!: (bitmap: { close: typeof mocks.close }) => void;
    mocks.decode.mockImplementation(() => new Promise(done => { resolve = done; }));
    const failed = vi.fn();
    createHeroV2ImageScrubber(canvas, abort.signal, vi.fn(), failed, vi.fn());
    await vi.advanceTimersByTimeAsync(30); abort.abort();
    const close = vi.fn(); resolve({ close }); await vi.advanceTimersByTimeAsync(50);
    expect(close).toHaveBeenCalled(); expect(mocks.draw).not.toHaveBeenCalled(); expect(failed).not.toHaveBeenCalled();
    mocks.fetch.mockImplementation(async () => ({ status: 200, headers: { get: () => '' }, arrayBuffer: async () => new ArrayBuffer(0) }));
    const second = new AbortController();
    createHeroV2ImageScrubber(document.createElement('canvas'), second.signal, vi.fn(), failed, vi.fn());
    await vi.advanceTimersByTimeAsync(50); expect(failed).toHaveBeenCalledOnce(); second.abort();
  });
});
