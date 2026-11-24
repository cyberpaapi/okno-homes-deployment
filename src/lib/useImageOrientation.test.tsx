import { act, renderHook } from "@testing-library/react";
import type { SyntheticEvent } from "react";
import { describe, expect, it } from "vitest";
import { useImageOrientation } from "./useImageOrientation";

describe("photograph orientation", () => {
  it("reserves the recorded portrait ratio before the photograph loads", () => {
    const { result } = renderHook(() => useImageOrientation("/assets/projects/real-v1/trib-birdseye-02.webp"));
    expect(result.current.portrait).toBe(true);
    expect(result.current.aspectRatio).toBe(2400 / 3200);
  });

  it("uses decoded CMS dimensions and clears the previous photograph's orientation on replacement", () => {
    const { result, rerender } = renderHook(({ src }) => useImageOrientation(src), { initialProps: { src: "/api/site-media/portrait.webp" } });
    const image = document.createElement("img");
    Object.defineProperties(image, { naturalWidth: { value: 600 }, naturalHeight: { value: 900 } });
    act(() => result.current.onLoad({ currentTarget: image } as SyntheticEvent<HTMLImageElement>));
    expect(result.current.portrait).toBe(true);
    expect(result.current.aspectRatio).toBe(2 / 3);
    rerender({ src: "/api/site-media/new-photo.webp" });
    expect(result.current.portrait).toBe(false);
    expect(result.current.aspectRatio).toBeUndefined();
    rerender({ src: "/assets/projects/real-v1/forrest-01.webp" });
    expect(result.current.portrait).toBe(false);
    expect(result.current.aspectRatio).toBeGreaterThan(1);
  });
});
