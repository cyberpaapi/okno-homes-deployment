import { act, fireEvent, render } from '@testing-library/react';
import { motionValue } from 'motion/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ScrollProcessFilm from './ScrollProcessFilm';

const download = vi.hoisted(() => vi.fn());
vi.mock('@/lib/downloadHeroMedia', () => ({ downloadHeroMedia: download }));
beforeEach(() => {
  download.mockReset().mockResolvedValue(new Uint8Array([1,2,3]));
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
  vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: vi.fn(() => 'blob:complete-process'), revokeObjectURL: vi.fn() }));
});

describe('replacement Process films and lifecycle', () => {
  afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });
  it('keeps the process unready during an incomplete download and reports failure', async () => {
    let reject!: (error: Error) => void;
    download.mockImplementation((_source, _signal, loading) => { loading(.35); return new Promise((_resolve, fail) => { reject = fail; }); });
    vi.stubGlobal('IntersectionObserver', class { observe() {} disconnect() {} });
    const ready = vi.fn(), loading = vi.fn();
    const view = render(<ScrollProcessFilm hq="/custom.mp4" mobile="/custom.mp4" poster="/cover.jpg" label="Film" className="film" progress={motionValue(0)} onReady={ready} onProgress={vi.fn()} onLoadProgress={loading} />);
    expect(loading).toHaveBeenLastCalledWith(.35);
    expect(ready).not.toHaveBeenCalledWith(true);
    expect(view.container.querySelector('video')).toBeNull();
    await act(async () => reject(new Error('offline')));
    expect(loading).toHaveBeenLastCalledWith(null);
    expect(ready).not.toHaveBeenCalledWith(true);
  });
  it('uses native original-film decoding inside an embedded preview without a full-size frame cache', async () => {
    const parent = Object.getOwnPropertyDescriptor(window, 'parent')!;
    Object.defineProperty(window, 'parent', { configurable: true, value: {} });
    vi.stubGlobal('IntersectionObserver', class { observe() {} disconnect() {} });
    const Decoder = vi.fn(); vi.stubGlobal('VideoDecoder', Decoder);
    try {
      const view = render(<ScrollProcessFilm hq="/process/process-master.hq.mp4" mobile="/process/process-master.scrub.mp4" poster="/process/land-poster.webp" label="Film" className="film" progress={motionValue(.6)} onReady={vi.fn()} onProgress={vi.fn()} />);
      await act(async () => {});
      expect(view.container.querySelector('video')).toBeTruthy();
      expect(view.container.querySelector('canvas')).toBeNull();
      expect(Decoder).not.toHaveBeenCalled();
      view.unmount();
    } finally { Object.defineProperty(window, 'parent', parent); }
  });
  it('eases a CMS replacement through the native fallback, reverses and cleans up', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('IntersectionObserver', class { observe() {} disconnect() {} });
    const progress = motionValue(.6);
    const onReady = vi.fn();
    const onProgress = vi.fn();
    const view = render(<ScrollProcessFilm hq="/custom-process.mp4" mobile="/custom-mobile.mp4" poster="/process/land-poster.webp" label="Process film" className="film" progress={progress} onReady={onReady} onProgress={onProgress} />);
    await act(async () => {});
    const video = view.container.querySelector('video')!;
    expect(video).toHaveAttribute('src', 'blob:complete-process');
    expect(view.container.querySelector('canvas')).toBeNull();
    Object.defineProperties(video, { readyState: { value: 4 }, duration: { value: 25.633333 } });
    fireEvent.loadedData(video);
    await act(async () => { await vi.advanceTimersByTimeAsync(1000); });
    expect(view.container.querySelector('[data-process-finish]')).toHaveStyle({opacity: 0});
    expect(video.currentTime).toBeGreaterThan(3.2);
    expect(video.currentTime).toBeLessThan(4);
    expect(onReady).toHaveBeenLastCalledWith(true);
    fireEvent.seeked(video);
    expect(onProgress).toHaveBeenLastCalledWith(video.currentTime / (video.duration - 1 / 30));
    await act(async () => { progress.set(.16); await vi.advanceTimersByTimeAsync(2000); });
    expect(video.currentTime).toBe(0);
    await act(async () => { progress.set(.9); await vi.advanceTimersByTimeAsync(200); });
    const atUnmount = video.currentTime;
    view.unmount();
    await act(async () => { progress.set(1); await vi.advanceTimersByTimeAsync(2000); });
    expect(video.currentTime).toBe(atUnmount);
  });
  it('holds the original film on the closed-house frame and never seeks into its outro', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('VideoDecoder', undefined);
    vi.stubGlobal('IntersectionObserver', class { observe() {} disconnect() {} });
    const progress = motionValue(1);
    const onProgress = vi.fn();
    const view = render(<ScrollProcessFilm hq="/process/process-master.hq.mp4" mobile="/process/process-master.scrub.mp4" poster="/process/land-poster.webp" label="Film" className="film" progress={progress} onReady={vi.fn()} onProgress={onProgress} />);
    await act(async () => { await vi.dynamicImportSettled(); await vi.advanceTimersByTimeAsync(50); });
    await act(async () => {});
    const video = view.container.querySelector('video')!;
    Object.defineProperties(video, { readyState: { value: 4 }, duration: { value: 25.633333 } });
    fireEvent.loadedData(video);
    await act(async () => { await vi.advanceTimersByTimeAsync(10000); });
    expect(video.currentTime).toBeCloseTo(620 / 30);
    fireEvent.seeked(video);
    expect(onProgress).toHaveBeenLastCalledWith(1);
    expect(view.container.querySelector('[data-process-finish]')).toHaveStyle({opacity: 1});
    await act(async () => { progress.set(2); await vi.advanceTimersByTimeAsync(1000); });
    expect(video.currentTime).toBeCloseTo(620 / 30);
    await act(async () => { progress.set(.8); await vi.advanceTimersByTimeAsync(500); });
    expect(video.currentTime).toBeLessThan(20.1);
    fireEvent.seeked(video);
    expect(Number(view.container.querySelector<HTMLElement>('[data-process-finish]')!.style.opacity)).toBeLessThan(1);
    expect(video.currentTime).toBeGreaterThan(18);
    view.unmount();
  });
  it('prepares the actual ending after a deliberate offscreen jump, then reverses gently', async () => {
    vi.useFakeTimers();
    let observe: (entries: { isIntersecting: boolean }[]) => void = () => {};
    vi.stubGlobal('IntersectionObserver', class {
      constructor(callback: typeof observe) { observe = callback; }
      observe() {} disconnect() {}
    });
    const progress = motionValue(.2);
    const onProgress = vi.fn();
    const view = render(<ScrollProcessFilm hq="/custom-process.mp4" mobile="/custom-mobile.mp4" poster="/process/land-poster.webp" label="Process film" className="film" progress={progress} onReady={vi.fn()} onProgress={onProgress} />);
    await act(async () => {});
    const video = view.container.querySelector('video')!;
    Object.defineProperties(video, { readyState: { value: 4 }, duration: { value: 25.633333 } });
    fireEvent.loadedData(video);
    await act(async () => { await vi.advanceTimersByTimeAsync(100); });
    await act(async () => { progress.set(1); observe([{ isIntersecting: false }]); await vi.advanceTimersByTimeAsync(40); });
    fireEvent.seeked(video);
    expect(video.currentTime).toBeCloseTo(25.6);
    fireEvent.seeked(video);
    expect(onProgress).toHaveBeenLastCalledWith(video.currentTime / (video.duration - 1 / 30));
    await act(async () => { progress.set(.87); observe([{ isIntersecting: true }]); await vi.advanceTimersByTimeAsync(100); });
    expect(video.currentTime).toBeLessThan(25.6);
    expect(video.currentTime).toBeGreaterThan(25.3);
    view.unmount();
  });
});
