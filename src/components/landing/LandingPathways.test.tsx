import { fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import LandingPathways from './LandingPathways';

const viewState = vi.hoisted(() => ({ visible: true, compact: true }));
vi.mock('@/lib/useSiteContent', () => ({ useSiteContentMap: () => ({}) }));
vi.mock('@/lib/useMediaQuery', () => ({ useMediaQuery: () => viewState.compact }));
vi.mock('motion/react', async importOriginal => {
  const actual = await importOriginal<typeof import('motion/react')>();
  const progress = actual.motionValue(0);
  return { ...actual, useScroll: () => ({ scrollYProgress: progress }), useReducedMotion: () => false,
    useInView: (_ref: unknown, options?: { margin?: string }) => options?.margin ? true : viewState.visible };
});
afterEach(() => { vi.restoreAllMocks(); viewState.visible=true; viewState.compact=true; });

describe('homepage Forza playback', () => {
  it.each([true, false])('autoplays once without controls or looping (compact=%s)', compact => {
    viewState.compact=compact;
    vi.spyOn(document,'hidden','get').mockReturnValue(false);
    vi.spyOn(HTMLMediaElement.prototype,'play').mockResolvedValue(undefined);
    vi.spyOn(HTMLMediaElement.prototype,'pause').mockImplementation(()=>{});
    const view=render(<LandingPathways/>);
    const video=view.container.querySelector<HTMLVideoElement>('#models-preview video')!;
    const play=vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(video,'play',{configurable:true,value:play});
    expect(video.controls).toBe(false);
    expect(video.loop).toBe(false);
    expect(video.muted).toBe(true);
    fireEvent.canPlay(video);
    expect(play).toHaveBeenCalled();
    video.currentTime=12;
    fireEvent.ended(video);
    play.mockClear();
    viewState.visible=false;view.rerender(<LandingPathways/>);
    viewState.visible=true;view.rerender(<LandingPathways/>);
    fireEvent.canPlay(video);
    fireEvent(document,new Event('visibilitychange'));
    expect(play).not.toHaveBeenCalled();
    expect(video.currentTime).toBe(12);
    view.unmount();
  });
});
