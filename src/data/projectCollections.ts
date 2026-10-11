import { atlasProjects, type AtlasProject, type ProjectFilm, type ProjectImage } from './projectAtlas';
import { projectPreviewClips } from './projectPreviewClips';

export type ProjectCollectionItem = { id: string; fields: Record<string, string> };

export const initialProjectItems: ProjectCollectionItem[] = atlasProjects.map(project => ({
  id: project.id,
  fields: {
    title: project.title,
    status: 'active',
    slug: project.id,
    slugHistory: '[]',
    showInProjects: 'true',
    category: '',
    location: '',
    description: project.description,
    coverSrc: project.image.src,
    coverAlt: project.image.alt,
    gallery: JSON.stringify(project.gallery.map((image, index) => ({ id: `${project.id}-photo-${index + 1}`, ...image }))),
    films: JSON.stringify(project.films.map((film, index) => ({ id: `${project.id}-film-${index + 1}`, ...film }))),
    previewSrc: projectPreviewClips[project.id] ?? '',
    previewPoster: '',
  },
}));

export function projectSlug(item: ProjectCollectionItem): string {
  return item.fields.slug?.trim() || item.id;
}

export function projectSlugHistory(item: ProjectCollectionItem): string[] {
  try {
    const value: unknown = JSON.parse(item.fields.slugHistory || '[]');
    return Array.isArray(value) ? value.filter((slug): slug is string => typeof slug === 'string' && !!slug) : [];
  } catch { return []; }
}

function readArray(value: string | undefined): Record<string, unknown>[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((entry): entry is Record<string, unknown> => !!entry && typeof entry === 'object' && !Array.isArray(entry)) : [];
  } catch { return []; }
}

function readImages(value: string | undefined): ProjectImage[] {
  return readArray(value).filter(entry => typeof entry.src === 'string' && !!entry.src && typeof entry.alt === 'string' && !!entry.alt)
    .map(entry => ({
      ...(typeof entry.id === 'string' && entry.id ? { id: entry.id } : {}),
      src: entry.src as string,
      alt: entry.alt as string,
      ...(typeof entry.width === 'number' && entry.width > 0 ? { width: entry.width } : {}),
      ...(typeof entry.height === 'number' && entry.height > 0 ? { height: entry.height } : {}),
    }));
}

function readFilms(value: string | undefined): ProjectFilm[] {
  return readArray(value).filter(entry => typeof entry.src === 'string' && !!entry.src && typeof entry.poster === 'string' && !!entry.poster && typeof entry.title === 'string' && !!entry.title)
    .map(entry => ({
      src: entry.src as string,
      poster: entry.poster as string,
      title: entry.title as string,
      duration: typeof entry.duration === 'number' && entry.duration > 0 ? entry.duration : 0,
      width: typeof entry.width === 'number' && entry.width > 0 ? entry.width : 1920,
      height: typeof entry.height === 'number' && entry.height > 0 ? entry.height : 1080,
    }));
}

export function projectFromCollectionItem(item: ProjectCollectionItem): AtlasProject | null {
  if (item.fields.status === 'archived') return null;
  const title = item.fields.title?.trim();
  const coverSrc = item.fields.coverSrc?.trim();
  const coverAlt = item.fields.coverAlt?.trim();
  if (!title || !coverSrc || !coverAlt) return null;
  const gallery = readImages(item.fields.gallery);
  const existingCover = gallery.find(image => image.src === coverSrc);
  const image = existingCover ? { ...existingCover, alt: coverAlt } : { src: coverSrc, alt: coverAlt };
  return {
    id: item.id,
    title,
    description: item.fields.description?.trim() ?? '',
    category: item.fields.category?.trim() || undefined,
    location: item.fields.location?.trim() || '',
    coordinates: null,
    href: `/projects/${projectSlug(item)}`,
    image,
    gallery: gallery.length ? gallery : [image],
    films: readFilms(item.fields.films),
    previewSrc: item.fields.previewSrc || undefined,
    previewPoster: item.fields.previewPoster || coverSrc,
    showInProjects: item.fields.showInProjects !== 'false',
    mediaStatus: 'client-supplied',
    locationStatus: 'awaiting-client',
  };
}

export function projectsFromCollection(items: ProjectCollectionItem[]): AtlasProject[] {
  return items.map(projectFromCollectionItem).filter((project): project is AtlasProject => project !== null);
}

export function visibleProjectsFromCollection(items: ProjectCollectionItem[]): AtlasProject[] {
  return projectsFromCollection(items).filter(project => project.showInProjects !== false);
}

export function findProjectByPath(items: ProjectCollectionItem[], path: string): { project: AtlasProject; redirect: boolean } | null {
  const item = items.find(entry => projectSlug(entry) === path || projectSlugHistory(entry).includes(path));
  if (!item) return null;
  const project = projectFromCollectionItem(item);
  return project ? { project, redirect: projectSlug(item) !== path } : null;
}

export function previewFromCollectionItem(item: ProjectCollectionItem | undefined): string | undefined {
  return item?.fields.previewSrc || undefined;
}
