/** Original-packet renderer; independent range delivery is explicitly opt-in. */
export type IndexedFilm = {
  source: string; bytes: number; width: number; height: number; fps: number;
  codec: string; description: string; packets: number[][];
};
const CACHE_LIMIT = typeof navigator !== 'undefined' && ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 0) >= 8 ? 96 : 48;
type ScrubberOptions = { cacheLimit?: number; boundedPresentation?: boolean; preserveFrame?: boolean; reverseKeyframesFirst?: boolean; independentRanges?: boolean };

/** Decode original AVC packets, avoiding the native player's seek pipeline.
 * The compressed source is streamed once; at most 48/96 native frames live.
 */
export async function createIndexedFrameScrubber(film: IndexedFilm, canvas: HTMLCanvasElement, signal: AbortSignal, ready: () => void, fail: () => void, onPresent: (time: number) => void, fullData?: Uint8Array, options: ScrubberOptions = {}) {
  const cacheLimit = Number.isFinite(options.cacheLimit) ? Math.min(96, Math.max(8, Math.floor(options.cacheLimit!))) : CACHE_LIMIT;
  const lookAhead = Math.floor(cacheLimit / 2) - 3;
  const independentReverse = options.reverseKeyframesFirst && film.packets.every(packet => Boolean(packet[3]));
  // Independent keyframes can be requested directly without downloading the
  // preceding movie. Inter-frame films and existing callers keep streaming.
  const independentRanges = Boolean(options.independentRanges && !fullData &&
    film.packets.length && film.packets.every(([offset, size, , key]) => Boolean(key) &&
      offset >= 0 && size > 0 && offset + size <= film.bytes &&
      Math.ceil(((offset % (512 * 1024)) + size) / (512 * 1024)) <= 32));
  const last = film.packets.length - 1;
  if (typeof VideoDecoder === 'undefined') return null;
  const description = Uint8Array.from(atob(film.description), character => character.charCodeAt(0));
  const config: VideoDecoderConfig = { codec: film.codec, codedWidth: film.width, codedHeight: film.height, description, optimizeForLatency: true, hardwareAcceleration: 'no-preference' };
  if (!(await VideoDecoder.isConfigSupported(config)).supported || signal.aborted) return null;
  const context = canvas.getContext('2d', { alpha: false, desynchronized: true });
  if (!context) return null;
  if (!options.preserveFrame || canvas.width !== film.width) canvas.width = film.width;
  if (!options.preserveFrame || canvas.height !== film.height) canvas.height = film.height;
  if (fullData && fullData.length !== film.bytes) return null;
  const source = independentRanges ? null : fullData ?? new Uint8Array(film.bytes);
  const frames = new Map<number, VideoFrame>();
  let available = fullData?.length ?? 0;
  let target = 0;
  let drawn = -1;
  let requestedAt = performance.now();
  let raf = 0;
  let busy = false;
  let disposed = false;
  let first = true;
  let draws = 0;
  let elapsed = 0;
  let maxLatency = 0;
  let generation = 0;
  let jobTarget = 0;
  let direction = 1;
  const chunkBytes = 512 * 1024;
  const compressedLimit = 16 * 1024 * 1024;
  const chunks = new Map<number, Uint8Array>();
  const pendingChunks = new Map<number, { abort: AbortController; promise: Promise<Uint8Array> }>();
  let compressedBytes = 0;
  let transferBytes = 0;
  let rangeRequests = 0;
  let rangeAborts = 0;
  let rangeRevision = 0;
  let rangeFailed = false;
  const publishRanges = () => {
    canvas.dataset.scrubDelivery = 'independent-ranges';
    canvas.dataset.scrubTransferBytes = String(transferBytes);
    canvas.dataset.scrubCompressedBytes = String(compressedBytes);
    canvas.dataset.scrubRangeRequests = String(rangeRequests);
    canvas.dataset.scrubRangeAborts = String(rangeAborts);
  };
  const packetChunks = (index: number) => {
    const [offset, size] = film.packets[index];
    const first = Math.floor(offset / chunkBytes), end = Math.floor((offset + size - 1) / chunkBytes);
    return Array.from({ length: end - first + 1 }, (_, number) => first + number);
  };
  const cancelObsoleteRanges = () => {
    const required = new Set(packetChunks(target));
    for (const [index, request] of pendingChunks) {
      if (!required.has(index)) { request.abort.abort(); pendingChunks.delete(index); rangeAborts++; }
    }
    publishRanges();
  };
  const getChunk = (index: number): Promise<Uint8Array> => {
    const cached = chunks.get(index);
    if (cached) return Promise.resolve(cached);
    const pending = pendingChunks.get(index);
    if (pending) return pending.promise;
    const abort = new AbortController();
    const request = { abort, promise: Promise.resolve(new Uint8Array()) as Promise<Uint8Array> };
    const start = index * chunkBytes, end = Math.min(film.bytes - 1, start + chunkBytes - 1);
    rangeRequests++; publishRanges();
    request.promise = (async () => {
      const response = await fetch(film.source, { signal: abort.signal, cache: 'force-cache', headers: { Range: `bytes=${start}-${end}` } });
      // A server ignoring Range must not trigger a fresh full movie per pose.
      // Cancel this response and hand off once to the native player instead.
      if (response.status !== 206 || !response.body) {
        await response.body?.cancel();
        throw new Error('Independent byte ranges unavailable');
      }
      const contentRange = response.headers.get('Content-Range');
      if (contentRange !== `bytes ${start}-${end}/${film.bytes}`) {
        await response.body.cancel();
        throw new Error('Film differs from range index');
      }
      const data = new Uint8Array(end - start + 1);
      const reader = response.body.getReader();
      let received = 0;
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          transferBytes += value.byteLength; publishRanges();
          if (received + value.byteLength > data.byteLength) throw new Error('Film range exceeds index');
          data.set(value, received); received += value.byteLength;
        }
        if (received !== data.byteLength) throw new Error('Incomplete film range');
      } catch (error) { await reader.cancel().catch(() => {}); throw error; }
      if (disposed || abort.signal.aborted) throw new DOMException('Obsolete film range', 'AbortError');
      chunks.set(index, data); compressedBytes += data.byteLength;
      const required = new Set(packetChunks(target));
      const centre = film.packets[target][0] / chunkBytes;
      while (compressedBytes > compressedLimit) {
        const candidates = [...chunks.keys()].filter(number => !required.has(number));
        if (!candidates.length) break;
        const farthest = candidates.reduce((a, b) => Math.abs(a - centre) >= Math.abs(b - centre) ? a : b);
        compressedBytes -= chunks.get(farthest)!.byteLength; chunks.delete(farthest);
      }
      publishRanges();
      return data;
    })().finally(() => { if (pendingChunks.get(index) === request) pendingChunks.delete(index); });
    pendingChunks.set(index, request);
    return request.promise;
  };
  const getPacket = async (index: number) => {
    const indices = packetChunks(index);
    const parts = await Promise.all(indices.map(getChunk));
    const [offset, size] = film.packets[index];
    const packet = new Uint8Array(size);
    for (let part = 0; part < indices.length; part++) {
      const start = Math.max(offset, indices[part] * chunkBytes);
      const end = Math.min(offset + size, (indices[part] + 1) * chunkBytes);
      packet.set(parts[part].subarray(start - indices[part] * chunkBytes, end - indices[part] * chunkBytes), start - offset);
    }
    return packet;
  };

  const draw = () => {
    raf = 0;
    if (disposed || document.hidden || drawn === target || !frames.size) return;
    // During a continuous gesture, do not hold the old picture while waiting
    // for a target that moves every RAF. Present the closest original frame.
    const candidates = [...frames.keys()].filter(index => !options.boundedPresentation ||
      (drawn < 0 ? index === target : index >= Math.min(drawn,target) && index <= Math.max(drawn,target)));
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
    onPresent(present / film.fps);
    if (first) { first = false; ready(); }
  };
  const queueDraw = () => { if (!disposed && !raf) raf = requestAnimationFrame(draw); };
  const decoder = new VideoDecoder({
    output(frame) {
      if (disposed) { frame.close(); return; }
      const index = Math.round(frame.timestamp / 1e6 * film.fps);
      frames.get(index)?.close();
      frames.set(index, frame);
      while (frames.size > cacheLimit) {
        const farthest = [...frames.keys()].reduce((a,b) => Math.abs(a-target) > Math.abs(b-target) ? a : b);
        frames.get(farthest)?.close(); frames.delete(farthest);
      }
      queueDraw();
    },
    error() { if (!disposed) { if (independentRanges) rangeFailed = true; fail(); } },
  });
  decoder.configure(config);

  async function pumpIndependent() {
    queueDraw();
    if (busy || rangeFailed) return;
    const ahead = Math.min(last, Math.max(0, target + direction * lookAhead));
    if (frames.has(target) && frames.has(ahead)) return;
    const revision = rangeRevision;
    const indices = frames.has(target)
      ? Array.from({ length: Math.abs(ahead - target) }, (_, index) => target + direction * (index + 1)).filter(index => !frames.has(index))
      : [target];
    if (!indices.length) return;
    busy = true;
    try {
      for (const index of indices) {
        const data = await getPacket(index);
        if (disposed || document.hidden || revision !== rangeRevision) break;
        const [, , timestamp] = film.packets[index];
        decoder.decode(new EncodedVideoChunk({ type: 'key', timestamp, data }));
        let deadline: ReturnType<typeof setTimeout> | undefined;
        try {
          await Promise.race([decoder.flush(), new Promise<never>((_resolve, reject) => {
            deadline = setTimeout(() => reject(new Error('Decoder stalled')), 2000);
          })]);
        } finally { clearTimeout(deadline); }
        if (revision !== rangeRevision) break;
      }
    } catch (error) {
      if (!disposed && !(error instanceof DOMException && error.name === 'AbortError')) {
        rangeFailed = true;
        for (const request of pendingChunks.values()) request.abort.abort();
        fail();
      }
    } finally { busy = false; }
    if (!disposed && !document.hidden && !rangeFailed) void pump();
  }

  async function pump() {
    if (disposed || document.hidden) return;
    if (independentRanges) { void pumpIndependent(); return; }
    // Cached frames remain usable while a speculative hardware decode waits.
    queueDraw();
    if (busy) return;
    const window = independentReverse && direction < 0 ? 2 : lookAhead;
    const ahead = Math.min(last,Math.max(0,target + direction*window));
    if (frames.has(target) && frames.has(ahead)) return;
    const needsTarget = !frames.has(target);
    // Decode the requested frame before filling the directional buffer. In
    // reverse, decoding the predecessor buffer first would add visible latency.
    if (!needsTarget && film.packets[ahead][0] + film.packets[ahead][1] > available) return;
    let start = needsTarget ? target : direction < 0 ? Math.max(0,target-window) : Math.min(last,target+1);
    while (start > 0 && !film.packets[start][3]) start--;
    let end = needsTarget ? independentReverse && direction < 0 ? target : Math.min(last,target+2) : direction < 0 ? target : Math.min(last,target+window);
    while (end >= start && film.packets[end][0] + film.packets[end][1] > available) end--;
    if (end < start || (needsTarget && end < target)) return;
    busy = true;
    jobTarget = target;
    const jobGeneration = generation;
    let deadline: ReturnType<typeof setTimeout> | undefined;
    try {
      // Independent keyframes can fill the reverse buffer nearest-first.
      // Inter-frame GOPs retain their required chronological decode order.
      const reverse = options.reverseKeyframesFirst && direction < 0 && !needsTarget &&
        film.packets.slice(start,end+1).every(packet => Boolean(packet[3]));
      for (let index = reverse ? end : start; reverse ? index >= start : index <= end; index += reverse ? -1 : 1) {
        const [offset,size,timestamp,key] = film.packets[index];
        decoder.decode(new EncodedVideoChunk({ type: key ? 'key' : 'delta', timestamp, data: source!.subarray(offset,offset+size) }));
      }
      await Promise.race([
        decoder.flush(),
        new Promise<never>((_resolve, reject) => { deadline = setTimeout(() => reject(new Error('Decoder stalled')), 2000); }),
      ]);
    } catch { if (!disposed && generation === jobGeneration) fail(); }
    finally { clearTimeout(deadline); if (generation === jobGeneration) busy = false; }
    if (generation !== jobGeneration) return;
    // A scroll gesture can change direction while these packets are decoding.
    if (!disposed) void pump();
  }
  const visibility = () => { if (!document.hidden) { requestedAt = performance.now(); void pump(); } };
  document.addEventListener('visibilitychange', visibility);
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    signal.removeEventListener('abort', dispose);
    cancelAnimationFrame(raf);
    document.removeEventListener('visibilitychange', visibility);
    for (const request of pendingChunks.values()) request.abort.abort();
    pendingChunks.clear(); chunks.clear(); compressedBytes = 0;
    if (independentRanges) publishRanges();
    if (decoder.state !== 'closed') decoder.close();
    for (const frame of frames.values()) frame.close();
    frames.clear();
  };
  signal.addEventListener('abort', dispose, { once: true });
  if (fullData || independentRanges) void pump();
  else void (async () => {
    try {
      const response = await fetch(film.source, { signal, cache: 'force-cache' });
      if (!response.ok || !response.body) throw new Error('Film unavailable');
      const reader = response.body.getReader();
      while (!disposed) {
        const { value, done } = await reader.read();
        if (done) break;
        if (available + value.byteLength > source!.byteLength) throw new Error('Film differs from index');
        source!.set(value,available); available += value.byteLength;
        void pump();
      }
      if (!disposed && available !== film.bytes) throw new Error('Incomplete film');
      void pump();
    } catch { if (!disposed) fail(); }
  })();
  return {
    setTime(time: number) {
      const next = Math.min(last,Math.max(0,Math.round(time*film.fps)));
      if (target !== next) {
        direction = next > target ? 1 : -1; target = next; requestedAt = performance.now();
        if (independentRanges) { rangeRevision++; cancelObsoleteRanges(); }
      }
      if (!independentRanges && busy && !frames.has(target) && Math.abs(target-jobTarget) > 6) {
        generation++;
        decoder.reset();
        decoder.configure(config);
        busy = false;
      }
      canvas.dataset.scrubTarget = (target / film.fps).toFixed(4);
      void pump();
    },
    dispose,
  };
}


