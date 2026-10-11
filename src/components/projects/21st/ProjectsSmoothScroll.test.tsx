import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProjectsSmoothScroll } from './ProjectsSmoothScroll';
const state=vi.hoisted(()=>({path:'/projects',create:vi.fn(),stop:vi.fn(),destroy:vi.fn(),start:vi.fn()}));
vi.mock('next/navigation',()=>({usePathname:()=>state.path}));
vi.mock('lenis',()=>({default:class{constructor(){state.create();}stop=state.stop;destroy=state.destroy;start=state.start;}}));
beforeEach(()=>{state.path='/projects';vi.clearAllMocks();vi.stubGlobal('matchMedia',()=>({matches:false,addEventListener:vi.fn(),removeEventListener:vi.fn()}));});
afterEach(()=>vi.unstubAllGlobals());
describe('Projects-only smooth scrolling',()=>{
  it('reinitializes within Projects and tears down when leaving the project routes',()=>{
    const {rerender}=render(<ProjectsSmoothScroll/>);
    expect(state.create).toHaveBeenCalledOnce();
    state.path='/projects/kioo';rerender(<ProjectsSmoothScroll/>);
    expect(state.stop).toHaveBeenCalledOnce();expect(state.destroy).toHaveBeenCalledOnce();
    expect(state.create).toHaveBeenCalledTimes(2);
    state.path='/about';rerender(<ProjectsSmoothScroll/>);
    expect(state.stop).toHaveBeenCalledTimes(2);expect(state.destroy).toHaveBeenCalledTimes(2);
    expect(state.create).toHaveBeenCalledTimes(2);
  });
  it('leaves native scrolling for reduced motion',()=>{
    vi.stubGlobal('matchMedia',()=>({matches:true,addEventListener:vi.fn(),removeEventListener:vi.fn()}));
    render(<ProjectsSmoothScroll/>);expect(state.create).not.toHaveBeenCalled();
  });
});
