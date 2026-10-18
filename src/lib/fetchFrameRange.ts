/** Bound failed/stalled range requests and recover once from stale partial caches. */
export async function fetchFrameRange(source: string, start: number, end: number, total: number, signal: AbortSignal) {
  for (let attempt = 0; attempt < 2; attempt++) {
    signal.throwIfAborted();
    const request = new AbortController();
    const cancel = () => request.abort(signal.reason);
    signal.addEventListener('abort', cancel, { once: true });
    let timedOut = false;
    const deadline = setTimeout(() => { timedOut = true; request.abort(); }, 6000);
    try {
      const response = await fetch(source, {
        signal: request.signal, cache: attempt ? 'reload' : 'force-cache',
        headers: { Range: `bytes=${start}-${end}` },
      });
      if (response.status !== 206 || response.headers.get('content-range') !== `bytes ${start}-${end}/${total}`) {
        // An ignored range can be a whole movie. Stop its body immediately.
        await response.body?.cancel();
        throw new Error('Frame range differs from index');
      }
      const bytes = new Uint8Array(await response.arrayBuffer());
      signal.throwIfAborted();
      if (bytes.length !== end - start + 1) throw new Error('Incomplete frame range');
      return bytes;
    } catch (error) {
      signal.throwIfAborted();
      if (attempt === 1) throw timedOut ? new Error('Frame request timed out') : error;
    } finally {
      clearTimeout(deadline);
      signal.removeEventListener('abort', cancel);
    }
  }
  throw new Error('Frame unavailable');
}
