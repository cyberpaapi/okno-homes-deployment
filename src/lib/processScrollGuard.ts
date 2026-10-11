/** Keep gesture-driven page movement within reach of the frame on screen.
 * No chapter snaps, queued excess gestures or forced playback. */
export function limitProcessScroll(
  current: number, requested: number, start: number, span: number,
  shown: number, kind: 'film' | 'timeline' = 'film',
) {
  if (span <= 0 || current === requested) return requested;
  const progress = Math.min(1, Math.max(0, shown));
  const opening = kind === 'film' ? .16 : 0;
  const length = kind === 'film' ? .78 : 1;
  const lead = kind === 'film' ? .065 : .16;
  const end = start + span;
  // Enter the detail sequence on its complete first/last phase before
  // accepting another gesture, even when the incoming gesture is enormous.
  // scrollTo can round a fractional CSS boundary by a fraction of a pixel.
  // Treat that position as inside, so a reverse entry can actually advance.
  if (kind === 'timeline' && requested > current && current < start - 1 && requested >= start) return start;
  if (kind === 'timeline' && requested < current && current > end + 1 && requested <= end) return end;
  if (requested > current && current <= end + 1 && requested > start && progress < .993) {
    return Math.max(current, Math.min(requested, start + span * (opening + length * Math.min(1, progress + lead))));
  }
  if (requested < current && current >= start - 1 && requested < end && progress > .003) {
    return Math.min(current, Math.max(requested, start + span * (opening + length * Math.max(0, progress - lead))));
  }
  return requested;
}

export function wheelPixels(delta: number, mode: number, viewport: number) {
  return delta * (mode === 1 ? 16 : mode === 2 ? viewport : 1);
}
