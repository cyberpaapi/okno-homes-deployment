"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useIsPresent,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
  type Variants,
} from "motion/react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import type { OknoModel } from "@/data/models";
import ModelsHeader from "./ModelsHeader";
import styles from "./ForzaExperience.module.css";
import { getVideoSeekRequest, mapProgressToTime } from "./forzaMotion";
import { useSiteCollection, useSiteCollectionsMap, useSiteContentMap } from "@/lib/useSiteContent";
import { exploreVariantId } from "@/data/configurator/studio/variantIds";
import { parseSignatureFeatures, parseSignatureGallery, signatureModelDefaults, signaturePlanDefaults } from "@/lib/signatureCollections";

type PlanFilter = "all" | "studio" | "2-bhk" | "3-bhk";

const planFilters: { value: PlanFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "studio", label: "Studio" },
  { value: "2-bhk", label: "2 BHK" },
  { value: "3-bhk", label: "3 BHK" },
];

const MAX_SCRUB_FPS = 24;
const SCRUB_SCHEDULER_FPS = 30;

const forzaGallery = [
  {
    label: "Exterior",
    src: "/models/forza/interiors/forza-exterior.webp",
    alt: "Forza front three-quarter exterior",
  },
  {
    label: "Kitchen",
    src: "/models/forza/interiors/forza-kitchen.webp",
    alt: "Forza kitchen interior",
  },
  {
    label: "Living",
    src: "/models/forza/interiors/forza-living.webp",
    alt: "Forza living and dining interior",
  },
  {
    label: "Bedroom",
    src: "/models/forza/interiors/forza-bedroom.webp",
    alt: "Forza bedroom interior",
  },
  {
    label: "Bath",
    src: "/models/forza/interiors/forza-bathroom.webp",
    alt: "Forza bathroom interior",
  },
];

const krayGallery = [
  {
    label: "Exterior",
    src: "/models/kray/gallery/kray-exterior-water.webp",
    alt: "Kray modular home beside a reflective mountain pool",
  },
  {
    label: "Living",
    src: "/models/kray/gallery/kray-interior-panorama.webp",
    alt: "Kray living room looking through full-height glazing toward the mountains",
  },
  {
    label: "Kitchen",
    src: "/models/kray/gallery/kray-interior-kitchen-lounge.webp",
    alt: "Kray timber kitchen and lounge interior",
  },
  {
    label: "Deck",
    src: "/models/kray/gallery/kray-exterior-deck.webp",
    alt: "Kray exterior with its integrated waterside deck",
  },
  {
    label: "Setting",
    src: "/models/kray/gallery/kray-mountain-community.webp",
    alt: "A collection of Kray homes in a mountain landscape",
  },
];

const gazeGallery = [
  {
    label: "Exterior",
    src: "/models/gaze/gallery/gaze-exterior-three-quarter.webp",
    alt: "Gaze timber retreat in a mountain setting",
  },
  {
    label: "Bedroom",
    src: "/models/gaze/gallery/gaze-bedroom-wide.webp",
    alt: "Gaze vaulted bedroom with warm timber ceiling",
  },
  {
    label: "Interior",
    src: "/models/gaze/gallery/gaze-interior-front.webp",
    alt: "Gaze bedroom and sitting space beneath the vaulted roof",
  },
  {
    label: "Setting",
    src: "/models/gaze/gallery/gaze-retreat-setting.webp",
    alt: "A collection of Gaze retreats beside a mountain pool",
  },
  {
    label: "Axonometric",
    src: "/models/gaze/gallery/gaze-axonometric.webp",
    alt: "Cutaway axonometric view of the Gaze interior",
  },
];

const tengoGallery = [
  {
    label: "Exterior",
    src: "/models/tengo/gallery/tengo-exterior-pool.webp",
    alt: "Tengo modular home beside a reflective pool",
  },
  {
    label: "Living",
    src: "/models/tengo/gallery/tengo-living.webp",
    alt: "Tengo living room with full-height garden glazing",
  },
  {
    label: "Bedroom",
    src: "/models/tengo/gallery/tengo-bedroom.webp",
    alt: "Tengo bedroom with warm timber ceiling and framed garden views",
  },
  {
    label: "Dining",
    src: "/models/tengo/gallery/tengo-dining.webp",
    alt: "Tengo dining room beneath a timber ceiling",
  },
  {
    label: "Plan",
    src: "/models/tengo/gallery/tengo-axonometric.webp",
    alt: "Tengo cutaway axonometric interior plan",
  },
];

const tribGallery = [
  {
    label: "Exterior",
    src: "/models/trib/gallery/trib-exterior-front.webp",
    alt: "Trib A-frame retreat among tall forest trees",
  },
  {
    label: "Bedroom",
    src: "/models/trib/gallery/trib-bedroom.webp",
    alt: "Trib bedroom beneath the warm timber A-frame ceiling",
  },
  {
    label: "Kitchenette",
    src: "/models/trib/gallery/trib-kitchenette.webp",
    alt: "Trib compact kitchenette beside the sleeping space",
  },
  {
    label: "Bath",
    src: "/models/trib/gallery/trib-bathroom.webp",
    alt: "Trib compact bathroom with timber finishes",
  },
  {
    label: "Setting",
    src: "/models/trib/gallery/trib-setting.webp",
    alt: "A collection of Trib retreats in a forest clearing",
  },
];

const octapodGallery = [
  {
    label: "Exterior",
    src: "/models/octapod/gallery/octapod-exterior-forest.webp",
    alt: "Octapod glazed exterior in a forest clearing",
  },
  {
    label: "Bedroom",
    src: "/models/octapod/gallery/octapod-bedroom-wide.webp",
    alt: "Octapod timber-lined bedroom with warm afternoon light",
  },
  {
    label: "Interior",
    src: "/models/octapod/gallery/octapod-bedroom-detail.webp",
    alt: "Octapod bedroom with a timber feature wall and pendant lights",
  },
  {
    label: "Setting",
    src: "/models/octapod/gallery/octapod-landscape-setting.webp",
    alt: "Octapod retreat placed in a sunlit woodland landscape",
  },
  {
    label: "Cutaway",
    src: "/models/octapod/gallery/octapod-cutaway-plan.webp",
    alt: "Octapod cutaway showing the bedroom and compact bathroom arrangement",
  },
];

