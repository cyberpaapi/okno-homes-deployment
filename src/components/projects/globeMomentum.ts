// Integrate angular velocity with exponential drag, independent of frame rate.
export function coastGlobe(velocity: number, seconds: number) {
  const friction = 2.2;
  const decay = Math.exp(-friction * Math.max(0, seconds));
  return { distance: velocity * (1 - decay) / friction, velocity: Math.abs(velocity * decay) < .15 ? 0 : velocity * decay };
}

export const GLOBE_ENTRANCE_DURATION = 3.2;

/**
 * Start with enough energy to make the atlas entrance legible, then ease into
 * the quiet continuous orbit used for the rest of the visit.
 */
export function globeAutoRotationSpeed(activeSeconds: number) {
  const steadySpeed = 2.5;
  const entranceSpeed = 82;
  const progress = Math.min(1, Math.max(0, activeSeconds) / GLOBE_ENTRANCE_DURATION);
  const remaining = 1 - progress;
  return steadySpeed + (entranceSpeed - steadySpeed) * remaining * remaining * remaining;
}
