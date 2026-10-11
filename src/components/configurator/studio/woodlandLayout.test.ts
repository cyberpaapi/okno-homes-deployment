import { describe, expect, it } from "vitest";
import { terrainHeight, woodlandLayout } from "./woodlandLayout";

describe("shared woodland site", () => {
  it("keeps the same landscape between house loads", () => {
    expect(woodlandLayout()).toEqual(woodlandLayout());
  });
  it("reserves a level, unobstructed clearing for the supplied houses", () => {
    const site=woodlandLayout();
    for(let x=-6;x<=6;x+=2)for(let z=-6;z<=6;z+=2)expect(terrainHeight(x,z)).toBe(0);
    for(const p of [...site.trees,...site.rocks,...site.ferns,...site.grass])expect(Math.hypot(p.x,p.z)).toBeGreaterThan(8.5);
  });
  it("bounds scene complexity and keeps plants off the walking path", () => {
    const site=woodlandLayout();
    expect(site.trees).toHaveLength(28);
    expect(site.grass.length).toBeLessThanOrEqual(260);
    expect(site.trees.filter(p=>Math.hypot(p.x,p.z)<23).length).toBeLessThanOrEqual(10);
    for(const p of [...site.ferns,...site.grass])if(p.z>0)expect(Math.abs(p.x-(9+Math.sin(p.z*.12)*2))).toBeGreaterThanOrEqual(1.8);
  });
});
