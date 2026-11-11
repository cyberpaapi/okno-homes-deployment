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

  it('opens on the loading bar and hands straight to the film when ready', () => {
    const view=render(<ForestEntryOption/>);
    const bar=screen.getByRole('progressbar',{name:'Loading experience'});
    expect(bar).toHaveAttribute('value','0');
    const viewport=view.container.querySelector('[style*="--brand-opacity"]') as HTMLElement;
    expect(viewport.style.getPropertyValue('--brand-opacity')).toBe('1.0000');
    expect(viewport.style.getPropertyValue('--journey-opacity')).toBe('0.0000');
    act(()=>motionState.onLoadProgress?.(.5));
    expect((bar as HTMLProgressElement).value).toBeLessThanOrEqual(.5);
    expect(document.documentElement.dataset.heroLoading).toBe('true');
    expect(screen.getByRole('status')).toHaveTextContent('Loading experience');
    act(()=>motionState.onReady?.(true));
    expect(document.documentElement.dataset.heroLoading).not.toBe('true');
    expect(viewport.style.getPropertyValue('--brand-opacity')).toBe('0.0000');
    expect(viewport.style.getPropertyValue('--journey-opacity')).toBe('1.0000');
    act(()=>{motionState.onReady?.(false);motionState.onLoadProgress?.(null);});
    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(screen.getByRole('status')).toHaveTextContent('Experience could not load');
    expect(document.documentElement.dataset.heroLoading).toBe('true');
    fireEvent.click(screen.getByRole('button',{name:'Retry loading'}));
    expect(screen.getByRole('progressbar')).toHaveAttribute('value','0');
    view.unmount();
  });

  it('plays a single film with no separate intro clip', () => {
    const {container}=render(<ForestEntryOption/>);
    expect([...container.querySelectorAll('video')].map(video => video.getAttribute('src'))).toEqual([
      '/assets/landing-options/forest-entry-scroll-window-smooth-b6de05527e75.mp4',
    ]);
    expect(container.querySelector('img[src="/assets/landing-options/forest-entry-intro-last-frame.png"]')).toBeNull();
  });

  it('releases ordinary wheel input only when the complete movie is ready',()=>{
    render(<ForestEntryOption/>);
    const blocked=new WheelEvent('wheel',{cancelable:true});fireEvent(window,blocked);expect(blocked.defaultPrevented).toBe(true);
    act(()=>motionState.onReady?.(true));
    const event=new WheelEvent('wheel',{deltaY:2400,cancelable:true,bubbles:true});
    fireEvent(window,event);
    expect(event.defaultPrevented).toBe(false);
  });

  it('shows the matching end still only once the last frame is presented',()=>{
    const {container}=render(<ForestEntryOption/>);
    act(()=>motionState.onReady?.(true));
    act(()=>{motionState.progress=1;motionState.onChange?.(1);});
    const viewport=container.querySelector('[style*="--end-opacity"]') as HTMLElement;
    expect(viewport.style.getPropertyValue('--end-opacity')).toBe('0.0000');
    act(()=>motionState.onProgress?.(1));
    expect(viewport.style.getPropertyValue('--end-opacity')).toBe('1.0000');
  });

  it('keeps the current landing after the forest-entry sequence', () => {
    const { container } = render(<ForestEntryOption />);
    const hero = screen.getByRole('region', { name: 'A journey from the forest into an OKNO home' });
    expect(screen.getByRole('heading', { level: 1, name: 'OKNO Modhomes' })).toBeInTheDocument();
    expect(hero.querySelectorAll('img[src="/assets/landing-options/forest-entry-start-v2.jpg"]')).toHaveLength(1);
    expect(screen.queryByText(/\d\s*\/\s*\d/)).not.toBeInTheDocument();
    expect(hero.querySelector('button')).toBeNull();
    expect(screen.getByTestId('option-one')).toBeInTheDocument();
    expect(container.firstElementChild).toHaveAttribute('data-journey-video', '/assets/landing-options/forest-entry-scroll-window-smooth-b6de05527e75.mp4');
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
