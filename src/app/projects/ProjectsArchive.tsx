'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Projects.module.css';

const FILTERS = ['All', 'Homes', 'Hospitality', 'Export'] as const;
type Filter = (typeof FILTERS)[number];

const PROJECTS = [
  {
    id: 'mehul-valley',
    category: 'Hospitality',
    title: 'Mehul Valley',
    location: 'Lonavala, Maharashtra',
    detail: '17 homes · delivered 2024',
    description: 'A hospitality project delivered at scale and built for the monsoon.',
    image: '/assets/projects/project-highlands.webp',
    alt: 'A compact home in a green highland landscape',
  },
  {
    id: 'mirror-house',
    category: 'Homes',
    title: 'Mirror House',
    location: 'Coorg, Karnataka',
    detail: 'Project story',
    description: 'A panelised home planned around a steep site, limited access and existing trees.',
    image: '/assets/about/IMG_20260813_133034.jpg',
    alt: 'Published coverage of an OKNO home in a forest setting',
  },
  {
    id: 'first-home',
    category: 'Homes',
    title: 'The first home delivered',
    location: 'India',
    detail: 'Delivered 2022',
    description: 'The project that proved the drawing, panel and assembly system on a real site.',
    image: '/assets/projects/project-desert.webp',
    alt: 'A compact OKNO home in a dry landscape',
  },
  {
    id: 'export-01',
    category: 'Export',
    title: 'Export 01',
    location: 'India → United States',
    detail: 'Delivered 2025',
    description: 'OKNO’s first panelised home export, shipped from India to the United States.',
    image: '/assets/projects/project-nordic.webp',
    alt: 'An OKNO home set between tall trees',
  },
] as const;

export default function ProjectsArchive() {
  const [activeFilter, setActiveFilter] = useState<Filter>('All');
  const visibleProjects = useMemo(
    () => PROJECTS.filter((project) => (
      activeFilter === 'All' || project.category === activeFilter
    )),
    [activeFilter],
  );

  return (
    <section className={styles.archive} aria-labelledby="project-archive-title">
      <div className={styles.archiveHeading}>
        <div>
          <p>Project archive</p>
          <h2 id="project-archive-title">Selected records.</h2>
        </div>
        <div className={styles.filters} aria-label="Filter projects">
          {FILTERS.map((filter) => (
            <button
              className={filter === activeFilter ? styles.activeFilter : undefined}
              type="button"
              key={filter}
              aria-pressed={filter === activeFilter}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.projectGrid} aria-live="polite">
        {visibleProjects.map((project) => (
          <article className={styles.projectCard} id={`project-${project.id}`} key={project.id}>
            <div className={styles.projectImage}>
              <Image
                src={project.image}
                alt={project.alt}
                fill
                sizes="(max-width: 760px) calc(100vw - 40px), 50vw"
              />
            </div>
            <div className={styles.projectCopy}>
              <div className={styles.projectMeta}>
                <span>{project.location}</span>
                <span>{project.detail}</span>
              </div>
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <Link href={`/enquiry?project=${project.id}`}>
                Discuss this project <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </article>
        ))}
      </div>

      <div className={styles.archiveCta}>
        <p>Have land, a brief, or a hospitality project in mind?</p>
        <Link href="/enquiry">Begin a conversation <span aria-hidden="true">→</span></Link>
      </div>
    </section>
  );
}
