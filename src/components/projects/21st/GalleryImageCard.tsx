'use client';
// shadcnblockscom / Gallery4, 21st.dev demo 692: image card, multiply overlay,
// bottom-aligned title and hover zoom. Descriptions/Read more removed at user request.
// unlumen / Scroll Reveal Image, demo 24466 supplies the scroll-linked image zoom.
import { useRef } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import type { AtlasProject } from '@/data/projectAtlas';
import GalleryLink from '../GalleryLink';
import styles from './AnimatedProjectIndex.module.css';
export function GalleryImageCard({project}:{project:AtlasProject}) {
  const ref=useRef<HTMLDivElement>(null), reduced=useReducedMotion();
  const {scrollYProgress}=useScroll({target:ref,offset:['start end','end start']});
  const progress=useSpring(scrollYProgress,{stiffness:120,damping:35});
  const scale=useTransform(progress,[0,.6],[1.18,1]);
  return <GalleryLink project={project} className={styles.card} ariaLabel={`View ${project.title} project`}>
    <div ref={ref} className={styles.image}>
      <motion.div className={styles.imageMotion} style={{scale:reduced?1:scale}}><Image src={project.gallery[Math.min(1,project.gallery.length-1)].src} alt={project.title} fill sizes="(max-width:600px) 88vw, (max-width:900px) 42vw, 29vw"/></motion.div>
      <div className={styles.cardShade} aria-hidden="true"/>
      <div className={styles.overlay}><h2>{project.title}</h2><span aria-hidden="true">↗</span></div>
    </div>
  </GalleryLink>;
}
