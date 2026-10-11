import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { atlasProjects } from '@/data/projectAtlas';
import { ProjectFilmDialog } from './ProjectFilmDialog';

describe('project film dialog',()=>{
  it('loads only the requested project film and restores focus on close',async()=>{
    const project=atlasProjects[0];
    render(<ProjectFilmDialog project={project}/>);
    expect(document.querySelector('video')).toBeNull();
    const opener=screen.getByRole('button',{name:`Watch ${project.title} films`});
    opener.focus();fireEvent.click(opener);
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(document.body.style.overflow).toBe('hidden');
    expect(document.querySelector('video')).toHaveAttribute('src',project.films[0].src);
    fireEvent.click(screen.getByRole('button',{name:`Play ${project.films[1].title}`}));
    expect(document.querySelector('video')).toHaveAttribute('src',project.films[1].src);
    fireEvent.keyDown(document,{key:'Escape'});
    await waitFor(()=>expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(document.body.style.overflow).toBe('');expect(opener).toHaveFocus();
  });
  it('does not invent a film for a photograph-only collection',()=>{
    render(<ProjectFilmDialog project={atlasProjects[1]}/>);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(document.querySelector('video')).toBeNull();
  });
});
