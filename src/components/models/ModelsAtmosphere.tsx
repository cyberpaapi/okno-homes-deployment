"use client";

// Adapted from kokonutd's Beams Background, 21st.dev demo 1637.
// The retrieved beam model, blue/cyan hue range and gradient construction are
// retained. Rendering is capped, paused offscreen and made static for reduced motion.
import { useEffect, useRef } from "react";
import styles from "./ModelsAtmosphere.module.css";

type Beam = {
  x: number;
  y: number;
  width: number;
  length: number;
  angle: number;
  speed: number;
  opacity: number;
  hue: number;
  pulse: number;
  pulseSpeed: number;
};

function createBeam(width: number, height: number, index: number): Beam {
  return {
    x: (index / 16) * width + (Math.random() - 0.5) * width * 0.18,
    y: Math.random() * height * 1.7 - height * 0.35,
    width: 42 + Math.random() * 74,
    length: height * (1.55 + Math.random() * 0.55),
    angle: -39 + Math.random() * 12,
    speed: 0.16 + Math.random() * 0.24,
    opacity: 0.075 + Math.random() * 0.09,
    hue: 198 + Math.random() * 34,
    pulse: Math.random() * Math.PI * 2,
    pulseSpeed: 0.006 + Math.random() * 0.009,
  };
}

export default function ModelsAtmosphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof window.matchMedia !== "function") return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 1;
    let height = 1;
    let beams: Beam[] = [];
    let frame = 0;
    let lastDraw = 0;
    let visible = true;
    let disposed = false;

    const drawBeam = (beam: Beam) => {
      context.save();
      context.translate(beam.x, beam.y);
      context.rotate((beam.angle * Math.PI) / 180);
      const alpha = beam.opacity * (0.82 + Math.sin(beam.pulse) * 0.18);
      const gradient = context.createLinearGradient(0, 0, 0, beam.length);
      gradient.addColorStop(0, `hsla(${beam.hue}, 92%, 68%, 0)`);
      gradient.addColorStop(0.14, `hsla(${beam.hue}, 92%, 68%, ${alpha * 0.45})`);
      gradient.addColorStop(0.46, `hsla(${beam.hue}, 90%, 66%, ${alpha})`);
      gradient.addColorStop(0.72, `hsla(${beam.hue}, 88%, 60%, ${alpha * 0.72})`);
      gradient.addColorStop(1, `hsla(${beam.hue}, 88%, 60%, 0)`);
      context.fillStyle = gradient;
      context.fillRect(-beam.width / 2, 0, beam.width, beam.length);
      context.restore();
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      context.filter = "blur(26px)";
      beams.forEach(drawBeam);
      canvas.dataset.ready = "true";
    };

    const animate = (now: number) => {
      frame = 0;
      if (disposed || document.hidden || !visible || reduce.matches) return;
      if (now - lastDraw >= 1000 / 30) {
        beams.forEach((beam, index) => {
          beam.y -= beam.speed;
          beam.pulse += beam.pulseSpeed;
          if (beam.y + beam.length < -120) beams[index] = createBeam(width, height, index);
        });
        draw();
        lastDraw = now;
      }
      frame = requestAnimationFrame(animate);
    };

    const sync = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      if (disposed || document.hidden || !visible) return;
      draw();
      if (!reduce.matches) frame = requestAnimationFrame(animate);
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      const maxDpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const dpr = Math.min(maxDpr, Math.sqrt(750000 / Math.max(1, width * height)));
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      beams = Array.from({ length: 16 }, (_, index) => createBeam(width, height, index));
      draw();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    intersectionObserver.observe(canvas);
    document.addEventListener("visibilitychange", sync);
    reduce.addEventListener("change", sync);
    resize();
    sync();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", sync);
      reduce.removeEventListener("change", sync);
    };
  }, []);

  return (
    <div className={styles.atmosphere} aria-hidden="true">
      <canvas ref={canvasRef} />
      <div className={styles.depth} />
      <div className={styles.vignette} />
    </div>
  );
}
