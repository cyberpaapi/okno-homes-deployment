"use client";

// 21st.dev Text Block Animation by daiwiikharihar, component 9902.
// Keep its two-pass block wipe without splitting the interactive heading DOM.
// SplitText replaces descendants, which disconnects the MorphingText pointer
// handlers used by the inverse-colour lens on Hospitality headings.
import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined" && typeof window.matchMedia === "function") gsap.registerPlugin(ScrollTrigger, useGSAP);

type Props = {
  children: ReactNode;
  animateOnScroll?: boolean;
  delay?: number;
  blockColor?: string;
  duration?: number;
  className?: string;
};

export function TextBlockAnimation({
  children,
  animateOnScroll = true,
  delay = 0,
  blockColor = "#b9cbb8",
  duration = 0.6,
  className,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const container = containerRef.current;
    if (!container) return;
    if (typeof window.matchMedia !== "function") return;
    gsap.registerPlugin(ScrollTrigger, useGSAP);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const heading = container.querySelector<HTMLElement>("h2");
    if (!heading) return;
    const block = document.createElement("div");
    Object.assign(block.style, {
      position: "absolute", inset: "0", width: "100%", height: "100%",
      backgroundColor: blockColor, zIndex: "2", pointerEvents: "none",
      transform: "scaleX(0)", transformOrigin: "left center",
    });
    container.appendChild(block);
    gsap.set(heading, { opacity: 0 });

    const timeline = gsap.timeline({
      defaults: { ease: "expo.inOut" },
      scrollTrigger: animateOnScroll ? { trigger: container, start: "top 85%", toggleActions: "play none none reverse" } : undefined,
      delay,
    });
    timeline
      .to(block, { scaleX: 1, duration, transformOrigin: "left center" })
      .set(heading, { opacity: 1 }, `<${duration / 2}`)
      .to(block, { scaleX: 0, duration, transformOrigin: "right center" }, `<${duration * 0.4}`);

    return () => { timeline.kill(); block.remove(); gsap.set(heading, { clearProps: "opacity" }); };
  }, { scope: containerRef, dependencies: [animateOnScroll, blockColor, delay, duration] });

  return <div ref={containerRef} className={className} style={{ position: "relative" }}>{children}</div>;
}
