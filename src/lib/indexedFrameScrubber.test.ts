import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import film from '../../config/process-video-hq.json';
import { createIndexedFrameScrubber } from './indexedFrameScrubber';
import mobileFilm from '../../config/process-video-scrub.json';

const bytes = readFileSync(`public${film.source}`);
describe('original-packet Process frame rendering', () => {
  afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); vi.useRealTimers(); });
  it('indexes every original frame without modifying the native MP4', () => {
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(film.sha256);
    expect([film.width,film.height,film.fps,film.packets.length]).toEqual([1920,1080,30,769]);
    expect(film.packets.filter(p=>p[3]).length).toBe(129);
    expect(film.packets.every(([position,size],index)=>position+size<=bytes.length && (index===0 || film.packets[index-1][2]<film.packets[index][2]))).toBe(true);
  });
  it('keeps the mobile manifest aligned and its original source unchanged', () => {
    const mobileBytes = readFileSync(`public${mobileFilm.source}`);
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
    const scrubber = await createIndexedFrameScrubber(film,canvas,abort.signal,ready,fail,vi.fn());
    await vi.advanceTimersByTimeAsync(30);
    for (const time of [12,13,14,15,16]) { scrubber!.setTime(time); await vi.advanceTimersByTimeAsync(30); }
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
  it('offers the native fallback when the AVC configuration is unsupported', async () => {
    vi.stubGlobal('VideoDecoder',{isConfigSupported:async()=>({supported:false})});
    const result = await createIndexedFrameScrubber(film,document.createElement('canvas'),new AbortController().signal,vi.fn(),vi.fn(),vi.fn());
    expect(result).toBeNull();
  });
});
