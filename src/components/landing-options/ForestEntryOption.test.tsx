import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ForestEntryOption from './ForestEntryOption';
import introDelivery from '../../../config/hero-v1-intro.json';

const motionState = vi.hoisted(() => ({
  progress: 0,
  onChange: null as ((progress: number) => void) | null,
  shown: 0,
  onShown: null as ((progress: number) => void) | null,
  onProgress: null as ((progress: number) => void) | null,
  onReady: null as ((ready: boolean) => void) | null,
  onLoadProgress: null as ((progress: number | null) => void) | null,
}));
const shownValue = { get:()=>motionState.shown, set:(value:number)=>{motionState.shown=value;motionState.onShown?.(value);}, on:()=>()=>{} };

vi.mock('next/image', () => ({ default: (props: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; priority?: boolean }) => {
  const imageProps = { ...props }; delete imageProps.fill; delete imageProps.priority;
  // eslint-disable-next-line @next/next/no-img-element
  return <img {...imageProps} alt={props.alt} />;
} }));
vi.mock('./ScrollJourneyFilm', () => ({ default: ({ src, className,onProgress,onReady,onLoadProgress }: { src: string; className: string;onProgress:(value:number)=>void;onReady:(value:boolean)=>void;onLoadProgress:(value:number|null)=>void }) => {motionState.onProgress=onProgress;motionState.onReady=onReady;motionState.onLoadProgress=onLoadProgress;return <video src={src} className={className} />;} }));
vi.mock('@/components/landing/LandingExperience', () => ({ default: () => <div data-testid="option-one">Current landing page</div> }));
vi.mock('lenis/react', () => ({ useLenis: () => undefined, ReactLenis: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
vi.mock('motion/react', () => ({
  motion: new Proxy({}, { get: (_, tag) => tag }),
  useScroll: () => ({ scrollYProgress: { get: () => motionState.progress } }),
  useSpring: (value: unknown) => value,
  useMotionValue:()=>shownValue,
  useTransform: () => ({ get: () => 0 }),
  useMotionValueEvent: (value: unknown, _event: string, callback: (progress: number) => void) => {
    if(value===shownValue)motionState.onShown=callback;else motionState.onChange = callback;
  },
  useReducedMotion: () => false,
}));

describe('ForestEntryOption', () => {
  it('shows preparation below the tagline and offers a scroll cue when ready', () => {
    const view=render(<ForestEntryOption/>);
    const bar=screen.getByRole('progressbar',{name:'Preparing scroll video'});
    expect(bar).toHaveAttribute('value','0');
    act(()=>motionState.onLoadProgress?.(.5));
    expect(bar).toHaveAttribute('value','0.5');
    act(()=>motionState.onReady?.(true));
    expect(bar).toHaveAttribute('value','1');
    expect(screen.getByRole('status')).toHaveTextContent('Scroll to explore');
    act(()=>{motionState.onReady?.(false);motionState.onLoadProgress?.(null);});
    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(screen.getByRole('status')).toHaveTextContent('Scroll to continue');
    view.unmount();
  });
  beforeEach(()=>{
    vi.spyOn(HTMLMediaElement.prototype,'load').mockImplementation(()=>{});
    vi.spyOn(HTMLMediaElement.prototype,'play').mockResolvedValue(undefined);
  });
  afterEach(() => {
    motionState.progress = 0;
    motionState.onChange = null;
    motionState.shown=0;motionState.onShown=null;motionState.onProgress=null;
    vi.restoreAllMocks();
  });

  it('keeps the automatic intro at a constant faster rate through the whole shot', () => {
    const {container}=render(<ForestEntryOption/>);
    const intro=container.querySelector('video')!;
    expect(intro.playbackRate).toBe(1.75);
    intro.currentTime=14;
    fireEvent.playing(intro);
    expect(intro.playbackRate).toBe(1.75);
  });

  it('explicitly starts buffered muted video and retries without replaying a completed intro', () => {
    const {container}=render(<ForestEntryOption/>);
    const intro=container.querySelector('video')!;
    const play=vi.mocked(intro.play);
    expect(play).toHaveBeenCalled();
    play.mockClear();
    fireEvent.loadedData(intro);
    fireEvent.canPlay(intro);
    expect(play).toHaveBeenCalledTimes(2);
    expect(intro.muted).toBe(true);
    fireEvent.ended(intro);
    play.mockClear();
    fireEvent.canPlay(intro);
    fireEvent.pointerDown(window);
    expect(play).not.toHaveBeenCalled();
  });

  it('recovers an unavailable intro to its static ending without blocking the page', () => {
    vi.spyOn(HTMLMediaElement.prototype,'pause').mockImplementation(()=>{});
    const {container}=render(<ForestEntryOption/>);
    const intro=container.querySelector('video')!;
    fireEvent.error(intro);
    expect(intro.className).toContain('introComplete');
    expect(container.querySelector('[style*="--brand-opacity"]')).toHaveStyle('--brand-opacity: 1.0000');
  });

  it('releases the intro and keeps a static base when returning to the opening',()=>{
    vi.spyOn(HTMLMediaElement.prototype,'pause').mockImplementation(()=>{});
    const play=vi.spyOn(HTMLMediaElement.prototype,'play').mockResolvedValue(undefined);
    const {container}=render(<ForestEntryOption/>);
    const intro=container.querySelector('video')!;
    play.mockClear();
    act(()=>{motionState.progress=.2;motionState.onChange?.(.2);});
    expect(intro.hasAttribute('src')).toBe(false);
    expect(intro.load).toHaveBeenCalledOnce();
    act(()=>{motionState.progress=0;motionState.onChange?.(0);});
    expect(intro.hasAttribute('src')).toBe(false);
    expect(intro.load).toHaveBeenCalledOnce();
    expect(play).not.toHaveBeenCalled();
    expect(intro.currentTime).toBe(0);
  });
  it('leaves ordinary wheel input to the normal document scroller',()=>{
    render(<ForestEntryOption/>);
    const event=new WheelEvent('wheel',{deltaY:2400,cancelable:true,bubbles:true});
    fireEvent(window,event);
    expect(event.defaultPrevented).toBe(false);
  });
  it('waits for the presented last frame before showing the ending overlay',()=>{
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
    const {container}=render(<ForestEntryOption/>);
    act(()=>{motionState.progress=1;motionState.onChange?.(1);});
    const viewport=container.querySelector('[style*="--end-opacity"]') as HTMLElement;
    expect(viewport.style.getPropertyValue('--end-opacity')).toBe('0.0000');
    act(()=>motionState.onProgress?.(1));
    expect(viewport.style.getPropertyValue('--end-opacity')).toBe('1.0000');
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
      '/assets/landing-options/forest-entry-scroll-window-smooth-b6de05527e75.mp4',
    );
    expect(container.firstElementChild).not.toHaveAttribute('data-ambient-video');
    expect([...container.querySelectorAll('video')].map(video => video.getAttribute('src'))).toEqual([
      introDelivery.source,
      '/assets/landing-options/forest-entry-scroll-window-smooth-b6de05527e75.mp4',
    ]);
  });

  it('holds the intro still and editable tagline without any idle playback', () => {
    const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    const { container, rerender } = render(<ForestEntryOption variant={{ id: 'hero-v1', fields: { tagline: 'A home in the forest.' } }} />);
    fireEvent.ended(container.querySelector('video')!);
    expect(container.querySelector('img[src="/assets/landing-options/forest-entry-intro-last-frame.png"]')).toBeInTheDocument();
    expect(screen.getByText('A home in the forest.')).toBeInTheDocument();
    expect(container.querySelectorAll('video')).toHaveLength(2);
    play.mockClear();
    fireEvent.focus(window);
    expect(play).not.toHaveBeenCalled();
    rerender(<ForestEntryOption variant={{ id: 'hero-v1', fields: { tagline: '' } }} />);
    expect(container.querySelector('[data-hero-v1-tagline]')).toBeNull();
  });

  it('does not replay the intro after scrolling away and returning to the top', () => {
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
    expect(intro.currentTime).toBe(3);
    expect(introPlay).not.toHaveBeenCalled();
    expect(intro.className).toContain('introComplete');
  });
});
