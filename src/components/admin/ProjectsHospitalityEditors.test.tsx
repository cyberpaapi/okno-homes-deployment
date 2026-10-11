import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import ProjectsCollectionEditor from './ProjectsCollectionEditor';
import HospitalitySelectionEditor from './HospitalitySelectionEditor';
import type { ContentItem } from '@/lib/contentCollections';

const projects: ContentItem[] = [
  { id: 'forrest', fields: { title: 'Forrest', coverSrc: '/assets/projects/real-v1/forrest-01.webp', coverAlt: 'Garden pavilion', gallery: JSON.stringify([{ id: 'forrest-photo-1', src: '/assets/projects/real-v1/forrest-01.webp', alt: 'Garden pavilion' }, { id: 'forrest-photo-2', src: '/assets/projects/real-v1/forrest-02.webp', alt: 'Second view' }]), films: '[]', previewSrc: '' } },
  { id: 'kioo', fields: { title: 'Kioo', coverSrc: '/assets/projects/real-v1/kioo-01.webp', coverAlt: 'Forest retreat', gallery: '[]', films: '[]', previewSrc: '' } },
];

function ProjectsHarness() {
  const [items, setItems] = useState<ContentItem[]>([projects[0]]);
  return <><ProjectsCollectionEditor items={items} onChange={setItems} disabled={false} onUpload={vi.fn(async () => '/api/site-media/test.webp')} />
    <output data-testid="projects-json">{JSON.stringify(items)}</output></>;
}
function HospitalityHarness() {
  const [items, setItems] = useState<ContentItem[]>([]);
  return <><HospitalitySelectionEditor items={items} projects={projects} onChange={setItems} disabled={false} onUpload={vi.fn(async () => '/api/site-media/test.webp')} />
    <output data-testid="hospitality-json">{JSON.stringify(items)}</output></>;
}

