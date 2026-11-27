"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import Header from "@/components/Header/Header";
import { SilkBackground } from "@/components/projects/21st/SilkBackground";
import { SubtleLink } from "@/components/ui/SubtleAction";
import type { ContentItem } from '@/lib/contentCollections';
import { useSiteCollection, useSiteContentMap } from '@/lib/useSiteContent';
import { initialTestimonialItems, testimonialCollectionId, testimonialDisclosureId, testimonialPageDefaults, testimonialsFromItems, testimonialSectionStyle } from '@/lib/testimonialCollections';
import { FrostedReviewSurface } from "./FrostedReviewSurface";
import styles from "./TestimonialsExperience.module.css";
import { useLoopingTestimonialRail } from "./useLoopingTestimonialRail";
import { HandwrittenQuote, type QuoteInkRegistry } from "./HandwrittenQuote";

const emptyValues: Record<string, string> = {};

export default function TestimonialsExperience({ initialItems = initialTestimonialItems, initialValues = emptyValues }: {
  initialItems?: ContentItem[]; initialValues?: Record<string, string>;
}) {
  const items = useSiteCollection(testimonialCollectionId, initialItems);
  const updates = useSiteContentMap();
  const values = useMemo(() => ({ ...initialValues, ...updates }), [initialValues, updates]);
  const testimonials = useMemo(() => testimonialsFromItems(items), [items]);
  const reviewIdentity = useMemo(() => JSON.stringify(testimonials), [testimonials]);
  const get = (key: string, fallback: string) => values[`testimonials.${key}`] ?? fallback;
  const showDisclosure = values[testimonialDisclosureId] !== 'hidden';
  const rail = useRef<HTMLDivElement>(null);
  const [inkRegistry] = useState<QuoteInkRegistry>(() => new Map());
  const railId = useId();
  const helpId = useId();
  const [userPaused, setUserPaused] = useState(false);
  const [keyboardFocused, setKeyboardFocused] = useState(false);
  const [scrolling, setScrolling] = useState(false);
  const [inkInterrupted, setInkInterrupted] = useState(false);
  const [menuActive, setMenuActive] = useState(false);
  const [phone, setPhone] = useState(true);
  const [clock, setClock] = useState(0);
  const completedClock = useRef(-1);
  const pointerHeld = useRef(false);
  const busy = useRef(false);
  const quietTimer = useRef<number | undefined>(undefined);
  const [inView, setInView] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);

  const resetClock = useCallback(() => setClock((value) => value + 1), []);
  const finishScrolling = useCallback(() => {
    window.clearTimeout(quietTimer.current);
    quietTimer.current = window.setTimeout(() => {
      if (pointerHeld.current) return;
      busy.current = false;
      setScrolling(false);
      setInkInterrupted(false);
    }, 180);
  }, []);
  const beginScrolling = useCallback((event?: Event) => {
    // Controller steps and their equivalent-cycle rebases emit native rail
    // scroll events too. User gestures are identified at the input handlers;
    // only external document scrolling interrupts ink here.
    if (event && event.target !== rail.current) setInkInterrupted(true);
    if (!busy.current) {
      busy.current = true;
      setScrolling(true);
      resetClock();
    }
    finishScrolling();
  }, [finishScrolling, resetClock]);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const phoneQuery = window.matchMedia("(max-width: 700px)");
    const updateMotion = () => setReducedMotion(query.matches);
    const updatePhone = () => setPhone(phoneQuery.matches);
    const updateVisibility = () => setHidden(document.hidden);
    const updateMenu = () => setMenuActive(document.documentElement.dataset.oknoPublicMenuActive === "true");
    updateMotion();
    updatePhone();
    updateVisibility();
    updateMenu();
    query.addEventListener("change", updateMotion);
    phoneQuery.addEventListener("change", updatePhone);
    document.addEventListener("visibilitychange", updateVisibility);
    window.addEventListener("okno-public-menu-activity", updateMenu);
    const observer = typeof IntersectionObserver === "undefined" ? undefined : new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting && entry.intersectionRatio >= 0.15);
    }, { threshold: [0, 0.15] });
    if (rail.current) observer?.observe(rail.current);
    // Without visibility observation, keep manual controls usable and autoplay off.
    return () => {
      query.removeEventListener("change", updateMotion);
      phoneQuery.removeEventListener("change", updatePhone);
      document.removeEventListener("visibilitychange", updateVisibility);
      window.removeEventListener("okno-public-menu-activity", updateMenu);
      observer?.disconnect();
    };
  }, []);

  useEffect(() => {
    const endPointer = () => {
      if (!busy.current && !pointerHeld.current) return;
      pointerHeld.current = false;
      finishScrolling();
    };
    // Capture native document and rail scrolling without measuring layout here.
    // The shader retains its last frame until this gesture has settled.
    window.addEventListener("scroll", beginScrolling, { passive: true, capture: true });
    window.addEventListener("pointerup", endPointer, { passive: true });
    window.addEventListener("pointercancel", endPointer, { passive: true });
    window.addEventListener("blur", endPointer);
    return () => {
      window.removeEventListener("scroll", beginScrolling, true);
      window.removeEventListener("pointerup", endPointer);
      window.removeEventListener("pointercancel", endPointer);
      window.removeEventListener("blur", endPointer);
      window.clearTimeout(quietTimer.current);
    };
  }, [beginScrolling, finishScrolling]);

  const { canRotate, move } = useLoopingTestimonialRail({
    rail, identity: reviewIdentity, count: testimonials.length, reducedMotion,
    suspended: hidden || !inView || userPaused || menuActive,
    onStart: beginScrolling, onEnd: finishScrolling, onChange: resetClock,
    isHeld: () => pointerHeld.current,
  });
  const autoplayRunning = canRotate && !userPaused && !keyboardFocused && !scrolling && !hidden && !menuActive && inView && !reducedMotion;

  const moveManually = (direction: "previous" | "next") => {
    resetClock();
    move(direction);
  };

  const onRailKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const direction = { ArrowLeft: "previous", ArrowRight: "next", Home: "first", End: "last" }[event.key];
    if (!direction) return;
    event.preventDefault();
    resetClock();
    move(direction as "previous" | "next" | "first" | "last");
  };

  return (
    <>
      <Header tone="dark" />
      <main className={styles.page} data-route="testimonials">
        <div className={styles.silk} aria-hidden="true">
          <SilkBackground maxPixels={phone ? 180_000 : 260_000} fps={12} interactive={false} paused={hidden || !inView || scrolling} />
        </div>
        <section className={styles.reviews} aria-labelledby="testimonials-title"
          onPointerDownCapture={() => setKeyboardFocused(false)}
          onKeyDownCapture={() => setKeyboardFocused(true)}
          onFocusCapture={(event) => {
            setKeyboardFocused(event.target.matches(":focus-visible"));
          }}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setKeyboardFocused(false);
          }}>
          <div className={styles.headingRow}>
            <div className={styles.intro} data-type-section="testimonials.introduction" style={testimonialSectionStyle(values, 'introduction')}>
              <h1 id="testimonials-title" className={styles.title} data-type-field={"testimonials.heading"}>{get('heading', testimonialPageDefaults.heading)}</h1>
              <p className={styles.description} data-type-field={"testimonials.introduction"}>{get('introduction', testimonialPageDefaults.introduction)}</p>
            </div>
            <div className={styles.controls} aria-label="Testimonial controls">
              <button className={styles.playback} type="button" aria-controls={railId}
                aria-label="Automatic testimonial rotation" aria-pressed={canRotate && !userPaused && !reducedMotion} aria-describedby={helpId}
                disabled={reducedMotion || !canRotate} onClick={() => { setUserPaused((paused) => !paused); setKeyboardFocused(false); resetClock(); }}>
                <span className={styles.progressTrack} aria-hidden="true">
                  <span key={`${clock}-${autoplayRunning}`} className={styles.progressFill} data-testimonial-progress data-running={autoplayRunning}
                    onAnimationEnd={(event) => {
                      if (event.target !== event.currentTarget || !autoplayRunning || busy.current || completedClock.current === clock) return;
                      completedClock.current = clock;
                      move("auto");
                      resetClock();
                    }} />
                </span>
              </button>
              <button type="button" aria-label="Previous testimonial" aria-controls={railId} disabled={!canRotate} onClick={() => moveManually("previous")}>
                <ArrowLeft aria-hidden="true" size={22} strokeWidth={1.5} />
              </button>
              <button type="button" aria-label="Next testimonial" aria-controls={railId} disabled={!canRotate} onClick={() => moveManually("next")}>
                <ArrowRight aria-hidden="true" size={22} strokeWidth={1.5} />
              </button>
            </div>
          </div>
          {showDisclosure && <p className={styles.disclosure} data-type-section="testimonials.disclosure" data-type-field={"testimonials.disclosure.copy"} style={testimonialSectionStyle(values, 'disclosure')}>{get('disclosure.copy', testimonialPageDefaults.disclosure)}</p>}
          <p id={helpId} className={styles.screenReaderOnly}>Testimonials advance every six seconds. Activate Automatic testimonial rotation to stop or restart. Rotation rests during scrolling and keyboard focus, then starts a fresh countdown. Scroll horizontally or use the previous and next buttons. With the testimonials focused, use Left and Right arrow keys, Home for the beginning, or End for the last testimonial. The reviews loop in either direction. Reduced motion turns automatic rotation off.</p>
          <div id={railId} ref={rail} className={styles.rail} role="region" aria-label="Testimonial stories" aria-roledescription="carousel" aria-describedby={helpId} tabIndex={0} onKeyDown={onRailKeyDown}
            onPointerDown={() => { pointerHeld.current = true; setInkInterrupted(true); beginScrolling(); }} onWheel={() => { setInkInterrupted(true); beginScrolling(); }}>
            <ul className={styles.track} data-type-section="testimonials.reviews" style={testimonialSectionStyle(values, 'reviews')}>
              {(testimonials.length > 1 ? ["before", "original", "after"] : ["original"]).flatMap((cycle) => testimonials.map((testimonial, index) => (
                <li key={`${cycle}-${testimonial.id}`} className={`${styles.card}${cycle === "original" ? "" : ` ${styles.clone}`}`}
                  data-testimonial-card={cycle === "original" ? "original" : "clone"}
                  data-testimonial-cycle={cycle} aria-hidden={cycle === "original" ? undefined : true} inert={cycle === "original" ? undefined : true}>
                    <figure>
                      <div className={styles.photo}>
                        {testimonial.image.src && <Image src={testimonial.image.src} alt={testimonial.image.alt} fill
                          sizes="(max-width: 700px) 85vw, (max-width: 1100px) 43vw, 29vw"
                          loading={index < 3 ? "eager" : "lazy"} />}
                      </div>
                      <FrostedReviewSurface className={styles.story}>
                        <blockquote><HandwrittenQuote text={testimonial.quote} reviewId={testimonial.id}
                          registry={inkRegistry} reducedMotion={reducedMotion}
                          suspended={hidden || !inView || inkInterrupted || menuActive}
                          interrupted={inkInterrupted} /></blockquote>
                        <figcaption>
                          <p className={styles.name}>{testimonial.name}</p>
                          <p className={styles.location}><span>{testimonial.location[0]}</span><span>{testimonial.location[1]}</span></p>
                        </figcaption>
                      </FrostedReviewSurface>
                    </figure>
                </li>
              )))}
            </ul>
          </div>
        </section>
        <section className={styles.close} aria-labelledby="testimonials-close" data-type-section="testimonials.closing" style={testimonialSectionStyle(values, 'closing')}>
          <h2 id="testimonials-close" data-type-field={"testimonials.closing.heading"}>{get('closing.heading', testimonialPageDefaults.closingHeading)}</h2>
          <div className={styles.closeDetails}>
            <p data-type-field={"testimonials.closing.body"}>{get('closing.body', testimonialPageDefaults.closingBody)}</p>
            <div className={styles.closeLinks}>
              <SubtleLink className={styles.enquire} href="/enquiry" distance={0} data-type-field={"testimonials.closing.enquiry-label"}>{get('closing.enquiry-label', testimonialPageDefaults.enquiryLabel)}</SubtleLink>
              <SubtleLink className={styles.models} href="/models" distance={0} data-type-field={"testimonials.closing.models-label"}>{get('closing.models-label', testimonialPageDefaults.modelsLabel)}</SubtleLink>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
