"use client";

import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import { SilkBackground } from "@/components/projects/21st/SilkBackground";
import ProcessDeliveryTimeline, {
  StaticProcessDeliveryTimeline,
  type ProcessTimelineItem,
} from "./21st/ProcessDeliveryTimeline";
import ProcessDetailTimeline from "./ProcessDetailTimeline";
import ProcessLoader from "./21st/ProcessLoader";
import ProcessNavigation from "./21st/ProcessNavigation";
import ProcessTextReveal from "./21st/ProcessTextReveal";
import styles from "./Process.module.css";
import { useChapterPlayback } from "./useChapterPlayback";
import { useSiteContent, useSiteContentMap } from "@/lib/useSiteContent";
import { resolveProcessDayRange } from "@/lib/processDayRange";

type Stage = ProcessTimelineItem & {
  days: string;
  copy: string;
};

const stages: readonly Stage[] = [
  {
    id: "land",
    days: "Days 01–10",
    label: "Land",
    title: "The brief meets the land.",
    copy: "The site and the brief are read together before a model is selected or a bespoke design begins.",
    poster: "/process/land-poster.webp",
  },
  {
    id: "architecture",
    days: "Days 11–25",
    label: "Architecture",
    title: "The plan takes shape.",
    copy: "The site, programme and chosen model are translated into a clear architectural direction.",
    poster: "/process/drawing-poster.webp",
  },
  {
    id: "design-lock",
    days: "Days 11–25",
    label: "Design lock",
    title: "Every decision is resolved.",
    copy: "Design development, approvals, engineering and material planning are completed before the build advances.",
    poster: "/process/design-lock-poster.webp",
  },
  {
    id: "assembly",
    days: "Days 73–90",
    label: "Assembly",
    title: "The structure takes shape.",
    copy: "Prepared floor and wall panels are aligned into the resolved structure on the finished base.",
    poster: "/process/generated/process-panel-base-v1.webp",
  },
  {
    id: "enclosure",
    days: "Days 73–90",
    label: "Enclosure",
    title: "The home closes around the view.",
    copy: "Roof, glazing and envelope complete the form while keeping the architecture tied to its setting.",
    poster: "/process/generated/process-panel-walls-v1.webp",
  },
  {
    id: "handover",
    days: "Days 73–90",
    label: "Handover",
    title: "Finished where it belongs.",
    copy: "The completed home is checked as one resolved whole before the final handover.",
    poster: "/process/generated/process-panel-complete-v1.webp",
  },
] as const;

function useProcessStages() {
  const values = useSiteContentMap();
  return stages.map(stage => ({
    ...stage,
    days: resolveProcessDayRange(values[`process.stage-${stage.id}.days`] ?? stage.days, stage.days).display,
    label: values[`process.stage-${stage.id}.label`] ?? stage.label,
    title: values[`process.stage-${stage.id}.title`] ?? stage.title,
    copy: values[`process.stage-${stage.id}.copy`] ?? stage.copy,
    poster: values[`process.stage-${stage.id}.poster`] ?? stage.poster,
  }));
}

function useProcessOpening() {
  return {
    eyebrow: useSiteContent("process.opening.eyebrow", "The OKNO process"),
    title: useSiteContent("process.opening.title", "Built in 90 days."),
    summary: useSiteContent("process.opening.summary", "From first site reading to final handover, every decision moves through one connected process."),
    cue: useSiteContent("process.opening.cue", "Scroll to enter the build"),
  };
}

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}

function between(value: number, start: number, end: number) {
  return clamp((value - start) / (end - start));
}

function useViewportLayout() {
  const [layout, setLayout] = useState<"desktop" | "tablet" | "mobile">("desktop");

  useEffect(() => {
    const update = () => setLayout(window.innerWidth <= 700 ? "mobile" : window.innerWidth <= 1023 ? "tablet" : "desktop");
    update();
    window.addEventListener("resize", update, { passive: true });
    return () => window.removeEventListener("resize", update);
  }, []);

  return layout;
}

type ViewportLayout = ReturnType<typeof useViewportLayout>;

