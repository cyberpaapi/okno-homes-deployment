import { act, fireEvent, render } from '@testing-library/react';
import { motionValue } from 'motion/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ScrollJourneyFilm from './ScrollJourneyFilm';

const download = vi.hoisted(() => ({ run: vi.fn() }));
vi.mock('@/lib/downloadHeroMedia', () => ({ downloadHeroMedia: download.run }));
vi.mock('@/lib/sitePreview', () => ({ isEmbeddedSitePreview: () => true }));
beforeEach(() => {
  download.run.mockReset();
  download.run.mockResolvedValue(new Uint8Array([1, 2, 3]));
  vi.spyOn(HTMLMediaElement.prototype,'pause').mockImplementation(()=>{});
  vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: vi.fn(()=>'blob:complete-video'), revokeObjectURL: vi.fn() }));
});
afterEach(()=>{vi.useRealTimers();vi.restoreAllMocks();vi.unstubAllGlobals();});

describe('complete native video preparation',()=>{
  it('does not mount the video or declare readiness until the download finishes and a frame decodes',async()=>{
    let finish!: (data: Uint8Array) => void;
    download.run.mockImplementation((_src,_signal,progress)=>{progress(.4);return new Promise(resolve=>{finish=resolve;});});
    const ready=vi.fn(),loading=vi.fn();
    const view=render(<ScrollJourneyFilm src="/custom.mp4" poster="/cover.jpg" className="film" progress={motionValue(0)} onReady={ready} onProgress={vi.fn()} onLoadProgress={loading}/>);
    expect(loading).toHaveBeenLastCalledWith(.4);
    expect(view.container.querySelector('video')).toBeNull();
    expect(ready).not.toHaveBeenCalledWith(true);
    await act(async()=>{finish(new Uint8Array([1,2,3]));});
    const video=view.container.querySelector('video')!;
    expect(video.src).toContain('blob:complete-video');
    expect(ready).not.toHaveBeenCalledWith(true);
    Object.defineProperties(video,{readyState:{value:2},duration:{value:24}});
    fireEvent.loadedData(video);
    expect(ready).toHaveBeenLastCalledWith(true);
    view.unmount();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:complete-video');
  });
  it('reports failures without declaring the video ready',async()=>{
    download.run.mockRejectedValue(new Error('Incomplete download'));
    const ready=vi.fn(),loading=vi.fn();
    const view=render(<ScrollJourneyFilm src="/custom.mp4" poster="/cover.jpg" className="film" progress={motionValue(0)} onReady={ready} onProgress={vi.fn()} onLoadProgress={loading}/>);
    await act(async()=>{});
    expect(loading).toHaveBeenLastCalledWith(null);
    expect(ready).not.toHaveBeenCalledWith(true);
    view.unmount();
  });
  it('seeks forward, reverses and reaches the true ending using only the downloaded blob',async()=>{
    vi.useFakeTimers();
    const progress=motionValue(.8),shown=vi.fn();
    const view=render(<ScrollJourneyFilm src="/custom.mp4" poster="/cover.jpg" className="film" progress={progress} onReady={vi.fn()} onProgress={shown}/>);
    await act(async()=>{});
    const video=view.container.querySelector('video')!;
    Object.defineProperties(video,{readyState:{value:4},duration:{value:24.042}});
    fireEvent.loadedData(video);
    await act(async()=>{await vi.advanceTimersByTimeAsync(40);});
    const forward=video.currentTime;
    expect(forward).toBeGreaterThan(10);
    fireEvent.seeked(video);
    await act(async()=>{progress.set(.5);await vi.advanceTimersByTimeAsync(40);});
    expect(video.currentTime).toBeLessThan(forward);
    fireEvent.seeked(video);
    await act(async()=>{progress.set(1);await vi.advanceTimersByTimeAsync(40);});
    fireEvent.seeked(video);
    expect(shown).toHaveBeenLastCalledWith(1);
    expect(download.run).toHaveBeenCalledOnce();
    view.unmount();
  });
});
