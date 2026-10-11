"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./ObsidianCursorTrail.module.css";

// Faithful interaction match for the public Obsidian Assembly cursor ribbon:
// https://obsidianassembly.com/

type TrailPoint = {
  x: number;
  y: number;
  vx: number;
  vy: number;
};

type EdgePoint = {
  x: number;
  y: number;
};

const LENGTH = 60;
const BASE_COLOR = [159, 175, 155] as const;
const END_COLOR = [198, 167, 106] as const;
const ALPHA_BASE = 0.8;
const ALPHA_END = 0.2;

export default function ObsidianCursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)");
    const noHover = window.matchMedia("(hover: none)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setEnabled(!(coarse.matches || noHover.matches || reduced.matches));

    sync();
    coarse.addEventListener("change", sync);
    noHover.addEventListener("change", sync);
    reduced.addEventListener("change", sync);
    return () => {
      coarse.removeEventListener("change", sync);
      noHover.removeEventListener("change", sync);
      reduced.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!enabled || !canvas) return;

    const context = canvas.getContext("2d", { alpha: true, desynchronized: true });
    if (!context) return;

    const points: TrailPoint[] = Array.from({ length: LENGTH }, () => ({ x: 0, y: 0, vx: 0, vy: 0 }));
    const upper: EdgePoint[] = Array.from({ length: LENGTH }, () => ({ x: 0, y: 0 }));
    const lower: EdgePoint[] = Array.from({ length: LENGTH }, () => ({ x: 0, y: 0 }));
    const target = { x: 0, y: 0 };

    let width = 0;
    let height = 0;
    let frame = 0;
    let hasPointer = false;
    let hidden = false;
    let destroyed = false;
    let lastX = 0;
    let lastY = 0;
    let lastTime = 0;
    let lastPointerAt = 0;
    let smoothedSpeed = 0;
    let schedule = () => {};

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      context.setTransform(1, 0, 0, 1, 0, 0);

      if (!hasPointer) {
        const centerX = width / 2;
        const centerY = height / 2;
        points.forEach((point) => {
          point.x = centerX;
          point.y = centerY;
          point.vx = 0;
          point.vy = 0;
        });
        target.x = centerX;
        target.y = centerY;
        lastX = centerX;
        lastY = centerY;
        lastTime = performance.now();
      }
    };

    const updatePointer = (x: number, y: number) => {
      const now = performance.now();
      if (hasPointer && ((x <= 1 && y <= 1) || (x <= 1 && y >= height - 1) || (x >= width - 1 && y <= 1) || (x >= width - 1 && y >= height - 1))) return;

      if (!hasPointer) {
        hasPointer = true;
        lastX = x;
        lastY = y;
        lastTime = now;
        points.forEach((point) => {
          point.x = x;
          point.y = y;
          point.vx = 0;
          point.vy = 0;
        });
        target.x = x;
        target.y = y;
        lastPointerAt = now;
        schedule();
        return;
      }

      const elapsed = Math.max(1, now - lastTime) / 1000;
      const speed = Math.hypot(x - lastX, y - lastY) / elapsed;
      const normalizedSpeed = Math.min(1, speed / 600);
      smoothedSpeed += (normalizedSpeed - smoothedSpeed) * 0.2;
      lastX = x;
      lastY = y;
      lastTime = now;
      target.x = x;
      target.y = y;
      lastPointerAt = now;
      schedule();
    };

    const pointerMove = (event: PointerEvent) => updatePointer(event.clientX, event.clientY);
    const mouseMove = (event: MouseEvent) => updatePointer(event.clientX, event.clientY);
    const touchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (touch) updatePointer(touch.clientX, touch.clientY);
    };
    const pointerLeave = () => {
      hasPointer = false;
      cancelAnimationFrame(frame);
      frame = 0;
      context.clearRect(0, 0, width, height);
    };

    const render = (now: number) => {
      frame = 0;
      if (destroyed || hidden || !hasPointer) return;

      context.clearRect(0, 0, width, height);

      smoothedSpeed *= 0.9;
      const speedMultiplier = 1 + 0.9 * smoothedSpeed;
      const headPull = 0.7;
      const headDx = (target.x - points[0].x) * headPull;
      const headDy = (target.y - points[0].y) * headPull;

      points[0].vx = points[0].vx * 0.8 + headDx * 0.3;
      points[0].vy = points[0].vy * 0.8 + headDy * 0.3;
      points[0].x += headDx + points[0].vx * 0.025 * speedMultiplier;
      points[0].y += headDy + points[0].vy * 0.025 * speedMultiplier;

      for (let index = 1; index < points.length; index += 1) {
        const previous = points[index - 1];
        const point = points[index];
        const dx = (previous.x - point.x) * 0.6;
        const dy = (previous.y - point.y) * 0.6;
        point.vx = point.vx * 0.8 + dx * 0.6;
        point.vy = point.vy * 0.8 + dy * 1.2;
        point.x += dx + point.vx * 0.025;
        point.y += dy + point.vy * 0.025;
      }

      for (let index = 0; index < points.length; index += 1) {
        const point = points[index];
        const next = points[index + 1] ?? point;
        const previous = points[index - 1] ?? point;
        let normalX = 0;
        let normalY = 0;

        if (index === 0) {
          const dx = next.x - point.x;
          const dy = next.y - point.y;
          const length = dx * dx + dy * dy;
          if (length >= 1e-10) {
            const inverse = 1 / Math.sqrt(length);
            normalX = -dy * inverse;
            normalY = dx * inverse;
          }
        } else if (index === points.length - 1) {
          const dx = point.x - previous.x;
          const dy = point.y - previous.y;
          const length = dx * dx + dy * dy;
          if (length >= 1e-10) {
            const inverse = 1 / Math.sqrt(length);
            normalX = -dy * inverse;
            normalY = dx * inverse;
          }
        } else {
          const previousDx = point.x - previous.x;
          const previousDy = point.y - previous.y;
          const previousLength = previousDx * previousDx + previousDy * previousDy;
          const nextDx = next.x - point.x;
          const nextDy = next.y - point.y;
          const nextLength = nextDx * nextDx + nextDy * nextDy;
          let previousNormalX = 0;
          let previousNormalY = 0;
          let nextNormalX = 0;
          let nextNormalY = 0;

          if (previousLength >= 1e-10) {
            const inverse = 1 / Math.sqrt(previousLength);
            previousNormalX = -previousDy * inverse;
            previousNormalY = previousDx * inverse;
          }
          if (nextLength >= 1e-10) {
            const inverse = 1 / Math.sqrt(nextLength);
            nextNormalX = -nextDy * inverse;
            nextNormalY = nextDx * inverse;
          }

          normalX = (previousNormalX + nextNormalX) / 2;
          normalY = (previousNormalY + nextNormalY) / 2;
          const normalLength = normalX * normalX + normalY * normalY;
          if (normalLength >= 1e-10) {
            const inverse = 1 / Math.sqrt(normalLength);
            normalX *= inverse;
            normalY *= inverse;
          }
        }

        const halfWidth = speedMultiplier / 2;
        upper[index].x = point.x + normalX * halfWidth;
        upper[index].y = point.y + normalY * halfWidth;
        lower[index].x = point.x - normalX * halfWidth;
        lower[index].y = point.y - normalY * halfWidth;
      }

      context.beginPath();
      context.moveTo(upper[0].x, upper[0].y);
      for (let index = 1; index < upper.length; index += 1) {
        context.lineTo(upper[index].x, upper[index].y);
      }
      for (let index = lower.length - 1; index >= 0; index -= 1) {
        context.lineTo(lower[index].x, lower[index].y);
      }
      context.closePath();

      const head = points[0];
      const tail = points[points.length - 1];
      if ((tail.x - head.x) ** 2 + (tail.y - head.y) ** 2 > 0.25) {
        const gradient = context.createLinearGradient(head.x, head.y, tail.x, tail.y);
        gradient.addColorStop(0, `rgba(${BASE_COLOR[0]},${BASE_COLOR[1]},${BASE_COLOR[2]},${ALPHA_BASE})`);
        gradient.addColorStop(1, `rgba(${END_COLOR[0]},${END_COLOR[1]},${END_COLOR[2]},${ALPHA_END})`);
        context.fillStyle = gradient;
      } else {
        context.fillStyle = `rgba(${BASE_COLOR[0]},${BASE_COLOR[1]},${BASE_COLOR[2]},${ALPHA_BASE})`;
      }
      context.fill();

      if (now - lastPointerAt < 800) {
        frame = requestAnimationFrame(render);
      } else {
        hasPointer = false;
        smoothedSpeed = 0;
        context.clearRect(0, 0, width, height);
      }
    };

    schedule = () => {
      if (!frame && !destroyed && !hidden && hasPointer) {
        frame = requestAnimationFrame(render);
      }
    };
    const visibilityChange = () => {
      hidden = document.hidden;
      if (hidden) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else {
        if (hasPointer) schedule();
      }
    };

    const supportsPointer = "PointerEvent" in window;
    if (supportsPointer) {
      window.addEventListener("pointermove", pointerMove, { passive: true });
      document.addEventListener("pointerleave", pointerLeave);
    } else {
      window.addEventListener("mousemove", mouseMove, { passive: true });
      document.addEventListener("mouseleave", pointerLeave);
    }
    window.addEventListener("touchmove", touchMove, { passive: true });
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", visibilityChange);
    resize();

    return () => {
      destroyed = true;
      cancelAnimationFrame(frame);
      context.clearRect(0, 0, width, height);
      if (supportsPointer) {
        window.removeEventListener("pointermove", pointerMove);
        document.removeEventListener("pointerleave", pointerLeave);
      } else {
        window.removeEventListener("mousemove", mouseMove);
        document.removeEventListener("mouseleave", pointerLeave);
      }
      window.removeEventListener("touchmove", touchMove);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", visibilityChange);
    };
  }, [enabled]);

  return <canvas ref={canvasRef} className={styles.trail} data-testid="site-cursor-trail" data-cursor-trail="obsidian" aria-hidden="true" />;
}