function applyScrollVisuals(
  track: HTMLElement | null,
  value: number,
  layout: ViewportLayout,
) {
  if (!track) return;
  const frame = between(value, 0, .68);
  const hero = between(value, .28, .65);
  const story = between(value, .58, .68);
  const rail = between(value, .58, .68);
  const bounds = layout === "mobile"
    ? { top: 57, right: 5, bottom: 5, left: 5, radius: 10 }
    : layout === "tablet"
      ? { top: 19, right: 5, bottom: 16, left: 48, radius: 14 }
      : { top: 13, right: 5, bottom: 13, left: 55, radius: 14 };
  const remaining = 1 - frame;

  track.style.setProperty(
    "--frame-clip",
    `inset(${bounds.top * remaining}% ${bounds.right * remaining}% ${bounds.bottom * remaining}% ${bounds.left * remaining}% round ${bounds.radius * remaining}px)`,
  );
  track.style.setProperty("--cover-inset", `${bounds.top * remaining}% ${bounds.right * remaining}% ${bounds.bottom * remaining}% ${bounds.left * remaining}%`);
  track.style.setProperty("--hero-opacity", String(1 - hero));
  track.style.setProperty("--hero-y", `${-34 * hero}px`);
  track.style.setProperty("--story-opacity", String(story));
  track.style.setProperty("--rail-y", `${24 * (1 - rail)}px`);
}

function StaticProcessHero() {
  const opening = useProcessOpening();
  const poster = useSiteContent("process.opening.cover", "/process/opening-cover.webp");
  return (
    <section className={styles.staticHero} aria-labelledby="process-title">
      <div className={styles.staticHeroCopy}>
        <p className={styles.heroLabel}>{opening.eyebrow}</p>
        <div id="process-title"><ProcessTextReveal text={opening.title} /></div>
        <p className={styles.heroSummary}>{opening.summary}</p>
      </div>
      <div className={styles.staticHeroFilm} aria-hidden="true">
        <Image src={poster} alt="" fill priority sizes="100vw" />
        <span />
      </div>
    </section>
  );
}

