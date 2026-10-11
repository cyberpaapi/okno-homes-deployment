import { afterEach, describe, expect, it, vi } from 'vitest';
import { createVideoScrubber } from './videoScrubber';

function fixture() {
  const video = document.createElement('video');
  Object.defineProperties(video, { duration: { value: 20.041667 }, readyState: { value: 4 } });
  let seeking = false;
  Object.defineProperty(video, 'seeking', { get: () => seeking });
  const scrubber = createVideoScrubber(video);
  return { video, scrubber, seeking: (value: boolean) => { seeking = value; } };
}
describe('scroll video exact seek scheduling', () => {
  afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });
  it('coalesces a rapid wheel gesture and follows the newest target after an in-flight seek', () => {
    vi.useFakeTimers();
    const { video, scrubber, seeking } = fixture();
    scrubber.setTime(2); scrubber.setTime(4); scrubber.setTime(8);
    vi.advanceTimersByTime(20);
    expect(video.currentTime).toBe(8);
    seeking(true);
    scrubber.setTime(12); scrubber.setTime(6);
    vi.advanceTimersByTime(20);
    expect(video.currentTime).toBe(8);
    seeking(false); video.dispatchEvent(new Event('seeked'));
    vi.advanceTimersByTime(20);
    expect(video.currentTime).toBe(6);
    scrubber.dispose();
  });
  it('settles on the last authored frame, reverses precisely and cancels unmounted work', () => {
    vi.useFakeTimers();
    const { video, scrubber } = fixture();
    scrubber.setTime(100); vi.advanceTimersByTime(20);
    expect(video.currentTime).toBeCloseTo(20, 4);
    scrubber.setTime(1.001); vi.advanceTimersByTime(20);
    expect(video.currentTime).toBe(1);
    scrubber.setTime(10); scrubber.dispose(); vi.advanceTimersByTime(20);
    video.dispatchEvent(new Event('seeked')); vi.advanceTimersByTime(20);
    expect(video.currentTime).toBe(1);
  });
  it('does not seek in a hidden tab and catches up when it returns', () => {
    vi.useFakeTimers();
    const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
    const { video, scrubber } = fixture();
    scrubber.setTime(7); vi.advanceTimersByTime(20);
    expect(video.currentTime).toBe(0);
    hidden.mockReturnValue(false); document.dispatchEvent(new Event('visibilitychange'));
    vi.advanceTimersByTime(20);
    expect(video.currentTime).toBe(7);
    scrubber.dispose();
  });
});
