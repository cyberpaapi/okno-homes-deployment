import { act, render } from '@testing-library/react';
import { useRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HERO_POSITION_KEY } from '@/lib/heroReloadPosition';
import { useHeroReloadPosition } from './useHeroReloadPosition';

const mockLenis = vi.hoisted(() => ({ value: null as { resize(): void; scrollTo(y: number): void } | null }));
vi.mock('lenis/react', () => ({ useLenis: () => mockLenis.value }));
function Harness() {
  const ref = useRef<HTMLElement>(null); useHeroReloadPosition(ref);
  return <div><section ref={ref} /><section id="sustainability-preview" /></div>;
}
describe('reload after measured layout changes', () => {
  afterEach(() => { mockLenis.value = null; vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers(); sessionStorage.clear(); delete document.documentElement.dataset.v1Restoration; });
  it('retains the original lower-section offset after hydration and yields immediately to user input', async () => {
    vi.useFakeTimers(); let top = 12870; let y = 0; let resized: (() => void) | undefined;
    vi.stubGlobal('scrollY', 0);
    const scroll = vi.spyOn(window, 'scrollTo').mockImplementation(((_x: number, next: number) => { y=next; vi.stubGlobal('scrollY',y); }) as typeof window.scrollTo);
    vi.spyOn(HTMLElement.prototype,'getBoundingClientRect').mockImplementation(function (this: HTMLElement) { return { top: this.id==='sustainability-preview' ? top-y : 0, bottom:7200-y } as DOMRect; });
    vi.stubGlobal('ResizeObserver', class { constructor(callback: () => void) { resized=callback; } observe() {} disconnect() {} });
    document.documentElement.dataset.v1Restoration = 'auto';
    sessionStorage.setItem(HERO_POSITION_KEY,JSON.stringify({version:1,path:location.pathname+location.search,savedAt:Date.now(),zone:'content',y:13248,section:'sustainability-preview',offset:378}));
    const view = render(<Harness />);
    expect(scroll).toHaveBeenLastCalledWith(0,13248);
    act(() => { top+=600; resized?.(); });
    expect(scroll).toHaveBeenLastCalledWith(0,13848);
    await act(() => vi.advanceTimersByTimeAsync(50));
    expect(scroll).toHaveBeenLastCalledWith(0,13848);
    act(() => { window.dispatchEvent(new WheelEvent('wheel')); });
    const count = scroll.mock.calls.length;
    act(() => { top+=200; resized?.(); });
    expect(scroll).toHaveBeenCalledTimes(count);
    expect(JSON.parse(sessionStorage.getItem(HERO_POSITION_KEY)!).offset).toBe(378);
    view.unmount(); expect(history.scrollRestoration).toBe('auto');
  });
  it.each([3200, 14000])('handles the first reload without a saved snapshot at y=%s', async (initialY) => {
    vi.useFakeTimers(); let y=initialY; vi.stubGlobal('scrollY',y);
    vi.spyOn(performance,'getEntriesByType').mockReturnValue([{type:'reload'}] as PerformanceEntry[]);
    vi.spyOn(document,'readyState','get').mockReturnValue('complete');
    vi.spyOn(HTMLElement.prototype,'getBoundingClientRect').mockImplementation(function (this: HTMLElement) { return {top:this.id==='sustainability-preview'?12870-y:0,bottom:7200-y} as DOMRect; });
    const scroll = vi.spyOn(window,'scrollTo').mockImplementation(((_x: number,next: number)=>{y=next;vi.stubGlobal('scrollY',y);}) as typeof window.scrollTo);
    const view=render(<Harness />);
    await act(()=>vi.advanceTimersByTimeAsync(50));
    expect(scroll).toHaveBeenLastCalledWith(0,initialY<7200?0:initialY);
    view.unmount();
  });

  it('refreshes Lenis dimensions before a lower-section restore can be clamped to the old limit', () => {
    let limit=12625; let y=0; vi.stubGlobal('scrollY',0);
    const resize=vi.fn(()=>{limit=20000;});
    const scrollTo=vi.fn((next: number)=>{y=Math.min(next,limit);vi.stubGlobal('scrollY',y);});
    mockLenis.value={resize,scrollTo};
    vi.spyOn(HTMLElement.prototype,'getBoundingClientRect').mockImplementation(function (this: HTMLElement) { return {top:this.id==='sustainability-preview'?12870-y:0,bottom:7200-y} as DOMRect; });
    document.documentElement.dataset.v1Restoration='auto';
    sessionStorage.setItem(HERO_POSITION_KEY,JSON.stringify({version:1,path:location.pathname+location.search,savedAt:Date.now(),zone:'content',y:13248,section:'sustainability-preview',offset:378}));
    const view=render(<Harness />);
    expect(resize).toHaveBeenCalled(); expect(scrollTo).toHaveBeenLastCalledWith(13248,{immediate:true,force:true}); expect(y).toBe(13248);
    view.unmount();
  });

});