type ExperienceFeature = {
  title: string;
  copy: string;
};

type GalleryImage = { id: string; label: string; src: string; alt: string };

type ExperienceConfig = {
  videoSrc: string;
  detailVideoSrc: string;
  posterSrc: string;
  frameRate: number;
  orbitDegrees?: 180 | 360;
  gallery: typeof forzaGallery;
  features: [ExperienceFeature, ExperienceFeature, ExperienceFeature];
};

const experienceBySlug: Record<string, ExperienceConfig> = {
  forza: {
    videoSrc: "/models/forza/video/forza-360-scroll-648p-24fps-fluid.mp4",
    detailVideoSrc: "/models/forza/video/forza-360-scroll-1080p-24fps-smooth.mp4",
    posterSrc:
      "/models/forza/orbit-keyframes-invisible-glow-1080p/forza-invisible-a00.png",
    frameRate: 24,
    gallery: forzaGallery,
    features: [
      {
        title: "Aperture",
        copy: "Full-height glazing holds the horizon inside the room.",
      },
      {
        title: "Threshold",
        copy: "A sheltered verandah makes the edge between home and landscape disappear.",
      },
      {
        title: "Precisely resolved",
        copy: "One bed, one bath and one considered kitchenette within 376 square feet.",
      },
    ],
  },
  kray: {
    videoSrc: "/models/kray/video/kray-360-scroll-648p-24fps-fluid.mp4",
    detailVideoSrc: "/models/kray/video/kray-360-scroll-1080p-24fps-smooth.mp4",
    posterSrc:
      "/models/kray/orbit-keyframes-midnight-teal-1080p/kray-a00.png",
    frameRate: 24,
    gallery: krayGallery,
    features: [
      {
        title: "Ascent",
        copy: "A rising roofline turns a compact footprint into a room with presence.",
      },
      {
        title: "Outlook",
        copy: "Full-height glazing opens the living space to mountain, forest and sky.",
      },
      {
        title: "Compact retreat",
        copy: "A complete studio home resolved within 306 square feet.",
      },
    ],
  },
  gaze: {
    videoSrc: "/models/gaze/video/gaze-360-scroll-648p-24fps-fluid.mp4",
    detailVideoSrc: "/models/gaze/video/gaze-360-scroll-1080p-24fps-smooth.mp4",
    posterSrc:
      "/models/gaze/orbit-keyframes-moonlit-cyan-1080p/gaze-a00.png",
    frameRate: 24,
    gallery: gazeGallery,
    features: [
      {
        title: "Framed outlook",
        copy: "A full-height glazed gable turns the landscape into the room's principal surface.",
      },
      {
        title: "Quiet volume",
        copy: "A vaulted timber ceiling gives the compact sleeping room a calm, generous proportion.",
      },
      {
        title: "Private retreat",
        copy: "One focused interior, a warm timber envelope and a footprint made for remote settings.",
      },
    ],
  },
  tengo: {
    videoSrc: "/models/tengo/video/tengo-360-scroll-648p-24fps-fluid.mp4",
    detailVideoSrc: "/models/tengo/video/tengo-360-scroll-1080p-24fps-smooth.mp4",
    posterSrc:
      "/models/tengo/blender-accurate/styled-imagen-final-1080p/tengo-a000-roof-final-1920x1080.png",
    frameRate: 24,
    gallery: tengoGallery,
    features: [
      {
        title: "Long horizon",
        copy: "An extended roofline gives the home a calm, grounded silhouette.",
      },
      {
        title: "Gathering room",
        copy: "Generous living and dining spaces open toward the deck and landscape.",
      },
      {
        title: "Room to arrive",
        copy: "Two- and three-bedroom plans begin at 1,426 square feet.",
      },
    ],
  },
  trib: {
    videoSrc: "/models/trib/video/trib-360-scroll-648p-24fps-fluid.mp4",
    detailVideoSrc: "/models/trib/video/trib-360-scroll-1080p-24fps-smooth.mp4",
    posterSrc:
      "/models/trib/orbit-keyframes-smoked-amber-clean-geometry-v2-1080p/trib-a00.png",
    frameRate: 24,
    gallery: tribGallery,
    features: [
      {
        title: "A-frame clarity",
        copy: "A steep, uninterrupted roof gives the retreat its unmistakable silhouette.",
      },
      {
        title: "Glazed arrival",
        copy: "The full-height triangular facade opens the compact interior toward the landscape.",
      },
      {
        title: "Compact escape",
        copy: "One bed, one bath and a kitchenette resolved within 436 square feet.",
      },
    ],
  },
  octapod: {
    videoSrc: "/models/octapod/video/octapod-360-scroll-648p-24fps-fluid.mp4",
    detailVideoSrc: "/models/octapod/video/octapod-360-scroll-1080p-24fps-smooth.mp4",
    posterSrc:
      "/models/octapod/orbit-keyframes-muted-aubergine-geometry-v2-1080p/octapod-a00.png",
    frameRate: 24,
    gallery: octapodGallery,
    features: [
      {
        title: "Eight-sided calm",
        copy: "A disciplined octagonal shell gives the compact retreat its unmistakable silhouette.",
      },
      {
        title: "Panoramic aperture",
        copy: "Full-height front glazing opens the studio to its setting while opaque facets provide shelter.",
      },
      {
        title: "Resort-ready studio",
        copy: "One bed, one bath and one kitchenette resolved within 300 square feet.",
      },
    ],
  },
};

const formatArea = (model: OknoModel, variantIndex = 0) => {
  const variant = model.variants[variantIndex] ?? model.variants[0];
  if (!variant) return "Area on request";
  return variant.areaDisplay ?? `${variant.areaSqFt.toLocaleString("en-IN")} sq ft`;
};

const variantMatchesPlan = (variantName: string, filter: PlanFilter) => {
  const normalizedName = variantName.toLowerCase().replace(/[-_]/g, " ");
  if (filter === "all") return true;
  if (filter === "studio") return normalizedName.includes("studio");
  return normalizedName.includes(filter.replace("-", " "));
};

