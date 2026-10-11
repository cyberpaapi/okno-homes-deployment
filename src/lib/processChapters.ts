export const PROCESS_FPS = 30;
// Frame 620 is the resolved, closed house before the cyan outline outro.
// Keep original AVC frames; this is a presentation cut, not a re-encode.
export const PROCESS_END_FRAME = 620;
export const PROCESS_END_TIME = PROCESS_END_FRAME / PROCESS_FPS;
export const PROCESS_CUES = [0, 7.65, 10.241667, 11.375, 16.675, 20.1, PROCESS_END_TIME] as const;
