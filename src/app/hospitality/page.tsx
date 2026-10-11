import HospitalityExperience from '@/components/hospitality/HospitalityExperience';
import { atlasProjects } from '@/data/projectAtlas';
import { projectsFromCollection } from '@/data/projectCollections';
import { initialHospitalitySelections } from '@/data/hospitalitySelectedWork';
import { readContent } from '@/lib/siteContentStore';

export const metadata = {
  title: 'OKNO — Hospitality',
  description: 'Bespoke modular hospitality estates for five residences and beyond, from site study to guest-ready delivery.',
};

export const dynamic = 'force-dynamic';

export default async function HospitalityPage() {
  const { publishedCollections } = await readContent();
  const projects = Object.prototype.hasOwnProperty.call(publishedCollections, 'projects.records')
    ? projectsFromCollection(publishedCollections['projects.records'])
    : atlasProjects;
  const selectedWork = Object.prototype.hasOwnProperty.call(publishedCollections, 'hospitality.selectedWork')
    ? publishedCollections['hospitality.selectedWork']
    : initialHospitalitySelections;
  return <HospitalityExperience initialProjects={projects} initialSelections={selectedWork} />;
}
