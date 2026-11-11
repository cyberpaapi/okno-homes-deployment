import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ForestEntryOption from './ForestEntryOption';

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
  beforeEach(()=>{
    vi.stubGlobal('matchMedia', vi.fn(() => ({matches: false})));
    vi.spyOn(HTMLMediaElement.prototype,'load').mockImplementation(()=>{});
    vi.spyOn(HTMLMediaElement.prototype,'play').mockResolvedValue(undefined);
  });
  afterEach(() => {
    motionState.progress = 0;
    motionState.onChange = null;
    motionState.onReady = null; motionState.onLoadProgress = null;
    motionState.shown=0;motionState.onShown=null;motionState.onProgress=null;
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });
  const viewport = (container: HTMLElement) => container.querySelector('[style*="--brand-opacity"]') as HTMLElement;

  it('opens on the loading bar over the first frame of the single scroll film', () => {
    const { container } = render(<ForestEntryOption/>);
    expect(container.querySelectorAll('video')).toHaveLength(1);
    expect(container.querySelector('video')).toHaveAttribute('src', '/assets/landing-options/forest-entry-journey-merged-cfcd487337e3.mp4');
    expect(container.querySelector('img[src="/assets/landing-options/forest-entry-intro-first-frame.jpg"]')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Loading experience' })).toBeInTheDocument();
    expect(viewport(container).style.getPropertyValue('--brand-opacity')).toBe('1.0000');
    expect(viewport(container).style.getPropertyValue('--cue-opacity')).toBe('0.0000');
    expect(document.documentElement.dataset.heroLoading).toBe('true');
  });

  it('shows the mouse prompt once loaded and leaves the film to scroll alone', () => {
    const play = vi.mocked(HTMLMediaElement.prototype.play);
    const { container } = render(<ForestEntryOption/>);
    act(() => motionState.onReady?.(true));
    expect(document.documentElement.dataset.heroLoading).not.toBe('true');
    expect(viewport(container).style.getPropertyValue('--brand-opacity')).toBe('0.0000');
    expect(viewport(container).style.getPropertyValue('--cue-opacity')).toBe('1.0000');
    expect(container.querySelector('[data-hero-scroll-cue]')).toHaveTextContent('Scroll to continue');
    expect(play).not.toHaveBeenCalled();
    const before = window.scrollY;
    expect(window.scrollY).toBe(before);
    act(() => { motionState.progress = .03; motionState.onChange?.(.03); });
    expect(viewport(container).style.getPropertyValue('--cue-opacity')).toBe('0.0000');
  });

  it('resolves the earlier journey-only film to the merged film', () => {
    const { container } = render(<ForestEntryOption variant={{ id: 'hero-v1', fields: { scrollVideo: '/assets/landing-options/forest-entry-scroll-window-smooth-b6de05527e75.mp4' } }} />);
    expect(container.firstElementChild).toHaveAttribute('data-journey-video', '/assets/landing-options/forest-entry-journey-merged-cfcd487337e3.mp4');
  });

  it('reports a failed film and retries', () => {
    render(<ForestEntryOption/>);
    act(()=>{motionState.onReady?.(false);motionState.onLoadProgress?.(null);});
    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(screen.getByRole('status')).toHaveTextContent('Experience could not load');
    expect(document.documentElement.dataset.heroLoading).toBe('true');
    fireEvent.click(screen.getByRole('button',{name:'Retry loading'}));
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('releases ordinary wheel input only when the film is ready',()=>{
    render(<ForestEntryOption/>);
    const blocked=new WheelEvent('wheel',{cancelable:true});fireEvent(window,blocked);expect(blocked.defaultPrevented).toBe(true);
    act(()=>motionState.onReady?.(true));
    const event=new WheelEvent('wheel',{deltaY:2400,cancelable:true,bubbles:true});
    fireEvent(window,event);
    expect(event.defaultPrevented).toBe(false);
  });

  it('shows the matching end still only once the last frame is presented', () => {
    const {container}=render(<ForestEntryOption/>);
    act(()=>motionState.onReady?.(true));
    act(()=>{motionState.progress=1;motionState.onChange?.(1);});
    expect(viewport(container).style.getPropertyValue('--end-opacity')).toBe('0.0000');
    act(()=>motionState.onProgress?.(1));
    expect(viewport(container).style.getPropertyValue('--end-opacity')).toBe('1.0000');
  });

  it('keeps the current landing after the forest-entry sequence', () => {
    render(<ForestEntryOption />);
    const hero = screen.getByRole('region', { name: 'A journey from the forest into an OKNO home' });
    expect(screen.getByRole('heading', { level: 1, name: 'OKNO Modhomes' })).toBeInTheDocument();
    expect(screen.queryByText(/\d\s*\/\s*\d/)).not.toBeInTheDocument();
    expect(hero.querySelector('button')).toBeNull();
    expect(screen.getByTestId('option-one')).toBeInTheDocument();
  });

  it('keeps the editable tagline for screen readers only', () => {
    const { container, rerender } = render(<ForestEntryOption variant={{ id: 'hero-v1', fields: { tagline: 'A home in the forest.' } }} />);
    const tagline = container.querySelector('[data-hero-v1-tagline]')!;
    expect(tagline).toHaveTextContent('A home in the forest.');
    expect(tagline.className).toContain('srOnly');
    rerender(<ForestEntryOption variant={{ id: 'hero-v1', fields: { tagline: '' } }} />);
    expect(container.querySelector('[data-hero-v1-tagline]')).toBeNull();
  });
});
