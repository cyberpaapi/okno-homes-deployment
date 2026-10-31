"use client";

// Bespoke-only composition of retrieved 21st.dev sources:
// Scroll Media Expansion Hero (1932), Glyph Portal (26558), Layered Text (5397),
// Horizontal Scroll (18065), Parallax Scrolling (4775),
// Aurora Background (18263), and Preloader (13967). The page uses the single
// site-wide 21st.dev fluid cursor rather than mounting a second local cursor.
import Image from "next/image";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import {
  AnimatePresence, MotionConfig, motion,
  useReducedMotion, useScroll, useTransform,
} from "motion/react";
import ModelsHeader from "./ModelsHeader";
import { MagneticLink } from "@/components/projects/21st/Magnetic";
import { MasonryLightbox } from "@/components/projects/21st/MasonryLightbox";
import { useProjectsContent } from "@/lib/useProjectContent";
import { localDestination } from "@/lib/localDestination";
import OknoLogo from "@/components/Brand/OknoLogo";
import styles from "./BespokeExperience.module.css";
import { useSiteContentMap } from "@/lib/useSiteContent";
import { previewImageLoader } from "@/lib/thumbnailImageLoader";
import { pageImageLoader } from "@/lib/pageImageLoader";
import { useMediaQuery } from "@/lib/useMediaQuery";

const horizontalStages = [
  { label: "PLACE", detail: "Topography, weather and view", copy: "Read orientation, access, climate and long views before drawing a room.", image: "/assets/projects/real-v1/lakewood-01.webp", alt: "Lakewood Villa entrance and planted garden", tone: "mist" },
  { label: "BRIEF", detail: "Life, ritual and investment", copy: "Understand how you live and what you wish to invest, then design back from both.", image: "/assets/projects/real-v1/lakewood-06.webp", alt: "Lakewood Villa living room opening to the landscaped garden", tone: "pearl" },
  { label: "FORM", detail: "Volume, structure and material", copy: "Shape volume, structure, material and landscape as one response, true to the investment agreed.", image: "/assets/projects/real-v1/lakewood-10.webp", alt: "Aerial view of Lakewood Villa, its pool and gardens at dusk", tone: "ice" },
  { label: "ATMOSPHERE", detail: "Light, texture and landscape", copy: "Tune light, texture and thresholds until the home feels inseparable from its setting.", image: "/assets/projects/real-v1/lakewood-02.webp", alt: "Lakewood Villa framed by its landscape and swimming pool", tone: "blue" },
] as const;

