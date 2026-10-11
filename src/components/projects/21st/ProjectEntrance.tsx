'use client';
// gaxocif204 / Preloader, 21st.dev 13967. Logo expands as the curved sheet lifts.
// Same timeline expressed with existing Motion; no second animation dependency.
import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import OknoLogo from '@/components/Brand/OknoLogo';
import styles from './ProjectEntrance.module.css';
export function ProjectEntrance({ready,onComplete}:{ready:boolean;onComplete?:()=>void}){
  const [show,setShow]=useState(true),[minimum,setMinimum]=useState(false),[skip,setSkip]=useState(false),reduced=useReducedMotion();
  useEffect(()=>{
    let seen=false;try{seen=sessionStorage.getItem('okno-projects-entered')==='1';}catch{}
    const minimumTimer=setTimeout(()=>{setMinimum(true);setSkip(seen);if(seen||matchMedia('(prefers-reduced-motion: reduce)').matches)setShow(false);},seen?0:500);
    const deadline=setTimeout(()=>setShow(false),3000);
    return()=>{clearTimeout(minimumTimer);clearTimeout(deadline);};
  },[]);
  useEffect(()=>{if(ready&&minimum){const t=setTimeout(()=>{setShow(false);try{sessionStorage.setItem('okno-projects-entered','1');}catch{}},0);return()=>clearTimeout(t);}},[ready,minimum]);
  return <AnimatePresence onExitComplete={onComplete}>{show&&<motion.div role="status" aria-label="Loading OKNO projects" className={styles.loader} initial={{y:0}} exit={{y:reduced?0:'-105%',opacity:reduced?0:1,borderBottomLeftRadius:'50% 20%',borderBottomRightRadius:'50% 20%'}} transition={{duration:reduced||skip?0:1,ease:[.65,0,.35,1]}}><motion.div exit={{scale:reduced?1:5,opacity:0}} transition={{duration:reduced||skip?0:.8}}><OknoLogo variant="compact" priority className={styles.entranceLogo}/></motion.div></motion.div>}</AnimatePresence>;
}
