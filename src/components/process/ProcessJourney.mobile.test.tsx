import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ProcessJourney from './ProcessJourney';

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