const getPlanVariantIndex = (model: OknoModel, filter: PlanFilter) => {
  if (filter === "all") return 0;
  return model.variants.findIndex((variant) =>
    variantMatchesPlan(variant.name, filter),
  );
};

type BentoOrigin = {
  x: number;
  y: number;
  scale: number;
};

type BentoCardKey = "specification" | "gallery" | "build" | "warranty";
type BentoOrigins = Record<BentoCardKey, BentoOrigin>;
type DetailsOrigin = { x: number; y: number };

const settleEase: [number, number, number, number] = [0.33, 0, 0.2, 1];
const retractEase: [number, number, number, number] = [0.65, 0, 0.35, 1];
const collapsedBentoOrigin: BentoOrigin = { x: 0, y: 0, scale: 0.1 };
const bentoCardKeys: BentoCardKey[] = [
  "specification",
  "gallery",
  "build",
  "warranty",
];

const detailsGridVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.04,
      staggerChildren: 0.03,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
};

const bentoCardVariants: Variants = {
  hidden: ({ x, y, scale }: BentoOrigin) => ({
    opacity: 0.18,
    x,
    y,
    scale,
  }),
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    transition: {
      duration: 1.65,
      ease: settleEase,
    },
  },
  exit: ({ x, y, scale }: BentoOrigin) => ({
    opacity: 0.12,
    x,
    y,
    scale,
    transition: {
      duration: 1.05,
      ease: retractEase,
    },
  }),
};

