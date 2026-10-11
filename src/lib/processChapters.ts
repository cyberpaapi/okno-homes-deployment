export const PROCESS_FPS = 30;
// Keep original frames beneath a smooth finish blend; never seek into the outro.
export const PROCESS_END_FRAME = 620;
export const PROCESS_END_TIME = PROCESS_END_FRAME / PROCESS_FPS;
export const PROCESS_HANDOVER_TIME = 20.1;
export const PROCESS_FINAL_SOURCE_TIME = 25.6;
export const PROCESS_FINISH_START = 18.3;
export const PROCESS_CUES = [0, 7.65, 10.241667, 11.375, 16.675, PROCESS_HANDOVER_TIME, PROCESS_END_TIME] as const;

export const PROCESS_DAY_RANGES = {
  land: 'Days 01–10',
  architecture: 'Days 11–18',
  'design-lock': 'Days 19–25',
  assembly: 'Days 26–60',
  enclosure: 'Days 61–72',
  handover: 'Days 73–90',
} as const;

/** C2-continuous finish: zero velocity and acceleration at both ends.
 * Driven by the presented film time, so forward and reverse share one blend. */
export function processFinishOpacity(time: number) {
  const t = Math.min(1, Math.max(0, (time - PROCESS_FINISH_START) / (PROCESS_HANDOVER_TIME - PROCESS_FINISH_START)));
  return t * t * t * (t * (t * 6 - 15) + 10);
}

export function processPresentationPackets(packets: number[][]) {
  return packets.slice(0, PROCESS_END_FRAME + 1);
}
