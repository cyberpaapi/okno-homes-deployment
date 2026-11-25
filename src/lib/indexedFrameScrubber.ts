/** Process-only adaptation of the existing V1 packet renderer. V1 is unchanged. */
export type IndexedFilm = {
  source: string; bytes: number; width: number; height: number; fps: number;
  codec: string; description: string; packets: number[][];
};
const CACHE_LIMIT = typeof navigator !== 'undefined' && ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 0) >= 8 ? 96 : 48;
type ScrubberOptions = { cacheLimit?: number; boundedPresentation?: boolean; preserveFrame?: boolean; reverseKeyframesFirst?: boolean };

/** Decode original AVC packets, avoiding the native player's seek pipeline.
 * The compressed source is streamed once; at most 48/96 native frames live.
 */
export async function createIndexedFrameScrubber(film: IndexedFilm, canvas: HTMLCanvasElement, signal: AbortSignal, ready: () => void, fail: () => void, onPresent: (time: number) => void, fullData?: Uint8Array, options: ScrubberOptions = {}) {
  const cacheLimit = Number.isFinite(options.cacheLimit) ? Math.min(96, Math.max(8, Math.floor(options.cacheLimit!))) : CACHE_LIMIT;
  const lookAhead = Math.floor(cacheLimit / 2) - 3;
  const independentReverse = options.reverseKeyframesFirst && film.packets.every(packet => Boolean(packet[3]));
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
  const source = fullData ?? new Uint8Array(film.bytes);
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
    error() { if (!disposed) fail(); },
  });
  decoder.configure(config);

  async function pump() {
    if (disposed || document.hidden) return;
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
        decoder.decode(new EncodedVideoChunk({ type: key ? 'key' : 'delta', timestamp, data: source.subarray(offset,offset+size) }));
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
    if (decoder.state !== 'closed') decoder.close();
    for (const frame of frames.values()) frame.close();
    frames.clear();
  };
  signal.addEventListener('abort', dispose, { once: true });
  if (fullData) void pump();
  else void (async () => {
    try {
      const response = await fetch(film.source, { signal, cache: 'force-cache' });
      if (!response.ok || !response.body) throw new Error('Film unavailable');
      const reader = response.body.getReader();
      while (!disposed) {
        const { value, done } = await reader.read();
        if (done) break;
        if (available + value.byteLength > source.byteLength) throw new Error('Film differs from index');
        source.set(value,available); available += value.byteLength;
        void pump();
      }
      if (!disposed && available !== film.bytes) throw new Error('Incomplete film');
      void pump();
    } catch { if (!disposed) fail(); }
  })();
  return {
    setTime(time: number) {
      const next = Math.min(last,Math.max(0,Math.round(time*film.fps)));
      if (target !== next) { direction = next > target ? 1 : -1; target = next; requestedAt = performance.now(); }
      if (busy && !frames.has(target) && Math.abs(target-jobTarget) > 6) {
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


