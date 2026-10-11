import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { atlasProjects } from '@/data/projectAtlas';
import ProjectGallery from './ProjectGallery';

const content = vi.hoisted(() => ({ values: {} as Record<string, string> }));
vi.mock('@/lib/useSiteContent', async importOriginal => {
  const original = await importOriginal<typeof import('@/lib/useSiteContent')>();
  return { ...original, useSiteContent: (id: string, fallback: string) => content.values[id] ?? fallback };
});

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  vi.stubGlobal('matchMedia', () => ({ matches: true, addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn() }));
});
afterEach(() => { content.values = {};vi.unstubAllGlobals();vi.restoreAllMocks(); });

const singleImageProject = { ...atlasProjects[1], gallery: [atlasProjects[1].image], films: [] };
const multiImageProject = { ...atlasProjects[1], gallery: [atlasProjects[1].image, atlasProjects[2].image, atlasProjects[0].image] };

describe('focused project gallery', () => {
  it('keeps a single available photograph singular and does not lead into another project', () => {
    render(<ProjectGallery project={singleImageProject} />);
    expect(screen.getAllByRole('img')).toHaveLength(1);
    expect(screen.queryByRole('button', { name: 'Next photograph' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: '← All places' })).toHaveAttribute('href', '/projects?place=kioo');
    expect(screen.getByRole('link', { name: 'Enquire' })).toHaveAttribute('href', '/enquiry?project=kioo');
    const otherProjectLinks = screen.getAllByRole('link').filter((link) => /^\/projects\//.test(link.getAttribute('href') ?? ''));
    expect(otherProjectLinks).toHaveLength(0);
  });
  it('changes only photographs within the project and restores focus after fullscreen', async () => {
    render(<ProjectGallery project={multiImageProject} />);
    const opener = screen.getByRole('button', { name: 'View photograph 2' });
    opener.focus();fireEvent.click(opener);
    const dialog = await screen.findByRole('dialog');
    expect(document.body.style.overflow).toBe('hidden');
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(within(dialog).getByText('Photograph 3 of 3')).toBeInTheDocument();
    expect(within(dialog).getByRole('img')).toHaveAttribute('alt', multiImageProject.gallery[2].alt);
    fireEvent.keyDown(window, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(opener).toHaveFocus();expect(document.body.style.overflow).toBe('');
    expect(screen.getAllByRole('button', { name: /^View photograph/ })).toHaveLength(3);
  });
  it('loads the selected project film only when films are requested', () => {
    const { container } = render(<ProjectGallery project={atlasProjects[0]} />);
    expect(container.querySelector('video')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Films' }));
    const video = container.querySelector('video')!;
    expect(video).toHaveAttribute('src', atlasProjects[0].films[0].src);
    expect(video).toHaveAttribute('preload', 'metadata');
    expect(video).toHaveAttribute('controls');
    expect(video).toHaveAttribute('autoplay');
    expect(video.muted).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Watch Forrest — FPV' }));
    expect(container.querySelector('video')).toHaveAttribute('src', atlasProjects[0].films[1].src);
  });
  it('opens a landscape film first when a project also has portrait reels', () => {
    const project = atlasProjects.find(item => item.id === 'kray-sangareddy')!;
    const { container } = render(<ProjectGallery project={project} />);
    fireEvent.click(screen.getByRole('button', { name: 'Films' }));
    expect(container.querySelector('video')).toHaveAttribute('src', project.films.find(item => item.width > item.height)!.src);
    expect(container.querySelector('video')).toHaveAttribute('autoplay');
  });
  it('keeps portrait-only reels manual and uncropped', () => {
    const project = atlasProjects.find(item => item.id === 'octapod-layana')!;
    const { container } = render(<ProjectGallery project={project} />);
    fireEvent.click(screen.getByRole('button', { name: 'Films' }));
    expect(container.querySelector('video')).not.toHaveAttribute('autoplay');
    expect(container.querySelector('video')).toHaveAttribute('preload', 'none');
  });
  it('switches the retrieved media selector with keys without changing photographs', () => {
    render(<ProjectGallery project={atlasProjects[0]} />);
    const photos = screen.getByRole('button', { name: 'Photographs' });
    photos.focus();fireEvent.keyDown(photos, { key: 'ArrowRight' });
    expect(screen.getByRole('button', { name: 'Films' })).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Films' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.keyDown(screen.getByRole('button', { name: 'Films' }), { key: 'ArrowLeft' });
    expect(screen.getByRole('button', { name: 'Photographs' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getAllByRole('button', { name: /^View photograph/ })).toHaveLength(12);
  });
  it('does not repeat a cover photo supplied twice in the gallery data', () => {
    render(<ProjectGallery project={{ ...atlasProjects[1], gallery: [atlasProjects[1].image, atlasProjects[1].image] }} />);
    expect(screen.getAllByRole('img')).toHaveLength(1);
    expect(screen.queryByRole('button', { name: 'Next photograph' })).not.toBeInTheDocument();
  });

  it('uses editable detail navigation and photo-film tab labels', () => {
    content.values = {
      'projects.detail.return': 'Explore all work',
      'projects.detail.return-href': '/journal',
      'projects.detail.photos-tab': 'Project images',
      'projects.detail.films-tab': 'Watch films',
    };
    render(<ProjectGallery project={atlasProjects[0]} />);
    expect(screen.getByRole('link', { name: '← Explore all work' })).toHaveAttribute('href', '/journal');
    expect(screen.getByRole('button', { name: 'Project images' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Watch films' }));
    expect(screen.getByRole('region', { name: 'Forrest Watch films' })).toBeInTheDocument();
  });
});
