import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import film from '../../config/process-video-hq.json';
import { createIndexedFrameScrubber } from './indexedFrameScrubber';
import mobileFilm from '../../config/process-video-scrub.json';

// Isolated source-only verification can read the owner's unchanged media from
// the canonical checkout without copying or linking public assets into it.
const publicAssets = process.env.OKNO_TEST_PUBLIC ?? 'public';
const bytes = readFileSync(`${publicAssets}${film.source}`);
describe('original-packet Process frame rendering', () => {
  afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); vi.useRealTimers(); });
  it('indexes every original frame without modifying the native MP4', () => {
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(film.sha256);
    expect([film.width,film.height,film.fps,film.packets.length]).toEqual([1920,1080,30,769]);
    expect(film.packets.filter(p=>p[3]).length).toBe(129);
    expect(film.packets.every(([position,size],index)=>position+size<=bytes.length && (index===0 || film.packets[index-1][2]<film.packets[index][2]))).toBe(true);
  });
  it('keeps the mobile manifest aligned and its original source unchanged', () => {
    const mobileBytes = readFileSync(`${publicAssets}${mobileFilm.source}`);
    expect(createHash('sha256').update(mobileBytes).digest('hex')).toBe(mobileFilm.sha256);
    expect([mobileFilm.width,mobileFilm.height,mobileFilm.fps,mobileFilm.packets.length]).toEqual([1280,720,30,769]);
    expect(mobileFilm.packets.map(p=>p[2])).toEqual(film.packets.map(p=>p[2]));
  });
  it('passes untouched AVC packets to the decoder, bounds frame memory and releases it', async () => {
    vi.useFakeTimers();
    const closed = vi.fn();
    const decode = vi.fn();
    const closeFrame = vi.fn();
    const reset = vi.fn();
    let flushes = 0;
    let rejectFirst: (() => void) | undefined;
    class Chunk { constructor(public value: { data: Uint8Array; timestamp: number; type: string }) {} }
    class Decoder {
      state = 'configured';
      static async isConfigSupported() { return { supported: true }; }
      constructor(private init: { output(frame: unknown): void }) {}
      configure() {}
      decode(chunk: Chunk) { decode(chunk.value); this.init.output({ timestamp: chunk.value.timestamp, close: closeFrame }); }
      async flush() {
        if (flushes++ === 0) await new Promise<void>((_resolve,reject) => { rejectFirst = () => reject(new Error('Obsolete job reset')); });
      }
      reset() { reset(); rejectFirst?.(); }
      close() { this.state = 'closed'; closed(); }
    }
    vi.stubGlobal('VideoDecoder',Decoder); vi.stubGlobal('EncodedVideoChunk',Chunk);
    vi.stubGlobal('fetch',vi.fn(async()=>({ok:true,body:{getReader:()=>{let done=false;return {read:async()=>{if(done)return {done:true};done=true;return {done:false,value:bytes};}};}}})));
    const drawImage = vi.fn();
    vi.spyOn(HTMLCanvasElement.prototype,'getContext').mockImplementation((() => ({drawImage})) as unknown as typeof HTMLCanvasElement.prototype.getContext);
    const canvas = document.createElement('canvas');
    const abort = new AbortController();
    const ready = vi.fn(); const fail = vi.fn();
    const scrubber = await createIndexedFrameScrubber(film,canvas,abort.signal,ready,fail,vi.fn(),new Uint8Array(bytes));
    await vi.advanceTimersByTimeAsync(30);
    // Even when flush is still pending, a cached requested frame must paint.
    scrubber!.setTime(1/30);
    await vi.advanceTimersByTimeAsync(30);
    expect(canvas.dataset.scrubPresentedTime).toBe('0.0333');
    for (const time of [12,13,14,15,16]) { scrubber!.setTime(time); await vi.advanceTimersByTimeAsync(30); }
    expect(fetch).not.toHaveBeenCalled();
    expect(canvas.dataset.scrubPresentedTime).toBe('16.0000');
    expect(Number(canvas.dataset.scrubCacheFrames)).toBe(48);
    expect(reset).toHaveBeenCalledOnce();
    for (const packet of decode.mock.calls.map(call=>call[0])) {
      const sample = film.packets.find(p=>p[2]===packet.timestamp)!;
      expect(Buffer.from(packet.data).equals(bytes.subarray(sample[0],sample[0]+sample[1]))).toBe(true);
    }
    decode.mockClear();
    scrubber!.setTime(12.1);
    await vi.advanceTimersByTimeAsync(30);
    expect(decode.mock.calls[0][0].timestamp).toBe(film.packets[360][2]);
    expect(canvas.dataset.scrubPresentedTime).toBe('12.1000');
    // The requested reverse frame precedes the background predecessor fill.
    expect(decode.mock.calls.some(([packet]) => packet.timestamp === film.packets[342][2])).toBe(true);
    expect(ready).toHaveBeenCalledOnce(); expect(fail).not.toHaveBeenCalled();
    abort.abort(); expect(closed).toHaveBeenCalled(); expect(closeFrame).toHaveBeenCalled();
  });
  it('reports a hung hardware decode so the complete native fallback can take over', async () => {
    vi.useFakeTimers();
    class Decoder {
      state = 'configured';
      static async isConfigSupported() { return { supported: true }; }
      configure() {} decode() {}
      flush() { return new Promise<void>(() => {}); }
      close() { this.state = 'closed'; }
    }
    vi.stubGlobal('VideoDecoder', Decoder);
    vi.stubGlobal('EncodedVideoChunk', class {});
    vi.spyOn(HTMLCanvasElement.prototype,'getContext').mockImplementation((() => ({drawImage: vi.fn()})) as unknown as typeof HTMLCanvasElement.prototype.getContext);
    const fail = vi.fn(), abort = new AbortController();
    await createIndexedFrameScrubber(film, document.createElement('canvas'), abort.signal, vi.fn(), fail, vi.fn(), new Uint8Array(bytes));
    await vi.advanceTimersByTimeAsync(2100);
    expect(fail).toHaveBeenCalledOnce();
    abort.abort();
  });
  it('offers the native fallback when the AVC configuration is unsupported', async () => {
    vi.stubGlobal('VideoDecoder',{isConfigSupported:async()=>({supported:false})});
    const result = await createIndexedFrameScrubber(film,document.createElement('canvas'),new AbortController().signal,vi.fn(),vi.fn(),vi.fn());
    expect(result).toBeNull();
  });
  it('bounds the optional phone cache, avoids future-frame overshoot, and preserves a painted canvas on restart', async () => {
    vi.useFakeTimers();
    let output: (frame: { timestamp: number; close(): void }) => void = () => {};
    const closeFrame = vi.fn();
    class Decoder {
      state = 'configured';
      static async isConfigSupported() { return { supported: true }; }
      constructor(init: { output: typeof output }) { output = init.output; }
      configure() {}
      decode() {}
      flush() { return new Promise<void>(() => {}); }
      close() { this.state = 'closed'; }
    }
    vi.stubGlobal('VideoDecoder', Decoder);
    vi.stubGlobal('EncodedVideoChunk', class {});
    vi.spyOn(HTMLCanvasElement.prototype,'getContext').mockImplementation((() => ({drawImage: vi.fn()})) as unknown as typeof HTMLCanvasElement.prototype.getContext);
    const canvas = document.createElement('canvas');
    canvas.width = film.width; canvas.height = film.height;
    const width = vi.spyOn(canvas,'width','set');
    const height = vi.spyOn(canvas,'height','set');
    const abort = new AbortController();
    const scrubber = await createIndexedFrameScrubber(film,canvas,abort.signal,vi.fn(),vi.fn(),vi.fn(),new Uint8Array(bytes),
      { cacheLimit: 24, boundedPresentation: true, preserveFrame: true });
    expect(width).not.toHaveBeenCalled(); expect(height).not.toHaveBeenCalled();
    const emit = (index: number) => output({ timestamp: index / film.fps * 1e6, close: closeFrame });
    emit(0); emit(2);
    await vi.advanceTimersByTimeAsync(30);
    scrubber!.setTime(1 / film.fps);
    await vi.advanceTimersByTimeAsync(30);
    // Frame 2 is cached, but the phone must hold frame 0 until frame 1 arrives.
    expect(canvas.dataset.scrubPresentedTime).toBe('0.0000');
    emit(1);
    await vi.advanceTimersByTimeAsync(30);
    expect(canvas.dataset.scrubPresentedTime).toBe('0.0333');
    for (let index = 3; index < 60; index++) emit(index);
    scrubber!.setTime(2 / film.fps);
    await vi.advanceTimersByTimeAsync(30);
    expect(Number(canvas.dataset.scrubCacheFrames)).toBe(24);
    expect(closeFrame).toHaveBeenCalled();
    abort.abort();
  });
  it.each([
    { allKeyframes: true, reverseKeyframesFirst: true, expected: [10,9,8] },
    { allKeyframes: false, reverseKeyframesFirst: true, expected: [1,2,3,4,5,6,7,8,9,10] },
    { allKeyframes: true, reverseKeyframesFirst: undefined, expected: [1,2,3,4,5,6,7,8,9,10] },
  ])('prefetches independent reverse keyframes nearest-first only when opted in: $allKeyframes/$reverseKeyframesFirst', async ({ allKeyframes, reverseKeyframesFirst, expected }) => {
    vi.useFakeTimers();
    const submitted: number[] = [];
    const batches: number[][] = [];
    const pendingBatch: number[] = [];
    class Chunk { constructor(public value: { timestamp: number }) {} }
    class Decoder {
      state = 'configured';
      static async isConfigSupported() { return { supported: true }; }
      constructor(private init: { output(frame: unknown): void }) {}
      configure() {}
      decode(chunk: Chunk) {
        submitted.push(Math.round(chunk.value.timestamp / 1e6 * 30));
        pendingBatch.push(Math.round(chunk.value.timestamp / 1e6 * 30));
        this.init.output({ timestamp: chunk.value.timestamp, close() {} });
      }
      async flush() { batches.push(pendingBatch.splice(0)); }
      close() { this.state = 'closed'; }
    }
    vi.stubGlobal('VideoDecoder',Decoder); vi.stubGlobal('EncodedVideoChunk',Chunk);
    vi.spyOn(HTMLCanvasElement.prototype,'getContext').mockImplementation((() => ({ drawImage: vi.fn() })) as unknown as typeof HTMLCanvasElement.prototype.getContext);
    const packets = Array.from({ length: 40 }, (_,index) => [index,1,index / 30 * 1e6,allKeyframes || index !== 5 ? 1 : 0]);
    const sampleFilm = { ...film, bytes: 40, packets };
    const abort = new AbortController();
    const scrubber = await createIndexedFrameScrubber(sampleFilm,document.createElement('canvas'),abort.signal,vi.fn(),vi.fn(),vi.fn(),new Uint8Array(40),
      { cacheLimit: 24, reverseKeyframesFirst });
    await vi.advanceTimersByTimeAsync(30);
    scrubber!.setTime(10 / 30);
    await vi.advanceTimersByTimeAsync(30);
    scrubber!.setTime(20 / 30);
    await vi.advanceTimersByTimeAsync(30);
    scrubber!.setTime(23 / 30);
    await vi.advanceTimersByTimeAsync(30);
    submitted.length = 0;
    // Frame 10 is already cached; its reverse lookahead at frame 1 is not.
    scrubber!.setTime(10 / 30);
    await vi.advanceTimersByTimeAsync(30);
    expect(submitted.slice(0,expected.length)).toEqual(expected);
    if (allKeyframes && reverseKeyframesFirst) {
      batches.length = 0;
      scrubber!.setTime(1 / 30);
      await vi.advanceTimersByTimeAsync(30);
      expect(batches[0]).toEqual([1]);
      expect(batches[1]).toEqual([1,0]);
    }
    abort.abort();
  });
});

