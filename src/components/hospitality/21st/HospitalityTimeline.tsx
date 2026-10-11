"use client";
/* eslint-disable @next/next/no-img-element -- the retrieved Product Timeline uses a native draggable=false image inside its slider */

// Direct hospitality-content implementation of hyperiux's bookmarked
// Product Timeline, 21st.dev component 26930. The pinned horizontal slider,
// alternating milestones, drawing stems, SplitText reveals and mobile track are retained.
import { useLayoutEffect, useRef, useSyncExternalStore, type CSSProperties } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import styles from "./HospitalityTimeline.module.css";
import overrides from "./HospitalityTimelineOverrides.module.css";
import { useSiteContentMap } from "@/lib/useSiteContent";

if (typeof window !== "undefined" && typeof window.matchMedia === "function") gsap.registerPlugin(ScrollTrigger, SplitText);

export type TimelineStep = readonly [string, string, string];

// Existing OKNO project photography supports the journey; these are not literal
// documentation of the individual delivery stages.
const stepPhotos = [
  "/assets/projects/real-v1/forrest-03.webp",
  "/assets/projects/real-v1/kioo-04.webp",
  "/assets/projects/real-v1/lakewood-03.webp",
  "/assets/projects/real-v1/forrest-04.webp",
  "/assets/projects/real-v1/octapod-layana-08.webp",
  "/assets/projects/real-v1/kray-sangareddy-02.webp",
  "/assets/projects/real-v1/rasa-vikarabad-04.webp",
] as const;

function StepPhoto({ index, image, alt, className, sizes }: { index: number; image: string; alt: string; className: string; sizes: string }) {
  return (
    <figure className={className} data-stage-photo aria-hidden={alt ? undefined : true}>
      <Image src={image || stepPhotos[index % stepPhotos.length]} alt={alt} fill sizes={sizes} loading="eager" />
    </figure>
  );
}

const REDUCED = "(prefers-reduced-motion: reduce)";
const MOBILE = "(max-width: 1023px)";
const subscribeTo = (queryText: string, callback: () => void) => {
  if (typeof window === "undefined") return () => {};
  const query = window.matchMedia(queryText);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
};
const matches = (query: string) => typeof window !== "undefined" && window.matchMedia(query).matches;

