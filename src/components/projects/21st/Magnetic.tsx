'use client';

// Adapted from bundui's Magnetic Button, retrieved through 21st.dev MCP (demo 1507).
// Preserve the source's cursor-distance / spring interaction; local pointer events
// avoid one document listener per control. Native elements retain focus semantics.
import { useRef, type PointerEvent } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useSpring, useReducedMotion, type HTMLMotionProps } from 'motion/react';

const SPRING_CONFIG = { damping: 100, stiffness: 400 };
const MotionLink = motion.create(Link);

function useMagnetic<T extends HTMLElement>(distance: number) {
  const ref = useRef<T>(null);
  const reduced = useReducedMotion();
  const x = useMotionValue(0), y = useMotionValue(0);
  const springX = useSpring(x, SPRING_CONFIG), springY = useSpring(y, SPRING_CONFIG);
  const reset = () => { x.set(0); y.set(0); };
  return {
    ref,
    style: { x: reduced ? 0 : springX, y: reduced ? 0 : springY },
    onPointerMove: (event: PointerEvent<T>) => {
      if (reduced || event.pointerType !== 'mouse' || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      x.set((event.clientX - rect.left - rect.width / 2) * distance);
      y.set((event.clientY - rect.top - rect.height / 2) * distance);
    },
    onPointerLeave: reset,
    onPointerCancel: reset,
    onBlur: reset,
  };
}

export function MagneticButton({ distance = .18, style, ...props }: HTMLMotionProps<'button'> & { distance?: number }) {
  const magnetic = useMagnetic<HTMLButtonElement>(distance);
  return <motion.button type="button" {...props} {...magnetic} style={{ ...style, ...magnetic.style }} />;
}

export function MagneticLink({ distance = .12, style, ...props }: React.ComponentProps<typeof MotionLink> & { distance?: number }) {
  const magnetic = useMagnetic<HTMLAnchorElement>(distance);
  return <MotionLink {...props} {...magnetic} style={{ ...style, ...magnetic.style }} />;
}
