import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { MATERIAL_FINISHES } from "@/data/configurator";
import { finishRendering } from "./finishRendering";

describe("customer material rendering assets", () => {
  it("ships matching 2K colour, normal and roughness maps for every enhanced finish", () => {
    for (const finish of MATERIAL_FINISHES) {
      const profile = finishRendering(finish);
      if (!profile.asset) continue;
      const root = `public/configurator/pbr/v1/${profile.asset}`;
      const maps = JSON.parse(readFileSync(`${root}/manifest.json`, "utf8")) as {map:string; width:number;height:number}[];
      expect(maps.map(m => m.map)).toEqual(["Color", "NormalGL", "Roughness"]);
      for (const map of maps) {
        expect(Math.max(map.width, map.height)).toBe(2048);
        expect(existsSync(`${root}/${map.map}.webp`)).toBe(true);
      }
    }
  });
  it("preserves specialist roof and custom samples and uses procedural relief for metal and timber", () => {
    for (const finish of MATERIAL_FINISHES) {
      const profile = finishRendering(finish);
      if (finish.family === "shingles" || finish.family === "thatched-roof") expect(profile.asset).toBeUndefined();
      if (finish.family === "metal-cladding") expect(profile.relief).toBe("seams");
      if (finish.family === "thermowood") expect(profile.relief).toBe("slats");
    }
    expect(finishRendering({id:"custom-test",name:"Company finish",family:"custom",registerNumber:"",approvedApplications:[]})).toMatchObject({color:"#ffffff",relief:"none"});
  });
});
