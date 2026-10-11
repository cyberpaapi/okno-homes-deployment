'use client';
// rahil1202 / PrismaHero, 21st.dev demo 12200: full-bleed footage and low-set kinetic typography.
import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion, useInView, useIsPresent, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from 'motion/react';
import { atlasProjects as defaultProjects, type AtlasProject } from '@/data/projectAtlas';
import { useProjectsContent, useProjectPreview } from '@/lib/useProjectContent';
import GalleryLink from '../GalleryLink';
import { TextReveal } from './TextReveal';
import { MagneticButton } from './Magnetic';
import { CarouselThumbnails } from './PhotoCarousel';
import { ProjectFilmDialog } from './ProjectFilmDialog';
import styles from './ProjectCinema.module.css';
import { PlaybackProgress } from './PlaybackProgress';
import { useProjectAdvance } from './useProjectAdvance';

function ProjectFootage({ project, paused, reset, onEnded, onPlaying, onFailed, progress }: { progress: MotionValue<number>; project: AtlasProject; paused: boolean; reset: boolean; onEnded: () => void; onPlaying: () => void; onFailed: () => void }) {
  const root=useRef<HTMLDivElement>(null), video=useRef<HTMLVideoElement>(null);
  const inView=useInView(root,{amount:.15}), seen=useInView(root,{once:true,amount:.05});
  const reduced=useReducedMotion();const [ready,setReady]=useState(false);
  const preview=useProjectPreview(project.id, project.previewSrc);
  const present=useIsPresent();
  useEffect(()=>{ if(reset&&video.current){video.current.pause();video.current.currentTime=0;} },[reset]);
  useEffect(()=>{
    const media=video.current;if(!media)return;let active=true;
    const sync=()=>{if(present&&inView&&!paused&&!reduced&&!document.hidden)void media.play().catch(error=>{ if(!active || error?.name==='AbortError' || document.hidden || reset) return;onFailed(); });else media.pause();};
    sync();document.addEventListener('visibilitychange',sync);
    return()=>{active=false;media.pause();document.removeEventListener('visibilitychange',sync);};
  },[present,inView,paused,reduced,seen,reset,onFailed]);
  return <div ref={root} className={styles.footage}>
    <Image src={project.previewPoster || project.image.src} alt={project.image.alt} fill sizes="100vw" />
    {preview&&seen&&!reduced&&<video ref={video} src={preview} muted playsInline preload="auto" onTimeUpdate={event=>{
      if(!present)return;
      const media=event.currentTarget;
      if(media.duration>0)progress.set(Math.min(1,media.currentTime/media.duration));
      const quality=media.getVideoPlaybackQuality?.();
      if(quality){media.dataset.decoded=String(quality.totalVideoFrames);media.dataset.dropped=String(quality.droppedVideoFrames);}
    }} onEnded={()=>{if(present)onEnded();}} onPlaying={()=>{if(present)onPlaying();}} aria-hidden="true" onLoadedData={()=>setReady(true)} onError={()=>{setReady(false);onFailed();}} style={{opacity:ready?1:0}} />}
  </div>;
}
export function PrismaProjectCinema({ activeId, onSelect, projectsFallback=defaultProjects, embedded=false, enabled=true }: { activeId: string; onSelect:(id:string)=>void; projectsFallback?:AtlasProject[]; embedded?:boolean; enabled?:boolean }) {
  const atlasProjects=useProjectsContent(projectsFallback,true);
  const index=Math.max(0,atlasProjects.findIndex(p=>p.id===activeId)), project=atlasProjects[index];
  const [paused,setPaused]=useState(false),[filmOpen,setFilmOpen]=useState(false),[interacting,setInteracting]=useState(false),[playingId,setPlayingId]=useState(''),[failedId,setFailedId]=useState('');
  const reduced=useReducedMotion();
  const playbackProgress=useMotionValue(0);
  const root=useRef<HTMLDivElement>(null);
  const visible=useInView(root,{amount:.5});
  const running=enabled&&visible&&!paused&&!filmOpen&&!interacting&&!reduced;
  const next=useCallback(()=>{if(atlasProjects.length)onSelect(atlasProjects[(index+1)%atlasProjects.length].id);},[atlasProjects,index,onSelect]);
  const failed=useCallback(()=>{if(project)setFailedId(project.id);},[project]);
  const preview=useProjectPreview(project?.id ?? '', project?.previewSrc);
  useProjectAdvance({id:project?.id ?? '',running:running&&!!project,photoOnly:!preview||failedId===project?.id,next,progress:playbackProgress});
  const ended=()=>{if(running&&!document.hidden)next();};
  // unlumen / Scroll Reveal Image, demo 24466: spring-smoothed expansion + image zoom.
  const {scrollYProgress}=useScroll({target:root,offset:['start end','start start']});
  const progress=useSpring(scrollYProgress,{stiffness:120,damping:35});
  const clipPath=useTransform(progress,[0,1],['inset(12% 12% 12% 12%)','inset(0% 0% 0% 0%)']);
  const scale=useTransform(progress,[0,1],[1.18,1]);
  const select=(next:number)=>{if(atlasProjects.length)onSelect(atlasProjects[(next+atlasProjects.length)%atlasProjects.length].id);};
  if (!project) return <div ref={root} className={embedded?styles.embedded:styles.scrollStage} id={embedded?undefined:'collection'}><section className={styles.cinema} aria-label="Selected project collections"><p className={styles.empty}>Projects will appear here when published.</p></section></div>;
  return <div ref={root} className={embedded?styles.embedded:styles.scrollStage} id={embedded?undefined:"collection"}><motion.section style={{clipPath:reduced||embedded?undefined:clipPath}} className={styles.cinema} aria-label="Selected project collections">
    <motion.div className={styles.mediaLayer} style={{scale:reduced||embedded?1:scale}}><AnimatePresence initial={false}><motion.div className={styles.scene} key={project.id} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:reduced?0:.7}}><ProjectFootage project={project} paused={!running} reset={!enabled} onEnded={ended} onPlaying={()=>setPlayingId(project.id)} onFailed={failed} progress={playbackProgress} /></motion.div></AnimatePresence></motion.div>
    <div className={styles.shade} aria-hidden="true" />
    <motion.div layout className={styles.content} data-playing={playingId===project.id} transition={{duration:reduced?0:.65,ease:[.22,1,.36,1]}}>
      <div className={styles.caption} key={project.id}><GalleryLink project={project} className={styles.title} ariaLabel={`Explore ${project.title}`}><h2><TextReveal>{project.title}</TextReveal></h2><span aria-hidden="true">↗</span></GalleryLink></div>
      <div className={styles.actions}><ProjectFilmDialog key={project.id} project={project} onOpenChange={setFilmOpen} /></div>
    </motion.div>
    <div className={styles.bottom} onFocusCapture={event=>{if(event.target instanceof Element&&event.target.matches(':focus-visible'))setInteracting(true);}} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget))setInteracting(false);}}><div className={styles.thumbs}><CarouselThumbnails items={atlasProjects.map(p=>({src:p.image.src,label:`Select ${p.title}`}))} index={index} setIndex={select} label="Project collections" /></div>
      <div className={styles.controls}>{!reduced&&<MagneticButton onClick={()=>setPaused(!paused)} aria-label={paused?'Play project showcase':'Pause project showcase'}>{paused?'▷':'Ⅱ'}</MagneticButton>}<MagneticButton aria-label="Previous project" onClick={()=>select(index-1)}>←</MagneticButton><MagneticButton aria-label="Next project" onClick={()=>select(index+1)}>→</MagneticButton></div>
    </div>
    <PlaybackProgress progress={playbackProgress} id={project.id} title={project.title}/>
  </motion.section></div>;
}
