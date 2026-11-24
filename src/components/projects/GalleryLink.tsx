'use client';

import { useEffect, useState, type ReactNode, type Ref } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'motion/react';
import { type AtlasProject } from '@/data/projectAtlas';
import styles from './GalleryLink.module.css';

type Props = {
  project: AtlasProject; children: ReactNode; className?: string; ariaLabel?: string;
  onPointerEnter?: () => void; onFocus?: () => void; markerRef?: Ref<HTMLAnchorElement>;
  active?: boolean;
};

/** Keep the chosen photograph in place while the gallery route opens. */
export default function GalleryLink({ project, children, className, ariaLabel, onPointerEnter, onFocus, markerRef, active }: Props) {
  const router = useRouter();
  const reduced = useReducedMotion();
  const [navigating, setNavigating] = useState(false);
  // Navigation has a bounded deadline even when a browser suspends animation callbacks.
  useEffect(() => {
    if (!navigating) return;
    const navigation = window.setTimeout(() => router.push(project.href), 160);
    return () => window.clearTimeout(navigation);
  }, [navigating, project.href, router]);
  return <>
    <Link href={project.href} className={className} ref={markerRef} prefetch={false} aria-label={ariaLabel} data-active={active}
      onPointerEnter={() => { onPointerEnter?.();router.prefetch(project.href); }}
      onFocus={() => { onFocus?.();router.prefetch(project.href); }}
      onClick={(event) => {
        if (reduced || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
        event.preventDefault();
        if (navigating) return;
        setNavigating(true);
      }}>{children}</Link>
    {navigating && createPortal(<motion.div className={styles.transition} aria-hidden="true"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      transition={{ duration: .16, ease: 'easeOut' }} />, document.body)}
  </>;
}
