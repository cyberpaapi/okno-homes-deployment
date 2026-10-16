import { act, renderHook } from '@testing-library/react';
import { motionValue } from 'motion/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useHeroFilmExit } from './useHeroFilmExit';

const driver=vi.hoisted(()=>({active:undefined as undefined|{targetScroll:number;scrollTo:ReturnType<typeof vi.fn>;on:ReturnType<typeof vi.fn>;off:ReturnType<typeof vi.fn>}}));
vi.mock('lenis/react', () => ({ useLenis: () => driver.active }));
let y = 0;
beforeEach(() => {
  vi.useFakeTimers(); y = 0; driver.active=undefined;
  vi.spyOn(window, 'scrollY', 'get').mockImplementation(() => y);
  vi.stubGlobal('innerHeight', 1000);
  vi.spyOn(window, 'scrollTo').mockImplementation((...args) => { y = Number(args[1]); });
});
afterEach(() => { document.body.style.overflow = ''; vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
function setup() {
  const hero = document.createElement('section');
  Object.defineProperty(hero, 'offsetHeight', { value: 2000 });
  hero.getBoundingClientRect = () => ({ top: -y } as DOMRect);
  const shown = motionValue(0), fallback = vi.fn();
  const hook = renderHook(() => useHeroFilmExit({ current: hero }, shown, true, fallback));
  return { ...hook, hero, shown, fallback };
}
describe('Hero movie handoff', () => {
  it('makes Home interrupt wheel inertia while leaving editable controls alone',()=>{
    const scrollTo=vi.fn((next:number)=>{y=next;});
    driver.active={targetScroll:600,scrollTo,on:vi.fn(),off:vi.fn()};
    y=400;const view=setup();
    act(()=>window.dispatchEvent(new KeyboardEvent('keydown',{key:'Home'})));
    expect(scrollTo).toHaveBeenCalledWith(0,{immediate:true,force:true});expect(y).toBe(0);
    const input=document.createElement('input');document.body.append(input);scrollTo.mockClear();
    act(()=>input.dispatchEvent(new KeyboardEvent('keydown',{key:'Home',bubbles:true})));
    expect(scrollTo).not.toHaveBeenCalled();input.remove();view.unmount();
  });
  it('holds before lower content, preserves overshoot and releases after the actual end frame', async () => {
    const view = setup();
    act(() => { y = 1200; window.dispatchEvent(new Event('scroll')); });
    expect(y).toBe(950); expect(view.hero.dataset.filmExitPending).toBe('true');
    const wheel = new WheelEvent('wheel', { deltaY: 300, cancelable: true });
    act(() => { window.dispatchEvent(wheel); });
    expect(wheel.defaultPrevented).toBe(true);
    await act(async () => { view.shown.set(1); await vi.advanceTimersByTimeAsync(200); });
    expect(y).toBe(1500); expect(view.hero.dataset.filmExitPending).toBeUndefined();
    expect(view.fallback).not.toHaveBeenCalled(); view.unmount();
  });
  it('defers a pending ending handoff until an open menu closes', async () => {
    const view=setup();
    act(()=>{y=1300;window.dispatchEvent(new Event('scroll'));});
    await act(async()=>{document.body.style.overflow='hidden';await vi.advanceTimersByTimeAsync(2250);});
    expect(y).toBe(950);
    const wheel=new WheelEvent('wheel',{deltaY:500,cancelable:true});
    act(()=>window.dispatchEvent(wheel)); expect(wheel.defaultPrevented).toBe(false);
    await act(async()=>{document.body.style.overflow='';});
    await act(async()=>{await vi.advanceTimersByTimeAsync(200);});
    expect(y).toBe(1300);view.unmount();
  });
  it('allows immediate reverse input and does not rewind a lower-section reload', async () => {
    const view = setup();
    act(() => { y = 1200; window.dispatchEvent(new Event('scroll')); });
    const wheel = new WheelEvent('wheel', { deltaY: -100, cancelable: true });
    act(() => { window.dispatchEvent(wheel); });
    expect(wheel.defaultPrevented).toBe(false);
    await act(async () => { await vi.advanceTimersByTimeAsync(2500); });
    expect(view.fallback).not.toHaveBeenCalled(); view.unmount();
    y = 2100; const restored = setup();
    act(() => { y = 2200; window.dispatchEvent(new Event('scroll')); });
    expect(y).toBe(2200); restored.unmount();
  });
  it('recovers to the matching ending still if decoding fails, without trapping the visitor', async () => {
    const view = setup();
    act(() => { y = 1300; window.dispatchEvent(new Event('scroll')); });
    await act(async () => { await vi.advanceTimersByTimeAsync(2250); });
    expect(view.fallback).toHaveBeenCalledOnce(); expect(y).toBe(1300);
    view.unmount();
  });
});
