import { describe, expect, it } from 'vitest';
import { atlasProjects } from './projectAtlas';
import { findProjectByPath, initialProjectItems, projectsFromCollection, visibleProjectsFromCollection } from './projectCollections';
import { initialHospitalitySelections, resolveHospitalitySelections } from './hospitalitySelectedWork';

describe('published project and Hospitality collections', () => {
  it('migrates all seven existing project records without changing their media', () => {
    const projects = projectsFromCollection(initialProjectItems);
    expect(projects.map(project => project.id)).toEqual(atlasProjects.map(project => project.id));
    expect(initialProjectItems.every(item => item.fields.slug === item.id && item.fields.showInProjects === 'true')).toBe(true);
    projects.forEach((project, index) => {
      expect(project.gallery.map(image => [image.src, image.alt, image.width, image.height]))
        .toEqual(atlasProjects[index].gallery.map(image => [image.src, image.alt, image.width, image.height]));
      expect(project.gallery.every(image => Boolean(image.id))).toBe(true);
      expect(project.films).toEqual(atlasProjects[index].films);
      expect(project.image.src).toBe(atlasProjects[index].image.src);
      expect(project.image.alt).toBe(atlasProjects[index].image.alt);
    });
  });

  it('creates a route-ready project with replaceable ordered photographs and optional films', () => {
    const item = {
      id: 'new-retreat',
      fields: {
        title: 'New Retreat', description: 'An approved project.',
        coverSrc: '/assets/projects/new-cover.webp', coverAlt: 'Retreat exterior',
        gallery: JSON.stringify([
          { id: 'photo-2', src: '/assets/projects/second.webp', alt: 'Bedroom' },
          { id: 'photo-1', src: '/assets/projects/new-cover.webp', alt: 'Exterior' },
        ]),
        films: '[]', previewSrc: '',
      },
    };
    const [project] = projectsFromCollection([item]);
    expect(project.href).toBe('/projects/new-retreat');
    expect(project.image.alt).toBe('Retreat exterior');
    expect(project.gallery.map(image => image.alt)).toEqual(['Bedroom', 'Exterior']);
    expect(project.films).toEqual([]);
    expect(project.coordinates).toBeNull();
    expect(projectsFromCollection([])).toEqual([]);
    expect(projectsFromCollection([{ ...item, fields: { ...item.fields, status: 'archived' } }])).toEqual([]);
  });

  it('keeps stable IDs, redirects former slugs, and filters only the Projects showcase', () => {
    const item = {
      ...initialProjectItems[0],
      fields: { ...initialProjectItems[0].fields, slug: 'forrest-estate', slugHistory: '["forrest"]', showInProjects: 'false', category: 'Estate landscape', location: 'Hyderabad', previewPoster: '/assets/projects/poster.webp' },
    };
    const project = projectsFromCollection([item])[0];
    expect(project.id).toBe('forrest');
    expect(project.href).toBe('/projects/forrest-estate');
    expect(project.category).toBe('Estate landscape');
    expect(project.location).toBe('Hyderabad');
    expect(project.previewPoster).toBe('/assets/projects/poster.webp');
    expect(visibleProjectsFromCollection([item])).toEqual([]);
    expect(findProjectByPath([item], 'forrest')?.redirect).toBe(true);
    expect(findProjectByPath([item], 'forrest-estate')?.redirect).toBe(false);
    expect(findProjectByPath([{ ...item, fields: { ...item.fields, status: 'archived' } }], 'forrest')).toBeNull();
  });

  it('uses the same approved project identities in Projects and Hospitality', () => {
    const selected = resolveHospitalitySelections(initialHospitalitySelections, atlasProjects);
    expect(selected.map(project => project.name)).toEqual(['Forrest', 'Kioo', 'Lakewood Villa', 'Octapod Layana', 'Rasa Vikarabad']);
    expect(selected[0].projectId).toBe('forrest');
    expect(selected.map(project => project.projectId)).toEqual(['forrest', 'kioo', 'lakewood', 'octapod-layana', 'rasa-vikarabad']);
  });

  it('inherits chosen project data and omits a selection if its project is archived', () => {
    const item = { id: 'chosen-kray', fields: { projectId: 'kray-sangareddy' } };
    const chosen = resolveHospitalitySelections([item], atlasProjects);
    expect(chosen[0].name).toBe('Kray Sangareddy');
    expect(chosen[0].image).toBe(atlasProjects.find(project => project.id === 'kray-sangareddy')?.image.src);
    expect(resolveHospitalitySelections([item], [])).toEqual([]);
    expect(resolveHospitalitySelections([], atlasProjects)).toEqual([]);
  });

  it('uses a chosen linked gallery photo while preserving explicit custom overrides and cover fallback', () => {
    const [project] = projectsFromCollection([initialProjectItems[0]]);
    const second = project.gallery[1];
    const chosen = { id: 'chosen-forrest', fields: { projectId: 'forrest', galleryPhotoId: second.id || '' } };
    expect(resolveHospitalitySelections([chosen], [project])[0]).toMatchObject({ image: second.src, alt: second.alt });
    expect(resolveHospitalitySelections([chosen], [{ ...project, gallery: [...project.gallery].reverse() }])[0].image).toBe(second.src);
    expect(resolveHospitalitySelections([{ ...chosen, fields: { ...chosen.fields, imageSrcOverride: '/custom.webp', imageAltOverride: 'Custom view' } }], [project])[0]).toMatchObject({ image: '/custom.webp', alt: 'Custom view' });
    expect(resolveHospitalitySelections([{ ...chosen, fields: { ...chosen.fields, galleryPhotoId: '' } }], [project])[0].image).toBe(project.image.src);
    expect(resolveHospitalitySelections([{ ...chosen, fields: { ...chosen.fields, galleryPhotoId: 'removed-photo' } }], [project])[0].image).toBe(project.image.src);
  });
});
