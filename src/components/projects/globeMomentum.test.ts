import { describe, expect, it } from 'vitest';
import { coastGlobe, GLOBE_ENTRANCE_DURATION, globeAutoRotationSpeed } from './globeMomentum';
describe('globe release momentum', () => {
  const simulate = (fps: number, seconds: number) => {
    let velocity = 240, rotation = 0;
    for (let i = 0; i < fps * seconds; i++) { const step = coastGlobe(velocity, 1 / fps);rotation += step.distance;velocity = step.velocity; }
    return { velocity, rotation };
  };
  it('travels the same distance at 30 and 120 fps', () => {
    const slow = simulate(30, 1), fast = simulate(120, 1);
    expect(slow.rotation).toBeCloseTo(fast.rotation, 8);expect(slow.velocity).toBeCloseTo(fast.velocity, 8);
    expect(slow.rotation).toBeGreaterThan(80);
  });
  it('comes to rest without reversing after a flick', () => {
    expect(simulate(60, 5).velocity).toBe(0);
    expect(coastGlobe(-240, .1).distance).toBeLessThan(0);
    expect(coastGlobe(0, .1)).toEqual({ distance: 0, velocity: 0 });
  });
  it('eases the opening orbit into a quiet uniform rotation', () => {
    expect(globeAutoRotationSpeed(0)).toBe(82);
    expect(globeAutoRotationSpeed(1)).toBeLessThan(82);
    expect(globeAutoRotationSpeed(2)).toBeLessThan(globeAutoRotationSpeed(1));
    expect(globeAutoRotationSpeed(GLOBE_ENTRANCE_DURATION)).toBe(2.5);
    expect(globeAutoRotationSpeed(GLOBE_ENTRANCE_DURATION + 30)).toBe(2.5);
  });
});
