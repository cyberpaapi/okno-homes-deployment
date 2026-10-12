import { act, fireEvent, render } from '@testing-library/react';
import { motionValue } from 'motion/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ScrollJourneyFilm from './ScrollJourneyFilm';

const parentDescriptor = Object.getOwnPropertyDescriptor(window,'parent')!;
beforeEach(()=>{vi.spyOn(HTMLMediaElement.prototype,'pause').mockImplementation(()=>{});});
afterEach(()=>{Object.defineProperty(window,'parent',parentDescriptor);vi.useRealTimers();vi.unstubAllGlobals();vi.restoreAllMocks();});

describe('embedded Hero V1 preview',()=>{
  it('uses native seeking without allocating an indexed decoder and stays responsive beyond five seconds',async()=>{
    vi.useFakeTimers();
    Object.defineProperty(window,'parent',{configurable:true,value:{}});
    const Decoder=vi.fn();vi.stubGlobal('VideoDecoder',Decoder);
    const progress=motionValue(.8),onReady=vi.fn(),onProgress=vi.fn();
    const view=render(<ScrollJourneyFilm src="/assets/landing-options/forest-entry-scroll-window-smooth-b6de05527e75.mp4" poster="/cover.jpg" className="film" progress={progress} onReady={onReady} onProgress={onProgress}/>);
    const video=view.container.querySelector('video')!;
    expect(video).toBeTruthy();expect(view.container.querySelector('canvas')).toBeNull();expect(Decoder).not.toHaveBeenCalled();
    Object.defineProperties(video,{readyState:{value:4},duration:{value:24}});
    fireEvent.loadedData(video);
    await act(async()=>{await vi.advanceTimersByTimeAsync(6000);});
    const forward=video.currentTime;expect(forward).toBeGreaterThan(10);expect(onReady).toHaveBeenCalledWith(true);
    fireEvent.seeked(video);
    await act(async()=>{progress.set(.5);await vi.advanceTimersByTimeAsync(1000);});
    expect(video.currentTime).toBeLessThan(forward);
    view.unmount();
  });
  it('reports the true ending after native metadata rounds the duration',async()=>{
    vi.useFakeTimers();
    Object.defineProperty(window,'parent',{configurable:true,value:{}});
    const onProgress=vi.fn();
    const view=render(<ScrollJourneyFilm src="/assets/landing-options/forest-entry-scroll-window-smooth-b6de05527e75.mp4" poster="/cover.jpg" className="film" progress={motionValue(1)} onReady={vi.fn()} onProgress={onProgress}/>);
    const video=view.container.querySelector('video')!;
    Object.defineProperties(video,{readyState:{value:4},duration:{value:24.042}});
    fireEvent.loadedData(video);
    await act(async()=>{await vi.advanceTimersByTimeAsync(20);});
    fireEvent.seeked(video);
    expect(video.currentTime).toBeGreaterThan(24);
    expect(video.currentTime).toBeLessThan(24.042);
    expect(onProgress).toHaveBeenLastCalledWith(1);
    view.unmount();
  });
});