export function HospitalityTimeline({ steps }: { steps: readonly TimelineStep[] }) {
  const values = useSiteContentMap();
  const get = (key: string, fallback: string) => values[`hospitality.timeline.${key}`] ?? fallback;
  const currentSteps = steps.map(([number, title, copy], index) => [
    get(`stage-${index + 1}.number`, number),
    get(`stage-${index + 1}.title`, title),
    get(`stage-${index + 1}.copy`, copy),
  ] as const);
  const stageImage = (index: number) => get(`stage-${index + 1}.image`, stepPhotos[index % stepPhotos.length]);
  const stageAlt = (index: number) => get(`stage-${index + 1}.alt`, "");
  const sectionRef = useRef<HTMLElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLSpanElement>(null);
  const reduced = useSyncExternalStore(
    (callback) => subscribeTo(REDUCED, callback),
    () => matches(REDUCED),
    () => false,
  );
  const mobile = useSyncExternalStore(
    (callback) => subscribeTo(MOBILE, callback),
    () => matches(MOBILE),
    () => false,
  );

  useLayoutEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    gsap.registerPlugin(ScrollTrigger, SplitText);
    const section = sectionRef.current;
    const slider = sliderRef.current;
    const activeLine = activeLineRef.current;
    if (!section || reduced) return;

    if (mobile) {
      const context = gsap.context(() => {
        section.querySelectorAll<HTMLElement>("[data-mobile-step]").forEach((node) => {
          const photo = node.querySelector("[data-stage-photo]");
          if (!photo) return;
          gsap.fromTo(photo,
            { autoAlpha: 0, rotationY: -58, x: -16, transformPerspective: 600, transformOrigin: "left center" },
            {
              autoAlpha: 1, rotationY: 0, x: 0, duration: .64, ease: "power3.out",
              scrollTrigger: { trigger: node, start: "top 84%", once: true },
            },
          );
        });
      }, section);
      return () => context.revert();
    }

    if (!slider || !activeLine) return;

    const splits: SplitText[] = [];
    const context = gsap.context(() => {
      const slidePercent = -65;
      gsap.timeline({
        scrollTrigger: { trigger: section, start: "top top", end: "92% bottom", scrub: true },
        defaults: { ease: "none" },
      }).fromTo(slider, { xPercent: 0 }, { xPercent: slidePercent });

      gsap.fromTo(activeLine, { clipPath: "inset(0 100% 0 0)" }, {
        clipPath: "inset(0 0% 0 0)",
        ease: "none",
        scrollTrigger: { trigger: section, start: "top 25%", end: "92% bottom", scrub: true },
      });

      const positions = [[6,26],[16,36],[26,46],[35,55],[45,65],[55,75],[65,85]];

      section.querySelectorAll<HTMLElement>("[data-timeline-step]").forEach((node, index) => {
        const stem = node.querySelector("[data-stem]");
        const dot = node.querySelector("[data-dot]");
        const photo = node.querySelector("[data-stage-photo]");
        const photoLink = node.querySelector("[data-photo-link]");
        const copy = node.querySelector<HTMLElement>("[data-copy]");
        if (!stem || !dot || !copy || !photo || !photoLink) return;
        const photoOrigin = index % 2 === 0 ? "center bottom" : "center top";
        const photoStart = { autoAlpha: 0, rotationX: index % 2 === 0 ? -62 : 62, y: index % 2 === 0 ? 16 : -16, transformPerspective: 650, transformOrigin: photoOrigin };
        const photoEnd = { autoAlpha: 1, rotationX: 0, y: 0 };
        const title = copy.querySelector("h3");
        const description = copy.querySelector("p");
        const titleSplit = title ? new SplitText(title, { type: "lines", mask: "lines" }) : null;
        const descriptionSplit = description ? new SplitText(description, { type: "lines", mask: "lines" }) : null;
        if (titleSplit) splits.push(titleSplit);
        if (descriptionSplit) splits.push(descriptionSplit);
        if (index === 0) {
          gsap.set(stem, { scaleY: 1, transformOrigin: "bottom bottom" });
          gsap.set(dot, { scale: 1 });
          gsap.set([...(titleSplit?.lines ?? []), ...(descriptionSplit?.lines ?? [])], { yPercent: 0 });
          gsap.timeline({ scrollTrigger: { trigger: section, start: "top 85%", end: "top 35%", scrub: true } })
            .fromTo(photoLink, { scaleX: 0 }, { scaleX: 1, transformOrigin: "left center", ease: "none", duration: .35 })
            .fromTo(photo, photoStart, { ...photoEnd, ease: "power2.out", duration: .75 }, "<");
          return;
        }
        gsap.set(stem, { scaleY: 0, transformOrigin: index % 2 === 0 ? "bottom bottom" : "top top" });
        gsap.set(dot, { scale: 0 });
        const [start, end] = positions[index];
        gsap.timeline({ scrollTrigger: { trigger: section, start: `${start}% 30%`, end: `${end}% 50%`, scrub: true } })
          .to(stem, { scaleY: 1, duration: .45 })
          .to(dot, { scale: 1, duration: .45 }, "<")
          .fromTo(photoLink, { scaleX: 0 }, { scaleX: 1, transformOrigin: "left center", duration: .3 }, "<")
          .fromTo(photo, photoStart, { ...photoEnd, duration: .8, ease: "power2.out" }, "<")
          .fromTo(titleSplit?.lines ?? [], { yPercent: 110 }, { yPercent: 0, duration: 1, stagger: .02, ease: "power2.out" }, "<")
          .fromTo(descriptionSplit?.lines ?? [], { yPercent: 110 }, { yPercent: 0, duration: 1, stagger: .02, ease: "power2.out" }, "<");
      });
    }, section);

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("resize", refresh);
    return () => {
      splits.forEach((split) => split.revert());
      context.revert();
      window.removeEventListener("resize", refresh);
    };
  }, [mobile, reduced, values, steps]);

  if (mobile || reduced) {
    return (
      <section id="delivery" ref={sectionRef} className={overrides.mobileStage} aria-labelledby="delivery-title" data-header-tone="dark">
        <figure className={overrides.mobileCover}>
          <img src={get("cover", "/assets/projects/real-v1/octapod-layana-08.webp")} alt={get("cover-alt", "Aerial view of a hospitality estate arranged around a central pool")} draggable={false} loading="lazy" decoding="async" />
        </figure>
        <header className={overrides.mobileHeader}>
          <small>{get("label", "Delivery path")}</small>
          <h2 id="delivery-title">{get("title", "Brief to opening.")}</h2>
          <span>{get("range", "01 — 07")}</span>
        </header>
        <ol className={overrides.mobileList}>
          {currentSteps.map(([number, title, copy], index) => (
            <li key={index} data-mobile-step data-phase={index < 2 ? "plan" : index < 4 ? "make" : "open"}>
              <b>{number}</b>
              <div><h3>{title}</h3><p>{copy}</p><StepPhoto index={index} image={stageImage(index)} alt={stageAlt(index)} className={overrides.mobilePhoto} sizes="(max-width: 599px) 128px, 160px" /></div>
            </li>
          ))}
        </ol>
      </section>
    );
  }

  return (
    <section id="delivery" ref={sectionRef} className={`${styles.stage} ${overrides.stage}`} aria-labelledby="delivery-title" data-header-tone="dark">
      <div className={`${styles.sticky} ${overrides.stickyCentered}`}>
        <div ref={sliderRef} className={styles.slider}>
          <figure className={styles.cover}>
            <img src={get("cover", "/assets/projects/real-v1/octapod-layana-08.webp")} alt={get("cover-alt", "Aerial view of a hospitality estate arranged around a central pool")} draggable={false} loading="lazy" decoding="async" />
          </figure>
          <div className={styles.timeline}>
            <div className={styles.axis} aria-hidden="true"><i /><span ref={activeLineRef} /><i /></div>
            <div className={styles.timelineTitle}>
              <small>{get("label", "Delivery path")}</small>
              <h2 id="delivery-title">{get("title", "Brief to opening.")}</h2>
            </div>
            <p className={styles.period}>{get("range", "01 — 07")}</p>
            {currentSteps.map(([number, title, copy], index) => (
              <article
                key={index}
                data-timeline-step
                data-side={index % 2 === 0 ? "top" : "bottom"}
                data-phase={index < 2 ? "plan" : index < 4 ? "make" : "open"}
                className={styles.step}
                style={{ "--step-index": index } as CSSProperties}
              >
                <span data-dot className={styles.dot} aria-hidden="true" />
                <span data-stem className={styles.stem} aria-hidden="true" />
                <span data-photo-link className={styles.photoLink} aria-hidden="true" />
                <StepPhoto index={index} image={stageImage(index)} alt={stageAlt(index)} className={styles.photo} sizes="(max-width: 1300px) 112px, 9vw" />
                <div data-copy className={styles.stepCopy}>
                  <b>{number}</b>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
