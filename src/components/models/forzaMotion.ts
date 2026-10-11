export function clampProgress(value: number) {
  return Math.min(1, Math.max(0, value));
}

export function mapProgressToTime(
  progress: number,
  duration: number,
  frameRate = 48,
) {
  const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : 0;
  const safeFrameRate = Number.isFinite(frameRate) && frameRate > 0 ? frameRate : 48;
  return clampProgress(progress) * Math.max(0, safeDuration - 1 / safeFrameRate);
}

type VideoSeekRequestInput = {
  duration: number;
  frameRate: number;
  progress: number;
  readyState: number;
  requestedFrame: number;
  seeking: boolean;
};

export function getVideoSeekRequest({
  duration,
  frameRate,
  progress,
  readyState,
  requestedFrame,
  seeking,
}: VideoSeekRequestInput) {
  if (readyState < 1 || seeking) return null;

  const safeFrameRate =
    Number.isFinite(frameRate) && frameRate > 0 ? frameRate : 48;
  const frameCount = Math.max(1, Math.floor(duration * safeFrameRate));
  const frameIndex = Math.max(
    0,
    Math.min(
      frameCount - 1,
      Math.round(
        mapProgressToTime(progress, duration, safeFrameRate) * safeFrameRate,
      ),
    ),
  );

  if (frameIndex === requestedFrame) return null;

  return {
    frameIndex,
    time: frameIndex / safeFrameRate,
  };
}