describe('Projects and Hospitality collection controls', () => {
  it('adds and removes a photograph inside a project without editing JSON', () => {
    render(<ProjectsHarness />);
    fireEvent.click(screen.getByRole('button', { name: 'Add photograph' }));
    const photo = screen.getAllByRole('textbox', { name: /^Image Required to publish$/ }).at(-1)!;
    fireEvent.change(photo, { target: { value: '/assets/projects/new-photo.webp' } });
    fireEvent.change(screen.getAllByRole('textbox', { name: /^Image description Required to publish$/ }).at(-1)!, { target: { value: 'New view' } });
    expect(screen.getByTestId('projects-json')).toHaveTextContent('new-photo.webp');
    fireEvent.click(screen.getAllByRole('button', { name: 'Remove image' }).at(-1)!);
    expect(screen.getByTestId('projects-json')).not.toHaveTextContent('new-photo.webp');
  });

  it('archives and restores a project within the draft', () => {
    render(<ProjectsHarness />);
    fireEvent.click(screen.getByRole('button', { name: 'Archive project' }));
    expect(screen.getByTestId('projects-json')).toHaveTextContent('"status":"archived"');
    expect(screen.getByRole('heading', { name: /Archived projects/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(screen.getByTestId('projects-json')).toHaveTextContent('Forrest');
    fireEvent.click(screen.getByRole('button', { name: 'Archive project' }));
    fireEvent.click(screen.getByRole('button', { name: 'Restore project' }));
    expect(screen.getByTestId('projects-json')).not.toHaveTextContent('"status":"archived"');
  });

  it('adds and removes an optional film, and can add a second project', () => {
    render(<ProjectsHarness />);
    fireEvent.click(screen.getByRole('button', { name: 'Add film' }));
    fireEvent.change(screen.getByRole('textbox', { name: /^Film title Required to publish$/ }), { target: { value: 'Arrival film' } });
    expect(screen.getByTestId('projects-json')).toHaveTextContent('Arrival film');
    fireEvent.click(screen.getByRole('button', { name: 'Remove film' }));
    expect(screen.getByTestId('projects-json')).not.toHaveTextContent('Arrival film');
    fireEvent.click(screen.getByRole('button', { name: 'Add project' }));
    expect(JSON.parse(screen.getByTestId('projects-json').textContent || '[]')).toHaveLength(2);
  });

  it('edits public slug, visibility, type, location and preview poster without changing internal ID', () => {
    render(<ProjectsHarness />);
    const slug = screen.getByRole('textbox', { name: 'Page address' });
    fireEvent.change(slug, { target: { value: 'forrest-estate' } });
    fireEvent.blur(slug);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Show in Projects' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Project type / category' }), { target: { value: 'Estate landscape' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Project detail location' }), { target: { value: 'Hyderabad' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Showcase preview poster' }), { target: { value: '/assets/projects/poster.webp' } });
    const [item] = JSON.parse(screen.getByTestId('projects-json').textContent || '[]') as ContentItem[];
    expect(item.id).toBe('forrest');
    expect(item.fields).toMatchObject({ slug: 'forrest-estate', showInProjects: 'false', category: 'Estate landscape', location: 'Hyderabad', previewPoster: '/assets/projects/poster.webp' });
    expect(JSON.parse(item.fields.slugHistory)).toContain('forrest');
  });

  it('finds a project by name and adds it to Hospitality selected work', () => {
    render(<HospitalityHarness />);
    fireEvent.click(screen.getByRole('button', { name: 'Select project' }));
    fireEvent.change(screen.getByRole('combobox', { name: 'Search projects' }), { target: { value: 'Kioo' } });
    fireEvent.click(within(screen.getByRole('listbox', { name: 'Projects' })).getByRole('option', { name: /Kioo/ }));
    expect(screen.getByTestId('hospitality-json')).toHaveTextContent('"projectId":"kioo"');
    fireEvent.click(screen.getByRole('button', { name: 'Remove selection' }));
    expect(screen.getByTestId('hospitality-json')).toHaveTextContent('[]');
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(screen.getByTestId('hospitality-json')).toHaveTextContent('"projectId":"kioo"');
  });

  it('reorders selected projects without changing their shared project records', () => {
    render(<HospitalityHarness />);
    fireEvent.click(screen.getByRole('button', { name: 'Select project' }));
    fireEvent.click(within(screen.getByRole('listbox', { name: 'Projects' })).getByRole('option', { name: /Forrest/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Select project' }));
    fireEvent.click(within(screen.getByRole('listbox', { name: 'Projects' })).getByRole('option', { name: /Kioo/ }));
    fireEvent.click(screen.getAllByRole('button', { name: 'Move up' })[1]);
    const selected = JSON.parse(screen.getByTestId('hospitality-json').textContent || '[]') as ContentItem[];
    expect(selected.map(item => item.fields.projectId)).toEqual(['kioo', 'forrest']);
    expect(projects.map(item => item.id)).toEqual(['forrest', 'kioo']);
  });

  it('chooses a linked gallery photograph and can return to the cover or custom override', () => {
    render(<HospitalityHarness />);
    fireEvent.click(screen.getByRole('button', { name: 'Select project' }));
    fireEvent.click(within(screen.getByRole('listbox', { name: 'Projects' })).getByRole('option', { name: /Forrest/ }));
    const source = screen.getByRole('combobox', { name: 'Photo from linked project' });
    fireEvent.change(source, { target: { value: 'forrest-photo-2' } });
    let [item] = JSON.parse(screen.getByTestId('hospitality-json').textContent || '[]') as ContentItem[];
    expect(item.fields.galleryPhotoId).toBe('forrest-photo-2');
    expect(item.fields.imageSrcOverride).toBe('');
    expect(screen.getByRole('img', { name: 'Hospitality card preview' })).toHaveAttribute('src', expect.stringContaining('forrest-02.webp'));
    fireEvent.change(source, { target: { value: '__cover__' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Custom photograph override' }), { target: { value: '/assets/projects/custom.webp' } });
    fireEvent.change(screen.getByRole('textbox', { name: /Photograph description/ }), { target: { value: 'Custom view' } });
    [item] = JSON.parse(screen.getByTestId('hospitality-json').textContent || '[]') as ContentItem[];
    expect(item.fields).toMatchObject({ galleryPhotoId: '', imageSrcOverride: '/assets/projects/custom.webp', imageAltOverride: 'Custom view' });
    fireEvent.change(source, { target: { value: 'forrest-photo-2' } });
    [item] = JSON.parse(screen.getByTestId('hospitality-json').textContent || '[]') as ContentItem[];
    expect(item.fields).toMatchObject({ galleryPhotoId: 'forrest-photo-2', imageSrcOverride: '', imageAltOverride: '' });
  });
});
