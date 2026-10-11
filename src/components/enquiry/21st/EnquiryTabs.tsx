"use client";

import { motion, useReducedMotion } from "motion/react";
import { useId, useLayoutEffect, useRef, useState } from "react";
import styles from "./EnquiryTabs.module.css";

type EnquiryTab = {
  label: string;
  value: string;
  accessibleLabel?: string;
};

type Indicator = {
  left: number;
  width: number;
};

type EnquiryTabsProps = {
  items: EnquiryTab[];
  value: string;
  onValueChange: (value: string) => void;
};

// Adapted from 21st.dev component 26923 by micka_design.
// The measured spring indicators and fluid hover layer are retained while the
// Base UI dependency is replaced with native tab semantics and keyboard input.
export default function EnquiryTabs({ items, value, onValueChange }: EnquiryTabsProps) {
  const groupRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef(new Map<string, HTMLButtonElement>());
  const [selected, setSelected] = useState<Indicator>({ left: 0, width: 0 });
  const [hovered, setHovered] = useState<Indicator | null>(null);
  const reducedMotion = useReducedMotion();
  const baseId = useId();

  const measure = (itemValue: string): Indicator => {
    const group = groupRef.current?.getBoundingClientRect();
    const button = buttonRefs.current.get(itemValue)?.getBoundingClientRect();
    if (!group || !button) return { left: 0, width: 0 };
    return { left: button.left - group.left, width: button.width };
  };

  useLayoutEffect(() => {
    const update = () => setSelected(measure(value));
    update();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", update);
      return () => window.removeEventListener("resize", update);
    }

    const observer = new ResizeObserver(update);
    if (groupRef.current) observer.observe(groupRef.current);
    return () => observer.disconnect();
  }, [value]);

  const selectAt = (index: number) => {
    const next = items[(index + items.length) % items.length];
    onValueChange(next.value);
    buttonRefs.current.get(next.value)?.focus();
  };

  return (
    <div
      ref={groupRef}
      className={styles.tabs}
      role="tablist"
      aria-label="Enquiry type"
      onMouseLeave={() => setHovered(null)}
      data-component="26923"
    >
      {hovered ? (
        <motion.span
          aria-hidden="true"
          className={styles.hoverIndicator}
          animate={hovered}
          transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 30 }}
        />
      ) : null}
      <motion.span
        aria-hidden="true"
        className={styles.selectedIndicator}
        animate={selected}
        transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
      />
      {items.map((item, index) => {
        const active = item.value === value;
        return (
          <button
            ref={(node) => {
              if (node) buttonRefs.current.set(item.value, node);
              else buttonRefs.current.delete(item.value);
            }}
            id={`${baseId}-${item.value}-tab`}
            key={item.value}
            className={styles.tab}
            type="button"
            role="tab"
            aria-controls={`enquiry-${item.value}-panel`}
            aria-label={item.accessibleLabel ?? item.label}
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            data-magnetic
            onClick={() => onValueChange(item.value)}
            onMouseEnter={() => setHovered(measure(item.value))}
            onFocus={() => setHovered(measure(item.value))}
            onBlur={() => setHovered(null)}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight") {
                event.preventDefault();
                selectAt(index + 1);
              } else if (event.key === "ArrowLeft") {
                event.preventDefault();
                selectAt(index - 1);
              } else if (event.key === "Home") {
                event.preventDefault();
                selectAt(0);
              } else if (event.key === "End") {
                event.preventDefault();
                selectAt(items.length - 1);
              }
            }}
          >
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
