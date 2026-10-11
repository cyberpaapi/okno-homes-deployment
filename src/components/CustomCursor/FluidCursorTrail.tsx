'use client';
// pulkitxm / Fluid Cursor Trail, retrieved 21st.dev demo 18358.
// Same canvas particle physics; bounded population, time-based decay and idle
// suspension added. The approved image trail remains in the atlas introduction.
import { useEffect, useRef } from 'react';
import styles from './CustomCursor.module.css';
type Particle = { x: number; y: number; vx: number; vy: number; life: number };
function isImageSurface(target: Element | null) {
  if (!target) return false;
  if (target.closest('[data-models-magnetic],[data-cursor-media-action]')) return false;
  if (target.closest('img,picture')) return true;
  const interactive = target.closest("a[href],button,[role='button']");
  return Boolean(interactive?.querySelector('img,picture'));
}
export function FluidCursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const fine = matchMedia('(hover: hover) and (pointer: fine)'), reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let particles: Particle[] = [], frame = 0, lastTime = 0, lastX = 0, lastY = 0, lastSpawn = 0;
    const resize = () => { const dpr = Math.min(devicePixelRatio || 1, 1.5);canvas.width = innerWidth * dpr;canvas.height = innerHeight * dpr;ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    const clear = () => { cancelAnimationFrame(frame);frame = 0;particles = [];lastSpawn = 0;ctx.clearRect(0, 0, innerWidth, innerHeight);canvas.dataset.particles = '0'; };
    const animate = (now: number) => {
      frame = 0;const dt = Math.min((now - lastTime) / 16.667 || 1, 3);lastTime = now;
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      particles = particles.filter(p => {
        p.x += p.vx * dt;p.y += p.vy * dt;p.vy += .025 * dt;p.life -= .027 * dt;
        if (p.life <= 0) return false;
        ctx.globalAlpha = p.life * .65;ctx.fillStyle = '#d8dcc2';ctx.beginPath();ctx.arc(p.x, p.y, 1.25 * p.life + .3, 0, Math.PI * 2);ctx.fill();return true;
      });
      ctx.globalAlpha = 1;canvas.dataset.particles = String(particles.length);
      if (particles.length) frame = requestAnimationFrame(animate);
    };
    const move = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!fine.matches || reduced.matches || document.hidden || event.pointerType !== 'mouse' || target?.closest('input,textarea,select,[contenteditable="true"],video,img,picture,iframe,[data-project-intro]') || isImageSurface(target)) { clear();return; }
      const now = performance.now();
      if (now - lastSpawn < 16 || (lastSpawn && Math.hypot(event.clientX - lastX, event.clientY - lastY) < 3)) return;
      const dx = lastSpawn ? Math.max(-2, Math.min(2, (event.clientX - lastX) * .025)) : 0;
      const dy = lastSpawn ? Math.max(-2, Math.min(2, (event.clientY - lastY) * .025)) : 0;
      for (let i = 0; i < 2; i++) particles.push({ x: event.clientX, y: event.clientY, life: 1, vx: (Math.random() - .5) * 1.6 - dx, vy: (Math.random() - .5) * 1.6 - dy });
      particles = particles.slice(-64);lastSpawn = now;lastX = event.clientX;lastY = event.clientY;
      if (!frame) { lastTime = now;frame = requestAnimationFrame(animate); }
    };
    const key = (event: KeyboardEvent) => { if (event.key === 'Tab') clear(); };
    resize();window.addEventListener('resize', resize);window.addEventListener('pointermove', move, { passive: true });window.addEventListener('blur', clear);window.addEventListener('keydown', key);document.documentElement.addEventListener('pointerleave', clear);document.addEventListener('visibilitychange', clear);fine.addEventListener('change', clear);reduced.addEventListener('change', clear);
    return () => { clear();window.removeEventListener('resize', resize);window.removeEventListener('pointermove', move);window.removeEventListener('blur', clear);window.removeEventListener('keydown', key);document.documentElement.removeEventListener('pointerleave', clear);document.removeEventListener('visibilitychange', clear);fine.removeEventListener('change', clear);reduced.removeEventListener('change', clear); };
  }, []);
  return <canvas ref={canvasRef} className={styles.particles} aria-hidden="true" data-particles="0" />;
}
