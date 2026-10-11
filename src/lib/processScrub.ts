import { PROCESS_CUES } from './processChapters';

export const processFilmProgress = (scroll: number) => Math.min(1, Math.max(0, (scroll - .16) / .78));

export function processStageAt(progress: number) {
  const time = Math.min(1, Math.max(0, progress)) * PROCESS_CUES.at(-1)!;
  return Math.max(0, Math.min(5, PROCESS_CUES.findLastIndex(cue => cue <= time)));
}

/** Critically damped playhead: ease into motion, brake on reversal, never bounce.
 * Scroll remains native; only the photograph's time is smoothed. */
export class ProcessPlayhead {
  time = 0;
  private velocity = 0;
  reset(time: number) {
    this.time = Math.max(0, time);
    this.velocity = 0;
  }
  step(target: number, elapsed: number) {
    const dt = Math.min(.05, Math.max(0, elapsed));
    if (!dt) return this.time;
    const original = Math.max(0, target);
    const omega = 2 / .24;
    const x = omega * dt;
    const decay = 1 / (1 + x + .48 * x * x + .235 * x * x * x);
    // Both directions travel 25% faster. Reverse retains its 25% lead,
    // with the same damped acceleration and reversal braking.
    const speed = original < this.time ? 5 : 4;
    const change = Math.min(speed * .24, Math.max(-speed * .24, this.time - original));
    const goal = this.time - change;
    const temp = (this.velocity + omega * change) * dt;
    this.velocity = (this.velocity - omega * temp) * decay;
    let next = goal + (change + temp) * decay;
    if ((original - this.time > 0) === (next > original)) {
      next = original;
      this.velocity = 0;
    }
    if (Math.abs(next - original) < .002 && Math.abs(this.velocity) < .025) {
      next = original;
      this.velocity = 0;
    }
    this.time = Math.max(0, next);
    return this.time;
  }
}
