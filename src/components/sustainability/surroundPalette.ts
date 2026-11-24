type Color = readonly [number, number, number];
type Stop = { at: number; top: Color; bottom: Color };

// Muted edge colors sampled from the rendered film: sky/fog above, forest below.
// The opening deliberately stays pure black as requested by the owner.
const stops: readonly Stop[] = [
  { at: 0, top: [0, 0, 0], bottom: [0, 0, 0] },
  { at: .20, top: [0, 0, 0], bottom: [0, 0, 0] },
  { at: .30, top: [18, 24, 18], bottom: [5, 9, 4] },
  { at: .46, top: [43, 50, 43], bottom: [24, 29, 18] },
  { at: .62, top: [91, 96, 92], bottom: [37, 41, 28] },
  { at: .82, top: [95, 101, 96], bottom: [33, 38, 28] },
  { at: 1, top: [95, 101, 96], bottom: [33, 38, 28] },
];

export function sustainabilitySurround(progress: number) {
  const p = Math.min(1, Math.max(0, progress));
  const index = Math.max(1, stops.findIndex(stop => stop.at >= p));
  const left = stops[index - 1], right = stops[index];
  const fraction = (p - left.at) / (right.at - left.at);
  const mix = (a: Color, b: Color) => `rgb(${a.map((value, i) => (value + (b[i] - value) * fraction).toFixed(2)).join(" ")})`;
  return { top: mix(left.top, right.top), bottom: mix(left.bottom, right.bottom) };
}
