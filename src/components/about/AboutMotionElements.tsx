"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";

type ImageProps = {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
};

/** Adapted from 21st.dev Scroll Reveal Image, component 24466. */
export function AboutScrollRevealImage({ src, alt, priority = false, className }: ImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 92%", "start 34%"] });
  const rawScale = useTransform(scrollYProgress, [0, 1], [1.025, 1]);
  const scale = useSpring(rawScale, { stiffness: 120, damping: 30, mass: 0.35 });

  return (
    <motion.figure
      ref={ref}
      data-about-21st="24466"
      className={className ?? "relative mx-auto mt-16 h-[clamp(26rem,52vw,48rem)] overflow-hidden sm:mt-20 lg:mt-24"}
    >
      <motion.div className="absolute inset-0" style={{ scale: reduce ? 1 : scale }}>
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes="(max-width: 1536px) 100vw, 1480px"
          className="object-cover object-center"
        />
      </motion.div>
    </motion.figure>
  );
}
