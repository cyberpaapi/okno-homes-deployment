import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import film from '../../config/hero-v1-frames.json';
import { createHeroImageScrubber } from './heroImageScrubber';

const data = readFileSync('public'+film.source);
function setup() {
  vi.useFakeTimers();
  const close = vi.fn(), draw = vi.fn();
  vi.spyOn(HTMLCanvasElement.prototype,'getContext').mockImplementation((() => ({drawImage:draw})) as unknown as typeof HTMLCanvasElement.prototype.getContext);
  const decode = vi.fn(async () => ({ close }));
  vi.stubGlobal('createImageBitmap',decode);
  const fetch = vi.fn(async (_url: string, options: {headers:{Range:string}}) => {
    const [start,end] = options.headers.Range.match(/\d+/g)!.map(Number);
    return {status:206,headers:{get:()=>`bytes ${start}-${end}/${data.length}`},arrayBuffer:async()=>Uint8Array.from(data.subarray(start,end+1)).buffer};
  });
  vi.stubGlobal('fetch',fetch);
  return {close,draw,decode,fetch};
}
afterEach(()=>{vi.useRealTimers();vi.restoreAllMocks();vi.unstubAllGlobals();});
describe('independent Hero scroll frames',()=>{
  it('indexes the original opening and ending with bounded delivery bytes and valid WebP poses',()=>{
    expect(createHash('sha256').update(data).digest('hex')).toBe(film.sha256);
    expect(data.length).toBeLessThan(47573337);
    expect([film.width,film.height,film.fps,film.sourceFrames,film.frames.length]).toEqual([1920,1080,24,577,289]);
    film.frames.forEach(([offset,size,index],i)=>{
      expect(index).toBe(i*2);expect(offset+size).toBeLessThanOrEqual(data.length);
      expect(data.subarray(offset,offset+4).toString()).toBe('RIFF');
      expect(data.subarray(offset+8,offset+12).toString()).toBe('WEBP');
    });
    expect(film.frames.at(-1)![2]/film.fps).toBe(24);
  });
  it('replaces rapid input, reverses directly, stays still when idle and releases its cache',async()=>{
    const mocks=setup(),canvas=document.createElement('canvas'),abort=new AbortController();
    const shown=vi.fn(),ready=vi.fn();
    const scrubber=createHeroImageScrubber(canvas,abort.signal,ready,vi.fn(),shown)!;
    await vi.advanceTimersByTimeAsync(30);
    scrubber.setTime(18);scrubber.setTime(4);await vi.advanceTimersByTimeAsync(50);
    expect(canvas.dataset.scrubPresentedTime).toBe('4.0000');
    const count=mocks.draw.mock.calls.length;
    await vi.advanceTimersByTimeAsync(2000);expect(mocks.draw).toHaveBeenCalledTimes(count);
    scrubber.setTime(24);await vi.advanceTimersByTimeAsync(50);
    expect(shown).toHaveBeenLastCalledWith(24);expect(ready).toHaveBeenCalledOnce();
    for(const time of [1,5,10,15,20,24,14,4]){scrubber.setTime(time);await vi.advanceTimersByTimeAsync(30);}
    expect(Number(canvas.dataset.scrubByteCache)).toBeLessThanOrEqual(16*1024*1024);
    expect(Number(canvas.dataset.scrubCacheFrames)).toBeLessThanOrEqual(18);
    abort.abort();expect(mocks.close).toHaveBeenCalled();
  });
  it('does not wait to download the whole movie to reach the accepted window',async()=>{
    const mocks=setup(),canvas=document.createElement('canvas'),abort=new AbortController();
    const scrubber=createHeroImageScrubber(canvas,abort.signal,vi.fn(),vi.fn(),vi.fn())!;
    await vi.advanceTimersByTimeAsync(30);mocks.fetch.mockClear();
    scrubber.setTime(24);await vi.advanceTimersByTimeAsync(50);
    expect(canvas.dataset.scrubPresentedTime).toBe('24.0000');
    expect(mocks.fetch.mock.calls.every(([,o])=>Number(o.headers.Range.match(/\d+/)![0])>data.length/2)).toBe(true);
    abort.abort();
  });
  it('retains the actual ending and opening through cache eviction for instant handoff and reversal',async()=>{
    const mocks=setup(),canvas=document.createElement('canvas'),abort=new AbortController();
    const scrubber=createHeroImageScrubber(canvas,abort.signal,vi.fn(),vi.fn(),vi.fn())!;
    await vi.advanceTimersByTimeAsync(40);
    for(const time of [1,4,8,12,16,20]){scrubber.setTime(time);await vi.advanceTimersByTimeAsync(30);}
    mocks.decode.mockClear();
    // Block new decodes: the window approach must already be in the cache.
    mocks.decode.mockImplementation(()=>new Promise<never>(()=>{}));
    scrubber.setTime(572/24);await vi.advanceTimersByTimeAsync(20);
    expect(canvas.dataset.scrubPresentedTime).toBe('23.8333');
    mocks.decode.mockClear();
    scrubber.setTime(24);await vi.advanceTimersByTimeAsync(20);
    expect(canvas.dataset.scrubPresentedTime).toBe('24.0000');
    expect(mocks.decode).not.toHaveBeenCalled();
    scrubber.setTime(0);await vi.advanceTimersByTimeAsync(20);
    expect(canvas.dataset.scrubPresentedTime).toBe('0.0000');
    expect(Number(canvas.dataset.scrubCacheFrames)).toBeLessThanOrEqual(18);
    abort.abort();
  });
});
