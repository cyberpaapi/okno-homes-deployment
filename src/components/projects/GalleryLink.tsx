'use client';

import { useEffect, useState, type ReactNode, type Ref } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, useReducedMotion } from 'motion/react';
import { type AtlasProject } from '@/data/projectAtlas';
import styles from './GalleryLink.module.css';

type Props = {
  project: AtlasProject; children: ReactNode; className?: string; ariaLabel?: string;
  onPointerEnter?: () => void; onFocus?: () => void; markerRef?: Ref<HTMLAnchorElement>;
  active?: boolean;
};

/** Expand the actual selected photograph into its destination's hero. */
export default function GalleryLink({ project, children, className, ariaLabel, onPointerEnter, onFocus, markerRef, active }: Props) {
  const router = useRouter();
  const reduced = useReducedMotion();
  const [bounds, setBounds] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  // Navigation has a bounded deadline even when a browser suspends animation callbacks.
  useEffect(() => {
    if (!bounds) return;
    const navigation = window.setTimeout(() => router.push(project.href), 650);
    return () => window.clearTimeout(navigation);
  }, [bounds, project.href, router]);
  return <>
    <Link href={project.href} className={className} ref={markerRef} prefetch={false} aria-label={ariaLabel} data-active={active}
      onPointerEnter={() => { onPointerEnter?.();router.prefetch(project.href); }}
      onFocus={() => { onFocus?.();router.prefetch(project.href); }}
      onClick={(event) => {
        if (reduced || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
        event.preventDefault();
        if (bounds) return;
        const anchor = event.currentTarget;
        const rect = (anchor.querySelector('img') ?? anchor).getBoundingClientRect();
        setBounds({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
      }}>{children}</Link>
    {bounds && createPortal(<motion.div className={styles.transition} aria-hidden="true"
      initial={{ ...bounds, opacity: .7 }}
      animate={{ top: 0, left: 0, width: '100vw', height: '100dvh', opacity: 1 }}
      transition={{ duration: .65, ease: [.22, 1, .36, 1] }}>
      <Image src={project.image.src} alt="" fill sizes="100vw" priority />
    </motion.div>, document.body)}
  </>;
}
