import { notFound, redirect } from 'next/navigation';
import { findAtlasProject } from '@/data/projectAtlas';
import { findProjectByPath } from '@/data/projectCollections';
import { readPublicContent } from '@/lib/publicContent';
import ProjectGallery from '@/components/projects/ProjectGallery';

export const dynamic = 'force-dynamic';
async function findPublishedProject(slug: string) {
  const { publishedCollections } = await readPublicContent();
  return Object.prototype.hasOwnProperty.call(publishedCollections, 'projects.records')
    ? findProjectByPath(publishedCollections['projects.records'], slug)
    : (() => { const project = findAtlasProject(slug); return project ? { project, redirect: false } : null; })();
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await findPublishedProject(slug);
  return { title: `${result?.project.title ?? 'Project'} — OKNO`, description: result ? `${result.project.title} by OKNO: ${result.project.description} In photographs and film.` : undefined };
}
export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await findPublishedProject(slug);
  if (!result) notFound();
  if (result.redirect) redirect(result.project.href);
  return <ProjectGallery key={result.project.id} project={result.project} />;
}