function ReducedProcess() {
  const currentStages = useProcessStages();
  const timelineItems = currentStages.map(({ id, days, label, title, poster }) => ({ id, days, label, title, poster }));
  const sequenceTitle = useSiteContent("process.sequence.title", "The OKNO build sequence");
  return (
    <section className={styles.reducedSequence} aria-labelledby="process-sequence-title">
      <h2 className={styles.srOnly} id="process-sequence-title">{sequenceTitle}</h2>
      <StaticProcessDeliveryTimeline items={timelineItems} />
      <div className={styles.reducedStages}>
        {currentStages.map((stage) => (
          <section className={styles.reducedScene} key={stage.id} aria-labelledby={`process-${stage.id}`}>
            <div className={styles.reducedMedia} style={{ backgroundImage: `url(${stage.poster})` }} aria-hidden="true" />
            <div className={styles.reducedShade} aria-hidden="true" />
            <div className={styles.reducedCopy}>
              <p>{stage.days} · {stage.label}</p>
              <h3 id={`process-${stage.id}`}>{stage.title}</h3>
              <span>{stage.copy}</span>
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}

function AnimatedProcess({ onFilmCovering }: { onFilmCovering: (covered: boolean) => void }) {
  const currentStages = useProcessStages();
  const timelineItems = currentStages.map(({ id, days, label, title, poster }) => ({ id, days, label, title, poster }));
  const opening = useProcessOpening();
  const masterHq = useSiteContent("process.opening.master-hq", "/process/process-master.hq.mp4");
  const masterScrub = useSiteContent("process.opening.master-scrub", "/process/process-master.scrub.mp4");
  const poster = useSiteContent("process.opening.poster", "/process/land-poster.webp");
  const loading = useSiteContent("process.opening.loading", "Loading process film");
  const filmLabel = useSiteContent("process.opening.film-label", "OKNO process film advancing from land analysis to the completed home as the page scrolls");
  const trackRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cover = useSiteContent("process.opening.cover", "/process/opening-cover.webp");
  const film = useChapterPlayback(trackRef, videoRef, `${masterHq}|${masterScrub}`);
  const activeStage = film.chapter;
  const masterFilmReady = film.revealed;
  const sequenceProgress = film.progress;
  const layout = useViewportLayout();
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });
  const visualProgress = useSpring(scrollYProgress, {
    stiffness: 210,
    damping: 30,
    mass: .72,
    restDelta: .0002,
  });
  useMotionValueEvent(visualProgress, "change", (value) => {
    applyScrollVisuals(trackRef.current, value, layout);
    onFilmCovering(value >= .68 && value < .98);
  });
  useEffect(() => {
    applyScrollVisuals(trackRef.current, visualProgress.get(), layout);
  }, [layout, visualProgress]);
  useEffect(() => () => onFilmCovering(false), [onFilmCovering]);

  const active = currentStages[activeStage];

  return (
    <section className={styles.storyTrack} ref={trackRef} aria-labelledby="process-title" data-playback={film.playback} data-chapter={active.id}>
      <div className={styles.stickyViewport}>
        <div className={styles.heroCopy}>
          <p className={styles.heroLabel}>{opening.eyebrow}</p>
          <div id="process-title"><ProcessTextReveal text={opening.title} /></div>
          <p className={styles.heroSummary}>{opening.summary}</p>
          <p className={styles.scrollCue}><span aria-hidden="true" /> {opening.cue}</p>
        </div>

        <div className={styles.mediaFrame}>
          <video
            className={styles.sceneVideo}
            ref={videoRef}
            data-process-master-video
            muted
            playsInline
            disablePictureInPicture
            controls={false}
            preload="auto"
            poster={poster}
            aria-label={filmLabel}
          >
            <source media="(min-width: 1024px)" src={masterHq} type="video/mp4" />
            <source src={masterScrub} type="video/mp4" />
          </video>

          <div className={styles.coverLayer} data-revealed={masterFilmReady} aria-hidden="true">
            <Image src={cover} alt="" fill priority sizes="(max-aspect-ratio: 16/9) 178vh, 100vw" quality={90} />
          </div>
          <div className={styles.mediaTreatment} aria-hidden="true" />

          <AnimatePresence>
            {film.playback === "loading" ? (
              <motion.div className={styles.loadingLayer} initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .24 }}>
                <ProcessLoader label={loading} />
              </motion.div>
            ) : null}
          </AnimatePresence>

          <div className={styles.storyCopy}>
            <AnimatePresence mode="sync" initial={false}>
              <motion.div
                className={styles.copyInner}
                key={active.id}
                initial={{ opacity: 0, transform: "translate3d(0, 22px, 0)" }}
                animate={{ opacity: 1, transform: "translate3d(0, 0, 0)" }}
                exit={{ opacity: 0, transform: "translate3d(0, -14px, 0)" }}
                transition={{ duration: .34, ease: [.23, 1, .32, 1] }}
              >
                <p className={styles.stageLabel}>{active.days}</p>
                <h2>{active.label}</h2>
                <p className={styles.stageTitle}>{active.title}</p>
                <p className={styles.stageCopy}>{active.copy}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {film.playback !== "opening" && film.playback !== "finished" ? (
          <div className={styles.playbackControls}>
            <p role="status">{film.playback === "playing" ? "Playing chapter" : film.playback === "loading" ? loading : film.playback === "blocked" ? "Film paused. Try playing again or view the timeline." : "Scroll to continue"}</p>
            <div>
              <button type="button" onClick={film.previous} disabled={film.playback === "playing" || film.playback === "loading"}>Previous</button>
              <button type="button" onClick={film.next} disabled={film.playback === "playing" || film.playback === "loading"}>{film.playback === "blocked" ? "Play film" : activeStage === 5 ? "Continue to timeline" : "Continue"}</button>
              <button type="button" onClick={film.leave}>View the timeline</button>
            </div>
          </div>
        ) : null}
        <div className={styles.timelineShell}>
          <ProcessDeliveryTimeline items={timelineItems} activeIndex={activeStage} progress={sequenceProgress} />
        </div>
      </div>
    </section>
  );
}

export default function ProcessJourney() {
  const reducedMotion = useReducedMotion();
  const [filmCovering, setFilmCovering] = useState(false);

  return (
    <div className={styles.processPage}>
      <div className={styles.silkLayer} aria-hidden="true">
        <SilkBackground maxPixels={320_000} fps={30} paused={filmCovering} interactive={false} />
      </div>
      <ProcessNavigation />
      <main className={styles.pageContent} data-route="process">
        {reducedMotion ? <><StaticProcessHero /><ReducedProcess /></> : <AnimatedProcess onFilmCovering={setFilmCovering} />}
        <ProcessDetailTimeline />
      </main>
    </div>
  );
}