describe('opt-in independent packet delivery', () => {
  const chunkBytes = 512 * 1024;
  const packets = Array.from({ length: 80 }, (_, index) => [index * chunkBytes, 128, Math.round(index / 30 * 1e6), 1]);
  const independent = { ...film, bytes: chunkBytes * 80, packets };
  afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); vi.useRealTimers(); });

  function decoder() {
    vi.useFakeTimers();
    const decoded = vi.fn();
    const closeFrame = vi.fn();
    const close = vi.fn();
    class Chunk { constructor(public value: { data: Uint8Array; timestamp: number }) {} }
    class Decoder {
      state = 'configured';
      static async isConfigSupported() { return { supported: true }; }
      constructor(private init: { output(frame: unknown): void }) {}
      configure() {}
      decode(chunk: Chunk) { decoded(chunk.value); this.init.output({ timestamp: chunk.value.timestamp, close: closeFrame }); }
      async flush() {}
      close() { this.state = 'closed'; close(); }
    }
    vi.stubGlobal('VideoDecoder', Decoder);
    vi.stubGlobal('EncodedVideoChunk', Chunk);
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation((() => ({ drawImage: vi.fn() })) as unknown as typeof HTMLCanvasElement.prototype.getContext);
    return { decoded, closeFrame, close };
  }

  function rangeResponse(start: number, end: number, total = independent.bytes) {
    const data = new Uint8Array(end - start + 1).fill(Math.floor(start / chunkBytes));
    return { status: 206, headers: new Headers({ 'Content-Range': `bytes ${start}-${end}/${total}` }),
      body: new ReadableStream({ start(controller) { controller.enqueue(data); controller.close(); } }) };
  }

  function respond(_url: string, request: RequestInit) {
    const match = (request.headers as Record<string, string>).Range.match(/bytes=(\d+)-(\d+)/)!;
    return Promise.resolve(rangeResponse(Number(match[1]), Number(match[2])));
  }

  it('fetches the newest late target without downloading preceding bytes, cancels stale demand and never replays it', async () => {
    const { decoded } = decoder();
    let firstSignal: AbortSignal | undefined;
    const fetcher = vi.fn((url: string, request: RequestInit) => {
      if (!firstSignal) {
        firstSignal = request.signal as AbortSignal;
        return new Promise<ReturnType<typeof rangeResponse>>((_resolve, reject) => firstSignal!.addEventListener('abort', () => reject(new DOMException('obsolete', 'AbortError'))));
      }
      return respond(url, request);
    });
    vi.stubGlobal('fetch', fetcher);
    const canvas = document.createElement('canvas'), abort = new AbortController(), fail = vi.fn();
    const scrubber = await createIndexedFrameScrubber(independent, canvas, abort.signal, vi.fn(), fail, vi.fn(), undefined,
      { cacheLimit: 24, boundedPresentation: true, independentRanges: true });
    scrubber!.setTime(40 / 30);
    await vi.advanceTimersByTimeAsync(40);
    expect(firstSignal!.aborted).toBe(true);
    expect((fetcher.mock.calls[1][1].headers as Record<string, string>).Range).toBe(`bytes=${40 * chunkBytes}-${41 * chunkBytes - 1}`);
    expect(decoded.mock.calls[0][0].timestamp).toBe(packets[40][2]);
    expect(decoded.mock.calls[0][0].data).toEqual(new Uint8Array(128).fill(40));
    expect(canvas.dataset.scrubPresentedTime).toBe('1.3333');
    expect(Number(canvas.dataset.scrubTransferBytes)).toBeLessThan(11 * chunkBytes);
    expect(canvas.dataset.scrubRangeAborts).toBe('1');
    expect(fail).not.toHaveBeenCalled();
    decoded.mockClear();
    scrubber!.setTime(12 / 30); scrubber!.setTime(5 / 30);
    await vi.advanceTimersByTimeAsync(40);
    expect(decoded.mock.calls[0][0].timestamp).toBe(packets[5][2]);
    expect(decoded.mock.calls.some(([packet]) => packet.timestamp === packets[12][2])).toBe(false);
    expect(canvas.dataset.scrubPresentedTime).toBe('0.1667');
    abort.abort();
  });

  it('bounds compressed and decoded caches while preserving a complete frame on destroy', async () => {
    const { closeFrame, close } = decoder();
    vi.stubGlobal('fetch', vi.fn(respond));
    const canvas = document.createElement('canvas'), abort = new AbortController();
    const scrubber = await createIndexedFrameScrubber(independent, canvas, abort.signal, vi.fn(), vi.fn(), vi.fn(), undefined,
      { cacheLimit: 24, boundedPresentation: true, independentRanges: true });
    for (const index of [0, 10, 20, 30, 40, 50, 60, 70]) {
      scrubber!.setTime(index / 30);
      await vi.advanceTimersByTimeAsync(40);
      expect(Number(canvas.dataset.scrubCompressedBytes)).toBeLessThanOrEqual(16 * 1024 * 1024);
      expect(Number(canvas.dataset.scrubCacheFrames)).toBeLessThanOrEqual(24);
    }
    const presented = canvas.dataset.scrubPresentedTime;
    abort.abort();
    expect(canvas.dataset.scrubPresentedTime).toBe(presented);
    expect(canvas.dataset.scrubCompressedBytes).toBe('0');
    expect(close).toHaveBeenCalledOnce(); expect(closeFrame).toHaveBeenCalled();
    const calls = vi.mocked(fetch).mock.calls.length;
    await vi.advanceTimersByTimeAsync(40);
    expect(vi.mocked(fetch).mock.calls).toHaveLength(calls);
  });

  it('protects every chunk of a dense requested frame when cancelling an obsolete packet', async () => {
    const { decoded } = decoder();
    const dense = { ...independent, bytes: chunkBytes + 1024, packets: [
      [0, 100, 0, 1], [100, 100, 33333, 1], [200, 100, 66667, 1], [300, 100, 100000, 1],
      [chunkBytes - 100, 200, 133333, 1], [chunkBytes + 100, 100, 166667, 1],
    ] };
    let release!: () => void;
    let firstSignal!: AbortSignal;
    const fetcher = vi.fn((_url: string, request: RequestInit) => {
      const match = (request.headers as Record<string, string>).Range.match(/bytes=(\d+)-(\d+)/)!;
      const start = Number(match[1]), end = Number(match[2]);
      if (start === 0) {
        firstSignal = request.signal as AbortSignal;
        return new Promise<ReturnType<typeof rangeResponse>>(resolve => { release = () => resolve(rangeResponse(start, end, dense.bytes)); });
      }
      return Promise.resolve(rangeResponse(start, end, dense.bytes));
    });
    vi.stubGlobal('fetch', fetcher);
    const abort = new AbortController();
    const scrubber = await createIndexedFrameScrubber(dense, document.createElement('canvas'), abort.signal, vi.fn(), vi.fn(), vi.fn(), undefined,
      { cacheLimit: 24, independentRanges: true });
    scrubber!.setTime(4 / 30);
    expect(firstSignal.aborted).toBe(false);
    release(); await vi.advanceTimersByTimeAsync(40);
    expect(decoded.mock.calls[0][0].data).toEqual(Uint8Array.from([...new Uint8Array(100), ...new Uint8Array(100).fill(1)]));
    expect(fetcher.mock.calls.filter(([, request]) => (request.headers as Record<string, string>).Range.startsWith('bytes=0-'))).toHaveLength(1);
    abort.abort();
  });

  it('cancels a server ignoring Range and falls back once instead of downloading a full movie per seek', async () => {
    decoder();
    const cancel = vi.fn();
    const fetcher = vi.fn(async () => ({ status: 200, body: { cancel } }));
    vi.stubGlobal('fetch', fetcher);
    const fail = vi.fn(), abort = new AbortController();
    const scrubber = await createIndexedFrameScrubber(independent, document.createElement('canvas'), abort.signal, vi.fn(), fail, vi.fn(), undefined,
      { independentRanges: true });
    await vi.advanceTimersByTimeAsync(30);
    for (const index of [40, 10, 60]) scrubber!.setTime(index / 30);
    await vi.advanceTimersByTimeAsync(30);
    expect(fetcher).toHaveBeenCalledOnce(); expect(cancel).toHaveBeenCalledOnce(); expect(fail).toHaveBeenCalledOnce();
    abort.abort();
  });

  it('aborts pending range reads on destroy without reporting an expected abort as failure', async () => {
    const { close } = decoder();
    let rangeSignal!: AbortSignal;
    vi.stubGlobal('fetch', vi.fn((_url: string, request: RequestInit) => new Promise((_resolve, reject) => {
      rangeSignal = request.signal as AbortSignal;
      rangeSignal.addEventListener('abort', () => reject(new DOMException('disposed', 'AbortError')));
    })));
    const fail = vi.fn(), abort = new AbortController();
    await createIndexedFrameScrubber(independent, document.createElement('canvas'), abort.signal, vi.fn(), fail, vi.fn(), undefined,
      { independentRanges: true });
    abort.abort(); await vi.advanceTimersByTimeAsync(30);
    expect(rangeSignal.aborted).toBe(true); expect(close).toHaveBeenCalledOnce(); expect(fail).not.toHaveBeenCalled();
  });

  it('keeps inter-frame sources on their existing streaming path even if the option is supplied', async () => {
    decoder();
    const inter = { ...film, bytes: 2, packets: [[0, 1, 0, 1], [1, 1, 33333, 0]] };
    const fetcher = vi.fn(async () => ({ ok: true, body: new ReadableStream({ start(controller) { controller.enqueue(new Uint8Array(2)); controller.close(); } }) }));
    vi.stubGlobal('fetch', fetcher);
    const abort = new AbortController();
    await createIndexedFrameScrubber(inter, document.createElement('canvas'), abort.signal, vi.fn(), vi.fn(), vi.fn(), undefined,
      { independentRanges: true });
    await vi.advanceTimersByTimeAsync(30);
    expect(vi.mocked(fetch).mock.calls[0][1]).not.toHaveProperty('headers');
    abort.abort();
  });
});
