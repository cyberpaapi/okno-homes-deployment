import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import film from '../../config/hero-v1-frames.json';
import video from '../../config/hero-v1-video.json';
import { createHeroImageScrubber } from './heroImageScrubber';

const data = readFileSync('public'+film.source);
// The merged opening film (11 November 2026): its final pose sets the ending time.
const LAST = (video.packets.length - 1) / 24;
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
  it('serves arbitrary forward and reverse poses without network requests when fully preloaded',async()=>{
    const mocks=setup(),canvas=document.createElement('canvas'),abort=new AbortController();
    const ready=vi.fn();
    const scrubber=createHeroImageScrubber(canvas,abort.signal,ready,vi.fn(),vi.fn(),undefined,data)!;
    await vi.advanceTimersByTimeAsync(40);
    expect(ready).toHaveBeenCalledOnce();
    for(const time of [22,3,24,0]){scrubber.setTime(time);await vi.advanceTimersByTimeAsync(40);expect(Number(canvas.dataset.scrubPresentedTime)).toBe(time);}
    expect(mocks.fetch).not.toHaveBeenCalled();
    expect(Number(canvas.dataset.scrubCacheFrames)).toBeLessThanOrEqual(18);
    abort.abort();
  });
  it('reports readiness only after preparing opening poses and presenting a frame',async()=>{
    const mocks=setup(),canvas=document.createElement('canvas'),abort=new AbortController();
    const ready=vi.fn(),loading=vi.fn();
    createHeroImageScrubber(canvas,abort.signal,ready,vi.fn(),vi.fn(),loading);
    expect(loading).toHaveBeenCalledWith(0);
    expect(ready).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(40);
    expect(mocks.decode.mock.calls.length).toBeGreaterThanOrEqual(6);
    expect(ready).toHaveBeenCalledOnce();
    expect(loading).toHaveBeenLastCalledWith(1);
    expect(loading.mock.calls.some(([value])=>value>0 && value<1)).toBe(true);
    abort.abort();
  });
  it('indexes the original opening and ending with bounded delivery bytes and valid WebP poses',()=>{
    expect(createHash('sha256').update(data).digest('hex')).toBe(film.sha256);
    expect(data.length).toBeLessThan(video.bytes);
    expect([film.width,film.height,film.fps,film.sourceFrames,film.frames.length]).toEqual([1920,1080,24,video.packets.length,(video.packets.length+1)/2]);
    film.frames.forEach(([offset,size,index],i)=>{
      expect(index).toBe(i*2);expect(offset+size).toBeLessThanOrEqual(data.length);
      expect(data.subarray(offset,offset+4).toString()).toBe('RIFF');
      expect(data.subarray(offset+8,offset+12).toString()).toBe('WEBP');
    });
    expect(film.frames.at(-1)![2]/film.fps).toBe(LAST);
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
    scrubber.setTime(LAST);await vi.advanceTimersByTimeAsync(50);
    expect(shown).toHaveBeenLastCalledWith(LAST);expect(ready).toHaveBeenCalledOnce();
    for(const time of [1,5,10,15,20,24,14,4]){scrubber.setTime(time);await vi.advanceTimersByTimeAsync(30);}
    expect(Number(canvas.dataset.scrubByteCache)).toBeLessThanOrEqual(16*1024*1024);
    expect(Number(canvas.dataset.scrubCacheFrames)).toBeLessThanOrEqual(18);
    abort.abort();expect(mocks.close).toHaveBeenCalled();
  });
  it('presents a new target while an older nearby range remains slow',async()=>{
    const mocks=setup(),canvas=document.createElement('canvas'),abort=new AbortController();
    const original=mocks.fetch.getMockImplementation()!;
    let blocked=false;
    mocks.fetch.mockImplementation(async(url,options)=>{
      const start=Number(options.headers.Range.match(/\d+/)![0]);
      if(blocked && start >= 8*256*1024 && start < 10*256*1024) return new Promise<never>(()=>{});
      return original(url,options);
    });
    const scrubber=createHeroImageScrubber(canvas,abort.signal,vi.fn(),vi.fn(),vi.fn())!;
    await vi.advanceTimersByTimeAsync(40);
    // These are different uncached ranges: slow network for the old target
    // must not serialize the most recent scroll position behind it.
    blocked=true;
    const slow=film.frames.find(frame=>frame[0]>=8*256*1024)![2]/film.fps;
    scrubber.setTime(slow);
    await vi.advanceTimersByTimeAsync(10);
    scrubber.setTime(12);
    await vi.advanceTimersByTimeAsync(50);
    expect(canvas.dataset.scrubPresentedTime).toBe('12.0000');
    abort.abort();
  });

  it('does not wait to download the whole movie to reach the accepted window',async()=>{
    const mocks=setup(),canvas=document.createElement('canvas'),abort=new AbortController();
    const scrubber=createHeroImageScrubber(canvas,abort.signal,vi.fn(),vi.fn(),vi.fn())!;
    await vi.advanceTimersByTimeAsync(30);mocks.fetch.mockClear();
    scrubber.setTime(LAST);await vi.advanceTimersByTimeAsync(50);
    expect(canvas.dataset.scrubPresentedTime).toBe(LAST.toFixed(4));
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
    scrubber.setTime(LAST-4/24);await vi.advanceTimersByTimeAsync(20);
    expect(canvas.dataset.scrubPresentedTime).toBe((LAST-4/24).toFixed(4));
    mocks.decode.mockClear();
    scrubber.setTime(LAST);await vi.advanceTimersByTimeAsync(20);
    expect(canvas.dataset.scrubPresentedTime).toBe(LAST.toFixed(4));
    expect(mocks.decode).not.toHaveBeenCalled();
    scrubber.setTime(0);await vi.advanceTimersByTimeAsync(20);
    expect(canvas.dataset.scrubPresentedTime).toBe('0.0000');
    expect(Number(canvas.dataset.scrubCacheFrames)).toBeLessThanOrEqual(18);
    abort.abort();
  });
});
