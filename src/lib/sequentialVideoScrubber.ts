/** Native fallback: seek to the next adjacent frame only after the previous
 * seek is presented. Delayed seeks never build a catch-up skip. */
export function createSequentialVideoScrubber(video: HTMLVideoElement, fps: number, present: (time: number) => void, maxPresentationFps = fps) {
  let requested = 0, shown = Math.round(video.currentTime*fps), raf = 0, disposed = false;
  let waiting = false, explicit = false, nextPaint = -Infinity, maxStep = 0, skipped = 0;
  const sequence: number[] = [];
  const indexAt = (time: number) => Math.min(Math.max(0,Math.round((video.duration-1/fps)*fps)),Math.max(0,Math.round(time*fps)));
  // Some native engines truncate seek times to microseconds. Seek inside the
  // requested frame, rather than fractionally before its presentation time.
  const seekTime = (index: number) => Math.min(video.duration-.0001,(index+.01)/fps);
  const queue = () => { if (!disposed && !raf && !document.hidden) raf = requestAnimationFrame(tick); };
  const tick = (now: number) => {
    raf = 0;
    if (disposed || document.hidden || waiting || !Number.isFinite(video.duration) || requested === shown) return;
    if (now < nextPaint) { queue(); return; }
    waiting = true; video.currentTime = seekTime(shown+Math.sign(requested-shown));
  };
  const seeked = () => {
    const next = Math.round(video.currentTime*fps);
    if (!explicit) { const step = Math.abs(next-shown); maxStep = Math.max(maxStep,step); skipped += Math.max(0,step-1); }
    const now = performance.now();
    const rate = Math.min(Math.max(fps,maxPresentationFps),fps+Math.abs(requested-next)*6);
    const interval = 1000/rate;
    nextPaint = !explicit && Number.isFinite(nextPaint) && now-nextPaint < interval
      ? nextPaint+interval : now+interval;
    explicit = false; shown = next; waiting = false;
    sequence.push(shown); if (sequence.length > 24) sequence.shift();
    video.dataset.scrubSequence = sequence.join(',');
    video.dataset.scrubPresentedFrames = String(Number(video.dataset.scrubPresentedFrames ?? 0)+1);
    video.dataset.scrubPresentedTime = (shown/fps).toFixed(4);
    video.dataset.scrubMaxStep = String(maxStep); video.dataset.scrubSkippedFrames = String(skipped);
    present(shown/fps); queue();
  };
  const visibility = () => queue();
  video.addEventListener('seeked',seeked); document.addEventListener('visibilitychange',visibility);
  return {
    setTime(time: number) { requested = indexAt(time); video.dataset.scrubTarget = (requested/fps).toFixed(4); queue(); },
    seek(time: number) {
      requested = indexAt(time);
      if (requested === shown && !waiting) { present(shown/fps); return; }
      explicit = true; waiting = true;
      video.dataset.scrubExplicitSeeks = String(Number(video.dataset.scrubExplicitSeeks ?? 0)+1);
      video.currentTime = seekTime(requested);
    },
    dispose() { disposed = true; cancelAnimationFrame(raf); video.removeEventListener('seeked',seeked); document.removeEventListener('visibilitychange',visibility); },
  };
}
