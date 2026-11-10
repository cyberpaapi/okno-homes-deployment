"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Box, Check, ChevronDown, Grid2X2, House, Maximize, Moon, PanelLeft, PanelRightClose, PanelRightOpen, PanelTop, RotateCw, Sun, View } from "lucide-react";
import { SubtleButton } from "@/components/ui/SubtleAction";
import Header from "@/components/Header/Header";
import type { SignatureAsset } from "@/data/configurator/signatureAssets";
import type { MaterialApplicationId } from "@/data/configurator";
import type { ConfiguratorSettings } from '@/lib/configuratorSettings';
import { zoneApplications } from './surfaceMapping';
import { createScene, type Background, type SceneApi } from "./cabinScene";
import { applicationGroups, familyLabels, optionsForApplication, registerOptions } from "./registerOptions";
import ExpandableControls from "./21st/ExpandableControls";
import SceneDock from "./21st/SceneDock";
import styles from "./Configurator.module.css";
import "./environment.css";

// Adapted from the owner's fullcode (1).zip / app/OknoExperience.tsx.
// Preserve supplied UI and scene appearance while selecting reviewed house derivatives.
const views = [
  { id: "hero", title: "hero", icon: Box }, { id: "front", title: "front", icon: House },
  { id: "side", title: "side", icon: PanelLeft }, { id: "rear", title: "rear", icon: View },
  { id: "plan", title: "plan", icon: Grid2X2 }, { id: "inside", title: "inside", icon: Maximize },
];
const applicationIcons = { "external-roof": House, "external-wall": PanelLeft, flooring: Grid2X2, "internal-ceiling": PanelTop, "internal-wall": View };
const backgrounds: { id: Background; label: string; image: string }[] = [
  { id: "meadow", label: "Meadow", image: "/textures/meadow-day.jpg" },
  { id: "forest", label: "Forest", image: "/textures/background-forest.jpg" },
  { id: "hill", label: "Hill", image: "/textures/background-hill.jpg" },
  { id: "island", label: "Island", image: "/textures/background-island.jpg" },
  { id: "full-island", label: "Full island", image: "/textures/background-island.jpg" },
];

