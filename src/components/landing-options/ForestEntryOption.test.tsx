import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ForestEntryOption from './ForestEntryOption';

const motionState = vi.hoisted(() => ({
  reduced: false,
  progress: 0,
  onChange: null as ((progress: number) => void) | null,
  shown: 0,
  onShown: null as ((progress: number) => void) | null,
  onProgress: null as ((progress: number) => void) | null,
  onReady: null as ((ready: boolean) => void) | null,
  onLoadProgress: null as ((progress: number | null) => void) | null,
}));
const lenisState = vi.hoisted(() => ({ enabled: false, scrollTo: vi.fn(), resize: vi.fn(), on: vi.fn(), off: vi.fn(), start: vi.fn(), stop: vi.fn() }));
const shownValue = { get:()=>motionState.shown, set:(value:number)=>{motionState.shown=value;motionState.onShown?.(value);}, on:()=>()=>{} };

vi.mock('next/image', () => ({ default: (props: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; priority?: boolean }) => {
  const imageProps = { ...props }; delete imageProps.fill; delete imageProps.priority;
  // eslint-disable-next-line @next/next/no-img-element
  return <img {...imageProps} alt={props.alt} />;
} }));
vi.mock('./ScrollJourneyFilm', () => ({ default: ({ src, className,onProgress,onReady,onLoadProgress }: { src: string; className: string;onProgress:(value:number)=>void;onReady:(value:boolean)=>void;onLoadProgress:(value:number|null)=>void }) => {motionState.onProgress=onProgress;motionState.onReady=onReady;motionState.onLoadProgress=onLoadProgress;return <video src={src} className={className} />;} }));
vi.mock('@/components/landing/LandingExperience', () => ({ default: () => <div data-testid="option-one">Current landing page</div> }));
vi.mock('lenis/react', () => ({ useLenis: () => lenisState.enabled ? lenisState : undefined, ReactLenis: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
vi.mock('motion/react', () => ({
  motion: new Proxy({}, { get: (_, tag) => tag }),
  useScroll: () => ({ scrollYProgress: { get: () => motionState.progress } }),
  useSpring: (value: unknown) => value,
  useMotionValue:()=>shownValue,
  useTransform: () => ({ get: () => 0 }),
  useMotionValueEvent: (value: unknown, _event: string, callback: (progress: number) => void) => {
    if(value===shownValue)motionState.onShown=callback;else motionState.onChange = callback;
  },
  useReducedMotion: () => motionState.reduced,
}));

let viewportWidth = 1440;

describe('ForestEntryOption', () => {
  beforeEach(()=>{
    viewportWidth = 1440;
    lenisState.enabled = false;
    lenisState.scrollTo.mockClear();
    vi.stubGlobal('matchMedia', vi.fn((query: string) => ({ matches: query === '(max-width: 700px)' && viewportWidth <= 700, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
    vi.spyOn(HTMLMediaElement.prototype,'load').mockImplementation(()=>{});
    vi.spyOn(HTMLMediaElement.prototype,'play').mockResolvedValue(undefined);
  });
  afterEach(() => {
    motionState.reduced = false;
    document.body.style.overflow = '';
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

  it('keeps lower-page scrolling unlocked when the film recovers or fails after initial readiness', () => {
    viewportWidth = 390;
    const scroll = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    const view = render(<ForestEntryOption />);
    act(() => motionState.onReady?.(true));
    vi.spyOn(window, 'scrollY', 'get').mockReturnValue(8000);
    scroll.mockClear();
    act(() => { motionState.onReady?.(false); motionState.onLoadProgress?.(null); });
    expect(document.documentElement.dataset.heroLoading).toBeUndefined();
    for (const event of [new WheelEvent('wheel', { deltaY: 400, cancelable: true }), new Event('touchmove', { cancelable: true }), new KeyboardEvent('keydown', { key: 'PageDown', cancelable: true })]) {
      fireEvent(window, event);
      expect(event.defaultPrevented).toBe(false);
    }
    fireEvent.scroll(window);
    expect(scroll).not.toHaveBeenCalled();
    act(() => motionState.onReady?.(true));
    act(() => motionState.onReady?.(false));
    expect(document.documentElement.dataset.heroLoading).toBeUndefined();
    view.unmount();
  });

  it('keeps the current landing after the forest-entry sequence', () => {
    render(<ForestEntryOption />);
    const hero = screen.getByRole('region', { name: 'A journey from the forest into an OKNO home' });
    expect(screen.getByRole('heading', { level: 1, name: 'OKNO Modhomes' })).toBeInTheDocument();
    expect(screen.queryByText(/\d\s*\/\s*\d/)).not.toBeInTheDocument();
    expect(hero).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Skip to end of film' })).toBeDisabled();
    expect(screen.getByTestId('option-one')).toBeInTheDocument();
  });

  it.each([390, 430, 700, 768, 1440])('gates Skip on readiness and sweeps to the actual end at %ipx', width => {
    viewportWidth = width;
    lenisState.enabled = true;
    const { container } = render(<ForestEntryOption />);
    const hero = screen.getByRole('region', { name: 'A journey from the forest into an OKNO home' });
    vi.spyOn(hero, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, -200, 390, 6000));
    Object.defineProperty(hero, 'offsetHeight', { configurable: true, value: 6000 });
    const skip = screen.getByRole('button', { name: 'Skip to end of film' });
    expect(skip).toBeDisabled();
    fireEvent.click(skip);
    expect(lenisState.scrollTo).not.toHaveBeenCalled();
    act(() => motionState.onReady?.(true));
    expect(skip).toBeEnabled();
    fireEvent.click(skip);
    expect(lenisState.scrollTo).toHaveBeenLastCalledWith(-200 + window.scrollY + 6000 - window.innerHeight, expect.objectContaining({ duration: width <= 700 ? 4.4 : 2.2, lock: false }));
    const options = lenisState.scrollTo.mock.calls.at(-1)![1];
    expect(options.easing(.5)).toBeCloseTo(.5);
    expect(options.easing(.1)).toBeLessThan(.1);
    expect(options.easing(.9)).toBeGreaterThan(.9);
    expect(options.easing(0)).toBe(0);
    expect(options.easing(1)).toBe(1);
    expect(options.force).toBeUndefined();
    expect(motionState.shown).toBe(0);
    expect(viewport(container).style.getPropertyValue('--end-opacity')).toBe('0.0000');
  });

  it('keeps modal locks authoritative and supports native phone scrolling before a Lenis instance is available', () => {
    viewportWidth = 390;
    const scroll = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    render(<ForestEntryOption />);
    const hero = screen.getByRole('region', { name: 'A journey from the forest into an OKNO home' });
    Object.defineProperty(hero, 'offsetHeight', { configurable: true, value: 6000 });
    act(() => motionState.onReady?.(true));
    scroll.mockClear();
    document.body.style.overflow = 'hidden';
    fireEvent.click(screen.getByRole('button', { name: 'Skip to end of film' }));
    expect(scroll).not.toHaveBeenCalled();
    document.body.style.overflow = '';
    fireEvent.click(screen.getByRole('button', { name: 'Skip to end of film' }));
    expect(scroll).toHaveBeenLastCalledWith({ top: 6000 - window.innerHeight, behavior: 'smooth' });
    const wheel = new WheelEvent('wheel', { deltaY: -120, cancelable: true });
    fireEvent(window, wheel);
    expect(wheel.defaultPrevented).toBe(false);
    const key = new KeyboardEvent('keydown', { key: 'ArrowUp', cancelable: true });
    fireEvent(window, key);
    expect(key.defaultPrevented).toBe(false);
    expect(scroll).toHaveBeenCalledTimes(1);
    expect(motionState.shown).toBe(0);
  });

  it('preserves the static one-viewport reduced-motion presentation without starting a scroll or film', () => {
    viewportWidth = 390;
    motionState.reduced = true;
    const { container } = render(<ForestEntryOption />);
    expect(container.firstElementChild).toHaveAttribute('data-static', 'true');
    expect(container.querySelector('video')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Skip to end of film' })).toBeNull();
    expect(document.documentElement.dataset.heroLoading).not.toBe('true');
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
