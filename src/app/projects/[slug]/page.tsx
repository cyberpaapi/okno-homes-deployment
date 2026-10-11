import { notFound, redirect } from 'next/navigation';
import { findAtlasProject } from '@/data/projectAtlas';
import { findProjectByPath } from '@/data/projectCollections';
import { readContent } from '@/lib/siteContentStore';
import ProjectGallery from '@/components/projects/ProjectGallery';

export const dynamic = 'force-dynamic';
async function findPublishedProject(slug: string) {
  const { publishedCollections } = await readContent();
  return Object.prototype.hasOwnProperty.call(publishedCollections, 'projects.records')
    ? findProjectByPath(publishedCollections['projects.records'], slug)
    : (() => { const project = findAtlasProject(slug); return project ? { project, redirect: false } : null; })();
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await findPublishedProject(slug);
  return { title: `${result?.project.title ?? 'Project'} — OKNO`, description: result?.project.description, robots: { index: false, follow: false } };
}
export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await findPublishedProject(slug);
  if (!result) notFound();
  if (result.redirect) redirect(result.project.href);
  return <ProjectGallery key={result.project.id} project={result.project} />;
}
