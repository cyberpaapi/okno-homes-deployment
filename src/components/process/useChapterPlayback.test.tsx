import { act, fireEvent, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ChapterGesture, chapterEnd } from '@/lib/processChapters';
import { useChapterPlayback } from './useChapterPlayback';

let video: HTMLVideoElement;
let track: HTMLElement;
let scrollY: number;
let now: number;
let visible: boolean;
let frameCallback: VideoFrameRequestCallback | undefined;
let ready: number;
let play: ReturnType<typeof vi.fn<() => Promise<void>>>;
let pause: ReturnType<typeof vi.fn<() => void>>;

beforeEach(() => {
  scrollY = 0; now = 0; visible = true; ready = 3;
  video = document.createElement('video'); track = document.createElement('section');
  Object.defineProperty(window, 'scrollY', { configurable: true, get: () => scrollY });
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: 720 });
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => !visible });
  Object.defineProperty(track, 'offsetHeight', { configurable: true, value: 1296 });
  vi.spyOn(track, 'getBoundingClientRect').mockImplementation(() => ({ top: -scrollY, bottom: 1296 - scrollY } as DOMRect));
  vi.spyOn(window, 'scrollTo').mockImplementation(((options: ScrollToOptions | number) => { if (typeof options === 'object') scrollY = options.top ?? scrollY; }) as typeof window.scrollTo);
  vi.spyOn(performance, 'now').mockImplementation(() => now);
  Object.defineProperty(video, 'readyState', { configurable: true, get: () => ready });
  Object.defineProperty(video, 'duration', { configurable: true, value: 25.633333 });
  play = vi.fn().mockResolvedValue(undefined); pause = vi.fn();
  video.play = play; video.pause = pause; video.load = vi.fn();
  video.requestVideoFrameCallback = vi.fn(callback => { frameCallback = callback; return 1; });
  video.cancelVideoFrameCallback = vi.fn();
});
afterEach(() => { vi.restoreAllMocks(); frameCallback = undefined; });

async function enter() {
  const trackRef = { current: track }; const videoRef = { current: video };
  const hook = renderHook(() => useChapterPlayback(trackRef, videoRef, 'master')); 
  await act(async () => { scrollY = 410; fireEvent.scroll(window); });
  return hook;
}
async function finish(index: number) {
  await act(async () => {
    video.currentTime = chapterEnd(index, video.duration);
    frameCallback?.(now, { mediaTime: video.currentTime } as VideoFrameCallbackMetadata);
  });
}
async function wheel(delta = 120) {
  await act(async () => { now += 300; fireEvent.wheel(window, { deltaY: delta, cancelable: true }); });
}

