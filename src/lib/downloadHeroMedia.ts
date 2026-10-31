/** Read the entire asset before exposing it to either scroll renderer. */
export async function downloadHeroMedia(source: string, signal: AbortSignal, progress: (fraction: number) => void, expectedBytes?: number) {
  const request = new AbortController();
  const cancel = () => request.abort();
  signal.throwIfAborted();
  signal.addEventListener('abort', cancel, { once: true });
  let deadline: ReturnType<typeof setTimeout>;
  const arm = () => { clearTimeout(deadline); deadline = setTimeout(() => request.abort(), 45000); };
  arm();
  try {
    const response = await fetch(source, { signal: request.signal, cache: 'force-cache' });
    if (!response.ok || response.status === 206 || !response.body) throw new Error('Video download unavailable');
    const total = expectedBytes || Number(response.headers.get('content-length')) || 0;
    if (total > 256 * 1024 * 1024) throw new Error('Video is too large to preload');
    const buffer = total ? new Uint8Array(total) : null;
    const chunks: Uint8Array[] = [];
    const reader = response.body.getReader();
    let received = 0;
    progress(total ? 0 : -1);
    try {
      while (true) {
        const { done, value } = await reader.read();
        signal.throwIfAborted();
        if (done) break;
        arm();
        if (received + value.length > (total || 256 * 1024 * 1024)) throw new Error('Unexpected video size');
        if (buffer) buffer.set(value, received); else chunks.push(value);
        received += value.length;
        // Completion is only reported once EOF and the byte count are verified.
        if (total) progress(Math.min(.999, received / total));
      }
      if (!received || (total && received !== total)) throw new Error('Incomplete video download');
      const data = buffer || new Uint8Array(received);
      if (!buffer) { let offset = 0; for (const chunk of chunks) { data.set(chunk, offset); offset += chunk.length; } }
      progress(1);
      return data;
    } finally { reader.releaseLock(); }
  } finally {
    clearTimeout(deadline!);
    request.abort();
    signal.removeEventListener('abort', cancel);
  }
}
