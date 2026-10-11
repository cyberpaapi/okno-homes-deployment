'use client';
// preetsuthar17 / Animated Tabs, 21st.dev demo 1962. Controlled, accessible adaptation.
import { useEffect, useRef } from 'react';
import styles from './Elements.module.css';

type Tab = { id: string; label: string; count?: number };
export function AnimatedTabs({ tabs, value, onChange }: { tabs: Tab[]; value: string; onChange: (id: string) => void }) {
  const root = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = root.current;
    if (!container) return;
    const measure = () => {
      const active = container.querySelector<HTMLButtonElement>('[aria-pressed="true"]');
      if (!active || !overlay.current || !container.offsetWidth) return;
      const left = active.offsetLeft, right = left + active.offsetWidth;
      overlay.current.style.clipPath = `inset(4px ${container.offsetWidth - right}px 4px ${left}px round 24px)`;
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, [value]);
  return <div ref={root} className={styles.tabs} role="group" aria-label="Gallery media" onKeyDown={(event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();event.stopPropagation();
    const index = tabs.findIndex(tab => tab.id === value);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    onChange(tabs[next].id);root.current?.querySelectorAll('button')[next]?.focus();
  }}>
    <div ref={overlay} className={styles.tabOverlay} aria-hidden="true">{tabs.map(tab => <span key={tab.id}>{tab.label} {tab.count !== undefined && <small>{tab.count}</small>}</span>)}</div>
    {tabs.map(tab => <button key={tab.id} type="button" aria-pressed={value === tab.id} onClick={() => onChange(tab.id)}>{tab.label} {tab.count !== undefined && <small>{tab.count}</small>}</button>)}
  </div>;
}
