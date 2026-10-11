'use client';
// dillionverma / Hero Video Dialog, 21st.dev demo 1107: center-scale spring dialog.
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { AtlasProject } from '@/data/projectAtlas';
import styles from './ProjectCinema.module.css';
export function ProjectFilmDialog({ project, onOpenChange }: { project: AtlasProject; onOpenChange?: (open: boolean) => void }) {
  const [open, setOpen] = useState(false), [index, setIndex] = useState(0);
  const reduced = useReducedMotion();
  const dialog = useRef<HTMLDivElement>(null), trigger = useRef<HTMLButtonElement>(null);
  const visibleIndex = Math.max(0, Math.min(index, project.films.length - 1));
  const film = project.films[visibleIndex];
  const visibleOpen = open && !!film;
  useEffect(() => {
    if (!film && open) queueMicrotask(() => { setOpen(false);onOpenChange?.(false); });
  }, [film, open, onOpenChange]);
  useEffect(() => {
    if (!visibleOpen) return;
    const old = document.body.style.overflow, opener = trigger.current;
    document.body.style.overflow = 'hidden';
    const frame = requestAnimationFrame(() => dialog.current?.focus());
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false);onOpenChange?.(false); }
      if (event.key === 'Tab') {
        const focusable = dialog.current?.querySelectorAll<HTMLElement>('button,video');
        if (!focusable?.length) return;
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) { event.preventDefault();last.focus(); }
        else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog.current)) { event.preventDefault();first.focus(); }
      }
    };
    document.addEventListener('keydown',key);
    return () => { cancelAnimationFrame(frame);document.body.style.overflow=old;document.removeEventListener('keydown',key);opener?.focus({preventScroll:true}); };
  },[visibleOpen,onOpenChange]);
  if (!film) return null;
  const close = () => { setOpen(false);onOpenChange?.(false); };
  return <><button ref={trigger} type="button" className={styles.watch} onClick={() => { setOpen(true);onOpenChange?.(true); }} aria-label={`Watch ${project.title} films`}><span className={styles.play} aria-hidden="true">▷</span></button>
    {typeof document !== 'undefined' && createPortal(<AnimatePresence>{visibleOpen && <motion.div className={styles.backdrop} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={close}>
      <motion.div ref={dialog} role="dialog" aria-modal="true" aria-label={`${project.title} film player`} tabIndex={-1} className={styles.dialog} onClick={event=>event.stopPropagation()} initial={reduced ? false : {scale:.5,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:reduced ? 1 : .9,opacity:0}} transition={{type:'spring',damping:30,stiffness:300}}>
        <div className={styles.dialogHeader}><span>{project.title} </span><button type="button" onClick={close} aria-label="Close film">×</button></div>
        <video key={film.src} src={film.src} poster={film.poster} controls playsInline autoPlay preload="metadata" aria-label={film.title} />
        {project.films.length>1 && <div className={styles.filmChoices} aria-label="Project films">{project.films.map((item,i)=><button type="button" key={item.src} aria-pressed={visibleIndex===i} aria-label={`Play ${item.title}`} onClick={()=>setIndex(i)}><span aria-hidden="true">▷</span> {item.title}</button>)}</div>}
      </motion.div>
    </motion.div>}</AnimatePresence>,document.body)}
  </>;
}
