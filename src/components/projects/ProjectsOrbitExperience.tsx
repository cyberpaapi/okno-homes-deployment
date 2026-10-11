'use client';

import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import Image from 'next/image';
import { MagneticButton, MagneticLink } from './21st/Magnetic';
import { TextReveal } from './21st/TextReveal';
import { SilkBackground } from './21st/SilkBackground';
import dynamic from 'next/dynamic';
import { atlasLocations, atlasProjects } from '@/data/projectAtlas';
import ProjectsHeader from './ProjectsHeader';
import GalleryLink from './GalleryLink';
import styles from './ProjectsOrbitExperience.module.css';

const AtlasGlobe = dynamic(() => import('./AtlasGlobe'), { ssr: false, loading: () => <div className={styles.globePoster} /> });
const ease = [.22, 1, .36, 1] as const;
const coordinate = (value: number, positive: string, negative: string) => `${Math.abs(value).toFixed(3)}° ${value >= 0 ? positive : negative}`;


export default function ProjectsOrbitExperience({ initialId = 'forrest' }: { initialId?: string }) {
  const [activeId, setActiveId] = useState(initialId);
  const reduced = useReducedMotion();
  const index = Math.max(0, atlasProjects.findIndex((project) => project.id === activeId));
  const active = atlasProjects[index];
  const step = (direction: number) => {
    const project = atlasProjects[(index + direction + atlasProjects.length) % atlasProjects.length];
    setActiveId(project.id);
  };
  return <div className={styles.page} data-route="projects">
    <div className={styles.silkSurface} aria-hidden="true"><SilkBackground /></div>
    <ProjectsHeader />
    <main className={styles.atlas} aria-labelledby="atlas-title">
      <div className={styles.titleBlock}><p>THE PROJECT ATLAS</p><h1 id="atlas-title"><TextReveal per="char">Places.</TextReveal></h1></div>
      <p className={styles.edition}>OKNO MODHOMES<br /><span>Architecture, situated.</span></p>
      <motion.div className={styles.globeStage} initial={reduced ? false : { opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.3, ease }}><AtlasGlobe locations={atlasLocations} focusId={atlasLocations[index]?.id} /></motion.div>
      <div className={styles.coordinateFrame} aria-hidden="true">{active.coordinates ? <><span>LATITUDE</span><strong>{coordinate(active.coordinates[0], 'N', 'S')}</strong><span>LONGITUDE</span><strong>{coordinate(active.coordinates[1], 'E', 'W')}</strong></> : <><span>PROJECT RECORD</span><strong>Photography</strong><span>PLACE</span><strong>{active.location}</strong></>}</div>
      <div className={styles.projectInfo} aria-live="polite">
        <AnimatePresence mode="wait" initial={false}><motion.div key={active.id} initial={reduced ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: reduced ? 0 : .22 }}>
          <p className={styles.location}>{active.location}</p>
          <GalleryLink project={active} className={styles.projectTitle} ariaLabel={`Open ${active.title} gallery`}><h2><TextReveal>{active.title}</TextReveal></h2><span aria-hidden="true">↗</span></GalleryLink>
        </motion.div></AnimatePresence>
      </div>
      <div className={styles.photoFrame}>
        <AnimatePresence mode="wait" initial={false}><motion.div key={active.id} initial={reduced ? false : { clipPath: 'inset(0 0 100% 0)' }} animate={{ clipPath: 'inset(0 0 0% 0)' }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : .5, ease }}>
          <GalleryLink project={active} className={styles.photograph} ariaLabel={`View ${active.title} photography`}><Image src={active.image.src} alt={active.image.alt} fill sizes="(max-width:700px) 105px, 190px" priority /></GalleryLink>
        </motion.div></AnimatePresence>
        <span className={styles.photoCaption}>Selected place <span>Open photography ↗</span></span>
      </div>
      <div className={styles.navigator} aria-label="Select a project"><MagneticButton onClick={() => step(-1)} aria-label="Previous location">←</MagneticButton><span>{active.title}</span><MagneticButton onClick={() => step(1)} aria-label="Next location">→</MagneticButton></div>
      <footer className={styles.footline}><span>HOMES WITHOUT BOUNDARIES.</span><span>Preview locations · mapping pending</span><MagneticLink href="/enquiry">Find your place ↗</MagneticLink></footer>
    </main>
  </div>;
}
