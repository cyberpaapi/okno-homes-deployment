import { Color, type MeshStandardMaterial } from "three";
import type { StudioFinish } from "@/data/configurator/studio/finishes";

// Rendering approximations of the register palette, not manufacturer scans.
const palette: Record<string, string> = {
  "obsidian-shield": "#232323", "titanium-veil": "#444444", "ivory-armor": "#e5e5e5",
  "castile-crest": "#535358", "barcelona-blaze": "#36373b", "lone-star-shingles": "#5f534a", "heartland-shingles": "#4d5457",
  "ebony-timber": "#262321", "golden-oak": "#8a5b31", "pearlwood": "#b9a78c",
  "desert-sand": "#e6e0d6", "brick-ember": "#9e7a6a", "terracotta-hue": "#d37a47", "urban-stone": "#b9afa3", "mink-gray": "#a7a099", "alpine-white": "#e8e6e7",
  "tuscan-elegance": "#cebaa1", "urban-slate": "#949494", "walnut-weave": "#735840", "oak-frost": "#cfc6bb",
  "sienna-nutwood": "#926e48", "brione-driftwood": "#b19373", "lime-grove": "#d2bea7", "silea-sandstone": "#60554b", "ontario-hemlock": "#cbb7a0",
};
export type FinishRendering = {
  asset?: string; color: string; repeat: number; roughness: number;
  metalness: number; normal: number; relief: "none" | "slats" | "seams";
};
export function finishRendering(finish: StudioFinish): FinishRendering {
  const base: FinishRendering = { color: palette[finish.id] || "#ffffff", repeat: .5, roughness: .82, metalness: 0, normal: .5, relief: "none" };
  if (finish.family === "metal-cladding") return { ...base, repeat: 1, roughness: .58, metalness: .18, relief: "seams" };
  if (finish.family === "thermowood") return { ...base, asset: "Wood095", repeat: .65, roughness: .8, normal: .65, relief: "slats" };
  if (finish.family === "laminated-wood") return { ...base, asset: "WoodFloor051", roughness: .62, normal: .4 };
  if (finish.family === "laminated-wood-herringbone") return { ...base, asset: "WoodFloor034", roughness: .62, normal: .4 };
  if (finish.family === "tiles") return { ...base, asset: "Tiles139", roughness: .64, normal: .5 };
  if (finish.family === "paint" && finish.id !== "brick-ember") return { ...base, asset: "Plaster001", repeat: .85, roughness: .94, normal: .28 };
  if (finish.id === "brick-ember") return { ...base, asset: "Bricks024", repeat: .7, normal: .65 };
  // Keep the register's specific shingle/thatch patterns rather than substitute roof tiles.
  return { ...base, color: "#ffffff", repeat: .65, normal: 0 };
}

/** Analytic cladding seams stay sharp at any zoom. Surface gradients perturb
 * shading normals only; company vertices/silhouettes remain unchanged. */
export function addFinishRelief(material: MeshStandardMaterial, profile: FinishRendering, meanLuminance?: number) {
  const relief = profile.relief === "slats" ? 1 : profile.relief === "seams" ? 2 : 0;
  material.onBeforeCompile = (shader) => {
    shader.uniforms.oknoMean = { value: meanLuminance || 1 };
    shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nvarying vec2 oknoUv;")
      .replace("#include <uv_vertex>", "#include <uv_vertex>\noknoUv = uv;");
    shader.fragmentShader = shader.fragmentShader.replace("#include <common>", `#include <common>
      varying vec2 oknoUv;
      uniform float oknoMean;
      vec2 oknoProfile(vec2 uv) {
        float pitch = ${relief === 1 ? "0.16" : "0.42"};
        float d = (fract(uv.x / pitch) - 0.5) * pitch;
        float width = ${relief === 1 ? "0.006" : "0.012"};
        float footprint = fwidth(uv.x);
        float variance = width * width + footprint * footprint;
        float height = exp(-d*d / variance);
        return vec2(height, -2.0*d / variance * height);
      }
      vec3 oknoReliefNormal(vec3 n, float slope, float direction) {
        vec3 dx = dFdx(-vViewPosition), dy = dFdy(-vViewPosition);
        vec3 r1 = cross(dy,n), r2 = cross(n,dx);
        float det = dot(dx,r1) * direction;
        vec2 dh = slope * vec2(dFdx(oknoUv.x), dFdy(oknoUv.x));
        vec3 gradient = sign(det) * (dh.x*r1 + dh.y*r2);
        return normalize(abs(det)*n - gradient);
      }
    `);
    if (meanLuminance) shader.fragmentShader = shader.fragmentShader.replace("#include <map_fragment>", `
      #ifdef USE_MAP
        vec3 grain = texture2D(map, vMapUv).rgb;
        float variation = clamp(dot(grain, vec3(0.2126, 0.7152, 0.0722)) / oknoMean, 0.3, 1.9);
        diffuseColor.rgb *= variation;
      #endif
    `);
    if (relief) {
      shader.fragmentShader = shader.fragmentShader.replace("#include <color_fragment>", `#include <color_fragment>
        float joint = oknoProfile(oknoUv).x;
        diffuseColor.rgb *= mix(1.0, ${relief === 1 ? "0.32" : "0.75"}, joint);
      `).replace("#include <normal_fragment_maps>", `#include <normal_fragment_maps>
        normal = oknoReliefNormal(normal, ${relief === 1 ? "-0.006" : "0.006"} * oknoProfile(oknoUv).y, faceDirection);
      `);
    }
  };
  material.customProgramCacheKey = () => `okno-pbr-v1-${relief}-${Boolean(meanLuminance)}`;
  material.color = new Color(profile.color);
}
