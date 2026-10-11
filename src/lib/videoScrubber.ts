/** One exact seek at a time, with the newest scroll position winning.
 * No second easing loop, fixed 30 Hz throttle, or keyframe snapping.
 */
export function createVideoScrubber(video: HTMLVideoElement, fps = 24) {
  let target = 0;
  let raf = 0;
  let disposed = false;
  let started = 0;
  let seeks = 0;
  let total = 0;
  let maximum = 0;
  let presented = 0;
  let videoFrame = 0;
  const frame = 1 / fps;
  const flush = () => {
    raf = 0;
    if (disposed || document.hidden || video.seeking || video.readyState < 2 || !Number.isFinite(video.duration)) return;
    const time = Math.min(Math.max(0, video.duration - frame), Math.round(target / frame) * frame);
    if (Math.abs(video.currentTime - time) < frame / 2) return;
    started = performance.now();
    video.dataset.scrubTarget = time.toFixed(4);
    video.currentTime = time;
  };
  const queue = () => { if (!disposed && !raf) raf = requestAnimationFrame(flush); };
  const seeked = () => {
    if (started) {
      const latency = performance.now() - started;
      total += latency;
      maximum = Math.max(maximum, latency);
      video.dataset.scrubSeeks = String(++seeks);
      video.dataset.scrubMeanMs = (total / seeks).toFixed(1);
      video.dataset.scrubMaxMs = maximum.toFixed(1);
      started = 0;
    }
    queue();
  };
  video.addEventListener('seeked', seeked);
  video.addEventListener('loadeddata', queue);
  document.addEventListener('visibilitychange', queue);
  const observeFrame = (_now: number, metadata: VideoFrameCallbackMetadata) => {
    video.dataset.scrubPresentedTime = metadata.mediaTime.toFixed(4);
    video.dataset.scrubPresentedFrames = String(++presented);
    if (!disposed) videoFrame = video.requestVideoFrameCallback(observeFrame);
  };
  if (typeof video.requestVideoFrameCallback === 'function') videoFrame = video.requestVideoFrameCallback(observeFrame);
  return {
    setTime(time: number) { target = Math.max(0, time); queue(); },
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      if (videoFrame) video.cancelVideoFrameCallback(videoFrame);
      video.removeEventListener('seeked', seeked);
      video.removeEventListener('loadeddata', queue);
      document.removeEventListener('visibilitychange', queue);
    },
  };
}