export default function BespokeExperience() {
  const content = useSiteContentMap();
  const projects = useProjectsContent();
  const lakewood = projects.find(project => project.id === "lakewood");
  const get = (id: string, fallback: string) => content[`models.bespoke.${id}`] ?? fallback;
  const currentStages = horizontalStages.map((stage, index) => ({
    ...stage,
    label: get(`stage-${index + 1}.label`, stage.label),
    detail: get(`stage-${index + 1}.detail`, stage.detail),
    copy: get(`stage-${index + 1}.copy`, stage.copy),
    image: get(`stage-${index + 1}.image`, stage.image),
    alt: get(`stage-${index + 1}.alt`, stage.alt),
  }));
  const heroRef = useRef<HTMLElement>(null);
  const horizontalRef = useRef<HTMLElement>(null);
  const parallaxRef = useRef<HTMLElement>(null);
  const reduced = Boolean(useReducedMotion());
  const [heroReady, setHeroReady] = useState(false);
  const [heroStart, setHeroStart] = useState({ width: "48vw", height: "44svh" });

  useEffect(() => {
    const tablet = window.matchMedia("(max-width: 1000px)");
    const phone = window.matchMedia("(max-width: 700px)");
    const sync = () => setHeroStart(phone.matches ? { width: "86vw", height: "54svh" } : tablet.matches ? { width: "72vw", height: "54svh" } : { width: "48vw", height: "44svh" });
    sync();
    tablet.addEventListener("change", sync);
    phone.addEventListener("change", sync);
    return () => { tablet.removeEventListener("change", sync); phone.removeEventListener("change", sync); };
  }, []);

  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ["start start", "end end"] });
  const heroWidth = useTransform(heroProgress, [0, .82], reduced ? ["100vw", "100vw"] : [heroStart.width, "100vw"]);
  const heroHeight = useTransform(heroProgress, [0, .82], reduced ? ["100svh", "100svh"] : [heroStart.height, "100svh"]);
  const heroRadius = useTransform(heroProgress, [0, .82], reduced ? [0, 0] : [34, 0]);
  const heroScale = useTransform(heroProgress, [0, 1], reduced ? [1, 1] : [1.08, 1]);
  const heroBackdropOpacity = useTransform(heroProgress, [0, .75], [.5, 0]);
  const heroTextOpacity = useTransform(heroProgress, [0, .42, .76], [1, 1, 0]);
  const heroTextY = useTransform(heroProgress, [0, .76], reduced ? [0, 0] : [0, -54]);

  const { scrollYProgress: horizontalProgress } = useScroll({ target: horizontalRef, offset: ["start start", "end end"] });
  const horizontalX = useTransform(horizontalProgress, [0, 1], reduced ? ["0%", "0%"] : ["0%", "-75%"]);
  const { scrollYProgress: parallaxProgress } = useScroll({ target: parallaxRef, offset: ["start end", "end start"] });
  const parallaxImageY = useTransform(parallaxProgress, [0, 1], reduced ? [0, 0] : [90, -90]);
  const parallaxImageScale = useTransform(parallaxProgress, [0, .42], reduced ? [1, 1] : [1.08, 1]);
  const parallaxImageClip = useTransform(parallaxProgress, [0, .32], reduced ? ["inset(0% 0% 0% 0% round 0px)", "inset(0% 0% 0% 0% round 0px)"] : ["inset(42% 7% 0% 7% round 36px 36px 0 0)", "inset(0% 0% 0% 0% round 0px)"]);
  const parallaxCardY = useTransform(parallaxProgress, [0, 1], reduced ? [0, 0] : [180, -140]);
  const parallaxWordY = useTransform(parallaxProgress, [0, 1], reduced ? [0, 0] : [120, -120]);

  const moveToDecision = (index: number) => {
    if (index >= horizontalStages.length) { document.getElementById("original")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" }); return; }
    const section = horizontalRef.current;
    if (!section) return;
    if (window.matchMedia("(max-width: 700px)").matches || reduced) {
      document.getElementById(`decision-${index}`)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
      return;
    }
    const top = window.scrollY + section.getBoundingClientRect().top;
    window.scrollTo({ top: top + (section.offsetHeight - window.innerHeight) * (index / (horizontalStages.length - 1)), behavior: "smooth" });
  };

  return (
    <MotionConfig reducedMotion="user">
      <BespokeEntrance ready={heroReady} />
      <main className={styles.page}>
        <AuroraWallpaper />
        <ModelsHeader tone="light" />

        <section ref={heroRef} className={styles.hero} data-type-section="bespoke.hero" aria-labelledby="bespoke-title">
          <div className={styles.heroSticky}>
            <motion.div className={styles.heroBackdrop} style={{ opacity: heroBackdropOpacity }} aria-hidden="true"><Image loader={pageImageLoader} src={get("hero.image", "/assets/projects/real-v1/lakewood-01.webp")} alt="" fill priority sizes="100vw" className={styles.image} /></motion.div>
            <motion.div className={styles.heroLayers} style={{ opacity: heroTextOpacity, y: heroTextY }} aria-hidden="true"><span data-type-field={"models.bespoke.hero.background-word"}>{get("hero.background-word", "BESPOKE")}</span><span data-type-field={"models.bespoke.hero.background-word"}>{get("hero.background-word", "BESPOKE")}</span><span data-type-field={"models.bespoke.hero.background-word"}>{get("hero.background-word", "BESPOKE")}</span></motion.div>
            <motion.div className={styles.heroFrame} style={{ width: heroWidth, height: heroHeight, borderRadius: heroRadius }}>
              <motion.div className={styles.heroImage} style={{ scale: heroScale }}>
                <Image loader={pageImageLoader} src={get("hero.image", "/assets/projects/real-v1/lakewood-01.webp")} alt={get("hero.alt", "Lakewood Villa and its pool at dusk")} fill priority sizes="100vw" className={styles.image} onLoad={() => setHeroReady(true)} onError={() => setHeroReady(true)} />
              </motion.div>
              <div className={styles.heroShade} aria-hidden="true" />
              <motion.div className={styles.heroWords} style={{ opacity: heroTextOpacity }}><p data-type-field={"models.bespoke.hero.eyebrow"}>{get("hero.eyebrow", "Bespoke by OKNO")}</p><h1 id="bespoke-title" aria-label={`${get("hero.line-1", "A home authored")} ${get("hero.line-2", "from place.")}`} data-type-field={"models.bespoke.hero.line-1"}>{get("hero.line-1", "A home authored")}<br />{get("hero.line-2", "from place.")}</h1></motion.div>
            </motion.div>
          </div>
        </section>

        <section id="manifesto" className={styles.manifesto} data-type-section="bespoke.manifesto" aria-labelledby="manifesto-title">
          <div className={styles.manifestoCopy} data-type-field={"models.bespoke.manifesto.line-1"}>
            <p className={styles.kicker} data-type-field={"models.bespoke.manifesto.eyebrow"}>{get("manifesto.eyebrow", "One of one. Calibrated.")}</p>
            <LayeredHeading id="manifesto-title" lines={[get("manifesto.line-1", "NOT SELECTED."), get("manifesto.line-2", "NOT ADAPTED."), get("manifesto.line-3", "AUTHORED.")]} />
            <p className={styles.bodyCopy} data-type-field={"models.bespoke.manifesto.copy"}>{get("manifesto.copy", "Bespoke begins where a catalogue ends. Every home is calibrated: designed back from your land, your life and your investment.")}</p>
          </div>
          <motion.figure className={styles.manifestoMedia} initial={reduced ? false : { clipPath: "inset(18% 10% 18% 10% round 32px)" }} whileInView={{ clipPath: "inset(0% 0% 0% 0% round 32px)" }} viewport={{ once: true, amount: .28 }} transition={{ duration: 1.2, ease: [.22, 1, .36, 1] }}>
            <Image loader={previewImageLoader} src={get("manifesto.image", "/assets/projects/real-v1/lakewood-02.webp")} alt={get("manifesto.alt", "Lakewood Villa framed by its landscape and swimming pool")} fill sizes="(max-width: 800px) 100vw, 58vw" className={styles.image} />
          </motion.figure>
        </section>

        <GlyphPortal />

        <section id="decisions" ref={horizontalRef} className={styles.horizontal} data-type-section="bespoke.decisions" aria-labelledby="decisions-title">
          <div className={styles.horizontalSticky}><motion.div className={styles.horizontalTrack} style={{ x: horizontalX }}>
            {currentStages.map((stage, index) => <article id={`decision-${index}`} key={index} className={styles.horizontalPanel} data-type-section={`bespoke.decision-${index + 1}`} data-tone={stage.tone}>
              <div className={styles.panelHeading}><h2 id={index === 0 ? "decisions-title" : undefined}>{stage.label}</h2></div>
              <figure className={styles.panelMedia}><Image loader={previewImageLoader} src={stage.image} alt={stage.alt} fill sizes="(max-width: 800px) 100vw, 62vw" className={styles.image} /></figure>
              <div className={styles.panelCaption}><div><p>{stage.detail}</p><strong>{stage.copy}</strong></div><button type="button" onClick={() => moveToDecision(index + 1)} aria-label={`${get("stages.next-action", "Next step")}: ${index < currentStages.length - 1 ? currentStages[index + 1].label : get("result.eyebrow", "The result")}`}><span data-type-field={"models.bespoke.stages.next-action"}>{get("stages.next-action", "Next step")}</span><b data-type-field={"models.bespoke.result.eyebrow"}>{index < currentStages.length - 1 ? currentStages[index + 1].label : get("result.eyebrow", "The result")}</b><i aria-hidden="true">→</i></button></div>
            </article>)}
          </motion.div></div>
        </section>

        <section id="original" ref={parallaxRef} className={styles.parallax} data-type-section="bespoke.result" aria-labelledby="parallax-title">
          <div className={styles.parallaxSticky}>
            <motion.div className={styles.parallaxImage} style={{ y: parallaxImageY, scale: parallaxImageScale, clipPath: parallaxImageClip }}><Image loader={pageImageLoader} src={get("result.image", "/assets/projects/real-v1/lakewood-02.webp")} alt={get("result.alt", "Lakewood Villa and its pool")} fill sizes="100vw" className={styles.image} /></motion.div>
            <motion.div className={styles.parallaxWords} style={{ y: parallaxWordY }} aria-hidden="true"><span data-type-field={"models.bespoke.result.word-1"}>{get("result.word-1", "ONE PLACE")}</span><span data-type-field={"models.bespoke.result.word-2"}>{get("result.word-2", "ONE HOME")}</span></motion.div>
            <motion.figure className={styles.parallaxCard} style={{ y: parallaxCardY }}><Image loader={previewImageLoader} src={get("result.card-image", "/assets/projects/real-v1/lakewood-01.webp")} alt={get("result.card-alt", "Lakewood Villa in its landscape")} fill sizes="(max-width: 700px) 70vw, 34vw" className={styles.image} /></motion.figure>
            <div className={styles.parallaxCopy}><p className={styles.kicker} data-type-field={"models.bespoke.result.eyebrow"}>{get("result.eyebrow", "The result")}</p><h2 id="parallax-title" data-type-field={"models.bespoke.result.heading"}>{get("result.heading", "Architecture that could belong nowhere else.")}</h2></div>
          </div>
        </section>
        <section className={styles.closing} aria-label="Begin your Bespoke home" data-type-section="bespoke.result">
          <MagneticLink href={localDestination(get("closing.href", "/enquiry?intent=home&model=bespoke"), "/enquiry?intent=home&model=bespoke")}>{get("closing.action", "Begin crafting")} <span aria-hidden="true">↗</span></MagneticLink>
        </section>
        {lakewood && lakewood.gallery.length > 0 && <section className={styles.gallery} aria-labelledby="bespoke-gallery-title">
          <p className={styles.kicker}>{get("gallery.label", "Bespoke projects")}</p>
          <h2 id="bespoke-gallery-title">{lakewood.title}</h2>
          <p className={styles.bodyCopy}>{lakewood.description}</p>
          <MasonryLightbox images={lakewood.gallery} title={lakewood.title} />
        </section>}
      </main>
    </MotionConfig>
  );
}

