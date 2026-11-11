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
const download = vi.hoisted(() => ({ resolve: null as ((data: Uint8Array) => void) | null, reject: null as ((error: Error) => void) | null, progress: null as ((value: number) => void) | null }));
vi.mock('@/lib/downloadHeroMedia', () => ({ downloadHeroMedia: (_src: string, _signal: AbortSignal, progress: (value: number) => void) => new Promise<Uint8Array>((resolve, reject) => { download.resolve = resolve; download.reject = reject; download.progress = progress; }) }));
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
    vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: vi.fn(() => 'blob:intro'), revokeObjectURL: vi.fn() }));
    vi.spyOn(HTMLMediaElement.prototype,'load').mockImplementation(()=>{});
    vi.spyOn(HTMLMediaElement.prototype,'pause').mockImplementation(()=>{});
    vi.spyOn(HTMLMediaElement.prototype,'play').mockResolvedValue(undefined);
  });
  afterEach(() => {
    motionState.progress = 0;
    motionState.onChange = null;
    motionState.onReady = null; motionState.onLoadProgress = null;
    motionState.shown=0;motionState.onShown=null;motionState.onProgress=null;
    download.resolve = null; download.reject = null; download.progress = null;
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });
  const introLoaded = async (intro: HTMLVideoElement) => {
    await act(async () => { download.resolve?.(new Uint8Array([1, 2, 3])); });
    Object.defineProperty(intro, 'readyState', { configurable: true, value: 4 });
    fireEvent.loadedData(intro);
  };
  const viewport = (container: HTMLElement) => container.querySelector('[style*="--brand-opacity"]') as HTMLElement;

  it('opens on the loading bar over the intro first frame and waits for both films', async () => {
    const play = vi.mocked(HTMLMediaElement.prototype.play);
    const { container } = render(<ForestEntryOption/>);
    const intro = container.querySelector('video')!;
    expect(intro).not.toHaveAttribute('autoplay');
    expect(intro).toHaveAttribute('poster', '/assets/landing-options/forest-entry-intro-first-frame.jpg');
    expect(container.querySelector('img[src="/assets/landing-options/forest-entry-intro-first-frame.jpg"]')).toBeInTheDocument();
    const bar = screen.getByRole('progressbar', { name: 'Loading experience' });
    expect(bar).toHaveAttribute('value', '0');
    expect(viewport(container).style.getPropertyValue('--brand-opacity')).toBe('1.0000');
    expect(document.documentElement.dataset.heroLoading).toBe('true');
    act(() => { motionState.onLoadProgress?.(.5); download.progress?.(.5); });
    expect((bar as HTMLProgressElement).value).toBeLessThanOrEqual(.5);
    act(() => motionState.onReady?.(true));
    expect(play).not.toHaveBeenCalled();
    expect(screen.getByRole('status')).toHaveTextContent('Loading experience');
    await introLoaded(intro);
    expect(intro.getAttribute('src')).toBe('blob:intro');
    expect(play).toHaveBeenCalled();
    expect(intro.playbackRate).toBe(1.75);
    expect(viewport(container).style.getPropertyValue('--brand-opacity')).toBe('0.0000');
    expect(document.documentElement.dataset.heroLoading).toBe('true');
  });

  it('hands the finished intro straight to the scroll film and unlocks the page', async () => {
    const { container } = render(<ForestEntryOption/>);
    const intro = container.querySelector('video')!;
    act(() => motionState.onReady?.(true));
    await introLoaded(intro);
    fireEvent.ended(intro);
    expect(intro.className).toContain('introComplete');
    expect(document.documentElement.dataset.heroLoading).not.toBe('true');
    expect(viewport(container).style.getPropertyValue('--still-opacity')).toBe('1.0000');
    expect(viewport(container).style.getPropertyValue('--journey-opacity')).toBe('1.0000');
    act(() => { motionState.progress = .03; motionState.onChange?.(.03); });
    expect(viewport(container).style.getPropertyValue('--still-opacity')).toBe('0.0000');
  });

  it('skips an intro that cannot load instead of blocking the page', async () => {
    const { container } = render(<ForestEntryOption/>);
    await act(async () => { download.reject?.(new Error('offline')); });
    act(() => motionState.onReady?.(true));
    expect(container.querySelector('video')!.className).toContain('introComplete');
    expect(document.documentElement.dataset.heroLoading).not.toBe('true');
  });

  it('reports a failed scroll film and retries both downloads', () => {
    render(<ForestEntryOption/>);
    act(()=>{motionState.onReady?.(false);motionState.onLoadProgress?.(null);});
    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(screen.getByRole('status')).toHaveTextContent('Experience could not load');
    fireEvent.click(screen.getByRole('button',{name:'Retry loading'}));
    expect(screen.getByRole('progressbar')).toHaveAttribute('value','0');
  });

  it('shows the matching end still only once the last frame is presented', async () => {
    const {container}=render(<ForestEntryOption/>);
    act(()=>motionState.onReady?.(true));
    await introLoaded(container.querySelector('video')!);
    fireEvent.ended(container.querySelector('video')!);
    act(()=>{motionState.progress=1;motionState.onChange?.(1);});
    expect(viewport(container).style.getPropertyValue('--end-opacity')).toBe('0.0000');
    act(()=>motionState.onProgress?.(1));
    expect(viewport(container).style.getPropertyValue('--end-opacity')).toBe('1.0000');
  });

  it('keeps the current landing after the forest-entry sequence', () => {
    const { container } = render(<ForestEntryOption />);
    const hero = screen.getByRole('region', { name: 'A journey from the forest into an OKNO home' });
    expect(screen.getByRole('heading', { level: 1, name: 'OKNO Modhomes' })).toBeInTheDocument();
    expect(screen.queryByText(/\d\s*\/\s*\d/)).not.toBeInTheDocument();
    expect(hero.querySelector('button')).toBeNull();
    expect(screen.getByTestId('option-one')).toBeInTheDocument();
    expect(container.firstElementChild).toHaveAttribute('data-journey-video', '/assets/landing-options/forest-entry-scroll-window-smooth-b6de05527e75.mp4');
    expect(container.querySelectorAll('video')).toHaveLength(2);
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