describe('normal-speed Process chapters', () => {
  it('catches a full-page gesture that crosses the entire sticky entrance', async () => {
    const trackRef = { current: track }; const videoRef = { current: video };
    const hook = renderHook(() => useChapterPlayback(trackRef, videoRef, 'master'));
    await act(async () => { scrollY = 720; fireEvent.scroll(window); });
    expect(hook.result.current.playback).toBe('playing');
    expect(hook.result.current.chapter).toBe(0);
    expect(scrollY).toBeCloseTo(396);
  });
  it('plays all six chapters once and waits at each stop, then releases to the timeline', async () => {
    const hook = await enter();
    expect(hook.result.current.playback).toBe('playing');
    expect(video.playbackRate).toBe(1);
    expect(scrollY).toBeCloseTo(396);
    for (let index = 0; index < 6; index++) {
      expect(hook.result.current.chapter).toBe(index);
      await finish(index);
      expect(hook.result.current.playback).toBe('paused');
      expect(video.currentTime).toBeCloseTo(chapterEnd(index, video.duration), 5);
      expect(hook.result.current.progress.get()).toBe((index + 1) / 6);
      const heldTime = video.currentTime;
      await wheel();
      expect(video.currentTime).toBe(heldTime);
      expect(hook.result.current.playback).toBe(index === 5 ? 'finished' : 'playing');
    }
    expect(play).toHaveBeenCalledTimes(6);
    expect(scrollY).toBe(1296);
  });

  it('consumes wheel momentum while playing and requires a fresh gesture after a stop', async () => {
    const hook = await enter();
    await wheel();
    await finish(0);
    await act(async () => { now += 10; fireEvent.wheel(window, { deltaY: 240, cancelable: true }); });
    expect(hook.result.current.chapter).toBe(0);
    expect(play).toHaveBeenCalledTimes(1);
    await wheel();
    expect(hook.result.current.chapter).toBe(1);
  });

  it('returns to the previous held chapter and resumes it through the next chapter', async () => {
    const hook = await enter(); await finish(0); await wheel(); await finish(1); await wheel(-120);
    expect(hook.result.current.chapter).toBe(0);
    expect(hook.result.current.playback).toBe('paused');
    expect(video.currentTime).toBeCloseTo(chapterEnd(0, video.duration));
    await wheel();
    expect(hook.result.current.chapter).toBe(1);
    expect(hook.result.current.playback).toBe('playing');
  });

  it('loads safely, handles rejected playback and lets the visitor retry or skip', async () => {
    ready = 1;
    const hook = await enter(); expect(hook.result.current.playback).toBe('loading');
    play.mockRejectedValueOnce(new Error('autoplay denied'));
    await act(async () => { ready = 3; fireEvent.canPlay(video); });
    expect(hook.result.current.playback).toBe('blocked');
    await act(async () => hook.result.current.next());
    expect(hook.result.current.playback).toBe('playing');
    act(() => hook.result.current.leave());
    expect(hook.result.current.playback).toBe('finished');
  });

  it('pauses when hidden and continues the unfinished chapter instead of skipping it', async () => {
    const hook = await enter(); video.currentTime = 2;
    act(() => { visible = false; fireEvent(document, new Event('visibilitychange')); });
    expect(hook.result.current.playback).toBe('paused');
    visible = true; await wheel();
    expect(hook.result.current.chapter).toBe(0);
    expect(video.currentTime).toBe(2);
    expect(hook.result.current.playback).toBe('playing');
  });

  it('supports keyboard exit and removes all scroll interception on unmount', async () => {
    const hook = await enter();
    act(() => fireEvent.keyDown(window, { key: 'Escape', cancelable: true }));
    expect(hook.result.current.playback).toBe('finished');
    hook.unmount();
    const event = new WheelEvent('wheel', { deltaY: 200, cancelable: true });
    window.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    expect(video.cancelVideoFrameCallback).toHaveBeenCalled();
  });

  it('accepts fresh keyboard and touch gestures without advancing during playback', async () => {
    const hook = await enter();
    act(() => fireEvent.keyDown(window, { key: 'PageDown', cancelable: true }));
    expect(hook.result.current.chapter).toBe(0);
    await finish(0);
    await act(async () => fireEvent.keyDown(window, { key: 'PageDown', cancelable: true }));
    expect(hook.result.current.chapter).toBe(1);
    await finish(1);
    act(() => fireEvent.touchStart(window, { touches: [{ clientY: 400 }] }));
    await act(async () => fireEvent.touchEnd(window, { changedTouches: [{ clientY: 300 }] }));
    expect(hook.result.current.chapter).toBe(2);
    expect(hook.result.current.playback).toBe('playing');
  });

  it('exposes a recoverable media error and releases scrolling through Skip', async () => {
    const hook = await enter();
    act(() => fireEvent.error(video));
    expect(hook.result.current.playback).toBe('blocked');
    act(() => hook.result.current.leave());
    const event = new WheelEvent('wheel', { deltaY: 100, cancelable: true });
    window.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });
});

describe('chapter gesture gate', () => {
  it('accumulates small trackpad deltas and ignores the rest of that burst', () => {
    const gesture = new ChapterGesture();
    expect(gesture.push(20, 1000, false)).toBe(0);
    expect(gesture.push(30, 1010, false)).toBe(0);
    expect(gesture.push(30, 1020, false)).toBe(1);
    expect(gesture.push(200, 1030, false)).toBe(0);
    expect(gesture.push(-100, 1400, false)).toBe(-1);
  });
});