function AuroraWallpaper() {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const context = element.getContext("2d");
    if (!context) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce), (max-width: 700px)");
    let frame = 0, last: number | null = null, elapsed = 0, lastPaint = 0;
    const resize = () => { const ratio = Math.min(1, window.devicePixelRatio || 1); element.width = Math.round(window.innerWidth * ratio); element.height = Math.round(window.innerHeight * ratio); element.style.width = `${window.innerWidth}px`; element.style.height = `${window.innerHeight}px`; context.setTransform(ratio, 0, 0, ratio, 0, 0); paint(elapsed); };
    const paint = (time = 0) => {
      const width = window.innerWidth, height = window.innerHeight;
      context.fillStyle = "#f4f1e9"; context.fillRect(0, 0, width, height);
      const colors = [[97, 116, 91], [139, 147, 115], [183, 173, 146]];
      colors.forEach((color, index) => { const phase = time * .00013 * (index + 1); const x = width * (.18 + index * .33 + Math.sin(phase + index) * .19); const y = height * (.2 + Math.cos(phase * 1.45 + index) * .29); const radius = Math.max(width, height) * (.43 + index * .07); const gradient = context.createRadialGradient(x, y, 0, x, y, radius); gradient.addColorStop(0, `rgba(${color.join(",")},.32)`); gradient.addColorStop(.56, `rgba(${color.join(",")},.1)`); gradient.addColorStop(1, `rgba(${color.join(",")},0)`); context.fillStyle = gradient; context.fillRect(0, 0, width, height); });
    };
    const loop = (time: number) => {
      frame = 0;
      if (document.hidden || reduced.matches) return;
      const delta = last === null ? 0 : Math.min(100, time - last);
      last = time;
      elapsed += delta;
      if (time - lastPaint >= 1000 / 24) { paint(elapsed); lastPaint = time; }
      frame = window.requestAnimationFrame(loop);
    };
    const start = () => {
      window.cancelAnimationFrame(frame);
      frame = 0;
      last = null;
      if (reduced.matches) paint(elapsed);
      else if (!document.hidden) frame = window.requestAnimationFrame(loop);
      element.dataset.animationState = reduced.matches ? "reduced" : document.hidden ? "hidden" : "running";
    };
    resize(); start(); window.addEventListener("resize", resize); document.addEventListener("visibilitychange", start); reduced.addEventListener("change", start);
    return () => { window.cancelAnimationFrame(frame); window.removeEventListener("resize", resize); document.removeEventListener("visibilitychange", start); reduced.removeEventListener("change", start); };
  }, []);
  return <canvas ref={canvas} className={styles.wallpaper} aria-hidden="true" />;
}

