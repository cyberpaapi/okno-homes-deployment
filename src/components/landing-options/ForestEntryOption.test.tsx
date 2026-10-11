import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ForestEntryOption from './ForestEntryOption';

const motionState = vi.hoisted(() => ({
  progress: 0,
  onChange: null as ((progress: number) => void) | null,
}));

vi.mock('next/image', () => ({ default: (props: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; priority?: boolean }) => {
  const imageProps = { ...props }; delete imageProps.fill; delete imageProps.priority;
  // eslint-disable-next-line @next/next/no-img-element
  return <img {...imageProps} alt={props.alt} />;
} }));
vi.mock('./ScrollJourneyFilm', () => ({ default: ({ src, className }: { src: string; className: string }) => <video src={src} className={className} /> }));
vi.mock('@/components/landing/LandingExperience', () => ({ default: () => <div data-testid="option-one">Current landing page</div> }));
vi.mock('lenis/react', () => ({ useLenis: () => undefined, ReactLenis: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
vi.mock('motion/react', () => ({
  motion: new Proxy({}, { get: (_, tag) => tag }),
  useScroll: () => ({ scrollYProgress: { get: () => motionState.progress } }),
  useSpring: (value: unknown) => value,
  useTransform: () => ({ get: () => 0 }),
  useMotionValueEvent: (_value: unknown, _event: string, callback: (progress: number) => void) => {
    motionState.onChange = callback;
  },
  useReducedMotion: () => false,
}));

describe('ForestEntryOption', () => {
  afterEach(() => {
    motionState.progress = 0;
    motionState.onChange = null;
    vi.restoreAllMocks();
  });

  it('keeps the current landing after the separate forest-entry sequence', () => {
    const { container } = render(<ForestEntryOption />);
    const hero = screen.getByRole('region', { name: 'A journey from the forest into an OKNO home' });
    expect(hero).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'OKNO Modhomes' })).toBeInTheDocument();
    expect(hero.querySelector('[data-component="9643"]')).not.toBeInTheDocument();
    expect(hero.querySelector('img[src="/assets/landing-options/okno-wordmark-only.svg"]')).not.toBeInTheDocument();
    expect(hero.querySelector('img[src="/assets/landing-options/forest-entry-foreground-v3.webp"]')).not.toBeInTheDocument();
    expect(hero.querySelectorAll('img[src="/assets/landing-options/forest-entry-start-v2.jpg"]')).toHaveLength(1);
    expect(screen.queryByText('Architecture drawn around your land.')).not.toBeInTheDocument();
    expect(screen.queryByText(/\d\s*\/\s*\d/)).not.toBeInTheDocument();
    expect(hero.querySelector('button')).toBeNull();
    expect(screen.getByTestId('option-one')).toBeInTheDocument();
    expect(container.firstElementChild).toHaveAttribute(
      'data-journey-video',
      '/assets/landing-options/forest-entry-scroll-window-smooth.mp4',
    );
    expect(container.firstElementChild).not.toHaveAttribute('data-ambient-video');
    expect([...container.querySelectorAll('video')].map(video => video.getAttribute('src'))).toEqual([
      '/assets/landing-options/forest-entry-intro-15s.mp4',
      '/assets/landing-options/forest-entry-scroll-window-smooth.mp4',
    ]);
  });

  it('holds the intro still and editable tagline without any idle playback', () => {
    const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    const { container, rerender } = render(<ForestEntryOption variant={{ id: 'hero-v1', fields: { tagline: 'A home in the forest.' } }} />);
    fireEvent.ended(container.querySelector('video')!);
    expect(container.querySelector('img[src="/assets/landing-options/forest-entry-intro-last-frame.png"]')).toBeInTheDocument();
    expect(screen.getByText('A home in the forest.')).toBeInTheDocument();
    expect(container.querySelectorAll('video')).toHaveLength(2);
    fireEvent.focus(window);
    expect(play).not.toHaveBeenCalled();
    rerender(<ForestEntryOption variant={{ id: 'hero-v1', fields: { tagline: '' } }} />);
    expect(container.querySelector('[data-hero-v1-tagline]')).toBeNull();
  });

  it('replays the intro after scrolling away and returning to the top', () => {
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});

    const { container } = render(<ForestEntryOption />);
    const [intro] = container.querySelectorAll('video');
    const introPlay = vi.spyOn(intro, 'play').mockResolvedValue(undefined);

    act(() => {
      motionState.progress = .2;
      motionState.onChange?.(.2);
    });
    expect(intro.className).toContain('introComplete');

    intro.currentTime = 3;
    introPlay.mockClear();
    act(() => {
      motionState.progress = 0;
      motionState.onChange?.(0);
    });
    expect(intro.currentTime).toBe(0);
    expect(introPlay).toHaveBeenCalledOnce();
    expect(intro.className).not.toContain('introComplete');
  });
});
