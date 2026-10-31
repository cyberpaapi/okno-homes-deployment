/** Seek to the latest scroll position. There is no movie-time playback queue:
 * rapid input replaces the pending target, including a change of direction. */
export function createScrollVideoScrubber(video: HTMLVideoElement, fps: number, present: (time: number) => void) {
  let target = 0, shown = -1, frame = 0, waiting = false, disposed = false;
  let watchdog: ReturnType<typeof setTimeout> | undefined;
  const indexAt = (time: number) => Math.min(Math.max(0, Math.round(video.duration * fps) - 1), Math.max(0, Math.round(time * fps)));
  const queue = () => { if (!disposed && !frame && !document.hidden) frame = requestAnimationFrame(tick); };
  const tick = () => {
    frame = 0;
    if (disposed || waiting || document.hidden || !Number.isFinite(video.duration) || target === shown) return;
    waiting = true;
    video.currentTime = Math.min(video.duration - .0001, (target + .01) / fps);
    clearTimeout(watchdog);
    watchdog = setTimeout(() => {
      if (disposed) return;
      if (!video.seeking && video.readyState >= 2) seeked();
      else { waiting = false; queue(); }
    }, 1500);
  };
  const seeked = () => {
    if (disposed) return;
    clearTimeout(watchdog);
    shown = Math.round(video.currentTime * fps);
    waiting = false;
    video.dataset.scrubPresentedTime = (shown / fps).toFixed(4);
    video.dataset.scrubPresentedFrames = String(Number(video.dataset.scrubPresentedFrames ?? 0) + 1);
    present(shown / fps);
    if (target !== shown) queue();
  };
  const visibility = () => { if (!document.hidden) queue(); };
  video.pause();
  video.addEventListener('seeked', seeked);
  document.addEventListener('visibilitychange', visibility);
  const setTime = (time: number) => {
    target = indexAt(time);
    video.dataset.scrubTarget = (target / fps).toFixed(4);
    queue();
  };
  return {
    setTime,
    seek: setTime,
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      clearTimeout(watchdog);
      video.removeEventListener('seeked', seeked);
      document.removeEventListener('visibilitychange', visibility);
    },
  };
}
