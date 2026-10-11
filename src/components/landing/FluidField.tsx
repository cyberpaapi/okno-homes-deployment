"use client";

import { useEffect, useRef } from "react";
import type { WebGLRenderer } from "three";
import styles from "./FluidField.module.css";

/*
 * 21st.dev Fluid Field Background, component 25595.
 * Source: docs/21st-source/rebuild-25595.tsx.txt
 * Retains its exact simplex-noise, domain warping, and traveling beam equations.
 * Palette and native renderer lifecycle replace the original iframe/CDN wrapper.
 */
const vertexShader = `
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float u_time;
  uniform vec2 u_resolution;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m;
    m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    uv.x *= u_resolution.x / u_resolution.y;

    vec3 baseColor = vec3(0.025, 0.035, 0.030);
    vec2 st = uv * 0.7;
    st += vec2(snoise(st + u_time * 0.05), snoise(st - u_time * 0.05)) * 0.3;

    float beam = smoothstep(0.1, 0.8, snoise(vec2(st.x + st.y * 1.5 - u_time * 0.15, u_time * 0.02)));
    vec3 glow = mix(vec3(0.43, 0.52, 0.47), vec3(0.22, 0.31, 0.27), snoise(uv * 1.5 + u_time * 0.1) * 0.5 + 0.5);

    gl_FragColor = vec4(baseColor + (glow * beam * 0.7), 1.0);
  }
`;

export type FluidFieldProps = {
  className?: string;
  active?: boolean;
};

/** Place within a positioned section; this decorative layer never captures input. */
export default function FluidField({ className, active = true }: FluidFieldProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas || !active) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let disposed = false;
    let visible = false;
    let loading = false;
    let contextLost = false;
    let renderer: WebGLRenderer | undefined;
    let disposeScene: (() => void) | undefined;
    let draw: (() => void) | undefined;
    let resize: (() => void) | undefined;
    let frame = 0;
    let timer: number | undefined;
    let lastFrameTime = 0;
    let elapsed = 12;

    function stop() {
      window.cancelAnimationFrame(frame);
      if (timer !== undefined) window.clearTimeout(timer);
      frame = 0;
      timer = undefined;
      lastFrameTime = 0;
    }

    function shouldAnimate() {
      return !disposed && visible && !document.hidden && !reducedMotion.matches && !contextLost;
    }

    function tick(now: number) {
      frame = 0;
      if (!shouldAnimate() || !draw) return;
      if (lastFrameTime) elapsed += Math.min((now - lastFrameTime) / 1000, 0.1);
      lastFrameTime = now;
      draw();
      // Schedule at 30fps rather than keeping a 60/120Hz idle RAF loop alive.
      timer = window.setTimeout(() => {
        timer = undefined;
        frame = window.requestAnimationFrame(tick);
      }, 1000 / 30);
    }

    async function initialise() {
      if (loading || renderer || disposed || reducedMotion.matches) return;
      loading = true;
      try {
        // Below-the-fold sections do not load Three or create a GL context early.
        const THREE = await import("three");
        if (disposed || !visible || reducedMotion.matches) return;
        const nextRenderer = new THREE.WebGLRenderer({
          canvas: canvas!,
          antialias: false,
          alpha: false,
          powerPreference: "low-power",
          depth: false,
          stencil: false,
        });
        renderer = nextRenderer;
        const geometry = new THREE.PlaneGeometry(2, 2);
        const uniforms = {
          u_time: { value: elapsed },
          u_resolution: { value: new THREE.Vector2(1, 1) },
        };
        const material = new THREE.ShaderMaterial({
          vertexShader,
          fragmentShader,
          uniforms,
          depthTest: false,
          depthWrite: false,
        });
        const scene = new THREE.Scene();
        scene.add(new THREE.Mesh(geometry, material));
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        disposeScene = () => {
          geometry.dispose();
          material.dispose();
          scene.clear();
        };
        draw = () => {
          if (disposed || contextLost) return;
          uniforms.u_time.value = elapsed;
          nextRenderer.render(scene, camera);
          canvas!.style.opacity = "1";
        };
        resize = () => {
          if (disposed || contextLost) return;
          const { width, height } = root!.getBoundingClientRect();
          if (!width || !height) return;
          const dpr = Math.min(window.devicePixelRatio || 1, 1.25, 1600 / Math.max(width, height));
          nextRenderer.setPixelRatio(dpr);
          nextRenderer.setSize(width, height, false);
          nextRenderer.getDrawingBufferSize(uniforms.u_resolution.value);
          if (visible && !document.hidden) draw?.();
        };
        resize();
        synchronize();
      } catch {
        // The CSS limestone field remains available if WebGL cannot initialise.
        canvas!.style.opacity = "0";
        disposeScene?.();
        renderer?.dispose();
        renderer = undefined;
        draw = undefined;
        resize = undefined;
      } finally {
        loading = false;
      }
    }

    function synchronize() {
      stop();
      if (disposed) return;
      if (reducedMotion.matches) {
        canvas!.style.opacity = "0";
        return;
      }
      if (shouldAnimate()) {
        if (renderer) frame = window.requestAnimationFrame(tick);
        else void initialise();
      }
    }

    function handleContextLost(event: Event) {
      event.preventDefault();
      contextLost = true;
      canvas!.style.opacity = "0";
      stop();
    }

    function handleContextRestored() {
      contextLost = false;
      resize?.();
      synchronize();
    }

    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      synchronize();
    });
    intersection.observe(root);
    const dimensions = typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(() => resize?.());
    dimensions?.observe(root);
    document.addEventListener("visibilitychange", synchronize);
    reducedMotion.addEventListener("change", synchronize);
    canvas.addEventListener("webglcontextlost", handleContextLost);
    canvas.addEventListener("webglcontextrestored", handleContextRestored);

    return () => {
      disposed = true;
      stop();
      intersection.disconnect();
      dimensions?.disconnect();
      document.removeEventListener("visibilitychange", synchronize);
      reducedMotion.removeEventListener("change", synchronize);
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      canvas.removeEventListener("webglcontextrestored", handleContextRestored);
      disposeScene?.();
      renderer?.dispose();
      renderer?.forceContextLoss();
      canvas.style.opacity = "0";
    };
  }, [active]);

  return (
    <div ref={rootRef} className={[styles.field, className].filter(Boolean).join(" ")} aria-hidden="true" data-fluid-field>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
