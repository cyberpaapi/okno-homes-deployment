import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import JournalExperience from './JournalExperience';
import JournalMarquee from './JournalMarquee';
import { pressEntries } from './journalData';

vi.mock('./JournalHero', () => ({ default: () => <section><h1>News from the practice.</h1></section> }));

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} });
});

describe('Journal press and blog experience', () => {
  it('offers a persistent pause and touch dragging without hiding duplicate loop cards', () => {
    render(<JournalExperience />);
    const pause = screen.getByRole('button', { name: 'Pause in the press motion' });
    fireEvent.click(pause);
    expect(screen.getByRole('button', { name: 'Resume in the press motion' })).toBeInTheDocument();
    const reel = screen.getByRole('region', { name: 'In the press' });
    const viewport = reel.querySelector<HTMLElement>('[data-dragging]')!;
    const track = reel.querySelector<HTMLElement>('[data-marquee-track]')!;
    Object.assign(viewport, { setPointerCapture: vi.fn(), hasPointerCapture: () => true, releasePointerCapture: vi.fn() });
    fireEvent.pointerDown(viewport, { pointerType: 'touch', pointerId: 2, clientX: 300 });
    fireEvent.pointerMove(viewport, { pointerType: 'touch', pointerId: 2, clientX: 180 });
    expect(track.style.transform).toContain('-120.000px');
    fireEvent.pointerCancel(viewport, { pointerType: 'touch', pointerId: 2 });
    expect(viewport).toHaveAttribute('data-dragging', 'false');
    expect(reel.querySelector('[data-duplicate]')).toBeInTheDocument();
  });
  it('leads with verified press, preserves two straight reels, and follows with a conventional blog grid', () => {
    render(<JournalExperience />);
    expect(screen.getByRole('heading', { name: 'News from the practice.' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Published stories and project records.' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'In the press' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'From the archive' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Latest from the Journal' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Choosing a modular home for a compact site' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Designing modular rooms for hospitality' })).toBeInTheDocument();
    expect(screen.getAllByText('Architectural Digest India').length).toBeGreaterThan(0);
    expect(screen.getAllByText('New Atlas').length).toBeGreaterThan(0);
    expect(screen.getAllByText('New Atlas')[0].tagName).toBe('STRONG');
    const press = screen.getByRole('region', { name: 'In the press' });
    const expectedMarks = ['Architectural Digest India', 'New Atlas', 'Homecrux', 'World Architecture Community', 'ArchDaily'];
    expectedMarks.forEach((source) => {
      const mark = press.querySelector(`[data-journal-source-mark="${source}"]`);
      expect(mark?.querySelector('img')).toHaveAttribute('src', expect.stringContaining('/assets/journal/source-logos/'));
    });
    const publicationMarquee = screen.getByLabelText('Publications covering OKNO');
    expectedMarks.forEach((source) => {
      const marks = publicationMarquee.querySelectorAll(`[data-journal-source-mark="${source}"]`);
      expect(marks).toHaveLength(2);
      marks.forEach((mark) => expect(mark.querySelector('svg image')?.getAttribute('href')).toContain('/assets/journal/source-logos/'));
    });
    expect(publicationMarquee.querySelectorAll('[aria-hidden="true"][inert]')).toHaveLength(1);
    expect(screen.getByRole('region', { name: 'From the archive' }).querySelector('[data-journal-source-mark]')).toBeNull();
  });

  it('supports explicit mouse grab-drag on each reel without turning the cards into drag links', () => {
    render(<JournalExperience />);
    const reel = screen.getByRole('region', { name: 'In the press' });
    const viewport = reel.querySelector<HTMLElement>('[data-dragging]')!;
    const track = reel.querySelector<HTMLElement>('[data-marquee-track]')!;
    Object.assign(viewport, { setPointerCapture: vi.fn(), hasPointerCapture: () => true, releasePointerCapture: vi.fn() });
    fireEvent.pointerDown(viewport, { pointerType: 'mouse', pointerId: 1, clientX: 320 });
    expect(viewport).toHaveAttribute('data-dragging', 'true');
    fireEvent.pointerMove(viewport, { pointerType: 'mouse', pointerId: 1, clientX: 220 });
    expect(track.style.transform).toContain('translate3d(-100.000px');
    fireEvent.pointerUp(viewport, { pointerType: 'mouse', pointerId: 1, clientX: 220 });
    expect(viewport).toHaveAttribute('data-dragging', 'false');
  });

  it('keeps photography inert and exposes only explicit, named arrow links', () => {
    render(<JournalExperience />);
    expect(screen.getByRole('button', { name: 'Pause in the press motion' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pause from the archive motion' })).toBeInTheDocument();
    const pressAction = screen.getByRole('link', { name: /Read AD Small Spaces.*Architectural Digest India/ });
    expect(pressAction).toHaveAttribute('data-journal-cursor-action');
    expect(pressAction).toHaveAttribute('target', '_blank');
    const projectAction = screen.getAllByRole('link', { name: /View Kioo — the 300 sq ft mirror-house model/ })[0];
    expect(projectAction).toHaveAttribute('href', '/projects/kioo');
    expect(screen.getAllByRole('img', { name: /Kioo mirrored cabin/ }).length).toBeGreaterThan(0);
  });

  it('links every Journal guide to its internal reading page', () => {
    render(<JournalExperience />);
    const expected = ['compact-site', 'sloped-land', 'small-retreat', 'material-comfort', 'factory-to-site', 'hospitality-rooms'];
    const articleLinks = screen.getAllByRole('link', { name: /^Read article (Choosing|What|Planning|Materials|From|Designing)/ });
    expect(articleLinks).toHaveLength(expected.length);
    expect(articleLinks.map((link) => link.getAttribute('href'))).toEqual(expected.map((slug) => `/journal/${slug}`));
  });

  it('renders photo-free, icon-free and source-free press as an intentional text card', () => {
    render(<JournalMarquee caption="In the press" direction="left" entries={[{
      id: 'text-only', kind: 'Press', source: '', date: '', title: 'A published update',
      summary: '', image: '', imageAlt: '', credit: '', href: 'https://example.com/news', external: true, logo: '',
    }]} />);
    const card = screen.getByRole('article');
    expect(card).toHaveAttribute('data-photo', 'false');
    expect(card).toHaveTextContent('A published update');
    expect(card).not.toHaveTextContent('Add a photograph before publishing');
    expect(screen.getByRole('link', { name: 'Read A published update' })).toHaveAttribute('href', 'https://example.com/news');
  });

  it('lets the page-level arrow wording change without altering the destination', () => {
    render(<JournalMarquee caption="In the press" direction="left" actionVerb="Explore" entries={[pressEntries[0]]} />);
    expect(screen.getByRole('link', { name: `Explore ${pressEntries[0].title} at ${pressEntries[0].source}` })).toHaveAttribute('href', pressEntries[0].href);
  });

  it('renders an arrow at every visible loop position while keeping duplicate actions out of the tab order', () => {
    render(<JournalExperience />);
    const reel = screen.getByRole('region', { name: 'In the press' });
    const cards = reel.querySelectorAll('article');
    const arrows = reel.querySelectorAll('[data-journal-cursor-action]');
    const duplicateArrows = reel.querySelectorAll('article[data-duplicate="true"] [data-journal-cursor-action]');
    expect(arrows).toHaveLength(cards.length);
    expect(duplicateArrows.length).toBeGreaterThan(0);
    duplicateArrows.forEach((arrow) => expect(arrow).toHaveAttribute('tabindex', '-1'));
  });

  it('does not render the old unsupported placeholder stories or article modal', () => {
    render(<JournalExperience />);
    expect(screen.queryByText(/Coorg hillside/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Prefab vs RCC/)).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByText('Modular homes made in India.')).not.toBeInTheDocument();
    expect(screen.queryByText('05')).not.toBeInTheDocument();
  });
});
