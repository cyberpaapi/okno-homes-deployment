import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import film from '../../config/hero-v1-video.json';
import { createH264FrameScrubber } from './h264FrameScrubber';

const bytes = readFileSync(`public${film.source}`);
function setup(rangeSupport = true) {
  vi.useFakeTimers();
  const closeFrame = vi.fn(); const close = vi.fn(); const decode = vi.fn();
  let output: ((frame: unknown) => void) | undefined;
  let paused = false;
  class Chunk { constructor(public value: { data: Uint8Array; timestamp: number; type: string }) {} }
  class Decoder {
    state = 'configured';
    static async isConfigSupported() { return { supported: true }; }
    constructor(private init: { output(frame: unknown): void }) { output=init.output; }
    configure() {}
    decode(chunk: Chunk) { decode(chunk.value); if (!paused) this.init.output({ timestamp: chunk.value.timestamp, close: closeFrame }); }
    async flush() { if (paused) await new Promise<void>(() => {}); }
    close() { this.state = 'closed'; close(); }
  }
  vi.stubGlobal('VideoDecoder', Decoder); vi.stubGlobal('EncodedVideoChunk', Chunk);
  const fetchRange = vi.fn(async (_url: string, options: { headers: { Range: string } }) => {
    const [start, end] = options.headers.Range.match(/\d+/g)!.map(Number);
    return { status: rangeSupport ? 206 : 200, headers: { get: () => `bytes ${start}-${end}/${bytes.length}` }, arrayBuffer: async () => Uint8Array.from(bytes.subarray(start, end+1)).buffer };
  });
  vi.stubGlobal('fetch', fetchRange);
  const drawImage = vi.fn();
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation((() => ({ drawImage })) as unknown as typeof HTMLCanvasElement.prototype.getContext);
  return { decode, closeFrame, close, fetchRange, drawImage, pause: () => { paused=true; }, emit: (index: number) => output?.({timestamp:film.packets[index][2],close:closeFrame}) };
}
describe('range-indexed film rendering', () => {
  afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); vi.useRealTimers(); });
  it('matches all 577 frames and exact indexed byte offsets of the delivery film', () => {
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(film.sha256);
    expect([film.width, film.height, film.fps, film.packets.length]).toEqual([1920,1080,24,577]);
    expect(film.packets.every(([position,size],index) => position+size <= bytes.length && (index===0 || film.packets[index-1][2] < film.packets[index][2]))).toBe(true);
    expect(film.packets.filter(p=>p[3]).length).toBe(49);
  });
  it('fetches late frames directly, deduplicates ranges, bounds memory and supports reverse and exact ending', async () => {
    const mocks = setup(); const canvas = document.createElement('canvas');
    const abort = new AbortController(); const ready = vi.fn(); const fail = vi.fn();
    const scrubber = await createH264FrameScrubber(canvas, abort.signal, ready, fail);
    await vi.advanceTimersByTimeAsync(30);
    mocks.fetchRange.mockClear();
    scrubber!.setTime(22);
    await vi.advanceTimersByTimeAsync(30);
    expect(canvas.dataset.scrubPresentedTime).toBe('22.0000');
    const ranges = mocks.fetchRange.mock.calls.map(([, options]) => options.headers.Range);
    expect(new Set(ranges).size).toBe(ranges.length);
    expect(ranges.every(range => Number(range.match(/\d+/)![0]) > film.bytes/2)).toBe(true);
    expect(Number(canvas.dataset.scrubFetchedBytes)).toBeLessThan(film.bytes/2);
    for (const time of [12, 13, 14, 15, 16, 4, 22, 10, 2]) { scrubber!.setTime(time); await vi.advanceTimersByTimeAsync(30); }
    expect(Number(canvas.dataset.scrubByteCache)).toBeLessThanOrEqual(16*1024*1024);
    expect(Number(canvas.dataset.scrubCacheFrames)).toBeLessThanOrEqual(36);
    scrubber!.setTime(12.125); await vi.advanceTimersByTimeAsync(30);
    expect(canvas.dataset.scrubPresentedTime).toBe('12.1250');
    scrubber!.setTime(100); await vi.advanceTimersByTimeAsync(30);
    expect(canvas.dataset.scrubPresentedTime).toBe('24.0000');
    for (const [packet] of mocks.decode.mock.calls) {
      const sample = film.packets.find(p=>p[2] === packet.timestamp)!;
      expect(Buffer.from(packet.data).equals(bytes.subarray(sample[0], sample[0]+sample[1]))).toBe(true);
    }
    expect(ready).toHaveBeenCalledOnce(); expect(fail).not.toHaveBeenCalled();
    abort.abort(); scrubber!.dispose();
    expect(mocks.close).toHaveBeenCalledOnce(); expect(mocks.closeFrame).toHaveBeenCalled();
    const draws = mocks.drawImage.mock.calls.length;
    scrubber!.setTime(4); await vi.advanceTimersByTimeAsync(30);
    expect(mocks.drawImage).toHaveBeenCalledTimes(draws);
  });
  it('lets a late seek supersede an unfinished early range and cancels distant work', async () => {
    setup(); const canvas = document.createElement('canvas'); const fail = vi.fn();
    const jobs: { start: number; signal: AbortSignal; finish(): void }[] = [];
    vi.stubGlobal('fetch', vi.fn((_url: string, options: { headers: { Range: string }; signal: AbortSignal }) => {
      const [start,end] = options.headers.Range.match(/\d+/g)!.map(Number);
      return new Promise((resolve,reject) => {
        options.signal.addEventListener('abort', () => reject(new Error('Cancelled')), { once: true });
        jobs.push({ start, signal: options.signal, finish: () => resolve({status:206, headers:{get:()=>`bytes ${start}-${end}/${bytes.length}`}, arrayBuffer:async()=>Uint8Array.from(bytes.subarray(start,end+1)).buffer}) });
      });
    }));
    const abort = new AbortController();
    const scrubber = await createH264FrameScrubber(canvas, abort.signal, vi.fn(), fail);
    expect(jobs.length).toBeGreaterThan(0);
    const early = [...jobs]; scrubber!.setTime(22);
    expect(early.every(job=>job.signal.aborted)).toBe(true);
    for (const job of jobs) if (!job.signal.aborted) job.finish();
    await vi.advanceTimersByTimeAsync(30);
    expect(canvas.dataset.scrubPresentedTime).toBe('22.0000');
    expect(fail).not.toHaveBeenCalled(); abort.abort();
  });
  it('keeps an active decode range when a nearby dense frame lies five byte chunks ahead', async () => {
    setup(); vi.stubGlobal('navigator', { deviceMemory: 8 });
    const jobs: { start: number; signal: AbortSignal; finish(): void }[] = [];
    vi.stubGlobal('fetch', vi.fn((_url: string, options: { headers: { Range: string }; signal: AbortSignal }) => {
      const [start,end] = options.headers.Range.match(/\d+/g)!.map(Number);
      return new Promise((resolve,reject) => {
        options.signal.addEventListener('abort', () => reject(new Error('Cancelled')), { once: true });
        jobs.push({start,signal:options.signal,finish:()=>resolve({status:206,headers:{get:()=>`bytes ${start}-${end}/${bytes.length}`},arrayBuffer:async()=>Uint8Array.from(bytes.subarray(start,end+1)).buffer})});
      });
    }));
    const canvas = document.createElement('canvas'); const fail = vi.fn(); const abort = new AbortController();
    const scrubber = await createH264FrameScrubber(canvas,abort.signal,vi.fn(),fail);
    scrubber!.setTime(19/24);
    jobs.find(job=>job.start===0)!.finish(); await vi.advanceTimersByTimeAsync(30);
    const required = jobs.find(job=>job.start===Math.floor(film.packets[12][0]/524288)*524288)!;
    expect(required.signal.aborted).toBe(false);
    scrubber!.setTime(43/24);
    expect(required.signal.aborted).toBe(false);
    for (let step=0;step<3;step++) {
      for (const job of jobs) if (!job.signal.aborted) job.finish();
      await vi.advanceTimersByTimeAsync(30);
    }
    expect(fail).not.toHaveBeenCalled(); expect(canvas.dataset.scrubPresentedTime).toBe('1.7917'); abort.abort();
  });
  it('never presents a cached future frame past a moving target and then rewinds', async () => {
    const mocks=setup(); const abort=new AbortController(); const canvas=document.createElement('canvas');
    const scrubber=await createH264FrameScrubber(canvas,abort.signal,vi.fn(),vi.fn());
    await vi.advanceTimersByTimeAsync(30); scrubber!.setTime(20); await vi.advanceTimersByTimeAsync(30);
    mocks.emit(540); mocks.pause(); scrubber!.setTime(22);
    await vi.advanceTimersByTimeAsync(30);
    expect(Number(canvas.dataset.scrubPresentedTime)).toBeLessThanOrEqual(22);
    expect(Number(canvas.dataset.scrubPresentedTime)).toBeGreaterThanOrEqual(20);
    mocks.emit(528); await vi.advanceTimersByTimeAsync(30);
    expect(canvas.dataset.scrubPresentedTime).toBe('22.0000'); abort.abort();
  });
  it('rejects a server ignoring byte ranges without allocating the complete film', async () => {
    setup(false); const fail = vi.fn(); const abort = new AbortController();
    await createH264FrameScrubber(document.createElement('canvas'), abort.signal, vi.fn(), fail);
    await vi.advanceTimersByTimeAsync(30);
    expect(fail).toHaveBeenCalled(); abort.abort();
  });
  it('offers native fallback if AVC decoding is unsupported', async () => {
    vi.stubGlobal('VideoDecoder', { isConfigSupported: async () => ({ supported: false }) });
    expect(await createH264FrameScrubber(document.createElement('canvas'), new AbortController().signal, vi.fn(), vi.fn())).toBeNull();
  });
  it('presents all frames in order after a large request and reverses without skipping', async () => {
    const mocks=setup(); const abort=new AbortController(); const canvas=document.createElement('canvas'); const seen:number[]=[];
    const scrubber=await createH264FrameScrubber(canvas,abort.signal,vi.fn(),vi.fn(),{sequential:true,onPresented:t=>seen.push(Math.round(t*24))});
    await vi.advanceTimersByTimeAsync(100); scrubber!.setTime(24);
    await vi.advanceTimersByTimeAsync(32000);
    expect(seen).toEqual(Array.from({length:577},(_,i)=>i));
    expect(mocks.decode.mock.calls.length).toBeLessThan(2000);
    expect(canvas.dataset.scrubSkippedFrames).toBe('0'); expect(canvas.dataset.scrubMaxStep).toBe('1');
    scrubber!.setTime(23); await vi.advanceTimersByTimeAsync(1400);
    expect(seen.slice(-24)).toEqual(Array.from({length:24},(_,i)=>575-i));
    expect(canvas.dataset.scrubPresentedTime).toBe('23.0000'); abort.abort();
  });
  it('responds faster to normal scrolling while retaining every adjacent frame and reversal', async () => {
    setup(); const abort=new AbortController(); const canvas=document.createElement('canvas'); const seen:number[]=[];
    const scrubber=await createH264FrameScrubber(canvas,abort.signal,vi.fn(),vi.fn(),{sequential:true,maxPresentationFps:60,onPresented:t=>seen.push(Math.round(t*24))});
    await vi.advanceTimersByTimeAsync(100); scrubber!.setTime(24);
    await vi.advanceTimersByTimeAsync(10500);
    expect(seen).toEqual(Array.from({length:577},(_,i)=>i));
    expect(canvas.dataset.scrubSkippedFrames).toBe('0');
    expect(Number(canvas.dataset.scrubByteCache)).toBeLessThanOrEqual(16*1024*1024);
    expect(Number(canvas.dataset.scrubFetchedBytes)).toBeLessThanOrEqual(film.bytes);
    scrubber!.setTime(20); await vi.advanceTimersByTimeAsync(1900);
    expect(canvas.dataset.scrubPresentedTime).toBe('20.0000');
    expect(canvas.dataset.scrubMaxStep).toBe('1');
    abort.abort();
  });
  it('prepares a larger compressed runway for faster playback without changing the memory cap', async () => {
    const mocks=setup(); const abort=new AbortController(); const canvas=document.createElement('canvas');
    await createH264FrameScrubber(canvas,abort.signal,vi.fn(),vi.fn(),{sequential:true,maxPresentationFps:60});
    await vi.advanceTimersByTimeAsync(100);
    const starts=mocks.fetchRange.mock.calls.map(([,options])=>Number(options.headers.Range.match(/\d+/)![0]));
    expect(starts).toContain(16*512*1024);
    expect(Number(canvas.dataset.scrubByteCache)).toBeLessThanOrEqual(16*1024*1024);
    abort.abort();
  });
  it('does not cancel its valid fast-playback runway on the next scroll update', async () => {
    setup(); const jobs:{start:number;signal:AbortSignal}[]=[];
    vi.stubGlobal('fetch',vi.fn((_url:string,options:{headers:{Range:string};signal:AbortSignal})=>new Promise((_resolve,reject)=>{
      const start=Number(options.headers.Range.match(/\d+/)![0]);
      jobs.push({start,signal:options.signal});
      options.signal.addEventListener('abort',()=>reject(new Error('Cancelled')),{once:true});
    })));
    const abort=new AbortController();
    const scrubber=await createH264FrameScrubber(document.createElement('canvas'),abort.signal,vi.fn(),vi.fn(),{sequential:true,maxPresentationFps:60});
    scrubber!.setTime(.125);
    expect(jobs.find(job=>job.start===8*512*1024)?.signal.aborted).toBe(false);
    expect(jobs.find(job=>job.start===16*512*1024)?.signal.aborted).toBe(false);
    abort.abort();
  });
  it('keeps presenting cached adjacent frames while a refill is blocked', async () => {
    const mocks=setup(); const abort=new AbortController(); const canvas=document.createElement('canvas');
    const scrubber=await createH264FrameScrubber(canvas,abort.signal,vi.fn(),vi.fn(),{sequential:true,maxPresentationFps:60});
    await vi.advanceTimersByTimeAsync(100);
    // Seed the runway, then stall a decoder refill. Presentation is independent
    // of that asynchronous job and must drain the ready frames.
    for(let index=1;index<=12;index++)mocks.emit(index);
    mocks.pause(); scrubber!.setTime(24);
    await vi.advanceTimersByTimeAsync(300);
    expect(Number(canvas.dataset.scrubPresentedTime)).toBeGreaterThanOrEqual(12/24);
    expect(canvas.dataset.scrubSkippedFrames).toBe('0');
    abort.abort();
  });
  it('holds a missing adjacent frame instead of using a cached future frame', async () => {
    const mocks=setup(); const abort=new AbortController(); const canvas=document.createElement('canvas'); const seen:number[]=[];
    const scrubber=await createH264FrameScrubber(canvas,abort.signal,vi.fn(),vi.fn(),{sequential:true,onPresented:t=>seen.push(Math.round(t*24))});
    await vi.advanceTimersByTimeAsync(100); mocks.pause(); mocks.emit(540); scrubber!.setTime(22);
    await vi.advanceTimersByTimeAsync(2000);
    expect(seen.at(-1)).toBeLessThanOrEqual(12);
    expect(seen.every((frame,i)=>i===0||frame===seen[i-1]+1)).toBe(true);
    expect(canvas.dataset.scrubSkippedFrames).toBe('0'); abort.abort();
  });
});
