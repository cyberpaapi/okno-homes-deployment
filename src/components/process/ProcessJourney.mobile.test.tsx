import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ProcessJourney from './ProcessJourney';
import { phoneTimelineTravelRatio } from './ProcessDetailTimeline';

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
    view.unmount();
  });
});

describe('phone chronology ending geometry', () => {
  it.each([
    { width: 360, smallHeight: 800, viewport: 800 },
    { width: 390, smallHeight: 844, viewport: 844 },
    { width: 390, smallHeight: 800, viewport: 844 },
  ])('preserves earlier phase positions at $width with viewport $viewport', ({ smallHeight, viewport }) => {
    const height = 4.62 * smallHeight;
    const travel = height - viewport;
    const originalTravel = 5 * smallHeight - viewport;
    const ratio = phoneTimelineTravelRatio(height, viewport);
    const phaseAt = (position: number) => Math.round(position / travel * ratio * 4) / 4;

    for (const boundary of [.125, .375, .625, .875]) {
      const position = originalTravel * boundary;
      expect(phaseAt(position - 1)).toBe((Math.round(boundary * 4) - 1) / 4);
      expect(phaseAt(position + 1)).toBe(Math.round(boundary * 4) / 4);
    }
    expect(phaseAt(travel)).toBe(1);
    expect(phaseAt(travel + 32)).toBe(1);
    // Reversing across the last boundary restores the preceding whole phase.
    expect(phaseAt(originalTravel * .875 - 1)).toBe(.75);
    expect(travel).toBeCloseTo(originalTravel - .38 * smallHeight);
  });

  it.each([800, 844])('releases after a 12svh final dwell in a %ipx viewport', viewport => {
    const travel = 4.62 * viewport - viewport;
    const finalStart = (5 * viewport - viewport) * .875;
    expect(travel - finalStart).toBeCloseTo(.12 * viewport);
  });

  it('leaves unmeasurable/static layout progress unchanged', () => {
    expect(phoneTimelineTravelRatio(0, 844)).toBe(1);
    expect(phoneTimelineTravelRatio(600, 844)).toBe(1);
  });
});
