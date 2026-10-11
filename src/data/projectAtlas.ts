import media from './realProjectMedia.json';
import { CONFIRMED_GLOBE_LOCATIONS } from './projectExperience';

export type ProjectImage = { id?: string; src: string; alt: string; width?: number; height?: number };
export type ProjectFilm = { src: string; poster: string; title: string; duration: number; width: number; height: number };
export type AtlasProject = {
  id: string; title: string; location: string; coordinates: readonly [number, number] | null;
  href: string; image: ProjectImage; gallery: ProjectImage[]; films: ProjectFilm[];
  category?: string; showInProjects?: boolean; previewSrc?: string; previewPoster?: string;
  description: string; mediaStatus: 'client-supplied'; locationStatus: 'awaiting-client' | 'approximate';
};

// Folder identities are used only for this noindex preview. The client is supplying
// approved project names and map locations. Never reuse the old demo coordinates.
export const atlasProjects: AtlasProject[] = media.map((project) => ({
  id: project.id, title: project.title, location: 'Project collection', coordinates: null,
  href: `/projects/${project.id}`, image: project.gallery[0], gallery: project.gallery,
  films: project.films, description: `Photography and films from the supplied ${project.title} project collection.`,
  mediaStatus: 'client-supplied', locationStatus: 'awaiting-client',
}));
export function findAtlasProject(id: string) { return atlasProjects.find((project) => project.id === id); }

// Preserve the user's current map layout while commercial assignments are pending.
// The legacy constant's name is historical; these are preview locations, not
// evidence that the supplied real projects were built in these cities.
export const atlasLocations = CONFIRMED_GLOBE_LOCATIONS.map(({ id, city, coordinates }) => ({ id, city, coordinates }));
