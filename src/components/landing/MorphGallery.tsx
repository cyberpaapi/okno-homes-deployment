"use client"

import * as React from "react"
import styles from "./MorphGallery.module.css"

/**
 * Morph Gallery — a photo gallery whose slides dissolve into each other
 * through noise instead of cutting or cross-fading.
 *
 * The transition is one full-screen shader pass over two textures. An fbm
 * noise field gives every pixel a threshold, and the progress value sweeps
 * past those thresholds, so the outgoing frame tears away in drifting tatters
 * rather than fading uniformly. The threshold is biased by the luminance of
 * the *incoming* frame, which makes its bright areas burn through first — the
 * detail that stops it reading as a generic dissolve filter.
 *
 * Self-contained: raw WebGL, React is the only import. No gallery library, no
 * animation library, no CSS file. The canvas sizes itself from its own box.
 *
 * Textures need CORS. An image served without `Access-Control-Allow-Origin`
 * cannot be uploaded to WebGL at all, so the component detects that and falls
 * back to a plain DOM cross-fade — the gallery still works, it just stops
 * morphing. That is the difference between "no shader" and "black rectangle".
 */

export type MorphItem = {
  /** Full-size image. Must be served with CORS headers to be morphed. */
  src: string
  /** Thumbnail for the strip. Falls back to `src`, which is wasteful. */
  thumb?: string
  alt?: string
}

export type MorphGalleryProps = {
  items: MorphItem[]
  /** **Must be a definite length.** The canvas fills this box. */
  height?: string
  /** Milliseconds of dissolve. */
  duration?: number
  /** fbm frequency. Higher tears into finer shreds. */
  noiseScale?: number
  /** Width of the dissolve front, in threshold units. 0 is a hard edge. */
  edge?: number
  /** How far the frames slide against each other while dissolving. */
  drift?: number
  /** Wrap past the ends. */
  loop?: boolean
  /** Milliseconds between automatic advances. 0 (default) is off. */
  autoplay?: number
  arrows?: boolean
  thumbnails?: boolean
  ariaLabel?: string
  /** Controlled index. Omit for uncontrolled. */
  index?: number
  defaultIndex?: number
  onIndexChange?: (index: number) => void
  className?: string
}

// #region gallery
/** Wrap past the ends when looping, clamp at them when not. */
export const wrapIndex = (i: number, n: number, loop: boolean): number => {
  if (n <= 0) return 0
  return loop ? ((i % n) + n) % n : Math.min(Math.max(i, 0), n - 1)
}

/** Quintic in-out: the dissolve starts and ends still, and hurries the middle. */
export const easeInOutQuint = (t: number): number => {
  const x = Math.min(Math.max(t, 0), 1)
  return x < 0.5 ? 16 * x ** 5 : 1 - (-2 * x + 2) ** 5 / 2
}

/**
 * `object-fit: cover` expressed as a UV scale about the centre. Both factors
 * are <= 1: the sampled window shrinks, so the image crops rather than
 * stretching, whichever way the box is out of proportion.
 */
export const coverScale = (
  canvasAspect: number,
  imgAspect: number,
): [number, number] =>
  canvasAspect > imgAspect
    ? [1, imgAspect / canvasAspect]
    : [canvasAspect / imgAspect, 1]
// #endregion

const VERT = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`

const FRAG = `
precision highp float;

uniform sampler2D u_from;
uniform sampler2D u_to;
uniform float u_progress;
uniform vec2 u_resolution;
uniform float u_fromAspect;
uniform float u_toAspect;
uniform float u_scale;
uniform float u_direction;
uniform float u_edge;
uniform float u_drift;