function LayeredHeading({ id, lines }: { id: string; lines: string[] }) {
  const reduced = useReducedMotion();
  return <h2 id={id} className={styles.layeredHeading}>{lines.map((line, index) => <motion.span key={line} initial={reduced ? false : { opacity: 0, x: index % 2 ? 50 : -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: .65 }} transition={{ duration: .75, delay: index * .09, ease: [.22, 1, .36, 1] }}>{line}</motion.span>)}</h2>;
}

function GlyphPortal() {
  const content = useSiteContentMap();
  const portalImage = content["models.bespoke.portal.image"] ?? "/assets/projects/real-v1/lakewood-02.webp";
  const portalAlt = content["models.bespoke.portal.image-alt"] ?? "";
  const brandMask = content["brand.logo.light"] || "/assets/projects/brand/okno-modhomes-white.svg";
  const ref = useRef<HTMLElement>(null);
  const maskId = `glyph-${useId().replace(/:/g, "")}`;
  const inkId = `${maskId}-ink`;
  const reduced = useReducedMotion();
  const compact = useMediaQuery('(max-width: 700px)');
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const maskScale = useTransform(scrollYProgress, [0, .78], reduced ? [1, 1] : [1, 12]);
  const maskRotate = useTransform(scrollYProgress, [0, .78], reduced ? [0, 0] : [0, -7]);
  const maskOpacity = useTransform(scrollYProgress, [.58, .86], [1, 0]);
  return <section id="okno-portal" ref={ref} className={styles.portal} aria-label="OKNO bespoke architecture transition"><div className={styles.portalSticky}>
    <div className={styles.portalScene}><Image loader={pageImageLoader} src={portalImage} alt={portalAlt} fill sizes="100vw" className={styles.image} /></div>
    <motion.svg className={styles.portalMask} style={{ scale: reduced ? 1 : maskScale, rotate: compact || reduced ? 0 : maskRotate, opacity: reduced ? 1 : maskOpacity }} viewBox={compact ? "0 0 600 1300" : "0 0 1600 900"} preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><filter id={inkId}><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" /></filter><mask id={maskId}><rect width="1600" height={compact ? 1300 : 900} fill="white" />{<image href={brandMask} x={compact ? 75 : 300} y={compact ? 485 : 320} width={compact ? 450 : 1000} height="330" preserveAspectRatio="xMidYMid meet" filter={`url(#${inkId})`} />}</mask></defs><rect width="1600" height={compact ? 1300 : 900} fill="#f4f1e9" mask={`url(#${maskId})`} /></motion.svg>
  </div></section>;
}

