export const heroFilmProgress = (scroll: number) => Math.min(1, Math.max(0, (scroll - .3) / .665));

/** Bound each gesture to less than one second ahead of the displayed film.
 * Excess wheel distance is discarded, never queued as a later camera jump. */
export function limitHeroFilmScroll(current: number, requested: number, start: number, span: number, shown: number) {
  if (span <= 0 || current === requested) return requested;
  const end = start + span;
  const progress = Math.min(1, Math.max(0, shown));
  if (requested > current && current <= end + 1 && requested > start && progress < 1) {
    return Math.max(current, Math.min(requested, start + span * (.3 + .665 * Math.min(1, progress + .035))));
  }
  if (requested < current && current >= start - 1 && requested < end && progress > 0) {
    return Math.min(current, Math.max(requested, start + span * (.3 + .665 * Math.max(0, progress - .035))));
  }
  return requested;
}
