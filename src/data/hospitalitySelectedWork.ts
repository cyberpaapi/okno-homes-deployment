import type { AtlasProject } from './projectAtlas';
import type { ContentItem } from '@/lib/contentCollections';

// Use the same project identity for each photograph throughout the site.
// Stable selection IDs preserve compatibility with existing saved collections.
export const initialHospitalitySelections: ContentItem[] = [
  {
    id: 'forrest',
    fields: {
      projectId: 'forrest', galleryPhotoId: '', nameOverride: '', kindOverride: 'Estate landscape',
      descriptionOverride: 'A glazed pavilion and garden sequence organised around water, landscape and arrival.',
      imageSrcOverride: '', imageAltOverride: 'Glazed OKNO pavilion beside a curved garden path and reflecting pool',
    },
  },
  {
    id: 'legacy-miraya',
    fields: {
      projectId: 'kioo', nameOverride: '', kindOverride: 'Woodland retreat',
      descriptionOverride: 'A compact retreat placed within dense planting, keeping the guest experience close to the site.',
      imageSrcOverride: '/assets/projects/real-v1/kioo-01.webp', imageAltOverride: 'Compact OKNO retreat set within dense forest planting',
    },
  },
  {
    id: 'legacy-nova-valley',
    fields: {
      projectId: 'lakewood', nameOverride: '', kindOverride: 'Hospitality estate',
      descriptionOverride: 'A larger hospitality composition with a clear arrival court and one shared architectural language.',
      imageSrcOverride: '/assets/projects/real-v1/lakewood-01.webp', imageAltOverride: 'Large OKNO villa with a folded roof and landscaped arrival court',
    },
  },
  {
    id: 'legacy-layana-farms',
    fields: {
      projectId: 'octapod-layana', nameOverride: '', kindOverride: 'Residence collection',
      descriptionOverride: 'Multiple residences gathered around shared gardens and water as one connected guest experience.',
      imageSrcOverride: '/assets/projects/real-v1/octapod-layana-01.webp', imageAltOverride: 'A group of compact modular residences arranged around a shared pool',
    },
  },
  {
    id: 'legacy-project-thiru',
    fields: {
      projectId: 'rasa-vikarabad', nameOverride: '', kindOverride: 'Modular retreat',
      descriptionOverride: 'Dark timber retreats arranged around a quiet pool as a calm hospitality collection.',
      imageSrcOverride: '/assets/projects/real-v1/rasa-vikarabad-01.webp', imageAltOverride: 'Dark timber modular residences facing a quiet swimming pool',
    },
  },
];

export type SelectedHospitalityProject = {
  id: string;
  projectId?: string;
  name: string;
  image: string;
  alt: string;
  kind: string;
  description: string;
};

export function resolveHospitalitySelections(items: ContentItem[], projects: AtlasProject[]): SelectedHospitalityProject[] {
  const byId = new Map(projects.map(project => [project.id, project]));
  return items.flatMap(item => {
    const projectId = item.fields.projectId?.trim();
    const project = projectId ? byId.get(projectId) : undefined;
    if (projectId && !project) return [];
    if (!project && !item.id.startsWith('legacy-')) return [];
    const galleryPhoto = project?.gallery.find((photo, index) => (photo.id || `${project.id}-photo-${index + 1}`) === item.fields.galleryPhotoId);
    const name = item.fields.nameOverride?.trim() || project?.title || '';
    const image = item.fields.imageSrcOverride?.trim() || galleryPhoto?.src || project?.image.src || '';
    const alt = item.fields.imageAltOverride?.trim() || galleryPhoto?.alt || project?.image.alt || '';
    if (!name || !image || !alt) return [];
    return [{
      id: item.id,
      ...(project ? { projectId: project.id } : {}),
      name, image, alt,
      kind: item.fields.kindOverride?.trim() || project?.category || 'Project collection',
      description: item.fields.descriptionOverride?.trim() || project?.description || '',
    }];
  });
}