function BespokeEntrance({ ready }: { ready: boolean }) {
  const [minimum, setMinimum] = useState(false), [show, setShow] = useState(true);
  const reduced = useReducedMotion();
  useLayoutEffect(() => {
    let fromSelector = document.documentElement.getAttribute("data-model-transition") === "bespoke";
    try { fromSelector ||= sessionStorage.getItem("okno-model-destination") === "bespoke"; sessionStorage.removeItem("okno-model-destination"); } catch {}
    const timer = window.setTimeout(() => { if (fromSelector) setShow(false); document.documentElement.removeAttribute("data-model-transition"); }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => { const minimumTimer = window.setTimeout(() => setMinimum(true), 120), deadline = window.setTimeout(() => setShow(false), 1000); return () => { window.clearTimeout(minimumTimer); window.clearTimeout(deadline); }; }, []);
  useEffect(() => { if (!ready || !minimum) return; const timer = window.setTimeout(() => setShow(false), 0); return () => window.clearTimeout(timer); }, [minimum, ready]);
  return <AnimatePresence>{show && !reduced && <motion.div data-bespoke-entrance className={styles.entrance} initial={{ transform: 'translate3d(0,0,0)' }} exit={{ transform: 'translate3d(0,-105%,0)' }} transition={{ duration: .4, ease: [.22, 1, .36, 1] }} aria-label="Loading Bespoke"><OknoLogo tone="dark" variant="compact" priority /></motion.div>}</AnimatePresence>;
}
