import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
import { PrismaProjectCinema } from './PrismaProjectCinema';
vi.mock('next/navigation',()=>({useRouter:()=>({push:vi.fn(),prefetch:vi.fn()})}));
beforeEach(()=>vi.stubGlobal('ResizeObserver',class{observe(){}unobserve(){}disconnect(){}}));
afterEach(()=>vi.unstubAllGlobals());
function ControlledCinema(){const [id,setId]=useState('forrest');return <PrismaProjectCinema activeId={id} onSelect={setId}/>;}
describe('visual project showcase',()=>{
  it('switches galleries and film availability without adding marketing labels',()=>{
    render(<ControlledCinema/>);
    expect(screen.getByRole('link',{name:'Explore Forrest'})).toHaveAttribute('href','/projects/forrest');
    expect(screen.getByRole('button',{name:'Watch Forrest films'})).toBeInTheDocument();
    expect(screen.queryByText(/selected works|photographs|watch film|explore project|07 collections/i)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'Select Kioo'}));
    expect(screen.getByRole('link',{name:'Explore Kioo'})).toHaveAttribute('href','/projects/kioo');
    expect(screen.queryByRole('button',{name:/Watch.*films/})).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'Next project'}));
    expect(screen.getByRole('button',{name:'Watch Kray Sangareddy films'})).toBeInTheDocument();
  });
});
