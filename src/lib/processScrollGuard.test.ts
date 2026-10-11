import { describe, expect, it } from 'vitest';
import { limitProcessScroll, wheelPixels } from './processScrollGuard';

describe('Process frame-aware scroll bounds', () => {
  it('catches a large forward gesture before it can leave an unfinished film', () => {
    expect(limitProcessScroll(0, 9000, 0, 3000, 0)).toBeCloseTo(632.1);
    expect(limitProcessScroll(1600, 9000, 0, 3000, .5)).toBeCloseTo(1802.1);
  });
  it('catches reverse entry and keeps the expanded film until frames return', () => {
    expect(limitProcessScroll(4000, 0, 0, 3000, 1)).toBeCloseTo(2667.9);
    expect(limitProcessScroll(1700, 0, 0, 3000, .5)).toBeCloseTo(1497.9);
  });
  it('releases each end only when that end has actually been presented', () => {
    expect(limitProcessScroll(2700, 9000, 0, 3000, .999)).toBe(9000);
    expect(limitProcessScroll(800, 0, 0, 3000, 0)).toBe(0);
  });
  it('keeps normal small gestures native and does not affect other sections', () => {
    expect(limitProcessScroll(1500, 1520, 0, 3000, .45)).toBe(1520);
    expect(limitProcessScroll(4000, 4500, 0, 3000, .5)).toBe(4500);
    expect(limitProcessScroll(0, -500, 100, 3000, .5)).toBe(-500);
    expect(limitProcessScroll(0, 500, 0, -10, .5)).toBe(500);
  });
  it('limits detailed timeline gestures to the next phase, in either direction', () => {
    expect(limitProcessScroll(100, 9000, 100, 4000, 0, 'timeline')).toBe(740);
    expect(limitProcessScroll(4100, 0, 100, 4000, 1, 'timeline')).toBe(3460);
  });
  it('enters a complete first/last detail phase without skipping it', () => {
    expect(limitProcessScroll(0, 9000, 100, 4000, 0, 'timeline')).toBe(100);
    expect(limitProcessScroll(5000, 0, 100, 4000, 1, 'timeline')).toBe(4100);
  });
  it('keeps small crossings of the sticky/footer boundary native in both directions', () => {
    const start = 3821.28125, span = 2880, end = start + span;
    for (const delta of [8, 40, 120, 180]) {
      expect(limitProcessScroll(end + 5, end + 5 - delta, start, span, 1, 'timeline')).toBe(end + 5 - delta);
      expect(limitProcessScroll(end - 5, end - 5 + delta, start, span, 1, 'timeline')).toBe(end - 5 + delta);
      expect(limitProcessScroll(start - 5, start - 5 + delta, start, span, 0, 'timeline')).toBe(start - 5 + delta);
    }
    // Large gestures still land on the end before entering an earlier phase.
    expect(limitProcessScroll(end + 5, end - 2000, start, span, 1, 'timeline')).toBe(end);
  });
  it('normalizes pixel, line and page wheel devices', () => {
    expect(wheelPixels(50, 0, 720)).toBe(50);
    expect(wheelPixels(3, 1, 720)).toBe(48);
    expect(wheelPixels(2, 2, 720)).toBe(1440);
  });
  it('advances inward from fractional CSS boundaries rounded by the browser', () => {
    const start = 3821.28125, span = 2880;
    expect(limitProcessScroll(6701.33349609375, 3101, start, span, 1, 'timeline')).toBeCloseTo(start + span * .84);
    expect(limitProcessScroll(start - .05, 9000, start, span, 0, 'timeline')).toBeCloseTo(start + span * .16);
    expect(limitProcessScroll(start + span + .05, 9000, start, span, .98, 'timeline')).toBe(start + span + .05);
  });
});
