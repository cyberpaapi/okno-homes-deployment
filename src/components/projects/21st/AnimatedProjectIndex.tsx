'use client';
// youcefbnm / Animated Gallery, 21st.dev demo 2073.
// Preserve the perspective reveal and offset columns with native project links.
import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import { useProjectsContent } from '@/lib/useProjectContent';
import { atlasProjects as defaultProjects, type AtlasProject } from '@/data/projectAtlas';
import { GalleryImageCard } from './GalleryImageCard';
import styles from './AnimatedProjectIndex.module.css';
export function AnimatedProjectIndex({projectsFallback=defaultProjects}:{projectsFallback?:AtlasProject[]}) {
  const atlasProjects=useProjectsContent(projectsFallback,true);
  const root=useRef<HTMLElement>(null), reduced=useReducedMotion();
  const {scrollYProgress}=useScroll({target:root,offset:['start end','end end']});
  const progress=useSpring(scrollYProgress,{stiffness:100,damping:30});
  const rotateX=useTransform(progress,[0,.4],[32,0]);
  const scale=useTransform(progress,[0,.4],[.94,1]);
  const middleY=useTransform(progress,[0,1],[140,-100]);
  return <section ref={root} id="index" className={styles.index} aria-label="Project photography">

    <motion.div className={styles.grid} style={{rotateX:reduced?0:rotateX,scale:reduced?1:scale}}>
      {[0,1,2].map(column=><motion.div className={styles.column} key={column} style={{y:reduced||column!==1?0:middleY}}>
        {atlasProjects.filter((_,i)=>i%3===column).map(project=><GalleryImageCard key={project.id} project={project}/>)}
      </motion.div>)}
    </motion.div>
  </section>;
}
