"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { CONFIRMED_GLOBE_LOCATIONS } from "@/data/projectExperience";
import styles from "./Globe.module.css";

type GlobeProps = {
  immersive?: boolean;
  onSelectProject?: (projectId: string) => void;
  onViewChange?: (view: { latitude: number; longitude: number }) => void;
};

type Mark = {
  id: string;
  lat: number;
  lng: number;
  city: string;
  project: string;
  projectId: string;
  primary: boolean;
};

const marks: Mark[] = CONFIRMED_GLOBE_LOCATIONS.map((location) => ({
  id: location.id,
  lat: location.coordinates[0],
  lng: location.coordinates[1],
  city: location.city,
  project: location.project,
  projectId: location.projectId,
  primary: true,
}));

export default function Globe({ immersive = false, onSelectProject, onViewChange }: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [mapLoadFailed, setMapLoadFailed] = useState(false);
  const [previewMark, setPreviewMark] = useState<Mark | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    if (!canvas) return;

    const context = canvas.getContext("2d")!;
    if (!context) return;

    let width = 0;
    let height = 0;
    let radius = 0;
    let frame = 0;
    let visible = true;
    let dragging = false;
    let moved = false;
    let lastX = 0;
    let lastY = 0;
    let hoveredMark = -1;
    let keyboardMark = 0;
    let previewIndex = -1;
    let lastViewUpdate = 0;
    let screenMarks: Array<[number, number, boolean] | undefined> = [];
    let rotation = -72;
    let tilt = -12;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const projection = d3.geoOrthographic().precision(0.35).clipAngle(90);
    const path = d3.geoPath(projection, context);
    type GeoDatum = Parameters<typeof path>[0];
    let land: GeoDatum | null = null;
    const sphere = { type: "Sphere" as const };
    const graticule = d3.geoGraticule10();
    const mapRequest = new AbortController();

    fetch("/assets/geo/world.geojson", { signal: mapRequest.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Globe map request failed with ${response.status}`);
        return response.json();
      })
      .then((data) => {
        land = data;
        setMapLoadFailed(false);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        console.warn("Unable to load the Projects globe map.", error);
        setMapLoadFailed(true);
      });

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.max(1, width * dpr);
      canvas.height = Math.max(1, height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      radius = Math.min(width, height) * 0.435;
      projection.translate([width / 2, height / 2]).scale(radius);
    }

    function markIsVisible(mark: Mark) {
      return d3.geoDistance([mark.lng, mark.lat], [-rotation, -tilt]) < Math.PI / 2 - 0.015;
    }

    function drawPin(x: number, y: number, primary: boolean, active: boolean) {
      const pinRadius = (primary ? 3.5 : 2.25) * (active ? 1.35 : 1);
      context.save();
      context.shadowColor = primary || active ? "rgba(229, 205, 145, .78)" : "transparent";
      context.shadowBlur = primary || active ? 12 : 0;
      context.fillStyle = primary || active ? "#f0d899" : "rgba(247, 239, 214, .72)";
      context.beginPath();
      context.arc(x, y, pinRadius, 0, Math.PI * 2);
      context.fill();
      context.strokeStyle = primary || active ? "rgba(255, 248, 224, .9)" : "rgba(255, 248, 224, .32)";
      context.lineWidth = 1;
      context.beginPath();
      context.arc(x, y, active ? 11 : primary ? 7.5 : 4.75, 0, Math.PI * 2);
      context.stroke();
      context.restore();
    }

    function localPoint(event: PointerEvent | MouseEvent) {
      const bounds = canvas.getBoundingClientRect();
      return [event.clientX - bounds.left, event.clientY - bounds.top] as const;
    }

    function pickMark(x: number, y: number) {
      let closest = -1;
      let distance = 19;
      screenMarks.forEach((point, index) => {
        if (!point?.[2]) return;
        const nextDistance = Math.hypot(x - point[0], y - point[1]);
        if (nextDistance < distance) {
          closest = index;
          distance = nextDistance;
        }
      });
      return closest;
    }

    function selectMark(index: number) {
      if (index < 0) return;
      onSelectProject?.(marks[index].projectId);
    }

    function showPreview(index: number) {
      if (previewIndex === index) return;
      previewIndex = index;
      setPreviewMark(index >= 0 ? marks[index] : null);
    }

    function draw() {
      if (!visible || document.hidden) {
        frame = 0;
        return;
      }

      if (!reducedMotion.matches && !dragging && hoveredMark < 0) rotation += 0.055;
      projection.rotate([rotation, tilt, -7.5]);
      context.clearRect(0, 0, width, height);

      const globeShade = context.createRadialGradient(
        width * 0.42,
        height * 0.34,
        radius * 0.08,
        width / 2,
        height / 2,
        radius,
      );
      globeShade.addColorStop(0, "#202b23");
      globeShade.addColorStop(0.7, "#111a14");
      globeShade.addColorStop(1, "#080e0a");
      context.beginPath();
      path(sphere);
      context.fillStyle = globeShade;
      context.fill();
      context.strokeStyle = "rgba(229, 205, 145, .42)";
      context.lineWidth = 1;
      context.stroke();

      context.beginPath();
      path(graticule);
      context.strokeStyle = "rgba(229, 205, 145, .1)";
      context.lineWidth = 0.65;
      context.stroke();

      if (land) {
        const landShade = context.createLinearGradient(
          width / 2 - radius,
          height / 2 - radius,
          width / 2 + radius,
          height / 2 + radius,
        );
        landShade.addColorStop(0, "#d8c188");
        landShade.addColorStop(0.52, "#a88951");
        landShade.addColorStop(1, "#66502f");
        context.beginPath();
        path(land);
        context.fillStyle = landShade;
        context.fill();
        context.strokeStyle = "rgba(36, 31, 18, .48)";
        context.lineWidth = 0.5;
        context.stroke();
      }

      screenMarks = [];
      marks.forEach((mark, index) => {
        const point = projection([mark.lng, mark.lat]);
        if (!point) return;
        const markVisible = markIsVisible(mark);
        screenMarks[index] = [point[0], point[1], markVisible];
        if (markVisible) drawPin(point[0], point[1], mark.primary, index === hoveredMark);
      });

      const previewPoint = previewIndex >= 0 ? screenMarks[previewIndex] : undefined;
      const preview = previewRef.current;
      if (previewPoint?.[2] && preview) {
        const horizontalInset = Math.min(124, width * 0.32);
        const previewX = Math.max(horizontalInset, Math.min(width - horizontalInset, previewPoint[0]));
        preview.style.setProperty("--preview-x", `${previewX}px`);
        preview.style.setProperty("--preview-y", `${previewPoint[1]}px`);
        preview.dataset.side = previewPoint[1] < 138 ? "bottom" : "top";
      } else if (previewIndex >= 0 && !previewPoint?.[2]) {
        hoveredMark = -1;
        showPreview(-1);
      }

      const now = performance.now();
      if (now - lastViewUpdate > 160) {
        const longitude = (((-rotation + 180) % 360) + 360) % 360 - 180;
        onViewChange?.({ latitude: -tilt, longitude });
        lastViewUpdate = now;
      }

      frame = requestAnimationFrame(draw);
    }

    function startDrawing() {
      if (!frame && visible && !document.hidden) frame = requestAnimationFrame(draw);
    }

    function handlePointerDown(event: PointerEvent) {
      dragging = true;
      moved = false;
      lastX = event.clientX;
      lastY = event.clientY;
      canvas.setPointerCapture?.(event.pointerId);
    }

    function handlePointerMove(event: PointerEvent) {
      if (dragging) {
        const deltaX = event.clientX - lastX;
        const deltaY = event.clientY - lastY;
        if (Math.abs(deltaX) + Math.abs(deltaY) > 2) {
          moved = true;
          hoveredMark = -1;
          showPreview(-1);
        }
        rotation += deltaX * 0.2;
        tilt = Math.max(-65, Math.min(65, tilt - deltaY * 0.15));
        lastX = event.clientX;
        lastY = event.clientY;
        return;
      }

      const [x, y] = localPoint(event);
      hoveredMark = pickMark(x, y);
      showPreview(hoveredMark);
      canvas.style.cursor = hoveredMark >= 0 ? "pointer" : "grab";
    }

    function handlePointerUp(event: PointerEvent) {
      if (!dragging) return;
      dragging = false;
      canvas.releasePointerCapture?.(event.pointerId);
    }

    function handleClick(event: MouseEvent) {
      if (moved) {
        moved = false;
        return;
      }
      const [x, y] = localPoint(event);
      const selectedMark = pickMark(x, y);
      if (selectedMark < 0) {
        showPreview(-1);
        return;
      }
      if (previewIndex !== selectedMark) {
        hoveredMark = selectedMark;
        showPreview(selectedMark);
        return;
      }
      selectMark(selectedMark);
    }

    function handlePointerLeave() {
      if (dragging) return;
      hoveredMark = -1;
      showPreview(-1);
      canvas.style.cursor = "grab";
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (!["ArrowLeft", "ArrowRight", "Enter", " "].includes(event.key)) return;
      event.preventDefault();

      if (event.key === "Enter" || event.key === " ") {
        selectMark(keyboardMark);
        return;
      }

      const direction = event.key === "ArrowLeft" ? -1 : 1;
      keyboardMark = (keyboardMark + direction + marks.length) % marks.length;
      const mark = marks[keyboardMark];
      rotation = -mark.lng;
      tilt = Math.max(-60, Math.min(60, -mark.lat));
      hoveredMark = keyboardMark;
      showPreview(keyboardMark);
    }

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) startDrawing();
        else if (frame) {
          cancelAnimationFrame(frame);
          frame = 0;
        }
      },
      { rootMargin: "160px 0px" },
    );

    const handleVisibilityChange = () => {
      if (document.hidden && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else startDrawing();
    };

    resize();
    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointercancel", handlePointerUp);
    canvas.addEventListener("click", handleClick);
    canvas.addEventListener("pointerleave", handlePointerLeave);
    canvas.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    if (containerRef.current) visibilityObserver.observe(containerRef.current);
    startDrawing();

    return () => {
      mapRequest.abort();
      cancelAnimationFrame(frame);
      visibilityObserver.disconnect();
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointercancel", handlePointerUp);
      canvas.removeEventListener("click", handleClick);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
      canvas.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [onSelectProject, onViewChange]);

  return (
    <div
      className={`${styles.globeWrap} ${immersive ? styles.immersive : ""}`}
      ref={containerRef}
    >
      <canvas
        ref={canvasRef}
        className={styles.globe}
        tabIndex={0}
        role="img"
        aria-label="Interactive globe with ten selectable confirmed project locations"
      />
      <div
        ref={previewRef}
        className={`${styles.markerPreview} ${previewMark ? styles.markerPreviewVisible : ""}`}
        role="status"
        aria-live="polite"
        aria-hidden={!previewMark}
      >
        {previewMark && (
          <>
            <span className={styles.markerCity}>{previewMark.city}</span>
            <strong>{previewMark.project}</strong>
            <span className={styles.markerCoordinates}>
              {Math.abs(previewMark.lat).toFixed(3)}° {previewMark.lat < 0 ? "S" : "N"}
              <i aria-hidden="true">·</i>
              {Math.abs(previewMark.lng).toFixed(3)}° {previewMark.lng < 0 ? "W" : "E"}
            </span>
          </>
        )}
      </div>
      {mapLoadFailed && (
        <p className={styles.mapError} role="status">
          Map detail is temporarily unavailable.
        </p>
      )}
    </div>
  );
}
