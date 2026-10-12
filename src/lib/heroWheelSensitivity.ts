// Wheel events also carry laptop trackpad input. Scale their distance rather
// than capping individual events, so dense gestures retain their proportions.
export const HERO_WHEEL_GAIN = .45;

export function heroWheelDelta(
  deltaY: number,
  eventType: string,
  heroTop: number,
  heroBottom: number,
  viewportHeight: number,
) {
  const inFilm = heroTop <= 0 && heroBottom > viewportHeight;
  return eventType === 'wheel' && inFilm ? deltaY * HERO_WHEEL_GAIN : deltaY;
}
