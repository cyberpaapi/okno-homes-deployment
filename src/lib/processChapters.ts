export const PROCESS_FPS = 30;
// Handover replaces the unfinished roof/outro with the final resolved house.
// Keep original AVC packets; this is a presentation cut, not a re-encode.
export const PROCESS_END_FRAME = 620;
export const PROCESS_END_TIME = PROCESS_END_FRAME / PROCESS_FPS;
export const PROCESS_HANDOVER_TIME = 20.1;
export const PROCESS_FINAL_SOURCE_TIME = 25.6;
export const PROCESS_CUES = [0, 7.65, 10.241667, 11.375, 16.675, PROCESS_HANDOVER_TIME, PROCESS_END_TIME] as const;

/** The original ending is a standalone keyframe in both released variants.
 * Repeat its packet at presentation timestamps, without changing image bytes. */
export function processPresentationPackets(packets: number[][]) {
  const held = packets[Math.round(PROCESS_FINAL_SOURCE_TIME * PROCESS_FPS)];
  if (!held?.[3]) throw new Error('Process final house must be an independent keyframe');
  return packets.slice(0, PROCESS_END_FRAME + 1).map((packet, index) =>
    index >= Math.round(PROCESS_HANDOVER_TIME * PROCESS_FPS)
      ? [held[0], held[1], Math.round(index / PROCESS_FPS * 1e6), 1]
      : packet);
}
