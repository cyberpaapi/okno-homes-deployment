'use client';
// unlumen / Cursor Image Trail, 21st.dev 18471. Distance-spawned image trail;
// constrained to the introductory whitespace, three cards, automatic expiry.
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'motion/react';
import { atlasProjects } from '@/data/projectAtlas';
import styles from './ProjectEntrance.module.css';
type Item={id:number;x:number;y:number;rotation:number;image:number};
export function ProjectImageTrail(){
  const [trail,setTrail]=useState<Item[]>([]),count=useRef(0);
  useEffect(()=>{
    const fine=matchMedia('(hover: hover) and (pointer: fine)'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
    let last:{x:number;y:number}|null=null;const timers=new Set<ReturnType<typeof setTimeout>>();
    const clear=()=>{last=null;setTrail(t=>t.length?[]:t);};
    const move=(e:PointerEvent)=>{
      const target=e.target instanceof Element?e.target:null;
      if(e.pointerType!=='mouse'||!fine.matches||reduced.matches||!target?.closest('[data-project-intro]')||target.closest('a,button,canvas')){clear();return;}
      if(last&&Math.hypot(e.clientX-last.x,e.clientY-last.y)<140)return;
      last={x:e.clientX,y:e.clientY};const id=++count.current;
      setTrail(t=>[...t,{id,x:e.clientX,y:e.clientY,rotation:(id%3-1)*8,image:id%atlasProjects.length}].slice(-3));
      const timer=setTimeout(()=>{setTrail(t=>t.filter(i=>i.id!==id));timers.delete(timer);},600);timers.add(timer);
    };
    window.addEventListener('pointermove',move,{passive:true});window.addEventListener('scroll',clear,{passive:true});window.addEventListener('blur',clear);
    return()=>{window.removeEventListener('pointermove',move);window.removeEventListener('scroll',clear);window.removeEventListener('blur',clear);timers.forEach(clearTimeout);};
  },[]);
  return <div className={styles.trail} aria-hidden="true"><AnimatePresence>{trail.map((item,i)=><motion.div className={styles.trailImage} key={item.id} style={{left:item.x,top:item.y,zIndex:i}} initial={{opacity:0,scale:.5,rotate:item.rotation*1.5}} animate={{opacity:.9,scale:1,rotate:item.rotation}} exit={{opacity:0,scale:.3,rotate:item.rotation*.5}} transition={{duration:.4,ease:[.23,1,.32,1]}}><Image src={atlasProjects[item.image].image.src} alt="" fill sizes="100px"/></motion.div>)}</AnimatePresence></div>;
}
