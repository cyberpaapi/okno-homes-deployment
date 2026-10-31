import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import FilmLoadingStatus from './FilmLoadingStatus';

describe('experience loading feedback', () => {
  let now = 0;
  let next: FrameRequestCallback | undefined;
  const tick = (milliseconds: number) => act(() => {
    for (let elapsed = 0; elapsed < milliseconds; elapsed += 16) {
      now += 16;
      const callback = next;
      next = undefined;
      callback?.(now);
    }
  });

  beforeEach(() => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({matches: false})));
    now = 0;
    next = undefined;
    vi.spyOn(performance, 'now').mockImplementation(() => now);
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { next = callback; return 1; });
    vi.stubGlobal('cancelAnimationFrame', () => { next = undefined; });
  });
  afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

  it('alternates quick and slow movement while remaining within real downloaded progress', () => {
    render(<FilmLoadingStatus ready={false} progress={.8} retry={() => {}} />);
    const bar = screen.getByRole('progressbar') as HTMLProgressElement;
    tick(288);
    const fast = bar.value;
    tick(288);
    const slow = bar.value - fast;
    expect(fast).toBeGreaterThan(slow * 3);
    tick(384);
    const beforeBurst = bar.value;
    tick(288);
    expect(bar.value - beforeBurst).toBeGreaterThan(slow);
    expect(bar.value).toBeLessThanOrEqual(.8);
    tick(10000);
    expect(bar.value).toBe(.8);
    expect(screen.getByRole('status')).toHaveTextContent('Loading experience');
  });

  it('reserves full completion for readiness and resets a failed attempt', () => {
    const { rerender } = render(<FilmLoadingStatus ready={false} progress={1} retry={() => {}} />);
    tick(10000);
    expect((screen.getByRole('progressbar') as HTMLProgressElement).value).toBeLessThan(1);
    rerender(<FilmLoadingStatus ready progress={1} retry={() => {}} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '1');
    expect(screen.getByRole('status')).toHaveTextContent('Scroll to explore');
    rerender(<FilmLoadingStatus ready={false} progress={null} retry={() => {}} />);
    expect(screen.queryByRole('progressbar')).toBeNull();
    rerender(<FilmLoadingStatus ready={false} progress={0} retry={() => {}} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '0');
  });

  it('keeps unknown-size downloads indeterminate and avoids animation for reduced motion', () => {
    const { rerender } = render(<FilmLoadingStatus ready={false} progress={-1} retry={() => {}} />);
    expect(screen.getByRole('progressbar')).not.toHaveAttribute('value');
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    vi.spyOn(window, 'matchMedia').mockReturnValue({ ...media, matches: true });
    rerender(<FilmLoadingStatus ready={false} progress={.6} retry={() => {}} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '0.6');
    expect(next).toBeUndefined();
  });
});
