import film from '../../config/hero-v1-frames.json';

export const heroImageDuration = film.sourceFrames / film.fps;

/** Independently decoded poses from the accepted film. The scroll position
 * chooses the image; nothing advances on a playback clock. */
export function createHeroImageScrubber(canvas: HTMLCanvasElement, signal: AbortSignal, ready: () => void, fail: () => void, present: (time: number) => void) {
  if (typeof createImageBitmap !== 'function' || signal.aborted) return null;
  const context = canvas.getContext('2d', { alpha: false, desynchronized: true });
  if (!context) return null;
  canvas.width = film.width; canvas.height = film.height;
  const CHUNK = 512 * 1024, MAX_CHUNKS = 32;
  const MAX_FRAMES = ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 0) >= 8 ? 28 : 18;
  const chunks = new Map<number, Uint8Array>();
  const requests = new Map<number, { abort: AbortController; promise: Promise<Uint8Array> }>();
  const images = new Map<number, ImageBitmap>();
  const decoding = new Map<number, Promise<ImageBitmap>>();
  let target = 0, drawn = -1, direction = 1, disposed = false, failed = false;
  let busy = false, warming = false, raf = 0, received = 0, draws = 0;
  let requestedAt = performance.now(), maxLatency = 0;
  const chunkAt = () => Math.floor(film.frames[target][0] / CHUNK);
  const distance = (id: number) => Math.abs(id-chunkAt()) + ((id-chunkAt())*direction < 0 ? .5 : 0);
  async function bytes(id: number) {
    const cached = chunks.get(id);
    if (cached) return cached;
    const job = requests.get(id);
    if (job) return job.promise;
    const abort = new AbortController();
    const start = id*CHUNK, end = Math.min(film.bytes-1, start+CHUNK-1);
    const promise = (async () => {
      const response = await fetch(film.source, { signal: abort.signal, cache: 'force-cache', headers: { Range: `bytes=${start}-${end}` } });
      if (response.status !== 206 || response.headers.get('content-range') !== `bytes ${start}-${end}/${film.bytes}`) throw new Error('Frame range differs from index');
      const data = new Uint8Array(await response.arrayBuffer());
      if (disposed || data.length !== end-start+1) throw new Error('Incomplete frame range');
      received += data.length; chunks.set(id,data);
      while (chunks.size > MAX_CHUNKS) chunks.delete([...chunks.keys()].reduce((a,b) => distance(a) > distance(b) ? a : b));
      canvas.dataset.scrubFetchedBytes = String(received);
      canvas.dataset.scrubByteCache = String([...chunks.values()].reduce((sum,b) => sum+b.length,0));
      return data;
    })().finally(() => { if (requests.get(id)?.abort === abort) requests.delete(id); });
    requests.set(id,{abort,promise});
    return promise;
  }
  async function image(index: number): Promise<ImageBitmap> {
    const cached = images.get(index);
    if (cached) return cached;
    const job = decoding.get(index);
    if (job) return job;
    const promise = (async () => {
      const [offset,size] = film.frames[index];
      const first = Math.floor(offset/CHUNK), last = Math.floor((offset+size-1)/CHUNK);
      const parts = await Promise.all(Array.from({length:last-first+1},(_,i) => bytes(first+i)));
      if (disposed) throw new Error('Disposed');
      const data = new Uint8Array(size); let written = 0;
      parts.forEach((part,i) => {
        const start = i === 0 ? offset%CHUNK : 0;
        const slice = part.subarray(start,Math.min(part.length,start+size-written));
        data.set(slice,written); written += slice.length;
      });
      const bitmap = await createImageBitmap(new Blob([data.buffer],{type:'image/webp'}));
      if (disposed) { bitmap.close(); throw new Error('Disposed'); }
      images.set(index,bitmap);
      while (images.size > MAX_FRAMES) {
        const farthest = [...images.keys()].reduce((a,b) => Math.abs(a-target) > Math.abs(b-target) ? a : b);
        images.get(farthest)?.close(); images.delete(farthest);
      }
      canvas.dataset.scrubCacheFrames = String(images.size);
      queue();
      return bitmap;
    })().finally(() => decoding.delete(index));
    decoding.set(index,promise);
    return promise;
  }
  const draw = () => {
    raf = 0;
    if (disposed || document.hidden || drawn === target) return;
    const candidates = [...images.keys()].filter(index => index >= Math.min(drawn,target) && index <= Math.max(drawn,target));
    if (!candidates.length) return;
    const index = images.has(target) ? target : candidates.reduce((a,b) => Math.abs(a-target) < Math.abs(b-target) ? a : b);
    if (index === drawn) return;
    const bitmap = images.get(index);
    if (!bitmap) return;
    context.drawImage(bitmap,0,0,film.width,film.height);
    drawn = index;
    const latency = performance.now()-requestedAt;
    maxLatency = Math.max(maxLatency,latency);
    canvas.dataset.scrubLastMs = latency.toFixed(1);
    canvas.dataset.scrubMaxMs = maxLatency.toFixed(1);
    canvas.dataset.scrubPresentedFrames = String(++draws);
    canvas.dataset.scrubPresentedTime = (film.frames[drawn][2]/film.fps).toFixed(4);
    if (draws === 1) { canvas.dataset.scrubLoadMs = latency.toFixed(1); ready(); }
    present(film.frames[drawn][2]/film.fps);
    void warm();
  };
  const queue = () => { if (!disposed && !raf && !document.hidden) raf = requestAnimationFrame(draw); };
  async function warm() {
    if (warming || disposed || failed || document.hidden) return;
    warming = true;
    const origin = target, heading = direction;
    try {
      // Two short speculative decodes can run alongside the foreground.
      // A cached approaching pose keeps active input moving while the exact
      // latest pose loads. Idle prefetch never advances beyond that target.
      for (let step=1;step<=12 && target===origin;step+=2) {
        await Promise.all([step,step+1].map(async distance => {
          const index = origin+heading*distance;
          if (index >= 0 && index < film.frames.length) await image(index);
        }));
      }
    } catch { /* Speculation does not trigger fallback. */ }
    finally { warming = false; if (target !== origin && !disposed && !failed) void warm(); }
  }
  async function pump() {
    queue();
    if (busy || disposed || failed || document.hidden || images.has(target)) return;
    busy = true; const index = target; let retry = false;
    try { await image(index); }
    catch (error) {
      if (error instanceof Error && error.name === 'AbortError') retry = true;
      else if (!disposed && index === target) {
        failed = true;
        canvas.parentElement?.setAttribute('data-film-failure',error instanceof Error ? error.message : 'Frame unavailable');
        fail();
      }
    } finally {
      busy = false; queue();
      if (!disposed && !failed && (retry || index !== target)) void pump();
    }
  }
  const setTime = (time: number) => {
    const index = Math.min(film.frames.length-1,Math.max(0,Math.round(time*film.fps/film.sampleStride)));
    if (index !== target) { direction = index > target ? 1 : -1; target = index; requestedAt = performance.now(); }
    canvas.dataset.scrubTarget = (film.frames[target][2]/film.fps).toFixed(4);
    // Fetch a small compressed runway; keep the existing 16 MiB cache cap.
    for (const [id,request] of requests) {
      if (Math.abs(id-chunkAt()) > 4) { request.abort.abort(); requests.delete(id); }
    }
    for (let step=0;step<=2;step++) {
      const id = chunkAt()+direction*step;
      if (id >= 0 && id*CHUNK < film.bytes) void bytes(id).catch(() => {});
    }
    void pump();
  };
  const visibility = () => { if (!document.hidden) void pump(); };
  const dispose = () => {
    if (disposed) return;
    disposed = true; cancelAnimationFrame(raf);
    for (const request of requests.values()) request.abort.abort();
    for (const bitmap of images.values()) bitmap.close();
    chunks.clear(); images.clear();
    document.removeEventListener('visibilitychange',visibility);
  };
  signal.addEventListener('abort',dispose,{once:true});
  document.addEventListener('visibilitychange',visibility);
  canvas.dataset.scrubMode = 'scroll'; setTime(0);
  return { setTime, seek: setTime, dispose };
}
