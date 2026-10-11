"use client";

// Adapted from bookmarked 21st.dev Reveal Text by isaiahBjork (component 2491).
// The title keeps its masked token rise; the vision treatment maps the same
// token sequencing to scroll progress instead of hover or decorative imagery.
import { Fragment, useMemo, useRef } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;

type HeadingRevealProps = {
  text: string;
  amount?: number;
  className?: string;
};

export function AboutHeadingReveal({ text, amount = 0.45, className = "" }: HeadingRevealProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const visible = useInView(ref, { once: true, amount });
  const reduce = useReducedMotion();
  const words = useMemo(() => text.trim().split(/\s+/), [text]);

  return (
    <span ref={ref} className={className} data-about-heading-reveal data-about-21st="2491">
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, index) => (
          <Fragment key={`${word}-${index}`}>
            {index > 0 ? " " : null}
            <span className="inline-flex overflow-hidden pb-[0.08em] align-bottom">
              <motion.span
                className="inline-block"
                initial={reduce ? false : { y: "108%", opacity: 0, filter: "blur(5px)" }}
                animate={visible ? { y: "0%", opacity: 1, filter: "blur(0px)" } : undefined}
                transition={
                  reduce
                    ? { duration: 0 }
                    : { duration: 0.74, delay: Math.min(index * 0.075, 0.42), ease: EASE }
                }
              >
                {word}
              </motion.span>
            </span>
          </Fragment>
        ))}
      </span>
    </span>
  );
}

type ScrollWordProps = {
  progress: MotionValue<number>;
  word: string;
  start: number;
  end: number;
};

function ScrollWord({ progress, word, start, end }: ScrollWordProps) {
  const color = useTransform(progress, [start, end], ["rgba(226,235,224,0.3)", "rgba(238,243,234,0.96)"]);
  const y = useTransform(progress, [start, end], [7, 0]);

  return (
    <motion.span className="inline-block" style={{ color, y }}>
      {word}
    </motion.span>
  );
}

type ScrollTextProps = {
  text: string;
  className?: string;
};

export function AboutScrollText({ text, className = "" }: ScrollTextProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  const words = useMemo(() => text.trim().split(/\s+/), [text]);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 88%", "end 48%"],
  });

  if (reduce) {
    return (
      <p ref={ref} className={className} data-about-scroll-text>
        {text}
      </p>
    );
  }

  return (
    <p ref={ref} className={className} aria-label={text} data-about-scroll-text>
      <span aria-hidden="true">
        {words.map((word, index) => {
          const start = (index / words.length) * 0.86;
          const end = Math.min(start + 0.14, 1);

          return (
            <Fragment key={`${word}-${index}`}>
              {index > 0 ? " " : null}
              <ScrollWord progress={scrollYProgress} word={word} start={start} end={end} />
            </Fragment>
          );
        })}
      </span>
    </p>
  );
}