export default function SuppliedConfigurator({ asset, requestedName, settings }: { asset?: SignatureAsset; requestedName?: string; settings?: ConfiguratorSettings } = {}) {
  const mount = useRef<HTMLDivElement>(null);
  const api = useRef<SceneApi | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [light, setLight] = useState<"day" | "golden">("day");
  const [background, setBackground] = useState<Background>("meadow");
  const [active, setActive] = useState<MaterialApplicationId>("external-wall");
  const [selected, setSelected] = useState<Partial<Record<MaterialApplicationId, string>>>({});
  const [interiorPreview, setInteriorPreview] = useState("");
  const [camera, setCamera] = useState("hero");
  const [turn, setTurn] = useState(true);
  const [finishesOpen, setFinishesOpen] = useState(true);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfError, setPdfError] = useState('');
  const current = applicationGroups.find(group => group.id === active)!;
  const options = optionsForApplication(active);

  useEffect(() => {
    if (!mount.current) return;
    const controller = new AbortController();
    let scene: SceneApi | undefined;
    let cancelled = false;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let timedOut = false;
    const timeout = window.setTimeout(() => { timedOut = true; controller.abort(); }, 45000);
    const start = async () => {
      setLight("day"); setBackground("meadow"); setCamera("hero");
      setReady(false); setError(""); setSelected({}); setInteriorPreview("");
      try {
        scene = createScene(mount.current!, () => {}, () => {}, undefined, Boolean(asset));
        api.current = scene;
        scene.turn(false);
        if (asset) {
          const response = await fetch(asset.url, { signal: controller.signal });
          if (!response.ok) throw new Error("The house asset could not load.");
          const blob = await response.blob();
          if (cancelled) return;
          await scene.glb(blob, asset.metersPerUnit);
          if (cancelled) return;
          const report = scene.mapSurfaces(settings?.mapping);
          setCounts(report.counts);
          const initial: Partial<Record<MaterialApplicationId, string>> = {};
          for (const [zone, id] of Object.entries(settings?.defaults ?? {})) {
            const application = zoneApplications[zone];
            const option = registerOptions.find(item => item.registerNumber === id && item.approvedApplications.includes(application));
            if (option && report.counts[application]) { scene.surface(application, option.preview, option.name); initial[application] = option.id; }
          }
          setSelected(initial);
        }
        if (cancelled) return;
        scene.turn(!reducedMotion);
        setTurn(!reducedMotion);
        setReady(true);
      } catch {
        if (!cancelled) {
          scene?.dispose(); scene = undefined; api.current = null;
          setError(timedOut ? "The house is taking too long to load. Check your connection, then try again." : "The 3D preview could not load. Check your connection and WebGL support, then try again.");
        }
      } finally { window.clearTimeout(timeout); }
    };
    void start();
    return () => { cancelled = true; window.clearTimeout(timeout); controller.abort(); scene?.dispose(); api.current = null; };
  }, [asset, attempt, settings]);

  useEffect(() => {
    const directions = { ArrowUp: "forward", ArrowDown: "backward", ArrowLeft: "left", ArrowRight: "right" } as const;
    const onKey = (event: KeyboardEvent) => {
      const direction = directions[event.key as keyof typeof directions];
      const target = event.target as HTMLElement | null;
      if (!direction || event.ctrlKey || event.metaKey || event.altKey || target?.closest("button, a, input, textarea, select, [contenteditable='true']")) return;
      event.preventDefault();
      setCamera(""); setTurn(false);
      api.current?.moveCamera(direction, event.shiftKey ? 1.05 : .46);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function choose(option: (typeof options)[number]) {
    if (asset && !api.current?.surface(active, option.preview, option.name)) return;
    setSelected(previous => ({ ...previous, [active]: option.id }));
    if (!asset) api.current?.finish(current.sceneGroup, option.preview);
    if (!asset && current.sharedInterior) setInteriorPreview(`${current.label}: ${option.name}`);
  }

  async function downloadPdf() {
    setPdfBusy(true); setPdfError('');
    try {
      const { downloadSelectionPdf } = await import('./selectionPdf');
      downloadSelectionPdf({ name: asset?.name || 'Studio Cabin', selected, counts, preview: api.current?.snapshot(), variant: new URLSearchParams(window.location.search).get('variant') || undefined });
    } catch { setPdfError('The PDF could not be created. Please try again.'); }
    finally { setPdfBusy(false); }
  }

  return <main className={`okno-cabin ${styles.configurator} scene-${light} scene-env-${background}`} data-configurator={asset ? "signature-house" : "supplied-studio-cabin"} data-model={asset?.slug ?? "studio-cabin"} data-finishes-open={finishesOpen}>
    <a className={styles.skipLink} href={finishesOpen ? "#finishes" : "#viewer-controls"}>Skip to controls</a>
    <div className="environment" /><div ref={mount} className="stage" /><div className="vignette" />
    {!ready && !error && <div className={styles.loader} role="status"><span>Preparing {asset?.name ?? "Studio Cabin"}</span></div>}
    {error && <div className={styles.error} role="alert"><p>{error}</p><SubtleButton tone="paper" onClick={() => setAttempt(value => value + 1)}>Try again</SubtleButton></div>}

    <div className={styles.siteHeader}><Header tone="dark" currentHref="/models" /></div>

    <aside className={styles.modelIntro} data-viewer-intro>
      <a className={styles.backLink} href="/models/signature"><ArrowLeft size={14} aria-hidden="true" />Back to models</a>
      <h1>{asset?.name ?? "Studio Cabin"}</h1>
      <p>{asset?.identity ?? (requestedName ? `${requestedName} has no supplied 3D asset. Studio Cabin is shown as a reference preview.` : "Studio Cabin reference preview.")}</p>
      <details className={styles.modelDetails}><summary>{asset ? "Model details" : "Cabin details"}<ChevronDown size={12} aria-hidden="true" /></summary>
        {asset ? <p>Original house proportions, aligned to a shared metre scale. Materials can be selected independently for walls, roof, floor and ceiling.</p> : <><p>A compact retreat drawn in timber, glass and changing light.</p>
        <dl><div><dt>Footprint</dt><dd>5.2 × 6.4 m</dd></div><div><dt>Interior</dt><dd>24 m²</dd></div><div><dt>Ridge</dt><dd>4.15 m</dd></div></dl></>}
      </details>
      {asset && <SubtleButton className={styles.pdfAction} tone="paper" aria-label="Download selections PDF" disabled={!ready || pdfBusy} onClick={() => void downloadPdf()}>{pdfBusy ? 'Preparing PDF…' : <><span className={styles.pdfVerb}>Download </span>PDF</>}</SubtleButton>}
      {pdfError && <p role="alert">{pdfError}</p>}
    </aside>

    {finishesOpen && <aside className={styles.finishPanel} id="finishes" aria-label="Cladding material options" tabIndex={-1}>
      <div className={styles.panelTitle}><h2>Materials</h2><button type="button" className={styles.iconButton} onClick={() => setFinishesOpen(false)} aria-label="Hide finishes" title="Hide finishes"><PanelRightClose size={18} /></button></div>
      <div className={styles.applicationControls}><ExpandableControls label="Material application" items={applicationGroups.map(group => ({ id: group.id, title: group.label, icon: applicationIcons[group.id] }))} value={active} onChange={value => setActive(value as MaterialApplicationId)} /></div>
      <section key={active} aria-label={`${current.label} finishes`} className={styles.finishList}>
        <header className={styles.sectionTitle}><h3>{current.label}</h3><span>Approved finishes</span></header>
        {!asset && current.sharedInterior && <div className={styles.interiorNote}><details><summary>About the interior preview<ChevronDown size={12} aria-hidden="true" /></summary><p>Wall, ceiling and flooring choices are saved separately here. This cabin previews them on its shared interior timber.</p></details><span role="status">{interiorPreview ? `Current interior preview — ${interiorPreview}` : "Original interior shown."}</span></div>}
        <div className={styles.swatches}>
          {options.map(option => <button key={option.id} type="button" className={styles.swatch} data-selected={selected[active] === option.id} aria-pressed={selected[active] === option.id} disabled={!ready || Boolean(asset && !counts[active])} onClick={() => choose(option)}><span className={styles.swatchImage} style={{ backgroundImage: `url(${option.image})` }}>{selected[active] === option.id && <Check size={13} aria-hidden="true" />}</span><span className={styles.swatchCopy}><b>{option.name}</b><small>{familyLabels[option.family]}</small></span></button>)}
        </div>
      </section>
      <p className={styles.selectedFinish} aria-live="polite">{asset && ready && !counts[active] ? 'This surface is not available in this model.' : selected[active] ? `Selected: ${options.find(option => option.id === selected[active])?.name}` : "Choose a finish to preview."}</p>
    </aside>}

    <div className={styles.viewerControls} id="viewer-controls" tabIndex={-1}>
      <div className={styles.cameraControls}>
        <ExpandableControls label="Camera views" items={views} value={turn ? null : camera} disabled={!ready} onChange={preset => { setCamera(preset); setTurn(false); api.current?.view(preset); }} />
        <button type="button" className={styles.toggleButton} aria-label="Turntable" title="Turntable" aria-pressed={turn} disabled={!ready} onClick={() => { setTurn(!turn); api.current?.turn(!turn); }}><RotateCw size={18} aria-hidden="true" /><span>Turntable</span></button>
      </div>
      <div className={styles.sceneControls}><SceneDock options={backgrounds} value={background} disabled={!ready} onChange={value => { setBackground(value as Background); api.current?.background(value as Background); }} />
        <div className={styles.lighting} role="group" aria-label="Lighting">{(["day", "golden"] as const).map(mode => {
          const Icon = mode === "day" ? Sun : Moon;
          return <button type="button" key={mode} aria-label={mode === "day" ? "Daylight" : "Golden hour"} title={mode === "day" ? "Daylight" : "Golden hour"} className={styles.iconButton} aria-pressed={light === mode} disabled={!ready} onClick={() => { setLight(mode); api.current?.light(mode); }}><Icon size={18} aria-hidden="true" /></button>;
        })}</div>
        <button type="button" className={styles.iconButton} aria-label={finishesOpen ? "Hide finishes" : "Show finishes"} title={finishesOpen ? "Hide finishes" : "Show finishes"} aria-expanded={finishesOpen} aria-controls="finishes" onClick={() => setFinishesOpen(open => !open)}><PanelRightOpen size={18} aria-hidden="true" /></button>
      </div>
    </div>
    <p className={styles.gestureHint}>Drag to orbit · Scroll to zoom · Arrow keys to move</p>
  </main>;
}
