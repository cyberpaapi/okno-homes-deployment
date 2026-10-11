import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import film from '../../config/hero-v1-video.json';
import { createH264FrameScrubber } from './h264FrameScrubber';

const bytes = readFileSync(`public${film.source}`);
describe('merged-film packet rendering', () => {
  afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); vi.useRealTimers(); });
  it('indexes every merged frame without modifying the MP4', () => {
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(film.sha256);
    expect([film.width,film.height,film.fps,film.packets.length]).toEqual([1920,1080,24,577]);
    expect(film.packets.filter(p=>p[3]).length).toBe(193);
    expect(film.packets.every(([position,size],index)=>position+size<=bytes.length && (index===0 || film.packets[index-1][2]<film.packets[index][2]))).toBe(true);
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
    const scrubber = await createH264FrameScrubber(canvas,abort.signal,ready,fail);
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
    scrubber!.setTime(12.125);
    await vi.advanceTimersByTimeAsync(30);
    expect(decode.mock.calls[0][0].timestamp).toBe(film.packets[291][2]);
    expect(canvas.dataset.scrubPresentedTime).toBe('12.1250');
    // The requested reverse frame precedes the background predecessor fill.
    expect(decode.mock.calls.some(([packet]) => packet.timestamp === film.packets[270][2])).toBe(true);
    expect(ready).toHaveBeenCalledOnce(); expect(fail).not.toHaveBeenCalled();
    abort.abort(); expect(closed).toHaveBeenCalled(); expect(closeFrame).toHaveBeenCalled();
  });
  it('offers the native fallback when the AVC configuration is unsupported', async () => {
    vi.stubGlobal('VideoDecoder',{isConfigSupported:async()=>({supported:false})});
    const result = await createH264FrameScrubber(document.createElement('canvas'),new AbortController().signal,vi.fn(),vi.fn());
    expect(result).toBeNull();
  });
});
