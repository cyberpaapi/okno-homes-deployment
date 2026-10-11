"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { motion, type Transition } from "motion/react";

import { cn } from "@/lib/utils";

interface TextProps {
  children: ReactNode;
  reverse?: boolean;
  transition?: Transition;
  splitBy?: "words" | "characters" | "lines" | string;
  staggerDuration?: number;
  staggerFrom?: "first" | "last" | "center" | "random" | number;
  containerClassName?: string;
  wordLevelClassName?: string;
  elementLevelClassName?: string;
  onClick?: () => void;
  onStart?: () => void;
  onComplete?: () => void;
  autoStart?: boolean;
}

export interface VerticalCutRevealRef {
  startAnimation: () => void;
  reset: () => void;
}

interface WordObject {
  characters: string[];
  needsSpace: boolean;
}

const VerticalCutReveal = forwardRef<VerticalCutRevealRef, TextProps>(
  (
    {
      children,
      reverse = false,
      transition = { type: "spring", stiffness: 190, damping: 22 },
      splitBy = "words",
      staggerDuration = 0.2,
      staggerFrom = "first",
      containerClassName,
      wordLevelClassName,
      elementLevelClassName,
      onClick,
      onStart,
      onComplete,
      autoStart = true,
      ...props
    },
    ref,
  ) => {
    const containerRef = useRef<HTMLSpanElement>(null);
    const text = typeof children === "string" ? children : children?.toString() || "";
    const [isAnimating, setIsAnimating] = useState(false);

    const splitIntoCharacters = (value: string): string[] => {
      if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
        const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
        return Array.from(segmenter.segment(value), ({ segment }) => segment);
      }
      return Array.from(value);
    };

    const elements = useMemo(() => {
      const words = text.split(" ");
      if (splitBy === "characters") {
        return words.map((word, index) => ({
          characters: splitIntoCharacters(word),
          needsSpace: index !== words.length - 1,
        }));
      }
      return splitBy === "words"
        ? text.split(" ")
        : splitBy === "lines"
          ? text.split("\n")
          : text.split(splitBy);
    }, [text, splitBy]);

    const getStaggerDelay = useCallback(
      (index: number) => {
        const total =
          splitBy === "characters"
            ? elements.reduce(
                (acc, word) =>
                  acc +
                  (typeof word === "string"
                    ? 1
                    : word.characters.length + (word.needsSpace ? 1 : 0)),
                0,
              )
            : elements.length;
        if (staggerFrom === "first") return index * staggerDuration;
        if (staggerFrom === "last") return (total - 1 - index) * staggerDuration;
        if (staggerFrom === "center") return Math.abs(Math.floor(total / 2) - index) * staggerDuration;
        if (staggerFrom === "random") return Math.abs(Math.floor(Math.random() * total) - index) * staggerDuration;
        return Math.abs(staggerFrom - index) * staggerDuration;
      },
      [elements, splitBy, staggerFrom, staggerDuration],
    );

    const startAnimation = useCallback(() => {
      setIsAnimating(true);
      onStart?.();
    }, [onStart]);

    useImperativeHandle(ref, () => ({ startAnimation, reset: () => setIsAnimating(false) }));

    useEffect(() => {
      if (autoStart) startAnimation();
    }, [autoStart, startAnimation]);

    const variants = {
      hidden: { y: reverse ? "-100%" : "100%" },
      visible: (index: number) => ({
        y: 0,
        transition: {
          ...transition,
          delay: ((transition?.delay as number) || 0) + getStaggerDelay(index),
        },
      }),
    };

    return (
      <span
        className={cn(containerClassName, "flex flex-wrap whitespace-pre-wrap", splitBy === "lines" && "flex-col")}
        onClick={onClick}
        ref={containerRef}
        {...props}
      >
        <span className="sr-only">{text}</span>
        {(splitBy === "characters"
          ? (elements as WordObject[])
          : (elements as string[]).map((element, index) => ({
              characters: [element],
              needsSpace: index !== elements.length - 1,
            }))
        ).map((word, wordIndex, array) => {
          const previousCharacters = array
            .slice(0, wordIndex)
            .reduce((sum, item) => sum + item.characters.length, 0);

          return (
            <span key={wordIndex} aria-hidden="true" className={cn("inline-flex overflow-hidden", wordLevelClassName)}>
              {word.characters.map((character, characterIndex) => (
                <span className={cn(elementLevelClassName, "relative whitespace-pre-wrap")} key={characterIndex}>
                  <motion.span
                    custom={previousCharacters + characterIndex}
                    initial="hidden"
                    animate={isAnimating ? "visible" : "hidden"}
                    variants={variants}
                    onAnimationComplete={
                      wordIndex === elements.length - 1 && characterIndex === word.characters.length - 1
                        ? onComplete
                        : undefined
                    }
                    className="inline-block"
                  >
                    {character}
                  </motion.span>
                </span>
              ))}
              {word.needsSpace && <span> </span>}
            </span>
          );
        })}
      </span>
    );
  },
);

VerticalCutReveal.displayName = "VerticalCutReveal";

export { VerticalCutReveal };
