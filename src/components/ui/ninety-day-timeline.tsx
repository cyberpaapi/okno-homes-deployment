"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { useEffect, useRef, useState } from "react";

export type TimelineStage = {
  days: string;
  title: string;
  description: string;
};

type NinetyDayTimelineProps = {
  stages: TimelineStage[];
};

/**
 * Adapted from 21st.dev Timeline #857 by manuarora700.
 * Retains the sticky stage heading and scroll-following beam while replacing
 * the demo changelog with OKNO's 90-day delivery sequence.
 */
export function NinetyDayTimeline({ stages }: NinetyDayTimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    const timeline = timelineRef.current;
    if (!timeline) return;

    const updateHeight = () => setHeight(timeline.getBoundingClientRect().height);
    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(timeline);
    return () => observer.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 18%", "end 70%"],
  });
  const beamHeight = useTransform(scrollYProgress, [0, 1], [0, height]);
  const beamOpacity = useTransform(scrollYProgress, [0, 0.06], [0, 1]);

  return (
    <div ref={containerRef} className="relative w-full">
      <div ref={timelineRef} className="relative pb-10 sm:pb-16">
        {stages.map((stage) => (
          <article
            key={stage.days}
            className="relative grid min-h-[31rem] grid-cols-[3.25rem_1fr] items-start gap-5 pt-16 sm:min-h-[34rem] sm:grid-cols-[4rem_1fr] sm:gap-8 sm:pt-24 lg:min-h-[42rem] lg:grid-cols-[minmax(17rem,.72fr)_minmax(0,1.28fr)] lg:gap-20 lg:pt-32"
          >
            <div className="sticky top-28 z-20 self-start lg:top-36">
              <div className="absolute left-[1.08rem] top-1.5 grid size-9 -translate-x-1/2 place-items-center rounded-full bg-[#f3efe7] sm:left-[1.58rem] sm:size-10 lg:left-[1.55rem]">
                <motion.span
                  className="size-3 rounded-full border border-[#315840] bg-[#9eb39f]"
                  initial={reduce ? false : { scale: 0.6, opacity: 0.45 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: false, amount: 0.8 }}
                  transition={{ type: "spring", stiffness: 240, damping: 22 }}
                />
              </div>
              <p className="hidden pl-20 text-[clamp(2.25rem,4vw,4.8rem)] font-medium leading-[.92] tracking-[-.065em] text-[#224331] lg:block">
                {stage.days}
              </p>
            </div>

            <motion.div
              className="col-start-2 border-t border-[#142018]/22 pt-7 lg:pt-9"
              initial={reduce ? false : { opacity: 0.32, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.52 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="text-xl font-medium tracking-[-.035em] text-[#8b5f45] sm:text-2xl lg:hidden">{stage.days}</p>
              <h3 className="mt-4 max-w-[13ch] text-[clamp(2.35rem,5.2vw,5.8rem)] font-medium leading-[.9] tracking-[-.068em] lg:mt-0">
                {stage.title}
              </h3>
              <p className="mt-8 max-w-xl text-base leading-8 text-[#142018]/64 sm:text-lg lg:mt-10 lg:text-xl lg:leading-9">
                {stage.description}
              </p>
            </motion.div>
          </article>
        ))}

        <div
          aria-hidden="true"
          className="absolute left-[1.02rem] top-16 w-px overflow-hidden bg-[#142018]/18 sm:left-[1.52rem] sm:top-24 lg:left-[1.48rem] lg:top-32"
          style={{ height: Math.max(0, height - 128) }}
        >
          <motion.div
            className="absolute inset-x-0 top-0 w-px bg-gradient-to-b from-[#b58463] via-[#315840] to-[#173225]"
            style={{ height: reduce ? Math.max(0, height - 128) : beamHeight, opacity: reduce ? 1 : beamOpacity }}
          />
        </div>
      </div>
    </div>
  );
}
