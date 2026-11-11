'use client';
// ayushmxxn / Masonry Lightbox, 21st.dev 26223. Original intrinsic-ratio columns,
// blur/stagger entrance, hover lift and shared-layout spring viewer. Adapted for
// architectural image sizes; added keyboard navigation and focus containment.
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'motion/react';
import type { ProjectImage } from '@/data/projectAtlas';
import { MagneticButton } from './Magnetic';
import { CarouselThumbnails } from './PhotoCarousel';
import styles from './MasonryLightbox.module.css';

/** `even` lays the photographs out in equal rows instead of staggered columns. */
export function MasonryLightbox({ images, title, even = false }: { images: ProjectImage[]; title: string; even?: boolean }) {
  const [selected, setSelected] = useState<number | null>(null);
  const visibleIndex = selected === null || !images.length ? null : Math.min(selected, images.length - 1);
  const reduced = useReducedMotion();
  const dialog = useRef<HTMLDivElement>(null), opener = useRef<HTMLButtonElement | null>(null);
  const open = visibleIndex !== null;
  const step = useCallback((delta: number) => setSelected(index => index === null ? null : (index + delta + images.length) % images.length), [images.length]);
  useEffect(() => {
    if (!open) return;
    const overflow = document.body.style.overflow, padding = document.body.style.paddingRight, returnFocus = opener.current;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    const frame = requestAnimationFrame(() => dialog.current?.focus());
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelected(null);
      if (images.length > 1 && ['ArrowRight', 'ArrowLeft'].includes(event.key)) { event.preventDefault();step(event.key === 'ArrowRight' ? 1 : -1); }
      if (event.key === 'Tab') {
        const buttons = dialog.current?.querySelectorAll<HTMLButtonElement>('button');
        if (!buttons?.length) return;
        const first = buttons[0], last = buttons[buttons.length - 1];
        if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) { event.preventDefault();last.focus(); }
        else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog.current)) { event.preventDefault();first.focus(); }
      }
    };
    window.addEventListener('keydown', key);
    return () => { cancelAnimationFrame(frame);document.body.style.overflow = overflow;document.body.style.paddingRight = padding;window.removeEventListener('keydown', key);returnFocus?.focus({ preventScroll: true }); };
  }, [open, images.length, step]);
  const image = visibleIndex === null ? null : images[visibleIndex];
  return <LayoutGroup id={`masonry-${title}`}><div className={styles.grid} data-single={images.length === 1} data-even={even}>
    {images.map((item, i) => <motion.button key={item.src} type="button" layoutId={reduced ? undefined : `photo-${i}`} className={styles.tile} aria-label={`View photograph ${i + 1}`}
      onClick={event => { opener.current = event.currentTarget;setSelected(i); }}
      initial={reduced ? false : { opacity: 0, y: 16, filter: 'blur(6px)' }} whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }} viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: reduced ? 0 : .6, delay: reduced ? 0 : (i % 12) * .05, ease: [.22, 1, .36, 1] }} whileHover={reduced ? undefined : { y: -3 }}>
      <Image src={item.src} alt={item.alt} width={item.width ?? 2400} height={item.height ?? 1600} sizes={images.length === 1 ? '90vw' : '(max-width:600px) 90vw, 46vw'} priority={i < 2} />
    </motion.button>)}
  </div>
  {typeof document !== 'undefined' && createPortal(<AnimatePresence>{image && visibleIndex !== null && <motion.div className={styles.backdrop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : .25 }} onClick={() => setSelected(null)} data-lenis-prevent>
    <div ref={dialog} role="dialog" aria-modal="true" aria-label={`${title} fullscreen photograph`} tabIndex={-1} className={styles.dialog}>
      <motion.div key={image.src} layoutId={reduced ? undefined : `photo-${visibleIndex}`} className={styles.frame} transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 28 }} onClick={event => event.stopPropagation()}>
        <Image src={image.src} alt={image.alt} width={image.width ?? 2400} height={image.height ?? 1600} sizes="94vw" unoptimized priority />
      </motion.div>
      <motion.button className={styles.close} aria-label="Close fullscreen photograph" onClick={() => setSelected(null)} initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: reduced ? 0 : .15 }}><svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 2L14 14M14 2L2 14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" /></svg></motion.button>
      {images.length > 1 && <div className={styles.navigation} onClick={event => event.stopPropagation()}>
        <MagneticButton aria-label="Previous photograph" onClick={() => step(-1)}>←</MagneticButton>
        <CarouselThumbnails items={images.map((item, i) => ({ src: item.src, label: `Show photograph ${i + 1}` }))} index={visibleIndex} setIndex={setSelected} label="Project photographs" />
        <MagneticButton aria-label="Next photograph" onClick={() => step(1)}>→</MagneticButton>
      </div>}
      <span className={styles.srOnly} aria-live="polite">Photograph {visibleIndex + 1} of {images.length}</span>
    </div>
  </motion.div>}</AnimatePresence>, document.body)}
  </LayoutGroup>;
}
