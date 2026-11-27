import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ProcessJourney from './ProcessJourney';
import { phoneTimelineProgress, phoneTimelineTravelRatio } from './ProcessDetailTimeline';

const film = vi.hoisted(() => ({ props: null as null | { onReady(ready: boolean): void; onLoadProgress(progress: number | null): void } }));
vi.mock('@/components/projects/21st/SilkBackground', () => ({ SilkBackground: () => null }));
vi.mock('./ScrollProcessFilm', () => ({ default: (props: typeof film.props) => { film.props = props; return <canvas data-testid="scroll-film" />; } }));
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe('phone build playback', () => {
  it('keeps the scroll film on mobile and gates scrolling until media readiness', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({ matches: query === '(max-width: 700px)', addEventListener: vi.fn(), removeEventListener: vi.fn() }));
    vi.stubGlobal('IntersectionObserver', class { observe() {} unobserve() {} disconnect() {} });
    const view = render(<ProcessJourney />);
    expect(view.container.querySelector('[data-playback="scroll"]')).toBeTruthy();
    expect(view.container.querySelector('video[controls]')).toBeNull();
    expect(document.documentElement.dataset.heroLoading).toBe('true');
    act(() => film.props?.onLoadProgress(.5));
    expect((screen.getByRole('progressbar') as HTMLProgressElement).value).toBeLessThanOrEqual(.5);
    expect(screen.getByRole('status')).toHaveTextContent('Loading experience');
    act(() => film.props?.onLoadProgress(1));
    expect(document.documentElement.dataset.heroLoading).toBe('true');
    act(() => film.props?.onReady(true));
    expect(document.documentElement.dataset.heroLoading).toBeUndefined();
    expect(screen.getByText('Scroll to enter')).toBeInTheDocument();
    expect(screen.queryByText('Scroll to enter the build')).not.toBeInTheDocument();
    view.unmount();
  });
});

describe('phone chronology ending geometry', () => {
  it.each([
    { width: 360, smallHeight: 800, viewport: 800, stageHeight: 800 },
    { width: 390, smallHeight: 844, viewport: 844, stageHeight: 844 },
    { width: 390, smallHeight: 800, viewport: 844, stageHeight: 844 },
    { width: 390, smallHeight: 800, viewport: 844, stageHeight: 800 },
  ])('follows intermediate positions and reverses at $width with viewport $viewport', ({ smallHeight, viewport, stageHeight }) => {
    const height = 4.62 * smallHeight;
    const travel = height - viewport;
    const ratio = phoneTimelineTravelRatio(height, viewport, stageHeight);
    const phaseAt = (position: number) => phoneTimelineProgress(position / travel, ratio);
    const releaseAt = height - stageHeight;
    const completeAt = releaseAt - .12 * smallHeight;

    // Small forward input must move the article without waiting for a phase
    // threshold; reversing has no spring queue or stale forward target.
    const positions = [0, 10, 20, completeAt * .25, completeAt * .5, completeAt * .75, completeAt];
    const forward = positions.map(phaseAt);
    expect(forward[1]).toBeGreaterThan(0);
    expect(forward[2]).toBeGreaterThan(forward[1]);
    for (let index = 1; index < forward.length; index++) {
      expect(forward[index]).toBeGreaterThan(forward[index - 1]);
    }
    expect([...positions].reverse().map(phaseAt)).toEqual([...forward].reverse());
    expect(phaseAt(completeAt * .25)).toBeCloseTo(.25);
    expect(phaseAt(completeAt * .5)).toBeCloseTo(.5);
    expect(phaseAt(completeAt * .75)).toBeCloseTo(.75);
    expect(phaseAt(-40)).toBe(0);
    expect(phaseAt(releaseAt)).toBe(1);
    expect(phaseAt(releaseAt + 32)).toBe(1);
    expect(phaseAt(completeAt - 1)).toBeLessThan(1);
  });

  it.each([800, 844])('releases after a 12svh final dwell in a %ipx viewport', viewport => {
    const travel = 4.62 * viewport - viewport;
    const ratio = phoneTimelineTravelRatio(4.62 * viewport, viewport);
    const finalStart = travel / ratio;
    expect(travel - finalStart).toBeCloseTo(.12 * viewport);
  });

  it('leaves unmeasurable/static layout progress unchanged', () => {
    expect(phoneTimelineTravelRatio(0, 844)).toBe(1);
    expect(phoneTimelineTravelRatio(600, 844)).toBe(1);
  });
});
