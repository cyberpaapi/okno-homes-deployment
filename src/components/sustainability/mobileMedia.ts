export const phoneMediaQuery = "(max-width: 700px)";

export const mobileMedia = {
  idle: "/sustainability/mobile/hero-idle-mobile-20261125.mp4",
  journey: "/sustainability/mobile/scroll-journey-mobile-intra-20261125.mp4",
  fog: "/sustainability/mobile/fog-loop-mobile-20261125.mp4",
  heroPoster: "/sustainability/mobile/hero-poster-mobile-20261125.jpg",
  journeyPoster: "/sustainability/mobile/journey-poster-mobile-20261125.jpg",
  fogPoster: "/sustainability/mobile/fog-poster-mobile-20261125.jpg",
  frameRate: 30,
  journeyFrames: 267,
} as const;

export function subscribeToPhoneMedia(onChange: () => void) {
  const query = window.matchMedia(phoneMediaQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

export const phoneMediaSnapshot = () => window.matchMedia(phoneMediaQuery).matches;
export const serverMediaSnapshot = (): null => null;

/** Land inside the chosen native frame, including the actual final frame. */
export function mobileJourneyTime(progress: number, duration: number) {
  const lastFrame = Math.min(
    mobileMedia.journeyFrames - 1,
    Math.max(0, Math.ceil(duration * mobileMedia.frameRate - 0.001) - 1),
  );
  const frame = Math.round(Math.min(1, Math.max(0, progress)) * lastFrame);
  return Math.min((frame + 0.25) / mobileMedia.frameRate, Math.max(0, duration - 0.001));
}
