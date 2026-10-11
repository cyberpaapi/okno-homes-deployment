import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { boundedVideoSize } from "./mediaPreparation";

describe("video derivative sizing", () => {
  it("preserves a source below the output cap without stretching it", () => {
    expect(boundedVideoSize(960, 540, 1920, 1080)).toEqual({ width: 960, height: 540 });
  });

  it("scales wide and portrait sources to even dimensions inside their bounds", () => {
    expect(boundedVideoSize(3840, 2160, 1920, 1080)).toEqual({ width: 1920, height: 1080 });
    expect(boundedVideoSize(1080, 1920, 1920, 1080)).toEqual({ width: 606, height: 1080 });
    expect(boundedVideoSize(1920, 1080, 1152, 648)).toEqual({ width: 1152, height: 648 });
  });

  it("keeps outputs even for odd source dimensions", () => {
    expect(boundedVideoSize(853, 479, 1920, 1080)).toEqual({ width: 852, height: 478 });
  });
});