varying vec2 v_uv;

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v) {
  const vec4 C = vec4(
    0.211324865405187,
    0.366025403784439,
   -0.577350269189626,
    0.024390243902439
  );
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(
    permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0)
  );
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x  = 2.0 * fract(p * C.www) - 1.0;
  vec3 h  = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 v) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 5; i++) {
    value += amplitude * snoise(v);
    v *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

// The drift below pushes UVs past the edge of the image, and CLAMP_TO_EDGE
// answers that by smearing the last row of pixels into long vertical streaks.
// Reflecting instead keeps real picture there. Done in the shader because
// MIRRORED_REPEAT is illegal on the non-power-of-two textures photos produce.
vec2 mirror(vec2 uv) {
  return 1.0 - abs(1.0 - mod(uv, 2.0));
}

vec2 coverUV(vec2 uv, float imgAspect) {
  float canvasAspect = u_resolution.x / u_resolution.y;
  vec2 scale = (canvasAspect > imgAspect)
    ? vec2(1.0, imgAspect / canvasAspect)
    : vec2(canvasAspect / imgAspect, 1.0);
  return mirror((uv - 0.5) * scale + 0.5);
}

void main() {
  // Widen the sweep by one edge at each end, so progress 0 and 1 are fully
  // one image or the other rather than already half-dissolved.
  float adjusted = u_progress * (1.0 + 2.0 * u_edge) - u_edge;

  float noise = fbm(v_uv * u_scale + vec2(0.0, u_progress * u_direction)) * 0.5 + 0.5;
  // Bias the threshold by how bright the incoming frame is here: its lit areas
  // cross the front first, so the new image appears to burn through the old.
  noise = smoothstep(
    0.0,
    2.0,
    length(texture2D(u_to, coverUV(v_uv, u_toAspect)).rgb) + noise
  );

  float mixFactor = 1.0 - smoothstep(adjusted - u_edge, adjusted + u_edge, noise);

  // Both frames slide, by different amounts and in opposite directions, so the
  // tatters have parallax against each other instead of sitting in one plane.
  vec2 fromUV = coverUV(
    v_uv + vec2(0.0, noise * u_progress * u_drift * u_direction),
    u_fromAspect
  );
  vec2 toUV = coverUV(
    v_uv + vec2(0.0, noise * (1.0 - u_progress) * -0.5 * u_drift * u_direction),
    u_toAspect
  );

  gl_FragColor = mix(texture2D(u_from, fromUV), texture2D(u_to, toUV), mixFactor);
}
`

const compile = (gl: WebGLRenderingContext, type: number, src: string) => {
  const shader = gl.createShader(type)
  if (!shader) throw new Error("could not create shader")
  gl.shaderSource(shader, src)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader)
    gl.deleteShader(shader)
    throw new Error("shader compile failed: " + log)
  }
  return shader
}

const link = (gl: WebGLRenderingContext, vertSrc: string, fragSrc: string) => {
  const vert = compile(gl, gl.VERTEX_SHADER, vertSrc)
  const frag = compile(gl, gl.FRAGMENT_SHADER, fragSrc)
  const program = gl.createProgram()
  if (!program) throw new Error("could not create program")
  gl.attachShader(program, vert)
  gl.attachShader(program, frag)
  gl.linkProgram(program)
  // The shaders are owned by the program once attached; drop our references
  // now so they are freed with it rather than leaking per mount.
  gl.deleteShader(vert)
  gl.deleteShader(frag)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program)
    gl.deleteProgram(program)
    throw new Error("program link failed: " + log)
  }
  return program
}

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    // Without this the texture upload throws and the whole gallery goes black.
    // With it, a host that sends no CORS header fails here instead — which we
    // can see, and fall back from.
    img.crossOrigin = "anonymous"
    img.decoding = "async"
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error("could not load " + src))
    img.src = src
  })

// Original: 21st.dev Morph Gallery, ID 27258. The shader above is retained
// verbatim. This integration changes scheduling, loading and controls only.
type GalleryEngine = {
  go: (index: number) => void
  visibility: (visible: boolean) => void
  tune: (tuning: { duration: number; noiseScale: number; edge: number; drift: number }) => void
}

const subscribeMotion = (listener: () => void) => {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)")
  query.addEventListener("change", listener)
  return () => query.removeEventListener("change", listener)
}
const readMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches
const serverMotion = () => false

export default function MorphGallery({
  items,
  height = "min(82svh, 960px)",
  duration = 1500,
  noiseScale = 3.5,
  edge = 0.15,
  drift = 0.5,
  loop = true,
  autoplay = 0,
  arrows = true,
  thumbnails = false,
  ariaLabel = "OKNO homes gallery",
  index,
  defaultIndex = 0,
  onIndexChange,
  className = "",
}: MorphGalleryProps) {
  const rootRef = React.useRef<HTMLElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const engineRef = React.useRef<GalleryEngine | null>(null)
  const [uncontrolled, setUncontrolled] = React.useState(defaultIndex)
  const active = wrapIndex(index ?? uncontrolled, items.length, loop)
  const [near, setNear] = React.useState(false)
  const [visible, setVisible] = React.useState(false)
  const [ready, setReady] = React.useState(false)
  const [failed, setFailed] = React.useState(false)
  const [generation, setGeneration] = React.useState(0)
  const [paused, setPaused] = React.useState(false)
  const [pageVisible, setPageVisible] = React.useState(true)
  const reduced = React.useSyncExternalStore(subscribeMotion, readMotion, serverMotion)
  const sources = JSON.stringify(items.map((item) => item.src))
  const initialRef = React.useRef({ active, duration, noiseScale, edge, drift })
  const visibleRef = React.useRef(false)

  React.useEffect(() => {
    initialRef.current = { active, duration, noiseScale, edge, drift }
    engineRef.current?.tune({ duration, noiseScale, edge, drift })
    engineRef.current?.go(active)
  }, [active, duration, noiseScale, edge, drift])

  React.useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const preload = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setNear(true)
        preload.disconnect()
      }
    }, { rootMargin: "400px" })
    const viewport = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting))
    preload.observe(root)
    viewport.observe(root)
    const visibility = () => setPageVisible(!document.hidden)
    document.addEventListener("visibilitychange", visibility)
    return () => {
      preload.disconnect()
      viewport.disconnect()
      document.removeEventListener("visibilitychange", visibility)
    }
  }, [])

  React.useEffect(() => {
    visibleRef.current = visible && pageVisible
    engineRef.current?.visibility(visible && pageVisible)
  }, [visible, pageVisible])

  React.useEffect(() => {
    const canvas = canvasRef.current
    const imageSources: string[] = JSON.parse(sources)
    if (!near || reduced || !canvas || !imageSources.length) return
    const gl = canvas.getContext("webgl", { alpha: false, antialias: false })
    if (!gl) {
      // Driver availability is external to React; preserve the native image.
      queueMicrotask(() => setFailed(true))
      return
    }
    let disposed = false
    let lost = false
    let running = visibleRef.current && !document.hidden
    let program: WebGLProgram | null = null
    let buffer: WebGLBuffer | null = null
    const textures: (WebGLTexture | null)[] = imageSources.map(() => null)
    const aspects = imageSources.map(() => 1)
    const uniforms: Record<string, WebGLUniformLocation | null> = {}
    let tuning = initialRef.current
    let from = wrapIndex(tuning.active, imageSources.length, loop)
    let to = from
    let pending = to
    let progress = 1
    let startedAt = 0
    let direction = 1
    let raf = 0
    let lastFrame = 0
    let hasDrawn = false

    const draw = () => {
      if (disposed || lost || !program || !textures[to] || !textures[from]) return
      gl.useProgram(program)
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, textures[from])
      gl.uniform1i(uniforms.from, 0)
      gl.activeTexture(gl.TEXTURE1)
      gl.bindTexture(gl.TEXTURE_2D, textures[to])
      gl.uniform1i(uniforms.to, 1)
      gl.uniform1f(uniforms.progress, progress)
      gl.uniform2f(uniforms.resolution, canvas.width, canvas.height)
      gl.uniform1f(uniforms.fromAspect, aspects[from])
      gl.uniform1f(uniforms.toAspect, aspects[to])
      gl.uniform1f(uniforms.scale, tuning.noiseScale)
      gl.uniform1f(uniforms.direction, direction)
      gl.uniform1f(uniforms.edge, Math.max(tuning.edge, 0.001))
      gl.uniform1f(uniforms.drift, tuning.drift)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      if (!hasDrawn) {
        hasDrawn = true
        setReady(true)
        setFailed(false)
      }
    }
    const frame = (now: number) => {
      raf = 0
      if (disposed || lost || !running) return
      // At most 45 fps, and only while changing image. The resting image has
      // no animation loop or pointer listener.
      if (now - lastFrame >= 1000 / 45) {
        lastFrame = now
        progress = easeInOutQuint((now - startedAt) / Math.max(tuning.duration, 1))
        draw()
      }
      if (progress < 1) raf = requestAnimationFrame(frame)
    }
    const go = (next: number) => {
      if (disposed || lost) return
      pending = wrapIndex(next, imageSources.length, loop)
      if (!textures[pending] || pending === to) return
      cancelAnimationFrame(raf)
      from = textures[to] ? to : pending
      to = pending
      const forward = loop
        ? ((to - from + imageSources.length) % imageSources.length) * 2 <= imageSources.length
        : to > from
      direction = forward ? 1 : -1
      progress = running && tuning.duration > 0 ? 0 : 1
      startedAt = performance.now()
      setFailed(false)
      draw()
      if (progress < 1) raf = requestAnimationFrame(frame)
    }
    const resize = () => {
      if (disposed || lost) return
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      const maxSize = Math.min(2400, gl.getParameter(gl.MAX_TEXTURE_SIZE) as number)
      const scale = Math.min(dpr, maxSize / Math.max(canvas.clientWidth, canvas.clientHeight, 1))
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * scale))
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * scale))
      gl.viewport(0, 0, canvas.width, canvas.height)
      draw()
    }
    const engine: GalleryEngine = {
      go,
      tune: (next) => { tuning = { ...tuning, ...next } },
      visibility: (next) => {
        running = next
        cancelAnimationFrame(raf)
        raf = 0
        if (!next) progress = 1
        else draw()
      },
    }
    engineRef.current = engine
    const onLost = (event: Event) => {
      event.preventDefault()
      lost = true
      cancelAnimationFrame(raf)
      setFailed(true)
      setReady(false)
    }
    const onRestored = () => setGeneration((value) => value + 1)
    canvas.addEventListener("webglcontextlost", onLost)
    canvas.addEventListener("webglcontextrestored", onRestored)
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)

    const upload = async (i: number) => {
      try {
        const img = await loadImage(imageSources[i])
        if (disposed || lost) return
        const texture = gl.createTexture()
        if (!texture) throw new Error("Texture allocation failed")
        textures[i] = texture
        gl.bindTexture(gl.TEXTURE_2D, texture)
        // Keep six-slide sequences viable on phones: the source photographs
        // remain untouched, while their GPU copies are capped to the useful
        // rendered resolution instead of allocating full 3200px textures.
        const longest = Math.max(img.naturalWidth, img.naturalHeight)
        const textureLimit = window.innerWidth <= 700 ? 1280 : 1800
        const textureScale = Math.min(1, textureLimit / Math.max(longest, 1))
        let textureSource: TexImageSource = img
        if (textureScale < 1) {
          const textureCanvas = document.createElement("canvas")
          textureCanvas.width = Math.max(1, Math.round(img.naturalWidth * textureScale))
          textureCanvas.height = Math.max(1, Math.round(img.naturalHeight * textureScale))
          const textureContext = textureCanvas.getContext("2d", { alpha: false })
          if (textureContext && "drawImage" in textureContext) {
            textureContext.drawImage(img, 0, 0, textureCanvas.width, textureCanvas.height)
            textureSource = textureCanvas
          }
        }
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureSource)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        aspects[i] = img.naturalWidth / Math.max(img.naturalHeight, 1)
        if (i === to) draw()
        if (i === pending) go(pending)
      } catch {
        if (!disposed && i === pending) setFailed(true)
      }
    }
    const start = async () => {
      try {
        program = link(gl, VERT, FRAG)
        gl.useProgram(program)
        buffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
        const position = gl.getAttribLocation(program, "a_position")
        gl.enableVertexAttribArray(position)
        gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)
        for (const name of ["from", "to", "progress", "resolution", "fromAspect", "toAspect", "scale", "direction", "edge", "drift"]) {
          uniforms[name] = gl.getUniformLocation(program, "u_" + name)
        }
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
        resize()
        await upload(to)
        // No gallery image or shader is requested until the section approaches
        // the viewport. After its first frame, prepare the remaining slides.
        if (!disposed) await Promise.all(imageSources.map((_, i) => textures[i] ? Promise.resolve() : upload(i)))
      } catch {
        if (!disposed) setFailed(true)
      }
    }
    void start()
    return () => {
      disposed = true
      if (engineRef.current === engine) engineRef.current = null
      cancelAnimationFrame(raf)
      observer.disconnect()
      canvas.removeEventListener("webglcontextlost", onLost)
      canvas.removeEventListener("webglcontextrestored", onRestored)
      for (const texture of textures) if (texture) gl.deleteTexture(texture)
      if (buffer) gl.deleteBuffer(buffer)
      if (program) gl.deleteProgram(program)
    }
  }, [sources, generation, loop, near, reduced])

  const go = React.useCallback((next: number) => {
    const wrapped = wrapIndex(next, items.length, loop)
    if (index === undefined) setUncontrolled(wrapped)
    onIndexChange?.(wrapped)
  }, [index, items.length, loop, onIndexChange])

  React.useEffect(() => {
    if (!autoplay || reduced || paused || !visible || !pageVisible || items.length < 2) return
    const timer = window.setInterval(() => go(active + 1), Math.max(autoplay, duration + 300))
    return () => window.clearInterval(timer)
  }, [autoplay, reduced, paused, visible, pageVisible, items.length, go, active, duration])

  const swipe = React.useRef<{ x: number; y: number } | null>(null)
  const current = items[active]
  if (!current) return null

  return (
    <section
      ref={rootRef}
      className={`${styles.gallery} ${className}`}
      style={{ height }}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      tabIndex={0}
      data-morph-gallery="27258"
      data-morph-renderer={reduced ? "reduced" : failed ? "fallback" : ready ? "webgl" : "loading"}
      onKeyDown={(event) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return
        event.preventDefault()
        go(active + (event.key === "ArrowRight" ? 1 : -1))
      }}
      onPointerDown={(event) => {
        if ((event.target as HTMLElement).closest("button")) return
        swipe.current = { x: event.clientX, y: event.clientY }
      }}
      onPointerUp={(event) => {
        const start = swipe.current
        swipe.current = null
        if (!start) return
        const dx = event.clientX - start.x
        const dy = event.clientY - start.y
        if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4) go(active + (dx < 0 ? 1 : -1))
      }}
      onPointerCancel={() => { swipe.current = null }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false) }}
    >
      {/* Original-resolution native image is also the no-WebGL/reduced-motion
          presentation; it is deliberately never a magnetic target. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={styles.image} src={current.src} alt={current.alt ?? ""} loading="lazy" decoding="async" draggable={false} />
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" style={{ opacity: ready && !failed && !reduced ? 1 : 0 }} />
      {arrows && items.length > 1 && (
        <div className={styles.controls}>
          {([-1, 1] as const).map((step) => (
            <button key={step} type="button" className={styles.arrow}
              data-cursor-media-action="true" data-landing-magnetic="true"
              onClick={() => go(active + step)}
              disabled={!loop && (step === -1 ? active === 0 : active === items.length - 1)}
              aria-label={step === -1 ? "Previous image" : "Next image"}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d={step === 1 ? "M4 12h15m-6-6 6 6-6 6" : "M20 12H5m6-6-6 6 6 6"} />
              </svg>
            </button>
          ))}
        </div>
      )}
      {thumbnails && items.length > 1 && (
        <div className={styles.thumbnails}>
          {items.map((item, i) => (
            <button key={item.src} type="button" onClick={() => go(i)} aria-current={i === active}
              aria-label={item.alt ? `Show ${item.alt}` : 'Show image'}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.thumb ?? item.src} alt="" width={80} height={50} loading="lazy" />
            </button>
          ))}
        </div>
      )}
      <span className={styles.srOnly} aria-live="polite" aria-atomic="true">{current.alt ?? 'Selected image'}</span>
    </section>
  )
}
