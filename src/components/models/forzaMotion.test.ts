import { describe, expect, it } from "vitest";
import {
  clampProgress,
  getVideoSeekRequest,
  mapProgressToTime,
} from "./forzaMotion";

describe("Forza video motion helpers", () => {
  it("clamps scroll progress before mapping it to media time", () => {
    expect(clampProgress(-0.4)).toBe(0);
    expect(clampProgress(1.4)).toBe(1);
    expect(mapProgressToTime(0.5, 8)).toBeCloseTo(3.9896, 3);
    expect(mapProgressToTime(2, 8)).toBeLessThan(8);
  });

  it("requests native 24 fps frames without applying a separate timer", () => {
    expect(
      getVideoSeekRequest({
        duration: 8,
        frameRate: 24,
        progress: 0.5,
        readyState: 4,
        requestedFrame: -1,
        seeking: false,
      }),
    ).toEqual({ frameIndex: 96, time: 4 });
  });

  it("coalesces targets while the browser is already seeking", () => {
    expect(
      getVideoSeekRequest({
        duration: 8,
        frameRate: 24,
        progress: 0.75,
        readyState: 4,
        requestedFrame: 96,
        seeking: true,
      }),
    ).toBeNull();
  });

  it("does not request the same decoded frame twice", () => {
    expect(
      getVideoSeekRequest({
        duration: 8,
        frameRate: 24,
        progress: 0.5,
        readyState: 4,
        requestedFrame: 96,
        seeking: false,
      }),
    ).toBeNull();
  });
});
