import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { atlasProjects } from '@/data/projectAtlas';
import GalleryLink from './GalleryLink';

const router = vi.hoisted(() => ({ push: vi.fn(), prefetch: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => router }));
vi.mock('motion/react', async (original) => ({
  ...await original<typeof import('motion/react')>(), useReducedMotion: () => false,
}));

beforeEach(() => { vi.useFakeTimers();router.push.mockClear(); });
afterEach(() => vi.useRealTimers());

describe('photographic route transition', () => {
  it('reaches the chosen gallery even if the browser does not complete animation frames', () => {
    render(<GalleryLink project={atlasProjects[1]}>Open gallery</GalleryLink>);
    fireEvent.click(screen.getByRole('link'));
    expect(router.push).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(700));
    expect(router.push).toHaveBeenCalledExactlyOnceWith('/projects/kioo');
  });

  it('cancels pending navigation when the source is unmounted', () => {
    const { unmount } = render(<GalleryLink project={atlasProjects[1]}>Open gallery</GalleryLink>);
    fireEvent.click(screen.getByRole('link'));unmount();
    act(() => vi.advanceTimersByTime(700));
    expect(router.push).not.toHaveBeenCalled();
  });
});
