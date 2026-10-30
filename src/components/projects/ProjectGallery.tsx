'use client';
// Composed from retrieved 21st.dev: 26223 Masonry Lightbox, 19066 Serif Hero,
// 1962 Animated Tabs, 19082 Framer Carousel Thumbnails and 12200 film stage.
import { useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { MagneticLink } from './21st/Magnetic';
import { CarouselThumbnails } from './21st/PhotoCarousel';
import { MasonryLightbox } from './21st/MasonryLightbox';
import { AnimatedTabs } from './21st/AnimatedTabs';
import { SilkBackground } from './21st/SilkBackground';
import { ProjectsSmoothScroll } from './21st/ProjectsSmoothScroll';
import { type AtlasProject } from '@/data/projectAtlas';
import ProjectsHeader from './ProjectsHeader';
import styles from './ProjectGallery.module.css';
import { useProjectContent } from '@/lib/useProjectContent';
import { useSiteContent } from '@/lib/useSiteContent';
import { projectContentHref } from '@/data/projectContentHref';

export default function ProjectGallery({ project: initialProject }: { project: AtlasProject }) {
  const project = useProjectContent(initialProject);
  const returnLabel = useSiteContent('projects.detail.return', 'All places');
  const returnHref = useSiteContent('projects.detail.return-href', '/projects?place={projectId}');
  const photosLabel = useSiteContent('projects.detail.photos-tab', 'Photographs');
  const filmsLabel = useSiteContent('projects.detail.films-tab', 'Films');
  if (!project) return <div className={styles.page} data-route="projects"><ProjectsHeader /><main className={`${styles.main} ${styles.unavailable}`}><p>Project archive</p><h1>This project is no longer available.</h1><MagneticLink href={projectContentHref(returnHref, '/projects', initialProject.id)} className={styles.return}>← <span data-type-field={"projects.detail.return"}>{returnLabel}</span></MagneticLink></main></div>;
  return <ProjectGalleryContent project={project} returnLabel={returnLabel} returnHref={projectContentHref(returnHref, `/projects?place=${encodeURIComponent(project.id)}`, project.id)} photosLabel={photosLabel} filmsLabel={filmsLabel} />;
}

function ProjectGalleryContent({ project, returnLabel, returnHref, photosLabel, filmsLabel }: { project: AtlasProject; returnLabel: string; returnHref: string; photosLabel: string; filmsLabel: string }) {
  const reduced = useReducedMotion();
  const images = useMemo(() => {
    const seen = new Set<string>();
    return [project.image, ...project.gallery].filter(image => { if (seen.has(image.src)) return false;seen.add(image.src);return true; });
  }, [project]);
  const [filmIndex, setFilmIndex] = useState(() => Math.max(0, project.films.findIndex(item => item.width > item.height)));
  const [mode, setMode] = useState<'photos' | 'films'>('photos');
  const activeFilmIndex = Math.max(0, Math.min(filmIndex, project.films.length - 1));
  const activeMode = mode === 'films' && project.films.length ? 'films' : 'photos';
  const film = project.films[activeFilmIndex];
  const landscapeFilm = !!film && film.width > film.height;
  return <div className={styles.page} data-route="projects">
    <ProjectsSmoothScroll />
    <div className={styles.silkSurface} aria-hidden="true"><SilkBackground paused={activeMode === 'films'} /></div>
    <ProjectsHeader projectId={project.id} />
    <main aria-labelledby="project-title" className={styles.main} data-type-section="projects.detail-controls">
      <motion.div className={styles.heading} initial={reduced ? false : { opacity: 0, y: 12, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration: reduced ? 0 : .5, ease: [.22, 1, .36, 1] }}>
        <MagneticLink href={returnHref} className={styles.return}>← <span data-type-field={"projects.detail.return"}>{returnLabel}</span></MagneticLink>
        <h1 id="project-title">{project.title}</h1>
        {project.description && <p className={styles.projectDescription}>{project.description}</p>}
        {(project.category || (project.location && project.location !== 'Project collection')) && <p className={styles.projectMeta}>{[project.category, project.location === 'Project collection' ? '' : project.location].filter(Boolean).join(' · ')}</p>}
        {project.films.length > 0 && <AnimatedTabs value={activeMode} onChange={id => setMode(id as 'photos' | 'films')} tabs={[{ id: 'photos', label: photosLabel }, { id: 'films', label: filmsLabel }]} />}
      </motion.div>
      {activeMode === 'photos' ? <section aria-label={`${project.title} ${photosLabel}`}><MasonryLightbox images={images} title={project.title} /></section> : film && <section className={styles.cinema} aria-label={`${project.title} ${filmsLabel}`}>
        <motion.div key={film.src} className={styles.filmStage} initial={reduced ? false : { opacity: 0, scale: .98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: reduced ? 0 : .5, ease: [.22, 1, .36, 1] }}>
          <video src={film.src} poster={film.poster} controls playsInline autoPlay={landscapeFilm} muted={landscapeFilm} preload={landscapeFilm ? "metadata" : "none"} aria-label={film.title} />
        </motion.div>
        {project.films.length > 1 && <CarouselThumbnails items={project.films.map(media => ({ src: media.poster, label: `Watch ${media.title}`, film: true }))} index={activeFilmIndex} setIndex={setFilmIndex} label={`${project.title} ${filmsLabel}`} />}
      </section>}
    </main>
  </div>;
}
