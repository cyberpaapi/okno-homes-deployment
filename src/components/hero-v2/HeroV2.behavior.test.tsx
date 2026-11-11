import type { ReactNode } from 'react';
import { act, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import HeroV2 from './HeroV2';

const mock = vi.hoisted(() => ({ reduced: false, progress: 0, change: undefined as (() => void) | undefined, present: undefined as ((time: number) => void) | undefined, setTime: vi.fn(), dispose: vi.fn() }));
const camera = { get: () => mock.progress, jump: (value: number) => { mock.progress = value; } };
vi.mock('motion/react', () => ({
  useReducedMotion: () => mock.reduced,
  useScroll: () => ({ scrollYProgress: {} }),
  useSpring: () => camera,
  useMotionValueEvent: (_value: unknown, _event: string, change: () => void) => { mock.change = change; },
}));
vi.mock('@/lib/useSiteContent', () => ({ useSiteContent: (_id: string, fallback: string) => fallback }));
vi.mock('@/components/ui/SubtleAction', () => ({ SubtleLink: ({ href, children }: { href: string; children: ReactNode }) => <a href={href}>{children}</a> }));
vi.mock('@/components/landing/LandingExperience', () => ({ default: () => <div data-testid="shared-page">Shared page</div> }));
vi.mock('@/components/landing-options/useHeroReloadPosition', () => ({ useHeroReloadPosition: vi.fn() }));
vi.mock('@/lib/heroV2ImageScrubber', () => ({ heroV2ImageDuration: 791 / 24, heroV2ImageAsset: () => ({ parts: [{source: '/optimized.bin'}], bytes: 3 }), createHeroV2ImageScrubber: (_canvas: unknown, _signal: unknown, ready: () => void, _fail: unknown, present: (time: number) => void) => { mock.present = present; ready(); return { setTime: mock.setTime, dispose: mock.dispose }; } }));
vi.mock('@/lib/downloadHeroMedia', () => ({ downloadHeroMedia: async () => new Uint8Array([1,2,3]) }));

afterEach(() => { mock.reduced = false; mock.progress = 0; mock.present = undefined; vi.clearAllMocks(); });

describe('scroll-only V2 behavior', () => {
  it('starts at the cave, maps forward and reverse scroll directly and keeps the shared page', async () => {
    const page = render(<HeroV2 />);
    await waitFor(() => expect(mock.setTime).toHaveBeenCalledWith(0));
    expect(page.container.querySelector('video')).toBeNull();
    expect(page.getByTestId('shared-page')).toBeInTheDocument();
    act(() => { mock.progress = .45; mock.change?.(); });
    expect(mock.setTime.mock.lastCall?.[0]).toBeCloseTo(.45 * 790 / 24);
    act(() => { mock.progress = 1; mock.change?.(); });
    expect(mock.setTime.mock.lastCall?.[0]).toBeCloseTo(790 / 24);
    act(() => { mock.progress = .09; mock.change?.(); });
    expect(mock.setTime.mock.lastCall?.[0]).toBeCloseTo(.09 * 790 / 24);
    page.unmount(); expect(mock.dispose).toHaveBeenCalled();
  });
  it('uses a single still and loads no film for reduced motion', () => {
    mock.reduced = true;
    const page = render(<HeroV2 />);
    expect(page.container.querySelector('canvas,video')).toBeNull();
    expect(page.container.querySelector('img')?.getAttribute('src')).toBe('/hero-v2/nighttime-first.webp');
    expect(mock.setTime).not.toHaveBeenCalled();
    expect(page.getByTestId('shared-page')).toBeInTheDocument();
  });
  it('hands the final frame straight to the page without a closing overlay', async () => {
    const page = render(<HeroV2 />);
    await waitFor(() => expect(mock.present).toBeDefined());
    const ending = page.container.querySelector('[data-v2-ending]')!;
    act(() => { mock.progress = 1; mock.change?.(); });
    act(() => mock.present?.(790 / 24));
    expect(ending).toHaveAttribute('aria-hidden', 'true');
    expect(ending).toHaveAttribute('inert');
  });

});
