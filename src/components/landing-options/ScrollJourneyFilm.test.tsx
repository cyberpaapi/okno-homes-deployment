import { act, fireEvent, render } from '@testing-library/react';
import { motionValue } from 'motion/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ScrollJourneyFilm from './ScrollJourneyFilm';

const parentDescriptor = Object.getOwnPropertyDescriptor(window,'parent')!;
afterEach(()=>{Object.defineProperty(window,'parent',parentDescriptor);vi.useRealTimers();vi.unstubAllGlobals();});

describe('embedded Hero V1 preview',()=>{
  it('uses native seeking without allocating an indexed decoder and stays responsive beyond five seconds',async()=>{
    vi.useFakeTimers();
    Object.defineProperty(window,'parent',{configurable:true,value:{}});
    const Decoder=vi.fn();vi.stubGlobal('VideoDecoder',Decoder);
    const progress=motionValue(.8),onReady=vi.fn();
    const view=render(<ScrollJourneyFilm src="/assets/landing-options/forest-entry-scroll-window-smooth.mp4" poster="/cover.jpg" className="film" progress={progress} onReady={onReady}/>);
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
});
