import film from '../../config/hero-v1-video.json';

export const indexedHeroFilm = film.source;
const last = film.packets.length - 1;
/** Decode indexed AVC packets near the current scroll position.
 * Bounded byte ranges avoid downloading the film prefix before a late seek.
 */
export async function createH264FrameScrubber(canvas: HTMLCanvasElement, signal: AbortSignal, ready: () => void, fail: () => void) {
  if (typeof VideoDecoder === 'undefined') return null;
  const description = Uint8Array.from(atob(film.description), character => character.charCodeAt(0));
  const config: VideoDecoderConfig = { codec: film.codec, codedWidth: film.width, codedHeight: film.height, description, optimizeForLatency: true, hardwareAcceleration: 'no-preference' };
  if (!(await VideoDecoder.isConfigSupported(config)).supported || signal.aborted) return null;
  const context = canvas.getContext('2d', { alpha: false, desynchronized: true });
  if (!context) return null;
  // Keep decoded delivery frames, with a smaller budget on memory-limited
  // devices. Unknown devices use the conservative budget.
  const CACHE_LIMIT = typeof navigator !== 'undefined' && ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 0) >= 8 ? 60 : 36;
  const LOOK_AHEAD = Math.floor(CACHE_LIMIT / 2) - 6;
  canvas.width = film.width;
  canvas.height = film.height;
  const CHUNK_BYTES = 512 * 1024;
  const MAX_CHUNKS = 32;
  const chunks = new Map<number, Uint8Array>();
  const pending = new Map<number, { promise: Promise<Uint8Array>; abort: AbortController }>();
  let received = 0;
  const currentChunk = () => Math.floor(film.packets[target][0] / CHUNK_BYTES);
  async function chunk(id: number) {
    const cached = chunks.get(id);
    if (cached) return cached;
    const existing = pending.get(id);
    if (existing) return existing.promise;
    const abort = new AbortController();
    const start = id * CHUNK_BYTES;
    const end = Math.min(film.bytes - 1, start + CHUNK_BYTES - 1);
    const promise = (async () => {
      const response = await fetch(film.source, { signal: abort.signal, headers: { Range: `bytes=${start}-${end}` }, cache: 'force-cache' });
      if (response.status !== 206 || response.headers.get('content-range') !== `bytes ${start}-${end}/${film.bytes}`) throw new Error('Film range differs from index');
      const data = new Uint8Array(await response.arrayBuffer());
      if (data.length !== end - start + 1) throw new Error('Incomplete film range');
      if (disposed) throw new Error('Disposed');
      received += data.length;
      chunks.set(id, data);
      while (chunks.size > MAX_CHUNKS) {
        const farthest = [...chunks.keys()].reduce((a,b) => Math.abs(a-currentChunk()) > Math.abs(b-currentChunk()) ? a : b);
        chunks.delete(farthest);
      }
      canvas.dataset.scrubFetchedBytes = String(received);
      canvas.dataset.scrubByteCache = String([...chunks.values()].reduce((sum, bytes) => sum + bytes.length, 0));
      return data;
    })().finally(() => { if (pending.get(id)?.abort === abort) pending.delete(id); });
    pending.set(id, { promise, abort });
    return promise;
  }
  async function packetBytes(index: number) {
    const [offset, size] = film.packets[index];
    const firstChunk = Math.floor(offset / CHUNK_BYTES);
    const lastChunk = Math.floor((offset + size - 1) / CHUNK_BYTES);
    const parts = await Promise.all(Array.from({ length: lastChunk - firstChunk + 1 }, (_, i) => chunk(firstChunk + i)));
    if (parts.length === 1) return parts[0].subarray(offset % CHUNK_BYTES, offset % CHUNK_BYTES + size);
    const result = new Uint8Array(size);
    let written = 0;
    for (let i = 0; i < parts.length; i++) {
      const start = i === 0 ? offset % CHUNK_BYTES : 0;
      const part = parts[i].subarray(start, Math.min(parts[i].length, start + size - written));
      result.set(part, written); written += part.length;
    }
    return result;
  }
  const frames = new Map<number, VideoFrame>();
  let target = 0;
  let drawn = -1;
  let requestedAt = performance.now();
  let raf = 0;
  let busy = false;
  let disposed = false;
  let failed = false;
  let first = true;
  let draws = 0;
  let elapsed = 0;
  let maxLatency = 0;
  let generation = 0;
  let jobTarget = 0;
  let fetching = false;
  let activeRanges = new Set<number>();
  let direction = 1;

  const draw = () => {
    raf = 0;
    if (disposed || document.hidden || drawn === target || !frames.size) return;
    // Approach the requested position without crossing it. A cached future
    // frame must not overshoot, then visibly rewind when the exact frame lands.
    const candidates = [...frames.keys()].filter(index => index >= Math.min(drawn,target) && index <= Math.max(drawn,target));
    if (!candidates.length) return;
    const present = frames.has(target) ? target : candidates.reduce((a,b) => Math.abs(a-target) < Math.abs(b-target) ? a : b);
    if (present === drawn) return;
    const frame = frames.get(present);
    if (!frame) return;
    context.drawImage(frame, 0, 0, film.width, film.height);
    drawn = present;
    const latency = performance.now() - requestedAt;
    canvas.dataset.scrubPresentedFrames = String(++draws);
    canvas.dataset.scrubPresentedTime = (present / film.fps).toFixed(4);
    if (first) canvas.dataset.scrubLoadMs = latency.toFixed(1);
    else {
      elapsed += latency;
      maxLatency = Math.max(maxLatency, latency);
      canvas.dataset.scrubMeanMs = (elapsed / (draws-1)).toFixed(1);
      canvas.dataset.scrubMaxMs = maxLatency.toFixed(1);
      canvas.dataset.scrubLastMs = latency.toFixed(1);
    }
    canvas.dataset.scrubCacheFrames = String(frames.size);
    if (first) { first = false; ready(); }
  };
  const queueDraw = () => { if (!disposed && !raf) raf = requestAnimationFrame(draw); };
  const decoder = new VideoDecoder({
    output(frame) {
      if (disposed) { frame.close(); return; }
      const index = Math.round(frame.timestamp / 1e6 * film.fps);
      frames.get(index)?.close();
      frames.set(index, frame);
      while (frames.size > CACHE_LIMIT) {
        const farthest = [...frames.keys()].reduce((a,b) => Math.abs(a-target) > Math.abs(b-target) ? a : b);
        frames.get(farthest)?.close(); frames.delete(farthest);
      }
      queueDraw();
    },
    error(error) { if (!disposed) { canvas.parentElement?.setAttribute("data-film-failure", error.name); failed = true; fail(); } },
  });
  decoder.configure(config);

  async function pump() {
    if (disposed || failed || busy || document.hidden) return;
    queueDraw();
    // Fetch a short compressed runway while the decoder works. Speculative
    // requests never choose a frame or trigger fallback on their own.
    for (let step = 1; step <= 3; step++) {
      const id = currentChunk() + direction * step;
      if (id >= 0 && id * CHUNK_BYTES < film.bytes) void chunk(id).catch(() => {});
    }
    const ahead = Math.min(last, Math.max(0, target + direction * LOOK_AHEAD));
    const needsTarget = !frames.has(target);
    let missing = target;
    if (!needsTarget) {
      while (missing !== ahead && frames.has(missing)) missing += direction;
      if (frames.has(missing)) return;
    }
    // Present a missing target first, then fill a short directional buffer.
    let start = needsTarget ? target : direction < 0 ? ahead : missing;
    while (start > 0 && !film.packets[start][3]) start--;
    const end = needsTarget ? Math.min(last, target + 2) : direction < 0 ? missing : ahead;
    busy = true;
    fetching = true;
    jobTarget = target;
    const jobGeneration = generation;
    const firstRange = Math.floor(film.packets[start][0] / CHUNK_BYTES);
    const endPacket = film.packets[end];
    const lastRange = Math.floor((endPacket[0]+endPacket[1]-1) / CHUNK_BYTES);
    activeRanges = new Set(Array.from({ length: lastRange-firstRange+1 }, (_, i) => firstRange+i));
    try {
      const packets = await Promise.all(Array.from({ length: end-start+1 }, (_, i) => packetBytes(start+i)));
      if (disposed || generation !== jobGeneration) return;
      fetching = false;
      for (let index = start; index <= end; index++) {
        const [, , timestamp, key] = film.packets[index];
        decoder.decode(new EncodedVideoChunk({ type: key ? 'key' : 'delta', timestamp, data: packets[index-start] }));
      }
      await decoder.flush();
    } catch (error) { if (!disposed && generation === jobGeneration) { canvas.parentElement?.setAttribute("data-film-failure", error instanceof Error ? error.message : "Film unavailable"); failed = true; fail(); } }
    finally { if (generation === jobGeneration) { busy = false; fetching = false; activeRanges.clear(); } }
    if (!disposed && generation === jobGeneration) void pump();
  }
  const visibility = () => { if (!document.hidden) { requestedAt = performance.now(); void pump(); } };
  document.addEventListener('visibilitychange', visibility);
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    for (const job of pending.values()) job.abort.abort();
    pending.clear(); chunks.clear();
    cancelAnimationFrame(raf);
    document.removeEventListener('visibilitychange', visibility);
    if (decoder.state !== 'closed') decoder.close();
    for (const frame of frames.values()) frame.close();
    frames.clear();
  };
  signal.addEventListener('abort', dispose, { once: true });
  void pump();
  return {
    setTime(time: number) {
      const next = Math.min(last,Math.max(0,Math.round(time*film.fps)));
      if (target !== next) { direction = next > target ? 1 : -1; target = next; requestedAt = performance.now(); }
      if (busy && fetching && Math.abs(target-jobTarget) > LOOK_AHEAD) {
        generation++;
        busy = false;
        activeRanges.clear();
      }
      for (const [id, job] of pending) {
        if (!activeRanges.has(id) && Math.abs(id-currentChunk()) > 4) { job.abort.abort(); pending.delete(id); }
      }
      canvas.dataset.scrubTarget = (target / film.fps).toFixed(4);
      void pump();
    },
    dispose,
  };
}

export const heroFilmDuration = film.packets.length / film.fps;
