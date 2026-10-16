"use client";

// Victor Welander's Expandable Tabs, 21st demo 1428 / component 272 (MIT).
// Original source: docs/21st-source/configurator-1428.tsx.txt.
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import styles from "./Controls.module.css";

type Item = { id: string; title: string; icon: LucideIcon };
type Props = { items: Item[]; value: string | null; onChange: (value: string) => void; label: string; disabled?: boolean };

const buttonVariants = {
  initial: { gap: 0, paddingLeft: 10, paddingRight: 10 },
  animate: (selected: boolean) => ({ gap: selected ? 7 : 0, paddingLeft: selected ? 12 : 10, paddingRight: selected ? 12 : 10 }),
};
const spanVariants = { initial: { width: 0, opacity: 0 }, animate: { width: "auto", opacity: 1 }, exit: { width: 0, opacity: 0 } };

export default function ExpandableControls({ items, value, onChange, label, disabled }: Props) {
  const reduced = useReducedMotion();
  const transition = { duration: reduced ? 0 : .22, ease: [.22, 1, .36, 1] as const };
  return <div className={styles.expandable} role="group" aria-label={label}>
    {items.map(item => {
      const selected = value === item.id;
      const Icon = item.icon;
      return <motion.button key={item.id} type="button" variants={buttonVariants} initial={false} animate="animate" custom={selected}
        transition={transition} onClick={() => onChange(item.id)} className={styles.expandButton} data-selected={selected}
        disabled={disabled} aria-label={item.title} aria-pressed={selected} title={item.title}>
        <Icon size={18} strokeWidth={1.6} aria-hidden="true" />
        <AnimatePresence initial={false}>
          {selected && <motion.span variants={spanVariants} initial="initial" animate="animate" exit="exit" transition={transition} className={styles.expandLabel} aria-hidden="true">{item.title}</motion.span>}
        </AnimatePresence>
      </motion.button>;
    })}
  </div>;
}
