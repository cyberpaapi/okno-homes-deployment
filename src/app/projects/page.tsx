import { atlasProjects } from '@/data/projectAtlas';
import { visibleProjectsFromCollection } from '@/data/projectCollections';
import { readContent } from '@/lib/siteContentStore';
import ProjectsExperience from '@/components/projects/ProjectsExperience';
import { initialGlobePinItems } from '@/data/globePinCollections';

export const metadata = {
  title: 'OKNO — Projects',
  description: 'An atlas of places. Explore OKNO’s photography and films from real project collections.',
  robots: { index: false, follow: false },
};
export const dynamic = 'force-dynamic';

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ place?: string }> }) {
  const { place } = await searchParams;
  const { publishedCollections } = await readContent();
  const projects = Object.prototype.hasOwnProperty.call(publishedCollections, 'projects.records')
    ? visibleProjectsFromCollection(publishedCollections['projects.records'])
    : atlasProjects;
  const pins = Object.prototype.hasOwnProperty.call(publishedCollections, 'projects.globePins')
    ? publishedCollections['projects.globePins']
    : initialGlobePinItems;
  const initialId = place && projects.some(project => project.id === place) ? place : (projects[0]?.id ?? '');
  return (
    <>
      <ProjectsExperience initialId={initialId} initialProjects={projects} initialPins={pins} />
    </>
  );
}
