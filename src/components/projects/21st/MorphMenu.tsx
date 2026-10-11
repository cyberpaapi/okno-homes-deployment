'use client';
// aayush-duhan / Liquid Morph Floating Menu, 21st.dev demo 16369.
// Retains the morphing shell, expanding circle, stagger and rolling letters.
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import styles from './MorphMenu.module.css';
const ease = [.22, 1, .36, 1] as const;
type Item = { href: string; label: string };

export function RollingLink({ href, label, current, onClick }: Item & { current?: boolean; onClick?: () => void }) {
  return <Link href={href} className={styles.rolling} aria-label={label} aria-current={current ? 'page' : undefined} onClick={onClick}>
    <span aria-hidden="true" className={styles.letters}>{[...label].map((char, i) => <span className={styles.char} key={i}><span style={{ transitionDelay: `${i * 18}ms` }}><span>{char === ' ' ? '\u00a0' : char}</span><span>{char === ' ' ? '\u00a0' : char}</span></span></span>)}</span>
  </Link>;
}

export function MorphMenu({ items, alwaysVisible = false }: { items: Item[]; alwaysVisible?: boolean }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setOpen(false);toggle.current?.focus(); } };
    const desktop = window.matchMedia('(min-width:761px)');
    const close = () => { if (desktop.matches && !alwaysVisible) setOpen(false); };
    document.addEventListener('pointerdown', outside);document.addEventListener('keydown', escape);desktop.addEventListener('change', close);
    return () => { document.removeEventListener('pointerdown', outside);document.removeEventListener('keydown', escape);desktop.removeEventListener('change', close); };
  }, [open, alwaysVisible]);
  const duration = reduced ? 0 : .7;
  return <div className={`${styles.position} ${alwaysVisible ? styles.always : ""}`} ref={root}>
    <motion.div className={styles.shell} initial={false} animate={{ width: open ? 278 : 100, height: open ? 448 : 42, borderRadius: open ? 24 : 30 }} transition={{ duration, ease }}>
      <motion.div className={styles.circle} aria-hidden="true" initial={false} animate={{ bottom: open ? '-20%' : '-200%' }} transition={{ duration, ease }} />
      <button ref={toggle} className={styles.toggle} type="button" aria-expanded={open} aria-controls="projects-mobile-menu" aria-label={open ? 'Close navigation' : 'Open navigation'} onClick={() => setOpen(!open)} data-open={open}>
        <span>{open ? 'Close' : 'Menu'}</span><span className={styles.icon} aria-hidden="true"><motion.i animate={{ rotate: open ? 45 : 0, y: open ? 0 : -3 }} transition={{ duration: reduced ? 0 : .3 }} /><motion.i animate={{ rotate: open ? -45 : 0, y: open ? 0 : 3 }} transition={{ duration: reduced ? 0 : .3 }} /></span>
      </button>
      <nav id="projects-mobile-menu" className={styles.links} aria-label="Mobile navigation" inert={!open} aria-hidden={!open}>
        {items.map((item, i) => <motion.div key={item.href} initial={false} animate={{ opacity: open ? 1 : 0, y: open ? 0 : 8 }} transition={{ duration: reduced ? 0 : .4, delay: open && !reduced ? .16 + .035 * i : 0, ease }}>
          <RollingLink {...item} current={item.href === '/projects'} onClick={() => setOpen(false)} />
        </motion.div>)}
      </nav>
    </motion.div>
  </div>;
}
