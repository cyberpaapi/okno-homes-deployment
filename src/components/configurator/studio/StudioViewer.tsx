"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  posters,
  sourceFor,
  type StudioModel,
} from "@/data/configurator/studio/catalogue";
import type { SceneState, StudioController } from "./studioScene";
import styles from "./Studio.module.css";
import customerAssets from "@/data/configurator/studio/customerAssets.json";
import { useCustomerCopy } from "./useCustomerCopy";
export default function StudioViewer({
  slug,
  state,
  onPick,
  admin = false,
}: {
  slug: StudioModel;
  state: SceneState;
  onPick?: (id: number, add: boolean) => void;
  admin?: boolean;
}) {
  const copy = useCustomerCopy();
  const canvas = useRef<HTMLCanvasElement>(null),
    controller = useRef<StudioController | null>(null),
    latest = useRef(state),
    pick = useRef(onPick);
  const [load, setLoad] = useState(admin ? 0 : 1),
    [phase, setPhase] = useState(admin ? "idle" : "loading"),
    [progress, setProgress] = useState(0);
  const [lighting, setLighting] = useState<"day" | "golden">("day");
  const lightRef = useRef(lighting);
  useEffect(() => { lightRef.current = lighting; }, [lighting]);
  const [materialError, setMaterialError] = useState<string | null>(null);
  useEffect(() => {
    latest.current = state;
    controller.current?.update(state);
  }, [state]);
  useEffect(() => {
    pick.current = onPick;
  }, [onPick]);
  useEffect(() => {
    if (!load || !canvas.current) return;
    const abort = new AbortController();
    let local: StudioController | null = null;
    const element = canvas.current;
    const lost = (event: Event) => {
      event.preventDefault();
      setPhase("error");
      abort.abort();
    };
    element.addEventListener("webglcontextlost", lost);
    setPhase("loading");
    setMaterialError(null);
    setProgress(0);
    void import("./studioScene")
      .then(({ createStudioScene }) => {
        if (abort.signal.aborted)
          throw new DOMException("Aborted", "AbortError");
        return createStudioScene(
          canvas.current!,
          admin ? `/api/configurator/assets/${slug}` : customerAssets[slug].url,
          abort.signal,
          (p) => {
            if (!abort.signal.aborted) setProgress(p);
          },
          (id, add) => pick.current?.(id, add),
          (error) => { if (!abort.signal.aborted) setMaterialError(error); },
          !admin,
        );
      })
      .then((api) => {
        local = api;
        if (abort.signal.aborted) {
          api.dispose();
          return;
        }
        controller.current = api;
        api.update(latest.current);
        if (!admin && lightRef.current !== "day") api.lighting?.(lightRef.current);
        setPhase("ready");
      })
      .catch(() => {
        if (!abort.signal.aborted) setPhase("error");
      });
    return () => {
      element.removeEventListener("webglcontextlost", lost);
      abort.abort();
      local?.dispose();
      controller.current = null;
    };
  }, [slug, load, admin]);
  return (
    <div className={styles.viewer}>
      {phase !== "ready" && (
        <Image
          src={posters[slug]}
          alt={admin ? `${slug} exterior reference` : copy("configurator.viewer.poster-accessible", { model: slug })}
          fill
          priority
          sizes="(max-width: 900px) 100vw, 65vw"
          className={styles.poster}
        />
      )}
      <canvas
        key={`${slug}:${load}:${admin}`}
        ref={canvas}
        aria-label={admin ? `${slug} interactive 3D surface editor` : copy("configurator.viewer.canvas-accessible", { model: slug })}
        data-phase={phase}
        className={styles.canvas}
        style={{ opacity: phase === "ready" ? 1 : 0, pointerEvents: phase === "ready" ? "auto" : "none" }}
      />
      <div className={styles.stageLabel}>
        <span className={styles.dot} />
        {phase === "ready" ? (admin ? "Live 3D · Your material palette" : copy("configurator.viewer.live")) : phase === "error" ? (admin ? "3D preview unavailable" : copy("configurator.viewer.error")) : phase === "idle" ? "Explore your home" : admin ? "Preparing your 3D home" : copy("configurator.viewer.loading")}
      </div>
      {phase === "idle" && (
        <div className={styles.loadPrompt}>
          <button
            className={styles.goldButton}
            onClick={() => setLoad((v) => v + 1)}
          >
            Explore in 3D <span>↗</span>
          </button>
          <p>
            Original company model ·{" "}
            {Math.round(sourceFor(slug).bytes / 1024 / 1024)} MB
          </p>
          <p>Load the model to see your finish choices in 3D.</p>
        </div>
      )}
      {phase === "loading" && (
        <div className={styles.loadPrompt} role="status">
          <p>
            {progress >= 1
              ? (admin ? "Preparing your model…" : copy("configurator.viewer.preparing"))
              : (admin ? `Loading model · ${Math.round(progress * 100)}%` : copy("configurator.viewer.progress", { progress: Math.round(progress * 100) }))}
          </p>
          <progress value={progress} max={1} />
        </div>
      )}
      {phase === "error" && (
        <div className={styles.loadPrompt} role="alert">
          <p>{admin ? "3D could not load. Your choices are preserved." : copy("configurator.viewer.error-help")}</p>
          <button onClick={() => setLoad((v) => v + 1)}>{admin ? "Retry 3D" : copy("configurator.viewer.retry")}</button>
        </div>
      )}
      {phase === "ready" && !admin && <div className={styles.sceneLighting} role="group" aria-label={copy("configurator.viewer.lighting-accessible")}>
        {(["day", "golden"] as const).map(mode => <button key={mode} aria-pressed={lighting === mode} onClick={() => { setLighting(mode); controller.current?.lighting?.(mode); }}>{mode === "day" ? copy("configurator.viewer.daylight") : copy("configurator.viewer.golden")}</button>)}
      </div>}
      {phase === "ready" && (
        <div className={styles.viewerTools}>
          <span>
            {admin
              ? "Click to select · Shift-click to add"
              : <><span className={styles.pointerHint}>{copy("configurator.viewer.pointer-hint")}</span><span className={styles.touchHint}>{copy("configurator.viewer.touch-hint")}</span></>}
          </span>
          <button onClick={() => controller.current?.fit()}>{admin ? "Reset view" : copy("configurator.viewer.reset")}</button>
        </div>
      )}
      {phase === "ready" && materialError && <div className={styles.loadPrompt} role="alert">
        <p>{materialError}</p>
        <button onClick={() => {
          setMaterialError(null);
          controller.current?.update(latest.current);
        }}>{admin ? "Retry material" : copy("configurator.viewer.retry-material")}</button>
      </div>}
    </div>
  );
}
