"use client";

// Julien Thibeaut's Dock, 21st demo 990 / component 233 (MIT).
// Original source: docs/21st-source/configurator-990.tsx.txt.
import { createContext, useContext, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue, type SpringOptions } from "motion/react";
import { Check } from "lucide-react";
import styles from "./Controls.module.css";

type Context = { mouseX: MotionValue<number>; spring: SpringOptions; reduced: boolean };
const DockContext = createContext<Context | null>(null);
const spring = { mass: .1, stiffness: 180, damping: 18 };
type DockOption = { id: string; label: string; image: string };

function useDock() {
  const value = useContext(DockContext);
  if (!value) throw new Error("Scene dock controls require a Dock provider");
  return value;
}

function Dock({ children }: { children: ReactNode }) {
  const mouseX = useMotionValue(Infinity);
  const reduced = Boolean(useReducedMotion());
  return <motion.div className={styles.dock} role="group" aria-label="Scene background"
    onPointerMove={event => { if (!reduced && event.pointerType === "mouse") mouseX.set(event.clientX); }}
    onPointerLeave={() => mouseX.set(Infinity)}>
    <DockContext.Provider value={{ mouseX, spring, reduced }}>{children}</DockContext.Provider>
  </motion.div>;
}

function DockLabel({ children, hovered, id }: { children: ReactNode; hovered: MotionValue<number>; id: string }) {
  const [visible, setVisible] = useState(false);
  const { reduced } = useDock();
  useEffect(() => hovered.on("change", value => setVisible(value === 1)), [hovered]);
  return <AnimatePresence>{visible && <motion.span id={id} role="tooltip" className={styles.dockLabel} style={{ x: "-50%" }}
    initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 3 }}
    transition={{ duration: reduced ? 0 : .15 }}>{children}</motion.span>}</AnimatePresence>;
}

function DockIcon({ image, width }: { image: string; width: MotionValue<number> }) {
  const iconWidth = useTransform(width, value => value - 8);
  return <motion.span className={styles.dockIcon} style={{ width: iconWidth, backgroundImage: `url(${image})` }} aria-hidden="true" />;
}

function DockItem({ option, selected, disabled, onSelect }: { option: DockOption; selected: boolean; disabled?: boolean; onSelect: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  const id = useId();
  const { mouseX, spring, reduced } = useDock();
  const hovered = useMotionValue(0);
  const distance = useTransform(mouseX, value => { const rect = ref.current?.getBoundingClientRect(); return value - (rect?.x ?? 0) - (rect?.width ?? 0) / 2; });
  const transform = useTransform(distance, [-100, 0, 100], [44, 54, 44]);
  const width = useSpring(transform, spring);
  return <motion.button ref={ref} type="button" className={styles.dockItem} style={{ width: reduced ? 44 : width }}
    disabled={disabled} onClick={onSelect} onHoverStart={() => hovered.set(1)} onHoverEnd={() => hovered.set(0)}
    onFocus={() => hovered.set(1)} onBlur={() => hovered.set(0)} aria-label={option.label} aria-pressed={selected}
    aria-describedby={id} data-selected={selected}>
    <DockIcon image={option.image} width={width} /><DockLabel id={id} hovered={hovered}>{option.label}</DockLabel>
    {selected && <Check size={12} className={styles.dockCheck} aria-hidden="true" />}
  </motion.button>;
}

export default function SceneDock({ options, value, onChange, disabled }: { options: DockOption[]; value: string; onChange: (value: string) => void; disabled?: boolean }) {
  return <Dock>{options.map(option => <DockItem key={option.id} option={option} selected={value === option.id} disabled={disabled} onSelect={() => onChange(option.id)} />)}</Dock>;
}
