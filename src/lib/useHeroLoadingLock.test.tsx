import { fireEvent, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useHeroLoadingLock } from './useHeroLoadingLock';

describe('hero download scroll gate',()=>{
  it('blocks wheel, touch and keyboard until ready and cleans up on unmount',()=>{
    const hook=renderHook(({locked})=>useHeroLoadingLock(locked),{initialProps:{locked:true}});
    expect(document.documentElement.dataset.heroLoading).toBe('true');
    for(const event of [new WheelEvent('wheel',{cancelable:true}),new Event('touchmove',{cancelable:true}),new KeyboardEvent('keydown',{key:'PageDown',cancelable:true})]){
      fireEvent(window,event);expect(event.defaultPrevented).toBe(true);
    }
    hook.rerender({locked:false});
    expect(document.documentElement.dataset.heroLoading).toBeUndefined();
    const wheel=new WheelEvent('wheel',{cancelable:true});fireEvent(window,wheel);
    expect(wheel.defaultPrevented).toBe(false);
    hook.rerender({locked:true});hook.unmount();
    expect(document.documentElement.dataset.heroLoading).toBeUndefined();
  });
  it('returns programmatic scroll to the opening while loading',()=>{
    const scroll=vi.spyOn(window,'scrollTo').mockImplementation(()=>{});
    const y=vi.spyOn(window,'scrollY','get').mockReturnValue(300);
    const hook=renderHook(()=>useHeroLoadingLock(true));
    fireEvent.scroll(window);
    expect(scroll).toHaveBeenCalledWith(0,0);
    hook.unmount();y.mockRestore();scroll.mockRestore();
  });
});
