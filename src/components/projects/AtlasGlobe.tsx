'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { type GlobePin } from '@/data/globePinCollections';
import styles from './AtlasGlobe.module.css';
import { coastGlobe, GLOBE_ENTRANCE_DURATION, globeAutoRotationSpeed } from './globeMomentum';
import { GLOBE_RADIUS, geographicPoint, setGlobeOrientation } from './globeCoordinates';

type Props = {
  locations: GlobePin[];
  focusId?: string;
  onReady?: () => void;
  paused?: boolean;
};

const labelOffsets: Record<string, [number, number]> = {
  hyderabad: [19, -15],
  lonavala: [-85, -18],
  coorg: [18, 20],
};

/**
 * A single textured GPU sphere. Pins use the sphere's own orientation so their
 * geographic coordinates stay attached to the map through every rotation.
 */
export default function AtlasGlobe({ locations, focusId, onReady, paused = false }: Props) {
  const locationsRef = useRef(locations);
  const refreshMarkersRef = useRef<() => void>(() => {});
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const markersRef = useRef<Array<HTMLElement | null>>([]);
  const focusRef = useRef<(id: string) => void>(() => {});
  const syncPauseRef = useRef<(value: boolean) => void>(() => {});
  const initialFocus = useRef(focusId ?? locations[0]?.id);
  const initialPaused = useRef(paused);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'fallback'>('loading');

  useLayoutEffect(() => {
    locationsRef.current = locations;
    refreshMarkersRef.current();
  }, [locations]);
  useEffect(() => { if (focusId) focusRef.current(focusId); }, [focusId]);
  useEffect(() => { syncPauseRef.current(paused); }, [paused]);
  useEffect(() => { if (state !== 'loading') onReady?.(); }, [state, onReady]);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    const contextOptions: WebGLContextAttributes = {
      alpha: true,
      antialias: true,
      depth: true,
      powerPreference: 'high-performance',
      premultipliedAlpha: true,
    };
    const context = canvas.getContext('webgl2', contextOptions) ?? canvas.getContext('webgl', contextOptions);
    if (!context) {
      queueMicrotask(() => setState('fallback'));
      return;
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const initial = locationsRef.current.find(location => location.id === initialFocus.current) ?? locationsRef.current[0];
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 3;
    const geometry = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0x9aaa91 });
    const earth = new THREE.Mesh(geometry, material);
    earth.rotation.order = 'XYZ';
    scene.add(earth);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        context: context as WebGLRenderingContext,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch {
      geometry.dispose();
      material.dispose();
      queueMicrotask(() => setState('fallback'));
      return;
    }
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);

    let markerPoints = locationsRef.current.map(location => geographicPoint(location.coordinates));
    const markerPosition = new THREE.Vector3();
    let texture: THREE.Texture | null = null;
    let textureReady = false;
    let disposed = false;
    let width = 500;
    let height = 500;
    let frame = 0;
    let lastTime = 0;
    let lastPaint = 0;
    let lastMetricsAt = Number.NEGATIVE_INFINITY;
    let labelMinX = 12;
    let labelMaxX = 488;
    let labelWidths: number[] = [];
    let longitude = -(initial?.coordinates?.[1] ?? 65);
    let latitude = -(initial?.coordinates?.[0] ?? 18);
    let targetLongitude = longitude;
    let targetLatitude = latitude;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let velocity = 0;
    let velocityY = 0;
    let visible = true;
    let hovering = false;
    let resumeAt = 0;
    let lastMove = 0;
    let entranceElapsed = 0;
    let idleTimer = 0;
    let suspended = initialPaused.current;
    let markerPaint = locationsRef.current.map(() => ({
      shown: false,
      x: Number.NaN,
      y: Number.NaN,
      labelLeft: Number.NaN,
    }));

    function paintMarkers() {
      locationsRef.current.forEach((location, index) => {
        const node = markersRef.current[index];
        const point = markerPoints[index];
        if (!node || !point) return;
        const painted = markerPaint[index] ?? (markerPaint[index] = { shown: false, x: Number.NaN, y: Number.NaN, labelLeft: Number.NaN });
        markerPosition.copy(point).applyQuaternion(earth.quaternion);
        const shown = markerPosition.z > GLOBE_RADIUS * Math.sin(0.035) && textureReady;
        if (painted.shown !== shown) {
          painted.shown = shown;
          node.style.visibility = shown ? 'visible' : 'hidden';
          node.tabIndex = shown ? 0 : -1;
        }
        if (!shown) return;
        const pixelsPerUnit = Math.min(width, height) / 2;
        const x = Math.round((width / 2 + markerPosition.x * pixelsPerUnit) * 4) / 4;
        const y = Math.round((height / 2 - markerPosition.y * pixelsPerUnit) * 4) / 4;
        if (painted.x !== x || painted.y !== y) {
          painted.x = x;
          painted.y = y;
          node.style.transform = `translate3d(${x}px,${y}px,0)`;
        }
        const label = node.lastElementChild as HTMLElement | null;
        if (!label) return;
        const preferred = labelOffsets[location.id]?.[0] ?? 13;
        const labelWidth = labelWidths[index] ?? 0;
        const labelLeft = Math.round(Math.max(
          labelMinX - x + 8,
          Math.min(preferred, labelMaxX - x + 8 - labelWidth),
        ) * 2) / 2;
        if (painted.labelLeft !== labelLeft) {
          painted.labelLeft = labelLeft;
          label.style.left = `${labelLeft}px`;
        }
      });
    }

    function draw(now: number) {
      frame = 0;
      if (disposed || suspended || !visible || document.hidden || !textureReady) return;
      if (now - lastPaint < 1000 / 60 - 1) {
        frame = requestAnimationFrame(draw);
        return;
      }
      lastPaint = now;
      const dt = Math.min((now - lastTime) / 1000 || 0.016, 0.05);
      lastTime = now;
      const rotating = !reduced.matches && !dragging && !hovering && now > resumeAt;
      let rotationSpeed = 0;
      let rotationPhase = reduced.matches ? 'reduced' : 'paused';
      if (rotating) {
        rotationSpeed = globeAutoRotationSpeed(entranceElapsed);
        targetLongitude += dt * rotationSpeed;
        entranceElapsed = Math.min(GLOBE_ENTRANCE_DURATION, entranceElapsed + dt);
        rotationPhase = entranceElapsed < GLOBE_ENTRANCE_DURATION ? 'entrance' : 'steady';
      }
      if (!dragging && !reduced.matches) {
        const horizontal = coastGlobe(velocity, dt);
        const vertical = coastGlobe(velocityY, dt);
        targetLongitude += horizontal.distance;
        velocity = horizontal.velocity;
        targetLatitude = Math.max(-70, Math.min(70, targetLatitude + vertical.distance));
        velocityY = Math.abs(targetLatitude) >= 70 ? 0 : vertical.velocity;
      }
      const blend = reduced.matches || dragging ? 1 : 1 - Math.exp(-dt * 7.5);
      longitude += (targetLongitude - longitude) * blend;
      latitude += (targetLatitude - latitude) * blend;

      setGlobeOrientation(earth, longitude, latitude);
      renderer.render(scene, camera);
      paintMarkers();

      if (process.env.NODE_ENV !== 'production' || now - lastMetricsAt >= 250) {
        lastMetricsAt = now;
        canvas!.dataset.rotationPhase = rotationPhase;
        canvas!.dataset.rotationSpeed = rotationSpeed.toFixed(2);
        canvas!.dataset.velocity = Math.hypot(velocity, velocityY).toFixed(3);
        canvas!.dataset.longitude = longitude.toFixed(4);
      }

      const settling = Math.abs(longitude - targetLongitude) + Math.abs(latitude - targetLatitude) > 0.005;
      if (dragging || settling || (!reduced.matches && (Math.abs(velocity) + Math.abs(velocityY) > 0.15 || (!hovering && now >= resumeAt)))) {
        frame = requestAnimationFrame(draw);
      } else if (!reduced.matches && !hovering) {
        window.clearTimeout(idleTimer);
        idleTimer = window.setTimeout(wake, Math.max(0, resumeAt - now) + 30);
      }
    }

    function wake() {
      if (!frame && !disposed && !suspended && visible && !document.hidden && textureReady) {
        frame = requestAnimationFrame(draw);
      }
    }

    function resize() {
      width = host!.clientWidth;
      height = host!.clientHeight;
      const left = host!.getBoundingClientRect().left;
      labelMinX = Math.max(0, -left) + 12;
      labelMaxX = Math.min(width, window.innerWidth - left) - 12;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const rawPixels = Math.max(1, width * height * dpr * dpr);
      const pixelScale = Math.min(1, Math.sqrt(520_000 / rawPixels));
      renderer.setPixelRatio(dpr * pixelScale);
      renderer.setSize(width, height, false);

      const aspect = width / Math.max(height, 1);
      if (aspect >= 1) {
        camera.left = -aspect;
        camera.right = aspect;
        camera.top = 1;
        camera.bottom = -1;
      } else {
        camera.left = -1;
        camera.right = 1;
        camera.top = 1 / aspect;
        camera.bottom = -1 / aspect;
      }
      camera.updateProjectionMatrix();
      labelWidths = markersRef.current.map((node) =>
        (node?.lastElementChild as HTMLElement | null)?.offsetWidth ?? 0,
      );
      wake();
    }

    focusRef.current = (id) => {
      const location = locationsRef.current.find(item => item.id === id);
      if (!location) return;
      const delta = ((-location.coordinates[1] - longitude + 540) % 360 + 360) % 360 - 180;
      targetLongitude = longitude + delta;
      targetLatitude = -location.coordinates[0];
      velocity = 0;
      velocityY = 0;
      entranceElapsed = GLOBE_ENTRANCE_DURATION;
      resumeAt = performance.now() + 2200;
      wake();
    };

    function down(event: PointerEvent) {
      if (event.button !== 0) return;
      dragging = true;
      velocity = 0;
      velocityY = 0;
      entranceElapsed = GLOBE_ENTRANCE_DURATION;
      lastX = event.clientX;
      lastY = event.clientY;
      lastMove = performance.now();
      targetLongitude = longitude;
      targetLatitude = latitude;
      canvas!.setPointerCapture(event.pointerId);
      canvas!.dataset.dragging = 'true';
      wake();
    }

    function move(event: PointerEvent) {
      if (!dragging) return;
      const now = performance.now();
      const elapsed = Math.max(0.008, (now - lastMove) / 1000);
      const dx = (event.clientX - lastX) * 0.34;
      const dy = event.pointerType === 'mouse' ? -(event.clientY - lastY) * 0.22 : 0;
      targetLongitude += dx;
      targetLatitude = Math.max(-70, Math.min(70, targetLatitude + dy));
      velocity = velocity * 0.35 + Math.max(-420, Math.min(420, dx / elapsed)) * 0.65;
      velocityY = velocityY * 0.35 + Math.max(-120, Math.min(120, dy / elapsed)) * 0.65;
      lastX = event.clientX;
      lastY = event.clientY;
      lastMove = now;
      wake();
    }

    function up(event: PointerEvent) {
      if (!dragging) return;
      dragging = false;
      if (event.type === 'pointercancel' || reduced.matches || performance.now() - lastMove > 120) {
        velocity = 0;
        velocityY = 0;
      }
      resumeAt = performance.now() + 1400;
      canvas!.dataset.dragging = 'false';
      if (canvas!.hasPointerCapture(event.pointerId)) canvas!.releasePointerCapture(event.pointerId);
      wake();
    }

    function enter(event: Event) {
      hovering = event.target instanceof Element && Boolean(event.target.closest('a,button'));
      if (!hovering) wake();
    }

    function leave() {
      hovering = false;
      wake();
    }

    function keyboard(event: KeyboardEvent) {
      const deltas: Record<string, [number, number]> = {
        ArrowLeft: [-18, 0],
        ArrowRight: [18, 0],
        ArrowUp: [0, 12],
        ArrowDown: [0, -12],
      };
      if (!deltas[event.key]) return;
      event.preventDefault();
      velocity = 0;
      velocityY = 0;
      entranceElapsed = GLOBE_ENTRANCE_DURATION;
      targetLongitude += deltas[event.key][0];
      targetLatitude = Math.max(-70, Math.min(70, targetLatitude + deltas[event.key][1]));
      resumeAt = performance.now() + 1800;
      wake();
    }

    function visibility() {
      if (document.hidden) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else {
        lastTime = performance.now();
        wake();
      }
    }

    function contextLost(event: Event) {
      event.preventDefault();
      cancelAnimationFrame(frame);
      frame = 0;
      setState('fallback');
    }

    const sizeObserver = new ResizeObserver(resize);
    sizeObserver.observe(host);
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) wake();
      else {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    });
    visibilityObserver.observe(host);

    canvas.addEventListener('pointerdown', down);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', up);
    canvas.addEventListener('keydown', keyboard);
    canvas.addEventListener('webglcontextlost', contextLost);
    host.addEventListener('pointerover', enter);
    host.addEventListener('pointerleave', leave);
    host.addEventListener('focusin', enter);
    host.addEventListener('focusout', leave);
    document.addEventListener('visibilitychange', visibility);
    reduced.addEventListener('change', wake);

    new THREE.TextureLoader().load(
      '/assets/projects/atlas/earth-relief.svg',
      (loadedTexture) => {
        if (disposed) {
          loadedTexture.dispose();
          return;
        }
        texture = loadedTexture;
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
        material.map = texture;
        material.needsUpdate = true;
        renderer.compile(scene, camera);
        textureReady = true;
        setState('ready');
        paintMarkers();
        wake();
      },
      undefined,
      () => { if (!disposed) setState('fallback'); },
    );

    syncPauseRef.current = (value) => {
      suspended = value;
      if (value) {
        cancelAnimationFrame(frame);
        frame = 0;
        window.clearTimeout(idleTimer);
      } else {
        lastTime = performance.now();
        wake();
      }
    };

    refreshMarkersRef.current = () => {
      markerPoints = locationsRef.current.map(location => geographicPoint(location.coordinates));
      markerPaint = locationsRef.current.map(() => ({ shown: false, x: Number.NaN, y: Number.NaN, labelLeft: Number.NaN }));
      resize();
      paintMarkers();
      const focus = locationsRef.current.find(location => location.id === initialFocus.current) ?? locationsRef.current[0];
      if (focus) focusRef.current(focus.id);
    };

    resize();
    return () => {
      syncPauseRef.current = () => {};
      disposed = true;
      window.clearTimeout(idleTimer);
      cancelAnimationFrame(frame);
      focusRef.current = () => {};
      refreshMarkersRef.current = () => {};
      sizeObserver.disconnect();
      visibilityObserver.disconnect();
      canvas.removeEventListener('pointerdown', down);
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', up);
      canvas.removeEventListener('pointercancel', up);
      canvas.removeEventListener('keydown', keyboard);
      canvas.removeEventListener('webglcontextlost', contextLost);
      host.removeEventListener('pointerover', enter);
      host.removeEventListener('pointerleave', leave);
      host.removeEventListener('focusin', enter);
      host.removeEventListener('focusout', leave);
      document.removeEventListener('visibilitychange', visibility);
      reduced.removeEventListener('change', wake);
      texture?.dispose();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <div className={styles.host} ref={hostRef} data-state={state} data-render-paused={paused}>
    <div className={styles.poster} aria-hidden="true" />
    <canvas
      className={styles.canvas}
      ref={canvasRef}
      tabIndex={0}
      role="img"
      aria-label="Interactive project globe. Drag or use arrow keys to rotate."
    />
    <div className={styles.rim} aria-hidden="true" />
    <div className={styles.markers} aria-label="Globe locations">
      {locations.map((location, index) => {
        const content = <>
          <span className={styles.pin} />
          <span
            className={styles.label}
            style={{ left: labelOffsets[location.id]?.[0] ?? 13, top: labelOffsets[location.id]?.[1] ?? -12 }}
          >
            {location.city.split(',')[0]}
          </span>
        </>;
        return <button
              type="button"
              key={location.id}
              ref={(node) => { markersRef.current[index] = node; }}
              className={styles.marker}
              data-active={selectedLocation === location.id}
              aria-label={`View ${location.city} on globe`}
              onClick={() => { setSelectedLocation(location.id); focusRef.current(location.id); }}
            >{content}</button>;
      })}
    </div>
    {selectedLocation && locations.some(location => location.id === selectedLocation) && <div className={styles.locationNote} role="status">
      <strong>{locations.find((location) => location.id === selectedLocation)?.city}</strong>
      <span>Location on the OKNO globe</span>
      <button aria-label="Close location note" onClick={() => setSelectedLocation(null)}>×</button>
    </div>}
  </div>;
}
