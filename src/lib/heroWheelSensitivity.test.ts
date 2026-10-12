import { describe, expect, it } from 'vitest';
import { heroWheelDelta } from './heroWheelSensitivity';

describe('Hero wheel sensitivity', () => {
  it('reduces dense trackpad gestures proportionally in either direction', () => {
    const deltas = [12, 80, 600, 2400, -12, -600];
    const scaled = deltas.map(delta => heroWheelDelta(delta, 'wheel', -500, 2812, 720));
    expect(scaled).toEqual(deltas.map(delta => delta * .45));
    expect(scaled[3]).toBe(1080);
  });

  it('keeps normal scrolling below the film and before its start', () => {
    expect(heroWheelDelta(600, 'wheel', -2592, 720, 720)).toBe(600);
    expect(heroWheelDelta(-600, 'wheel', -3500, -188, 720)).toBe(-600);
    expect(heroWheelDelta(600, 'wheel', 100, 3412, 720)).toBe(600);
  });

  it('does not change touchscreen input', () => {
    expect(heroWheelDelta(600, 'touchmove', 0, 3312, 720)).toBe(600);
  });
});
