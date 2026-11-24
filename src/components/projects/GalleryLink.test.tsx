import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { atlasProjects } from '@/data/projectAtlas';
import Image from 'next/image';
import GalleryLink from './GalleryLink';

const router = vi.hoisted(() => ({ push: vi.fn(), prefetch: vi.fn() }));
const motionPreferences = vi.hoisted(() => ({ reduced: false }));
const preventedClicks: boolean[] = [];
// JSDOM cannot open another document; observe the component's decision before
// cancelling the browser default at the document boundary.
function interceptBrowserNavigation(event: MouseEvent) {
  preventedClicks.push(event.defaultPrevented);
  event.preventDefault();
}
vi.mock('next/navigation', () => ({ useRouter: () => router }));
vi.mock('motion/react', async (original) => ({
  ...await original<typeof import('motion/react')>(), useReducedMotion: () => motionPreferences.reduced,
}));

beforeEach(() => { vi.useFakeTimers();router.push.mockClear();router.prefetch.mockClear();motionPreferences.reduced = false;preventedClicks.length = 0;document.addEventListener('click', interceptBrowserNavigation); });
afterEach(() => { document.removeEventListener('click', interceptBrowserNavigation);vi.useRealTimers(); });

describe('restrained gallery navigation', () => {
  it('keeps the clicked image in place and reaches its gallery without waiting for animation frames', () => {
    const view = render(<GalleryLink project={atlasProjects[1]}><Image src="/selected-detail.webp" width={240} height={160} alt="Selected photograph" /></GalleryLink>);
    const photograph = screen.getByRole('img', { name: 'Selected photograph' });
    fireEvent.click(screen.getByRole('link'));
    fireEvent.click(screen.getByRole('link'));
    expect(screen.getAllByRole('img')).toEqual([photograph]);
    expect(view.container).toContainElement(photograph);
    expect(document.querySelector(`img[src="${atlasProjects[1].image.src}"]`)).toBeNull();
    expect(router.push).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(159));
    expect(router.push).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(router.push).toHaveBeenCalledExactlyOnceWith('/projects/kioo');
  });

  it.each([{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { altKey: true }, { button: 1 }])('preserves native link behavior for %o', modifiers => {
    render(<GalleryLink project={atlasProjects[1]}>Open gallery</GalleryLink>);
    fireEvent.click(screen.getByRole('link'), modifiers);
    expect(preventedClicks).toEqual([false]);
    expect(document.querySelector('[aria-hidden="true"]')).toBeNull();
    act(() => vi.advanceTimersByTime(200));
    expect(router.push).not.toHaveBeenCalled();
  });

  it('uses the normal link immediately when reduced motion is requested', () => {
    motionPreferences.reduced = true;
    render(<GalleryLink project={atlasProjects[1]}>Open gallery</GalleryLink>);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/projects/kioo');
    fireEvent.click(screen.getByRole('link'));
    expect(preventedClicks).toEqual([false]);
    expect(document.querySelector('[aria-hidden="true"]')).toBeNull();
    act(() => vi.advanceTimersByTime(200));
    expect(router.push).not.toHaveBeenCalled();
  });

  it('retains pointer and keyboard gallery prefetching', () => {
    render(<GalleryLink project={atlasProjects[1]}>Open gallery</GalleryLink>);
    fireEvent.pointerEnter(screen.getByRole('link'));
    fireEvent.focus(screen.getByRole('link'));
    expect(router.prefetch).toHaveBeenCalledTimes(2);
    expect(router.prefetch).toHaveBeenLastCalledWith('/projects/kioo');
  });

  it('cancels pending navigation when the source is unmounted', () => {
    const { unmount } = render(<GalleryLink project={atlasProjects[1]}>Open gallery</GalleryLink>);
    fireEvent.click(screen.getByRole('link'));unmount();
    act(() => vi.advanceTimersByTime(700));
    expect(router.push).not.toHaveBeenCalled();
  });
});