export default function ForzaExperience({ models, initialModelSlug = "forza", initialDetailsOpen = false, initialVariantId = null }: {
  models: OknoModel[];
  initialModelSlug?: string;
  initialDetailsOpen?: boolean;
  initialVariantId?: string | null;
}) {
  const content = useSiteContentMap();
  const collections = useSiteCollectionsMap();
  const modelRecords = collections["signature.models"] ?? signatureModelDefaults;
  const planRecords = collections["signature.plans"] ?? signaturePlanDefaults(content);
  const get = (id: string, fallback: string) => content[`models.signature.${id}`] ?? fallback;
  const trackRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const detailVideoRef = useRef<HTMLVideoElement>(null);
  const targetProgressRef = useRef(0);
  const requestedFrameRef = useRef(-1);
  const scrubFrameRef = useRef<number | null>(null);
  const scrubTimerRef = useRef<number | null>(null);
  const detailSettleTimerRef = useRef<number | null>(null);
  const detailRequestRef = useRef(0);
  const scheduleScrubRef = useRef<() => void>(() => undefined);
  const scheduleDetailRef = useRef<() => void>(() => undefined);
  const detailsTriggerRef = useRef<HTMLButtonElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [videoReady, setVideoReady] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const initialModelExists = modelRecords.some(record => record.id === initialModelSlug);
  const [detailsOpen, setDetailsOpen] = useState(initialDetailsOpen && initialModelExists);
  const [linkedVariantId, setLinkedVariantId] = useState(initialVariantId);
  const [detailsOrigin, setDetailsOrigin] = useState<DetailsOrigin>({ x: 0, y: 0 });
  const [activeSlug, setActiveSlug] = useState(initialModelExists ? initialModelSlug : "forza");
  const [planFilter, setPlanFilter] = useState<PlanFilter>("all");
  useEffect(() => {
    document.documentElement.removeAttribute("data-model-transition");
    try { sessionStorage.removeItem("okno-model-destination"); } catch {}
  }, []);
  const orderedModels = modelRecords.flatMap((record, index): OknoModel[] => {
    const original = models.find(model => model.slug === record.id);
    const plans = planRecords.filter(plan => plan.fields.modelId === record.id);
    if (!plans.length) return [];
    return [{
      ...(original ?? { number: index + 1, slug: record.id, category: "home" as const, sourceUrl: "", description: record.fields.description || "" }),
      name: original ? original.name : record.fields.name || record.id,
      variants: plans.map((plan, planIndex) => ({
        ...(original?.variants[planIndex] ?? { areaSqFt: 0, price: { display: "", sourceDisplay: "Client-managed", status: "verified" as const } }),
        name: plan.fields.name,
        areaDisplay: plan.fields.area,
        spaces: (plan.fields.spaces || "").split(" · ").filter(Boolean),
        price: { ...(original?.variants[planIndex]?.price ?? { sourceDisplay: "Client-managed", status: "verified" as const }), display: plan.fields.price },
      })),
    }];
  });
  const activeModel = orderedModels.find(model => model.slug === activeSlug) ?? orderedModels[0] ?? models[0]!;
  const activeRecord = modelRecords.find(record => record.id === activeModel.slug);
  const filteredModels = orderedModels.filter(
    (model) => getPlanVariantIndex(model, planFilter) >= 0,
  );
  const activeVariantIndex = Math.max(0, getPlanVariantIndex(activeModel, planFilter));
  const activeVariant =
    activeModel.variants[activeVariantIndex] ?? activeModel.variants[0];
  const sourceExperience = experienceBySlug[activeModel.slug] ?? experienceBySlug.forza;
  const customFeatures = parseSignatureFeatures(activeRecord?.fields.features);
  const defaultGallery = sourceExperience.gallery.map((image, index) => ({
    id: `${activeModel.slug}-gallery-${index + 1}`,
    fields: {
      label: get(`${activeModel.slug}.gallery-${index + 1}.label`, image.label),
      image: get(`${activeModel.slug}.gallery-${index + 1}.image`, image.src),
      alt: get(`${activeModel.slug}.gallery-${index + 1}.alt`, image.alt),
    },
  }));
  const customGallery = parseSignatureGallery(activeRecord?.fields.gallery);
  const galleryRecords = useSiteCollection(`signature.gallery.${activeModel.slug}`, defaultGallery);
  const posterSrc = activeRecord?.fields.poster || get(`${activeModel.slug}.poster`, sourceExperience.posterSrc);
  const presentationModel: OknoModel = {
    ...activeModel,
    name: get(`${activeModel.slug}.display-name`, activeRecord?.fields.name || activeModel.name),
  };
  const experience = {
    ...sourceExperience,
    videoSrc: activeRecord?.fields.orbitFilm || get(`${activeModel.slug}.orbit-film`, sourceExperience.videoSrc),
    detailVideoSrc: activeRecord?.fields.detailFilm || get(`${activeModel.slug}.detail-film`, sourceExperience.detailVideoSrc),
    posterSrc,
    gallery: (customGallery.length ? customGallery.map(image => ({ id: image.id, fields: image })) : galleryRecords.length ? galleryRecords : [{ id: `${activeModel.slug}-poster`, fields: { label: "Exterior", image: posterSrc, alt: `${presentationModel.name} exterior` } }]).map((item): GalleryImage => ({
      id: item.id,
      label: item.fields.label || "View",
      src: item.fields.image || posterSrc,
      alt: item.fields.alt || `${presentationModel.name} view`,
    })),
    features: sourceExperience.features.map((feature, index) => ({
      title: customFeatures[index]?.title || get(`${activeModel.slug}.feature-${index + 1}.title`, feature.title),
      copy: customFeatures[index]?.copy || get(`${activeModel.slug}.feature-${index + 1}.copy`, feature.copy),
    })) as ExperienceConfig["features"],
  };
  const scrubFrameRate = Math.min(experience.frameRate, MAX_SCRUB_FPS);
  const attachActiveVideo = useCallback((node: HTMLVideoElement | null) => {
    // Ignore a keyed video's late null ref so it cannot detach the scrub
    // controller from the replacement video.
    if (node) videoRef.current = node;
  }, []);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  const progress = useSpring(scrollYProgress, {
    stiffness: 125,
    damping: 30,
    mass: 0.62,
    restDelta: 0.0002,
  });

  // A short, critically damped spring gives the orbit perceptible mass. It
  // continues for roughly a quarter second after wheel input ends, without
  // overshooting the scroll-selected angle.
  const rotationProgress = useSpring(scrollYProgress, {
    stiffness: 300,
    damping: 32,
    mass: 0.85,
    restDelta: 0.002,
    restSpeed: 0.01,
  });

  const introOpacity = useTransform(progress, [0, 0.055, 0.13], [1, 1, 0]);
  const introY = useTransform(progress, [0, 0.13], [0, -14]);
  const cueOpacity = useTransform(progress, [0, 0.045, 0.1], [1, 1, 0]);
  const actionOpacity = useTransform(progress, [0, 0.1, 0.84, 1], [0.66, 0.42, 0.42, 1]);

  useMotionValueEvent(rotationProgress, "change", (latest) => {
    const video = videoRef.current;
    if (video && video.readyState >= 1 && Number.isFinite(video.duration)) {
      const targetFrame = Math.round(
        mapProgressToTime(latest, video.duration, scrubFrameRate) * scrubFrameRate,
      );
      if (targetFrame === requestedFrameRef.current) return;
    }
    targetProgressRef.current = latest;
    setDetailVisible(false);
    scheduleScrubRef.current();
    scheduleDetailRef.current();
  });

  useEffect(() => {
    if (prefersReducedMotion) return;

    const video = videoRef.current;
    if (!video) return;
    let prepared = false;

    const prepareVideo = () => {
      if (
        prepared ||
        video.readyState < 2 ||
        !Number.isFinite(video.duration)
      ) {
        return;
      }

      prepared = true;
      const initialProgress = progress.get();
      const initialTime = mapProgressToTime(
        initialProgress,
        video.duration,
        scrubFrameRate,
      );

      video.pause();
      targetProgressRef.current = initialProgress;
      requestedFrameRef.current = Math.round(initialTime * scrubFrameRate);
      video.currentTime = initialTime;
      setVideoReady(true);
    };

    prepareVideo();
    video.addEventListener("loadeddata", prepareVideo, { once: true });

    return () => {
      video.removeEventListener("loadeddata", prepareVideo);
    };
  }, [
    activeModel.slug,
    experience.videoSrc,
    prefersReducedMotion,
    progress,
    scrubFrameRate,
  ]);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const detailVideo = detailVideoRef.current;
    if (!detailVideo) return;
    let cancelled = false;

    const refineFrame = (requestId: number) => {
      detailSettleTimerRef.current = null;
      if (
        cancelled ||
        document.hidden ||
        detailVideo.readyState < 2 ||
        !Number.isFinite(detailVideo.duration)
      ) {
        return;
      }

      const motionTime = videoRef.current?.currentTime;
      const targetTime = typeof motionTime === "number" && Number.isFinite(motionTime)
        ? Math.min(detailVideo.duration - 1 / scrubFrameRate, Math.max(0, motionTime))
        : mapProgressToTime(
            targetProgressRef.current,
            detailVideo.duration,
            scrubFrameRate,
          );
      const reveal = () => {
        if (!cancelled && requestId === detailRequestRef.current) {
          setDetailVisible(true);
        }
      };

      detailVideo.pause();
      if (Math.abs(detailVideo.currentTime - targetTime) < 1 / scrubFrameRate) {
        reveal();
        return;
      }

      detailVideo.addEventListener("seeked", reveal, { once: true });
      detailVideo.currentTime = targetTime;
    };

    const scheduleDetail = () => {
      const requestId = ++detailRequestRef.current;
      if (detailSettleTimerRef.current !== null) {
        window.clearTimeout(detailSettleTimerRef.current);
      }
      detailSettleTimerRef.current = window.setTimeout(
        () => refineFrame(requestId),
        140,
      );
    };

    const prepareDetail = () => scheduleDetail();
    scheduleDetailRef.current = scheduleDetail;
    if (detailVideo.readyState >= 2) prepareDetail();
    else detailVideo.addEventListener("loadeddata", prepareDetail, { once: true });

    return () => {
      cancelled = true;
      detailRequestRef.current += 1;
      scheduleDetailRef.current = () => undefined;
      detailVideo.removeEventListener("loadeddata", prepareDetail);
      if (detailSettleTimerRef.current !== null) {
        window.clearTimeout(detailSettleTimerRef.current);
        detailSettleTimerRef.current = null;
      }
    };
  }, [activeModel.slug, experience.detailVideoSrc, prefersReducedMotion, scrubFrameRate]);

  useEffect(() => {
    if (prefersReducedMotion || !videoReady) return;

    const video = videoRef.current;
    if (!video) return;
    const track = trackRef.current;
    let trackVisible = true;
    let lastSeekAt = 0;
    // Schedule slightly above the source cadence to absorb event-loop overhead;
    // frame quantization still prevents requesting more than 24 unique frames.
    const minimumSeekInterval = 1000 / SCRUB_SCHEDULER_FPS;

    const scrubVideo = () => {
      scrubFrameRef.current = null;
      if (!trackVisible || document.hidden) return;

      const elapsed = performance.now() - lastSeekAt;
      if (elapsed < minimumSeekInterval) {
        if (scrubTimerRef.current === null) {
          scrubTimerRef.current = window.setTimeout(() => {
            scrubTimerRef.current = null;
            scrubVideo();
          }, minimumSeekInterval - elapsed);
        }
        return;
      }

      const seekRequest = getVideoSeekRequest({
        duration: video.duration,
        frameRate: scrubFrameRate,
        progress: targetProgressRef.current,
        readyState: video.readyState,
        requestedFrame: requestedFrameRef.current,
        seeking: video.seeking,
      });

      if (seekRequest) {
        requestedFrameRef.current = seekRequest.frameIndex;
        lastSeekAt = performance.now();
        video.currentTime = seekRequest.time;
      }
    };

    const scheduleScrub = () => {
      if (scrubFrameRef.current === null && trackVisible && !document.hidden) {
        scrubFrameRef.current = requestAnimationFrame(scrubVideo);
      }
    };

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        trackVisible = entry.isIntersecting;
        if (!trackVisible && scrubFrameRef.current !== null) {
          cancelAnimationFrame(scrubFrameRef.current);
          scrubFrameRef.current = null;
        } else if (trackVisible) {
          scheduleScrub();
        }
      },
      { rootMargin: "120px 0px" },
    );

    const handleVisibilityChange = () => {
      if (document.hidden && scrubFrameRef.current !== null) {
        cancelAnimationFrame(scrubFrameRef.current);
        scrubFrameRef.current = null;
      } else {
        scheduleScrub();
      }
    };

    scheduleScrubRef.current = scheduleScrub;
    video.addEventListener("seeked", scrubVideo);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    if (track) visibilityObserver.observe(track);
    scheduleScrub();

    return () => {
      scheduleScrubRef.current = () => undefined;
      video.removeEventListener("seeked", scrubVideo);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      visibilityObserver.disconnect();
      if (scrubTimerRef.current !== null) {
        window.clearTimeout(scrubTimerRef.current);
        scrubTimerRef.current = null;
      }
      if (scrubFrameRef.current !== null) {
        cancelAnimationFrame(scrubFrameRef.current);
        scrubFrameRef.current = null;
      }
    };
  }, [activeModel.slug, prefersReducedMotion, scrubFrameRate, videoReady]);

  const selectModel = (slug: string) => {
    if (slug === activeSlug || !orderedModels.some(model => model.slug === slug)) return;

    const track = trackRef.current;
    const trackTop = track
      ? window.scrollY + track.getBoundingClientRect().top
      : 0;

    window.scrollTo({ top: trackTop, behavior: "auto" });
    scrollYProgress.jump(0);
    progress.jump(0);
    rotationProgress.jump(0);
    setVideoReady(false);
    setDetailVisible(false);
    detailRequestRef.current += 1;
    requestedFrameRef.current = -1;
    targetProgressRef.current = 0;
    setDetailsOpen(false);
    setLinkedVariantId(null);
    setActiveSlug(slug);
  };

  const selectPlan = (filter: PlanFilter) => {
    if (filter === planFilter) return;

    setPlanFilter(filter);
    const nextModels = orderedModels.filter(
      (model) => getPlanVariantIndex(model, filter) >= 0,
    );
    const activeStillAvailable = nextModels.some(
      (model) => model.slug === activeModel.slug,
    );

    if (!activeStillAvailable && nextModels[0]) {
      selectModel(nextModels[0].slug);
    }
  };

  const openDetails = () => {
    setLinkedVariantId(null);
    const triggerRect = detailsTriggerRef.current?.getBoundingClientRect();
    if (triggerRect) {
      setDetailsOrigin({
        x: triggerRect.left + triggerRect.width / 2,
        y: triggerRect.top + triggerRect.height / 2,
      });
    }
    setDetailsOpen(true);
  };

  useEffect(() => {
    const firstDetailImage = experience.gallery[1] ?? experience.gallery[0];
    if (!firstDetailImage) return;

    const image = document.createElement("img");
    image.decoding = "async";
    image.src = firstDetailImage.src;
    if (typeof image.decode === "function") {
      void image.decode().catch(() => undefined);
    }
  }, [activeModel.slug, experience.gallery]);

  return (
    <main className={styles.page}>
      <section
        ref={trackRef}
        className={`${styles.scrollTrack} ${
          prefersReducedMotion ? styles.reducedTrack : ""
        }`}
        aria-label={`${presentationModel.name} scroll-controlled ${experience.orbitDegrees ?? 360} degree experience`}
      >
        <div className={styles.stage}>
          <div
            className={`${styles.ambientGlow} ${
              activeModel.slug === "gaze" ? styles.ambientGlowGaze : ""
            } ${
              activeModel.slug === "tengo" ? styles.ambientGlowTengo : ""
            } ${
              activeModel.slug === "trib" ? styles.ambientGlowTrib : ""
            } ${
              activeModel.slug === "octapod" ? styles.ambientGlowOctapod : ""
            }`}
          />

          <ModelsHeader tone="dark" enquireHref={`/enquiry?model=${activeModel.slug}`} />

          <motion.div
            className={styles.productStage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              key={`${activeModel.slug}:${experience.videoSrc}:${experience.detailVideoSrc}`}
              className={styles.productTransition}
              initial={{ opacity: 0, x: 22 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            >
                {prefersReducedMotion ? (
                  <Image
                    src={experience.posterSrc}
                    alt={activeRecord?.fields.posterAlt || get(`${activeModel.slug}.poster-alt`, `${presentationModel.name} modular home in the Signature collection`)}
                    fill
                    priority
                    sizes="100vw"
                    className={styles.productMedia}
                  />
                ) : (
                  <video
                    ref={attachActiveVideo}
                    className={`${styles.productMedia} ${styles.motionMedia}`}
                    muted
                    playsInline
                    disablePictureInPicture
                    controls={false}
                    preload="auto"
                    poster={experience.posterSrc}
                    aria-label={get(`${activeModel.slug}.orbit-description`, `${presentationModel.name} rotating in response to page scroll`)}
                  >
                    <source src={experience.videoSrc} type="video/mp4" />
                  </video>
                )}
                {!prefersReducedMotion && (
                  <video
                    ref={detailVideoRef}
                    className={`${styles.productMedia} ${styles.detailMedia}`}
                    data-visible={detailVisible}
                    muted
                    playsInline
                    disablePictureInPicture
                    controls={false}
                    preload="auto"
                    poster={experience.posterSrc}
                    aria-hidden="true"
                  >
                    <source src={experience.detailVideoSrc} type="video/mp4" />
                  </video>
                )}
            </motion.div>
          </motion.div>

          <div className={styles.sceneShade} />

          <AnimatePresence>
            {!videoReady && !prefersReducedMotion && (
              <motion.div
                className={styles.loader}
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
              >
                <span />
                <p>{get("loading", "Loading")} {presentationModel.name}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            className={styles.intro}
            style={{ opacity: introOpacity, y: introY }}
          >
            <p>{get("eyebrow", "Signature collection")}</p>
            <h1>{presentationModel.name}</h1>
            <div className={styles.introFacts}>
              <span>{presentationModel.variants[activeVariantIndex]?.name ?? activeVariant?.name}</span>
              <span>{formatArea(presentationModel, activeVariantIndex)}</span>
              <span className={styles.introPrice}>
                {presentationModel.variants[activeVariantIndex]?.price.display ?? activeVariant?.price.display}
              </span>
            </div>
          </motion.div>

          <div className={styles.planFilter} role="group" aria-label={get("plan-filter-label", "Filter by floor plan")}>
            {planFilters.map((filter) => {
              const selected = filter.value === planFilter;
              return (
                <button
                  key={filter.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => selectPlan(filter.value)}
                >
                  {selected && (
                    <motion.span
                      layoutId="active-plan-filter"
                      className={styles.planFilterIndicator}
                      transition={
                        prefersReducedMotion
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 360, damping: 32 }
                      }
                    />
                  )}
                  <span className={styles.planFilterText}>{get(`filter-${filter.value}`, filter.label)}</span>
                </button>
              );
            })}
          </div>

          {!prefersReducedMotion && (
            <>
              <FeatureCard
                progress={progress}
                range={[0.12, 0.18, 0.3, 0.38]}
                placement="upperLeft"
                eyebrow={get("feature-eyebrow", "Signature detail")}
                title={experience.features[0].title}
                copy={experience.features[0].copy}
              />
              <FeatureCard
                progress={progress}
                range={[0.32, 0.39, 0.51, 0.59]}
                placement="upperRight"
                eyebrow={get("feature-eyebrow", "Signature detail")}
                title={experience.features[1].title}
                copy={experience.features[1].copy}
              />
              <FeatureCard
                progress={progress}
                range={[0.54, 0.61, 0.77, 0.85]}
                placement="lowerRight"
                eyebrow={get("feature-eyebrow", "Signature detail")}
                title={experience.features[2].title}
                copy={experience.features[2].copy}
              />
            </>
          )}

          <motion.div className={styles.scrollCue} style={{ opacity: cueOpacity }}>
            <span aria-hidden="true">↓</span>
            <p>{get("scroll-cue", "Scroll to rotate")}</p>
          </motion.div>

          <motion.div className={styles.bottomDock} style={{ opacity: actionOpacity }}>
            <motion.div
              layout={!prefersReducedMotion}
              className={styles.modelSelector}
              role="group"
              aria-label={get("models-label", "Signature models")}
            >
              <AnimatePresence initial={false} mode="popLayout">
                {filteredModels.map((model) => (
                  <motion.button
                    layout={!prefersReducedMotion}
                    key={model.slug}
                    type="button"
                    aria-pressed={model.slug === activeModel.slug}
                    className={model.slug === activeModel.slug ? styles.activeModel : undefined}
                    onClick={() => selectModel(model.slug)}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 5, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={
                      prefersReducedMotion
                        ? { opacity: 0, pointerEvents: "none" }
                        : { opacity: 0, y: 5, scale: 0.96, pointerEvents: "none" }
                    }
                    transition={{ duration: prefersReducedMotion ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {model.name}
                  </motion.button>
                ))}
              </AnimatePresence>
            </motion.div>
            <p className={styles.filterStatus} aria-live="polite">
              {filteredModels.length} {filteredModels.length === 1 ? get("home-singular", "home") : get("home-plural", "homes")} {get("available", "available")}
            </p>
            <button
              ref={detailsTriggerRef}
              type="button"
              className={styles.detailsButton}
              onClick={openDetails}
            >
              <span aria-hidden="true">⊞</span>
              {activeRecord?.fields.exploreAction || get(`${activeModel.slug}.explore-action`, get("details-action", "Explore details"))}
            </button>
          </motion.div>

        </div>
      </section>

      <AnimatePresence>
        {detailsOpen && (
          <DetailsLayer
            model={presentationModel}
            initialVariantIndex={linkedVariantId ? Math.max(0, activeModel.variants.findIndex((_, index) => exploreVariantId(activeModel.slug, index) === linkedVariantId)) : activeVariantIndex}
            gallery={experience.gallery}
            origin={detailsOrigin}
            onClose={() => setDetailsOpen(false)}
            returnFocusRef={detailsTriggerRef}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

function FeatureCard({
  progress,
  range,
  placement,
  eyebrow,
  title,
  copy,
}: {
  progress: MotionValue<number>;
  range: [number, number, number, number];
  placement: "upperLeft" | "upperRight" | "lowerRight";
  eyebrow: string;
  title: string;
  copy: string;
}) {
  const opacity = useTransform(progress, range, [0, 1, 1, 0]);
  const y = useTransform(progress, range, [14, 0, 0, -10]);
  const scale = useTransform(progress, [range[0], range[1]], [0.98, 1]);

  return (
    <motion.article
      className={`${styles.featureCard} ${styles[placement]}`}
      style={{ opacity, y, scale }}
    >
      <div className={styles.featureTopline}>
        <span>{eyebrow}</span>
        <span aria-hidden="true">↗</span>
      </div>
      <h2>{title}</h2>
      <p>{copy}</p>
      <i aria-hidden="true" />
    </motion.article>
  );
}

function AccessibleVariantStack({ children, slug, index, direction, reducedMotion }: {
  children: ReactNode;
  slug: string;
  index: number;
  direction: number;
  reducedMotion: boolean;
}) {
  const isPresent = useIsPresent();
  return <motion.div
    key={`${slug}-variant-${index}`}
    data-variant-stack={index}
    className={styles.variantStack}
    aria-hidden={!isPresent}
    inert={!isPresent}
    custom={direction}
    initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: direction * 72 }}
    animate={{ opacity: 1, x: 0 }}
    exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: direction * -72 }}
    transition={{ duration: reducedMotion ? 0.01 : 0.48, ease: [0.22, 1, 0.36, 1] }}
  >{children}</motion.div>;
}

function DetailsLayer({
  model,
  initialVariantIndex,
  gallery,
  origin,
  onClose,
  returnFocusRef,
}: {
  model: OknoModel;
  initialVariantIndex: number;
  gallery: GalleryImage[];
  origin: DetailsOrigin;
  onClose: () => void;
  returnFocusRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const content = useSiteContentMap();
  const get = (id: string, fallback: string) => content[`models.signature.${id}`] ?? fallback;
  const panelRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [variantIndex, setVariantIndex] = useState(initialVariantIndex);
  const [variantDirection, setVariantDirection] = useState(1);
  const [selectedGalleryId, setSelectedGalleryId] = useState(gallery[1]?.id ?? gallery[0]?.id ?? "");
  const [galleryDirection, setGalleryDirection] = useState(1);
  const [bentoOrigins, setBentoOrigins] = useState<BentoOrigins | null>(null);
  const variant = model.variants[variantIndex] ?? model.variants[0];
  const configurationVariantId = exploreVariantId(model.slug, variantIndex);
  const galleryIndex = Math.max(0, gallery.findIndex(image => image.id === selectedGalleryId));
  const galleryImage = gallery[galleryIndex] ?? gallery[0]!;
  const variantDetails = [
    {
      label: get("detail.internal-area", "Internal area"),
      value:
        variant.areaDisplay ??
        `${variant.areaSqFt.toLocaleString("en-IN")} sq ft`,
    },
    { label: get("detail.starting-price", "Starting price"), value: variant.price.display, emphasis: true },
    { label: get("detail.delivery", "Delivery"), value: get("detail.delivery-value", "90 days") },
    { label: get("detail.spaces", "Spaces"), value: variant.spaces.join(" · ") },
  ];

  const selectVariant = (index: number) => {
    if (index === variantIndex) return;
    setVariantDirection(index > variantIndex ? 1 : -1);
    setVariantIndex(index);
  };

  const selectGalleryImage = (index: number) => {
    if (index === galleryIndex) return;
    setGalleryDirection(index > galleryIndex ? 1 : -1);
    setSelectedGalleryId(gallery[index]?.id ?? gallery[0]?.id ?? "");
  };

  useLayoutEffect(() => {
    if (prefersReducedMotion || bentoOrigins || !gridRef.current) return;

    const gridRect = gridRef.current.getBoundingClientRect();
    const measuredOrigins = {} as BentoOrigins;

    bentoCardKeys.forEach((key) => {
      const card = gridRef.current?.querySelector<HTMLElement>(
        `[data-bento-card="${key}"]`,
      );
      if (!card) return;

      const width = card.offsetWidth;
      const height = card.offsetHeight;
      const centerX = gridRect.left + card.offsetLeft + width / 2;
      const centerY = gridRect.top + card.offsetTop + height / 2;
      const longestSide = Math.max(width, height, 1);
      measuredOrigins[key] = {
        x: origin.x - centerX,
        y: origin.y - centerY,
        scale: Math.max(0.065, Math.min(0.16, 54 / longestSide)),
      };
    });

    if (bentoCardKeys.every((key) => measuredOrigins[key])) {
      setBentoOrigins(measuredOrigins);
    }
  }, [bentoOrigins, origin.x, origin.y, prefersReducedMotion]);

  useEffect(() => {
    const preloadTimer = window.setTimeout(() => {
      gallery.forEach(({ src }) => {
        const image = document.createElement("img");
        image.decoding = "async";
        image.src = src;
        if (typeof image.decode === "function") {
          void image.decode().catch(() => undefined);
        }
      });
    }, 1500);

    return () => window.clearTimeout(preloadTimer);
  }, [gallery]);

  useEffect(() => {
    const returnFocusElement = returnFocusRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const handleKeys = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'button, a[href], [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.hasAttribute("disabled"));
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeys);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeys);
      returnFocusElement?.focus();
    };
  }, [onClose, returnFocusRef]);

  return (
    <motion.div
      ref={panelRef}
      className={styles.detailsLayer}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${model.slug}-details-title`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.01 } }}
      exit={{ opacity: 0, transition: { duration: 0.18, delay: 1.03 } }}
    >
      <motion.div
        className={styles.detailsBackdrop}
        initial={prefersReducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: prefersReducedMotion ? 0.01 : 0.52, ease: settleEase }}
      />

      <motion.div
        className={styles.detailsHeader}
        initial={prefersReducedMotion ? false : { opacity: 0, y: -22 }}
        animate={{ opacity: 1, y: 0 }}
        exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -18 }}
        transition={{
          duration: prefersReducedMotion ? 0.01 : 0.62,
          delay: prefersReducedMotion ? 0 : 0.18,
          ease: settleEase,
        }}
      >
          <span>{get("eyebrow", "Signature collection")}</span>
        <button ref={closeRef} type="button" onClick={onClose}>
          {get("detail.close", "Close")} <span aria-hidden="true">×</span>
        </button>
      </motion.div>

      <motion.div
        key={bentoOrigins ? "animated-grid" : "measurement-grid"}
        ref={gridRef}
        className={styles.detailsGrid}
        variants={detailsGridVariants}
        style={{ visibility: prefersReducedMotion || bentoOrigins ? "visible" : "hidden" }}
        initial={prefersReducedMotion || !bentoOrigins ? false : "hidden"}
        animate={prefersReducedMotion || bentoOrigins ? "visible" : undefined}
        exit={prefersReducedMotion ? "visible" : "exit"}
      >
        <motion.section
          className={styles.specCard}
          data-bento-card="specification"
          variants={bentoCardVariants}
          custom={bentoOrigins?.specification ?? collapsedBentoOrigin}
        >
          <p>{get("eyebrow", "Signature collection")}</p>
          <h2 id={`${model.slug}-details-title`}>{model.name}</h2>
          <div className={styles.variantTabs} role="tablist" aria-label={`${model.name} variants`}>
            {model.variants.map((item, index) => (
              <button
                key={`${model.slug}-variant-${index}`}
                type="button"
                role="tab"
                aria-selected={variantIndex === index}
                onClick={() => selectVariant(index)}
              >
                {variantIndex === index && (
                  <motion.span
                    layoutId={`${model.slug}-variant-selection`}
                    className={styles.variantTabFill}
                    transition={{ type: "spring", stiffness: 380, damping: 34 }}
                    aria-hidden="true"
                  />
                )}
                <span className={styles.variantTabLabel}>{item.name}</span>
              </button>
            ))}
          </div>

          <div className={styles.variantViewport}>
            <AnimatePresence initial={false} mode="popLayout" custom={variantDirection}>
              <AccessibleVariantStack
                key={`${model.slug}-variant-${variantIndex}`}
                slug={model.slug}
                index={variantIndex}
                direction={variantDirection}
                reducedMotion={Boolean(prefersReducedMotion)}
              >
                <div className={styles.specRows}>
                  {variantDetails.map((detail, index) => (
                    <DetailRow
                      key={detail.label}
                      label={detail.label}
                      value={detail.value}
                      emphasis={Boolean(detail.emphasis)}
                      direction={variantDirection}
                      index={index}
                      reducedMotion={Boolean(prefersReducedMotion)}
                    />
                  ))}
                </div>

                <motion.div
                  className={styles.configureSlot}
                  initial={
                    prefersReducedMotion
                      ? false
                      : { opacity: 0, x: variantDirection * 24 }
                  }
                  animate={{ opacity: 1, x: 0 }}
                  exit={
                    prefersReducedMotion
                      ? { opacity: 0 }
                      : { opacity: 0, x: variantDirection * -24 }
                  }
                  transition={{
                    duration: prefersReducedMotion ? 0.01 : 0.38,
                    delay: prefersReducedMotion ? 0 : 0.18,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <Link href={configurationVariantId ? `/models/signature/${model.slug}/configure?variant=${configurationVariantId}` : `/enquiry?model=${model.slug}&intent=configure`} className={styles.configureButton}>
                    {get("detail.configure-action", "Configure")} {model.name} <span aria-hidden="true">↗</span>
                  </Link>
                </motion.div>
              </AccessibleVariantStack>
            </AnimatePresence>
          </div>
        </motion.section>

        <motion.section
          className={styles.imageCard}
          data-bento-card="gallery"
          variants={bentoCardVariants}
          custom={bentoOrigins?.gallery ?? collapsedBentoOrigin}
          aria-label={`${model.name} gallery`}
        >
          <AnimatePresence initial={false} mode="popLayout" custom={galleryDirection}>
            <motion.div
              key={galleryImage.id}
              className={styles.galleryFrame}
              custom={galleryDirection}
              initial={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, x: galleryDirection * 28, scale: 1.015 }
              }
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, x: galleryDirection * -28, scale: 0.995 }
              }
              transition={{
                duration: prefersReducedMotion ? 0.01 : 0.46,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <Image
                src={galleryImage.src}
                alt={galleryImage.alt}
                fill
                sizes="(max-width: 760px) 100vw, 58vw"
                className={styles.detailImage}
              />
            </motion.div>
          </AnimatePresence>

          <div className={styles.galleryMeta} aria-live="polite">
            <strong>{galleryImage.label}</strong>
          </div>

          {gallery.length > 1 && <div className={styles.galleryTabs} role="tablist" aria-label={`Choose a view of ${model.name}`}>
            {gallery.map((image, index) => (
              <button
                key={image.id}
                type="button"
                role="tab"
                aria-selected={galleryIndex === index}
                onClick={() => selectGalleryImage(index)}
              >
                {image.label}
              </button>
            ))}
          </div>}
        </motion.section>

        <motion.section
          className={styles.noteCard}
          data-bento-card="build"
          variants={bentoCardVariants}
          custom={bentoOrigins?.build ?? collapsedBentoOrigin}
        >
          <p>{get("detail.build-eyebrow", "Built indoors")}</p>
          <strong>{get("detail.build-line-1", "Factory precision.")}<br />{get("detail.build-line-2", "Landscape presence.")}</strong>
        </motion.section>

        <motion.section
          className={styles.noteCard}
          data-bento-card="warranty"
          variants={bentoCardVariants}
          custom={bentoOrigins?.warranty ?? collapsedBentoOrigin}
        >
          <p>{get("detail.warranty-eyebrow", "Included")}</p>
          <strong>{get("detail.warranty-value", "20-year structural warranty")}</strong>
        </motion.section>
      </motion.div>
    </motion.div>
  );
}

function DetailRow({
  label,
  value,
  emphasis,
  direction,
  index,
  reducedMotion,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
  direction: number;
  index: number;
  reducedMotion: boolean;
}) {
  return (
    <motion.div
      className={`${styles.specRow} ${emphasis ? styles.specRowEmphasis : ""}`}
      initial={reducedMotion ? false : { opacity: 0, x: direction * (22 + index * 4) }}
      animate={{ opacity: 1, x: 0 }}
      exit={
        reducedMotion
          ? { opacity: 0 }
          : { opacity: 0, x: direction * (-18 - index * 4) }
      }
      transition={{
        duration: reducedMotion ? 0.01 : 0.42,
        delay: reducedMotion ? 0 : index * 0.045,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <span>{label}</span>
      <strong>{value}</strong>
    </motion.div>
  );
}
