'use client';
// uilayout.contact / Smooth Scroll, 21st.dev demo 2836 (Lenis integration).
import { useEffect } from 'react';
import Lenis from 'lenis';
import { usePathname } from 'next/navigation';
import 'lenis/dist/lenis.css';
export function ProjectsSmoothScroll(){
  const pathname=usePathname();
  useEffect(()=>{
    if(pathname!=='/projects'&&!pathname?.startsWith('/projects/'))return;
    const media=window.matchMedia('(prefers-reduced-motion: reduce)');
    let lenis:Lenis|undefined;
    const syncLock=()=>{if(document.hidden||document.body.style.overflow==='hidden')lenis?.stop();else lenis?.start();};
    const setup=()=>{lenis?.destroy();lenis=undefined;if(!media.matches){lenis=new Lenis({autoRaf:true,lerp:.2,smoothWheel:true,syncTouch:false,anchors:true,prevent:node=>!!node.closest('[role="dialog"], [data-lenis-prevent]')});syncLock();}};
    setup();media.addEventListener('change',setup);
    const observer=new MutationObserver(syncLock);observer.observe(document.body,{attributes:true,attributeFilter:['style']});
    document.addEventListener('visibilitychange',syncLock);
    return()=>{observer.disconnect();media.removeEventListener('change',setup);document.removeEventListener('visibilitychange',syncLock);lenis?.stop();lenis?.destroy();lenis=undefined;};
  },[pathname]);
  return null;
}
