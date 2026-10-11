import { describe, expect, it } from 'vitest';
import { ProcessPlayhead, processFilmProgress, processStageAt } from './processScrub';

describe('smooth Process scroll playhead', () => {
  it('reserves only the opening expansion and final hold outside the film', () => {
    expect(processFilmProgress(0)).toBe(0);
    expect(processFilmProgress(.16)).toBe(0);
    expect(processFilmProgress(.55)).toBeCloseTo(.5);
    expect(processFilmProgress(.94)).toBeCloseTo(1);
    expect(processFilmProgress(2)).toBe(1);
  });
  it('eases into a large jump, caps speed and settles without overshoot', () => {
    const head = new ProcessPlayhead();
    const first = head.step(10, 1 / 60);
    expect(first).toBeGreaterThan(0);
    expect(first).toBeLessThan(.02);
    for (let index = 0; index < 400; index++) {
      const prior = head.time;
      const next = head.step(10, 1 / 60);
      expect(next).toBeGreaterThanOrEqual(prior);
      expect(next - prior).toBeLessThanOrEqual(3.2 / 60);
      expect(next).toBeLessThanOrEqual(10);
    }
    expect(head.time).toBe(10);
  });
  it('brakes a moving film before reversing and settles precisely', () => {
    const head = new ProcessPlayhead();
    for (let index = 0; index < 80; index++) head.step(20, 1 / 60);
    const prior = head.time;
    // Velocity changes gently; a reverse gesture does not teleport the image.
    expect(head.step(1, 1 / 60)).toBeGreaterThan(prior);
    for (let index = 0; index < 240; index++) head.step(1, 1 / 60);
    expect(head.time).toBe(1);
    for (let index = 0; index < 120; index++) head.step(0, 1 / 60);
    expect(head.time).toBe(0);
  });
  it('backtracks faster while retaining the forward speed and smooth frame bounds', () => {
    const forward = new ProcessPlayhead();
    const reverse = new ProcessPlayhead();
    reverse.reset(25.6);
    for (let index = 0; index < 120; index++) {
      const prior = reverse.time;
      forward.step(25.6, 1 / 60);
      reverse.step(0, 1 / 60);
      expect(reverse.time).toBeLessThanOrEqual(prior);
      expect(prior - reverse.time).toBeLessThanOrEqual(4 / 60);
      expect(reverse.time).toBeGreaterThanOrEqual(0);
    }
    expect((25.6 - reverse.time) / forward.time).toBeCloseTo(1.25, 2);
    for (let index = 0; index < 500; index++) reverse.step(0, 1 / 60);
    expect(reverse.time).toBe(0);
  });
  it('does not jump across the film after a delayed frame or hidden tab', () => {
    const head = new ProcessPlayhead();
    expect(head.step(25, 30)).toBeLessThan(.16);
    const prior = head.time;
    expect(head.step(25, 0)).toBe(prior);
  });
  it('retains both Days 11–25 stages from original film cues', () => {
    expect(processStageAt(7.7 / 25.633333)).toBe(1);
    expect(processStageAt(10.5 / 25.633333)).toBe(2);
    expect(processStageAt(0)).toBe(0);
    expect(processStageAt(1)).toBe(5);
  });
  it('prepares an offscreen ending without preserving stale forward velocity', () => {
    const head = new ProcessPlayhead();
    for (let index = 0; index < 60; index++) head.step(10, 1 / 60);
    head.reset(25.6);
    expect(head.time).toBe(25.6);
    expect(head.step(23, 1 / 60)).toBeLessThan(25.6);
    expect(head.time).toBeGreaterThan(25.5);
  });
});
