"use client";

import { useMemo } from "react";
import { atlasProjects, type AtlasProject } from "@/data/projectAtlas";
import { projectPreviewClips } from "@/data/projectPreviewClips";
import { useSiteCollectionsMap, useSiteContentMap } from "@/lib/useSiteContent";
import { initialProjectItems, previewFromCollectionItem, projectFromCollectionItem, projectsFromCollection, visibleProjectsFromCollection } from "@/data/projectCollections";
import type { ContentCollections } from "@/lib/contentCollections";

type Values = Record<string, string>;

export function resolveProjectContent(project: AtlasProject, values: Values): AtlasProject {
  const prefix = `projects.${project.id}`;
  const gallery = project.gallery.map((image, index) => ({
    ...image,
    src: values[`${prefix}.image-${index + 1}.src`] ?? image.src,
    alt: values[`${prefix}.image-${index + 1}.alt`] ?? image.alt,
  }));
  return {
    ...project,
    title: values[`${prefix}.title`] ?? project.title,
    description: values[`${prefix}.description`] ?? project.description,
    image: gallery[0],
    gallery,
    films: project.films.map((film, index) => ({
      ...film,
      src: values[`${prefix}.film-${index + 1}.src`] ?? film.src,
      poster: values[`${prefix}.film-${index + 1}.poster`] ?? film.poster,
      title: values[`${prefix}.film-${index + 1}.title`] ?? film.title,
    })),
  };
}

export function resolveProjectDetail(project: AtlasProject, values: Values, collections: ContentCollections): AtlasProject | null {
  if (!Object.hasOwn(collections, 'projects.records')) return resolveProjectContent(project, values);
  const item = collections['projects.records'].find(record => record.id === project.id);
  return item ? projectFromCollectionItem(item) : null;
}

export function useProjectContent(project: AtlasProject): AtlasProject | null {
  const values = useSiteContentMap();
  const collections = useSiteCollectionsMap();
  return useMemo(() => resolveProjectDetail(project, values, collections), [project, values, collections]);
}

export function useProjectsContent(fallback: AtlasProject[] = atlasProjects, visibleOnly = false) {
  const values = useSiteContentMap();
  const collections = useSiteCollectionsMap();
  return useMemo(() => Object.prototype.hasOwnProperty.call(collections, 'projects.records')
    ? (visibleOnly ? visibleProjectsFromCollection(collections['projects.records']) : projectsFromCollection(collections['projects.records']))
    : fallback.map(project => resolveProjectContent(project, values)).filter(project => !visibleOnly || project.showInProjects !== false), [values, collections, fallback, visibleOnly]);
}

export function useProjectPreview(projectId: string, fallback?: string) {
  const values = useSiteContentMap();
  const collections = useSiteCollectionsMap();
  if (Object.prototype.hasOwnProperty.call(collections, 'projects.records')) {
    return previewFromCollectionItem(collections['projects.records'].find(item => item.id === projectId));
  }
  return values[`projects.${projectId}.preview`] ?? fallback ?? projectPreviewClips[projectId];
}

export { initialProjectItems };
