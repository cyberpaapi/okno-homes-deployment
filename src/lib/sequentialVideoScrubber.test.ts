import { afterEach, describe, expect, it, vi } from 'vitest';
import { createSequentialVideoScrubber } from './sequentialVideoScrubber';

function setup() {
  vi.useFakeTimers();
  vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);
  const video = document.createElement('video');
  Object.defineProperty(video, 'duration', { value: 577/24 });
  let time = 0, paused = false;
  const seeks: number[] = [];
  Object.defineProperty(video, 'currentTime', {
    get: () => time,
    set: (value: number) => {
      time = value; seeks.push(Math.round(value*24));
      if (!paused) setTimeout(() => video.dispatchEvent(new Event('seeked')), 1);
    },
  });
  const seen: number[] = [];
  const controller = createSequentialVideoScrubber(video, 24, t => seen.push(Math.round(t*24)));
  return { video, controller, seeks, seen, pause: () => { paused = true; } };
}

describe('ordered native video fallback', () => {
  afterEach(() => { vi.restoreAllMocks(); vi.useRealTimers(); });
  it('walks every frame forward and backward, including a large scroll request', async () => {
    const { video, controller, seen } = setup();
    controller.setTime(24); await vi.advanceTimersByTimeAsync(25000);
    expect(seen).toEqual(Array.from({ length: 576 }, (_, i) => i+1));
    controller.setTime(23); await vi.advanceTimersByTimeAsync(1100);
    expect(seen.slice(-24)).toEqual(Array.from({ length: 24 }, (_, i) => 575-i));
    expect(video.dataset.scrubSkippedFrames).toBe('0');
    expect(video.dataset.scrubMaxStep).toBe('1');
    controller.dispose();
  });
  it('waits for the pending seek instead of skipping ahead during a stall', async () => {
    const { video, controller, seeks, seen, pause } = setup();
    pause(); controller.setTime(24); await vi.advanceTimersByTimeAsync(2000);
    expect(seeks).toEqual([1]); expect(seen).toEqual([]);
    controller.setTime(22); await vi.advanceTimersByTimeAsync(2000);
    expect(seeks).toEqual([1]);
    video.dispatchEvent(new Event('seeked')); await vi.advanceTimersByTimeAsync(50);
    expect(seeks).toEqual([1,2]); expect(seen).toEqual([1]);
    controller.dispose(); video.dispatchEvent(new Event('seeked'));
    await vi.advanceTimersByTimeAsync(1000); expect(seeks).toEqual([1,2]);
  });
  it('separates offscreen preparation from gesture playback', async () => {
    const { video, controller, seen } = setup();
    controller.seek(23); await vi.advanceTimersByTimeAsync(30);
    controller.setTime(23.125); await vi.advanceTimersByTimeAsync(160);
    expect(seen).toEqual([552,553,554,555]);
    expect(video.dataset.scrubExplicitSeeks).toBe('1');
    expect(video.dataset.scrubSkippedFrames).toBe('0');
    controller.dispose();
  });
});
