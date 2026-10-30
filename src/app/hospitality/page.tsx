import HospitalityExperience from '@/components/hospitality/HospitalityExperience';
import { atlasProjects } from '@/data/projectAtlas';
import { projectsFromCollection } from '@/data/projectCollections';
import { initialHospitalitySelections } from '@/data/hospitalitySelectedWork';
import { readPublicContent } from '@/lib/publicContent';

export const metadata = {
  title: 'OKNO — Hospitality',
  description: 'Boutique hospitality estates of five residences and more, from site study to first guest.',
};

export const dynamic = 'force-dynamic';

export default async function HospitalityPage() {
  const { publishedCollections } = await readPublicContent();
  const projects = Object.prototype.hasOwnProperty.call(publishedCollections, 'projects.records')
    ? projectsFromCollection(publishedCollections['projects.records'])
    : atlasProjects;
  const selectedWork = Object.prototype.hasOwnProperty.call(publishedCollections, 'hospitality.selectedWork')
    ? publishedCollections['hospitality.selectedWork']
    : initialHospitalitySelections;
  return <HospitalityExperience initialProjects={projects} initialSelections={selectedWork} />;
}
