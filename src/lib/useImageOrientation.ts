"use client";

import { useCallback, useState, type CSSProperties, type SyntheticEvent } from "react";
import projectMedia from "@/data/realProjectMedia.json";

type Dimensions = { width?: number; height?: number };
const knownImages = new Map(projectMedia.flatMap(project => project.gallery.map(image => [image.src, image] as const)));

/** Existing photographs reserve their ratio immediately; uploaded replacements use
 * their decoded dimensions without carrying orientation over from the previous src. */
export function useImageOrientation(src: string, dimensions?: Dimensions) {
  const [loaded, setLoaded] = useState<{ src: string; width: number; height: number }>();
  const recorded = dimensions?.width && dimensions?.height ? dimensions : knownImages.get(src);
  const measured = loaded?.src === src ? loaded : recorded;
  const width = measured?.width ?? 0;
  const height = measured?.height ?? 0;
  const portrait = width > 0 && height > width;
  const aspectRatio = width > 0 && height > 0 ? width / height : undefined;
  const frameStyle = portrait ? { "--photo-aspect": aspectRatio } as CSSProperties : undefined;
  const onLoad = useCallback((event: SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth: width, naturalHeight: height } = event.currentTarget;
    if (width > 0 && height > 0) setLoaded({ src, width, height });
  }, [src]);
  return { portrait, aspectRatio, frameStyle, onLoad };
}
