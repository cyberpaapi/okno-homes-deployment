'use client';
// uilayout.contact / Framer Carousel Thumbnails, 21st.dev demo 19082.
// Original spring track, velocity-aware dragging and expanding centered thumbnails.
import { useEffect, useRef } from 'react';
import { animate, motion, useMotionValue, useReducedMotion } from 'motion/react';
import Image from 'next/image';
import { thumbnailImageLoader } from '@/lib/thumbnailImageLoader';
import type { ProjectImage } from '@/data/projectAtlas';
import styles from './Elements.module.css';

export function PhotoCarousel({ images, index, setIndex, still }: { images: ProjectImage[]; index: number; setIndex: (index: number) => void; still: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const reduced = useReducedMotion();
  const dragging = useRef(false);
  const animation = useRef<ReturnType<typeof animate> | null>(null);
  useEffect(() => {
    const container = root.current;
    if (!container) return;
    const snap = (instant = false) => {
      animation.current?.stop();
      const target = -index * container.clientWidth;
      if (reduced || instant) x.set(target);
      else animation.current = animate(x, target, { type: 'spring', stiffness: 300, damping: 30 });
    };
    snap();
    let measuredWidth = container.clientWidth;
    const resize = new ResizeObserver(() => {
      if (container.clientWidth !== measuredWidth) { measuredWidth = container.clientWidth;if (!dragging.current) snap(true); }
    });
    resize.observe(container);
    return () => { resize.disconnect();animation.current?.stop(); };
  }, [index, reduced, x]);
  return <div ref={root} className={styles.carousel}>
    <motion.div className={styles.track} style={{ x }} drag={images.length > 1 ? 'x' : false} dragElastic={.2} dragMomentum={false}
      onDragStart={() => { dragging.current = true;animation.current?.stop(); }}
      onDragEnd={(_, info) => {
        dragging.current = false;
        const width = root.current?.clientWidth || 1;
        const delta = Math.abs(info.velocity.x) > 500 ? (info.velocity.x > 0 ? -1 : 1) : Math.abs(info.offset.x) > width * .3 ? (info.offset.x > 0 ? -1 : 1) : 0;
        const next = Math.max(0, Math.min(images.length - 1, index + delta));
        if (next !== index) setIndex(next);
        else { animation.current?.stop();animation.current = animate(x, -index * width, reduced ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 30 }); }
      }}>
      {images.map((image, i) => <div className={styles.slide} key={image.src} aria-hidden={i !== index}>
        {<div className={styles.drift} data-still={still || !!reduced}><Image src={image.src} alt={image.alt} fill priority={i === 0} sizes="(max-width:760px) 150vh, 100vw" draggable={false} /></div>}
      </div>)}
    </motion.div>
  </div>;
}

type Thumbnail = { src: string; label: string; film?: boolean };
const FULL = 100, COLLAPSED = 34, GAP = 5, MARGIN = 3;
export function CarouselThumbnails({ items, index, setIndex, label }: { items: Thumbnail[]; index: number; setIndex: (index: number) => void; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const center = () => root.scrollTo?.({ left: index * (COLLAPSED + GAP) + MARGIN - (root.clientWidth / 2 - FULL / 2), behavior: reduced ? 'instant' : 'smooth' });
    center();const observer = new ResizeObserver(center);observer.observe(root);
    return () => observer.disconnect();
  }, [index, reduced]);
  return <div ref={ref} className={styles.thumbnails} aria-label={label}><div className={styles.thumbnailTrack}>
    {items.map((item, i) => <motion.button key={item.src} type="button" aria-label={item.label} aria-pressed={i === index} onClick={() => setIndex(i)} initial={false} animate={i === index ? 'active' : 'inactive'}
      variants={{ active: { width: FULL, marginLeft: MARGIN, marginRight: MARGIN, opacity: 1 }, inactive: { width: COLLAPSED, marginLeft: 0, marginRight: 0, opacity: .55 } }}
      transition={{ duration: reduced ? 0 : .35, ease: 'easeOut' }}>
      <Image loader={thumbnailImageLoader} src={item.src} alt="" fill sizes="100px" draggable={false} />{item.film && <span aria-hidden="true">▷</span>}
    </motion.button>)}
  </div></div>;
}
