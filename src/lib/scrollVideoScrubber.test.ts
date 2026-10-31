import { afterEach, describe, expect, it, vi } from 'vitest';
import { createScrollVideoScrubber } from './scrollVideoScrubber';

afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });
describe('scroll-driven native film', () => {
  it('replaces a pending forward seek with reversal and stays still after settling', async () => {
    vi.useFakeTimers();
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
    const video = document.createElement('video');
    Object.defineProperty(video, 'duration', { value: 24.042 });
    const present = vi.fn();
    const scrubber = createScrollVideoScrubber(video, 24, present);
    scrubber.setTime(18); await vi.advanceTimersByTimeAsync(20);
    expect(video.currentTime).toBeCloseTo(18 + .01/24);
    scrubber.setTime(23); scrubber.setTime(4);
    video.dispatchEvent(new Event('seeked'));
    await vi.advanceTimersByTimeAsync(20);
    expect(video.currentTime).toBeCloseTo(4 + .01/24);
    video.dispatchEvent(new Event('seeked'));
    await vi.advanceTimersByTimeAsync(2000);
    expect(video.currentTime).toBeCloseTo(4 + .01/24);
    expect(present).toHaveBeenLastCalledWith(4);
    expect(present).toHaveBeenCalledTimes(2);
    scrubber.dispose();
  });
  it('recovers a missed seeked notification instead of permanently ignoring later scrolls', async () => {
    vi.useFakeTimers();
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
    const video = document.createElement('video');
    Object.defineProperties(video, { duration: { value: 24 }, readyState: { value: 2 } });
    const present = vi.fn();
    const scrubber = createScrollVideoScrubber(video,24,present);
    scrubber.setTime(6); await vi.advanceTimersByTimeAsync(20);
    scrubber.setTime(12); await vi.advanceTimersByTimeAsync(1520);
    expect(video.currentTime).toBeCloseTo(12 + .01/24);
    video.dispatchEvent(new Event('seeked'));
    expect(present).toHaveBeenLastCalledWith(12);
    scrubber.dispose();
  });
  it('seeks the true last frame directly rather than playing hundreds of old targets', async () => {
    vi.useFakeTimers();
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
    const video = document.createElement('video');
    Object.defineProperty(video, 'duration', { value: 24.042 });
    const present = vi.fn();
    const scrubber = createScrollVideoScrubber(video, 24, present);
    scrubber.setTime(24); await vi.advanceTimersByTimeAsync(20);
    expect(video.currentTime).toBeGreaterThan(24);
    expect(video.currentTime).toBeLessThan(24.042);
    video.dispatchEvent(new Event('seeked'));
    expect(present).toHaveBeenLastCalledWith(24);
    scrubber.dispose();
  });
});
