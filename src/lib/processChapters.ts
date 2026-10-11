export const PROCESS_CUES = [0, 7.65, 10.241667, 11.375, 16.675, 21.975, 25.633333] as const;
export const PROCESS_FPS = 30;

export function chapterBoundary(index: number, duration: number) {
  const safe = Number.isFinite(duration) && duration > 0 ? duration : PROCESS_CUES.at(-1)!;
  return PROCESS_CUES[Math.max(0, Math.min(6, index))] / PROCESS_CUES.at(-1)! * safe;
}

/** Stop on the last frame belonging to this chapter, before the next cut. */
export function chapterEnd(index: number, duration: number) {
  return Math.max(0, chapterBoundary(index + 1, duration) - 1 / PROCESS_FPS);
}

/** A wheel burst is one gesture. Momentum at a stop never starts another film. */
export class ChapterGesture {
  private lastInput = -Infinity;
  private amount = 0;
  private direction = 0;
  reset(now: number) { this.lastInput = now; this.amount = 0; this.direction = 0; }
  push(delta: number, now: number, playing: boolean) {
    const fresh = now - this.lastInput > 220;
    this.lastInput = now;
    if (fresh) { this.amount = 0; this.direction = Math.sign(delta); }
    if (playing || !this.direction || Math.sign(delta) !== this.direction) return 0;
    this.amount += Math.abs(delta);
    if (this.amount < 70) return 0;
    const direction = this.direction;
    this.direction = 0;
    this.amount = 0;
    return direction;
  }
}
