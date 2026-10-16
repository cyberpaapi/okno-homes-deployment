import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ProcessJourney from './ProcessJourney';

vi.mock('@/components/projects/21st/SilkBackground', () => ({ SilkBackground: () => null }));

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe('phone build playback', () => {
  it('uses a controlled native film, follows its chapter and releases playback when unmounted', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({ matches: query === '(max-width: 700px)', addEventListener: vi.fn(), removeEventListener: vi.fn() }));
    const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
    const pause = vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
    vi.stubGlobal('IntersectionObserver', class {
      constructor(private callback: (entries: { isIntersecting: boolean }[]) => void) {}
      observe(element: Element) { if (element.tagName === 'VIDEO') this.callback([{ isIntersecting: true }]); }
      unobserve() {}
      disconnect() {}
    });
    const view = render(<ProcessJourney />);
    const video = screen.getByLabelText('OKNO build sequence from land to handover') as HTMLVideoElement;
    expect(video).toHaveAttribute('controls');
    expect(video).toHaveAttribute('playsinline');
    expect(video).toHaveAttribute('src', '/process/process-mobile-build.mp4');
    expect(view.container.querySelector('[data-playback="scroll"]')).toBeNull();
    expect(play).toHaveBeenCalledOnce();
    Object.defineProperty(video, 'duration', { value: 20.7, configurable: true });
    video.currentTime = 20.5;
    fireEvent.timeUpdate(video);
    expect(screen.getByRole('heading', { name: 'Handover' })).toBeInTheDocument();
    expect(screen.getAllByText('Days 73–90').length).toBeGreaterThan(0);
    view.unmount();
    expect(pause).toHaveBeenCalled();
  });
});
