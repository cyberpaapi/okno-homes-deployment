'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, useInView, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import ProjectsHeader from './ProjectsHeader';
import { SilkBackground } from './21st/SilkBackground';
import { ProjectsSmoothScroll } from './21st/ProjectsSmoothScroll';
import { ProjectEntrance } from './21st/ProjectEntrance';
import { MagneticLink } from './21st/Magnetic';
import { PrismaProjectCinema } from './21st/PrismaProjectCinema';
import { AnimatedProjectIndex } from './21st/AnimatedProjectIndex';
import { Typewriter } from './21st/Typewriter';
import { MorphingText } from './21st/MorphingText';
import styles from './ProjectsExperience.module.css';
import { useSiteCollection, useSiteContent } from '@/lib/useSiteContent';
import { atlasProjects, type AtlasProject } from '@/data/projectAtlas';
import { globePinsFromCollection, initialGlobePinItems } from '@/data/globePinCollections';
import type { ContentItem } from '@/lib/contentCollections';
import { useProjectsContent } from '@/lib/useProjectContent';
import { projectContentHref } from '@/data/projectContentHref';
const AtlasGlobe=dynamic(()=>import('./AtlasGlobe'),{ssr:false,loading:()=> <div className={styles.globePoster}/>});
export default function ProjectsExperience({initialId='forrest',initialProjects=atlasProjects,initialPins=initialGlobePinItems}:{initialId?:string;initialProjects?:AtlasProject[];initialPins?:ContentItem[]}){
  const eyebrow=useSiteContent('projects.intro.eyebrow','OKNO PROJECTS');
  const title=useSiteContent('projects.intro.title','Homes,\n everywhere.');
  const subtitle=useSiteContent('projects.intro.subtitle','Distinct places. A shared way of living.');
  const action=useSiteContent('projects.intro.action','Our projects');
  const actionHref=useSiteContent('projects.intro.action-href','#collection');
  const [requestedId,setRequestedId]=useState(initialId),[ready,setReady]=useState(false),[filmActive,setFilmActive]=useState(false),[entered,setEntered]=useState(false),[introSettled,setIntroSettled]=useState(false);
  const projects=useProjectsContent(initialProjects,true);
  const pinItems=useSiteCollection('projects.globePins',initialPins);
  const pins=useMemo(()=>globePinsFromCollection(pinItems),[pinItems]);
  const activeId=projects.some(project=>project.id===requestedId)?requestedId:(projects[0]?.id??'');
  const onEntered=useCallback(()=>setEntered(true),[]);
  const onReady=useCallback(()=>setReady(true),[]);
  const reduced=useReducedMotion(),story=useRef<HTMLDivElement>(null);
  const storyVisible=useInView(story);
  useEffect(()=>{
    if(!entered||reduced)return;
    const timer=window.setTimeout(()=>setIntroSettled(true),1100);
    return()=>window.clearTimeout(timer);
  },[entered,reduced]);
  // ajith66310 / Inversion Circle Scroll Animation (25479): sticky two-phase
  // circle geometry. Here the existing globe contracts, then the film expands.
  const {scrollYProgress}=useScroll({target:story,offset:['start start','end end']});
  const progress=useSpring(scrollYProgress,{stiffness:150,damping:36});
  const scale=useTransform(progress,[0,.08,.34],[1,1,.012]);
  const globeOpacity=useTransform(progress,[.3,.36],[1,0]);
  const textOpacity=useTransform(progress,[0,.22],[1,0]);
  const textY=useTransform(progress,[0,.3],[0,-70]);
  const radius=useTransform(progress,[.34,.76],[0,115]);
  const clipPath=useTransform(radius,value=>value>=114.99?'none':`circle(${value}% at var(--portal-x) var(--portal-y))`);
  useMotionValueEvent(progress,'change',v=>setFilmActive(prev=>(v>.76)===prev?prev:v>.76));
  return <div className={styles.page} data-route="projects">
    <div className={styles.silk} aria-hidden="true"><SilkBackground paused={(!reduced&&entered&&!introSettled)||(filmActive&&storyVisible)} maxPixels={180_000} fps={24} interactive={false}/></div>
    <ProjectsSmoothScroll/><ProjectEntrance ready={ready} onComplete={onEntered}/><ProjectsHeader/>
    <main>
      <div ref={story} className={styles.story} data-reduced={!!reduced}>
        <div className={styles.collectionAnchor} id="collection"/>
        <div className={styles.sticky}>
          <section id="atlas" className={styles.hero} aria-labelledby="atlas-title" inert={!reduced&&filmActive}>
            <motion.div className={styles.intro} data-project-intro style={{opacity:reduced?1:textOpacity,y:reduced?0:textY}}>
              <motion.div initial={reduced?false:{opacity:0,y:12,filter:'blur(6px)'}} animate={{opacity:1,y:0,filter:'blur(0px)'}} transition={{duration:.5,ease:[.22,1,.36,1]}}>
                <p>{eyebrow}</p><h1 id="atlas-title"><Typewriter text={title} start={entered} speed={38}>{content=><MorphingText>{content}</MorphingText>}</Typewriter></h1>
                <p className={styles.subtitle}>{subtitle}</p>
                <MagneticLink href={projectContentHref(actionHref, '#collection')} className={styles.discover} aria-label={action}>{action} <span aria-hidden="true">↗</span></MagneticLink>
              </motion.div>
            </motion.div>
            <div className={styles.globe}><motion.div className={styles.globeInner} style={{scale:reduced?1:scale,opacity:reduced?1:globeOpacity}}><AtlasGlobe locations={pins} onReady={onReady} paused={!entered||filmActive}/></motion.div></div>
          </section>
          <motion.div className={styles.filmReveal} style={{clipPath:reduced?undefined:clipPath}} inert={!reduced&&!filmActive} aria-hidden={!reduced&&!filmActive}>
            <PrismaProjectCinema activeId={activeId} onSelect={setRequestedId} projectsFallback={initialProjects} embedded enabled={!!reduced||filmActive}/>
          </motion.div>
        </div>
      </div>
      <AnimatedProjectIndex projectsFallback={initialProjects}/>
    </main>
  </div>;
}
