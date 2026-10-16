import { describe, it, expect } from "vitest";
import { Box3, Vector3 } from "three";
import fs from "node:fs";
import path from "node:path";
import manifest from "@/data/configurator/signatureAssetManifest.json";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { PerspectiveCamera } from "three";
import { housePlacement, houseViews, houseOrbitLimits } from "./modelFraming";

describe("physical house framing", () => {
  it("retains different physical sizes while grounding and centering offset masters", () => {
    const small = housePlacement(new Box3(new Vector3(20, -.6, -40), new Vector3(25, 4, -32)));
    const large = housePlacement(new Box3(new Vector3(4, -.6, -43), new Vector3(20, 4, -31)));
    expect(small.scale).toBe(1); expect(large.scale).toBe(1);
    expect(large.size.x / small.size.x).toBe(3.2);
    expect(small.position.y).toBeCloseTo(.605);
    expect(small.position.x).toBe(-22.5);
  });
  it("moves the camera further away for a larger house or narrow screen", () => {
    const size = new Vector3(6, 5, 9);
    const distance = (s: Vector3, aspect: number) => { const [p, t] = houseViews(s, 40, aspect).hero; return p.distanceTo(t); };
    expect(distance(size.clone().multiplyScalar(2), 1.6)).toBeGreaterThan(distance(size, 1.6));
    expect(distance(size, .46)).toBeGreaterThan(distance(size, 1.6));
  });
  it("rejects empty bounds and invalid units", () => {
    expect(() => housePlacement(new Box3())).toThrow();
    expect(() => housePlacement(new Box3(new Vector3(), new Vector3(1, 1, 1)), 0)).toThrow();
  });
});

describe("supplied interior camera reachability", () => {
  for (const [slug, asset] of Object.entries(manifest)) {
    it(`${slug} settles at its real interior point without orbit clamping`, () => {
      const binary = fs.readFileSync(path.join(process.cwd(), "public", asset.url));
      const gltf = JSON.parse(binary.subarray(20, 20 + binary.readUInt32LE(12)).toString());
      const view = gltf.scenes[gltf.scene ?? 0].extras.oknoInteriorView;
      const camera = new PerspectiveCamera(70, 1, .08, 250);
      const eye = new Vector3().fromArray(view.position);
      camera.position.copy(eye);
      const controls = new OrbitControls(camera, document.createElement("canvas"));
      Object.assign(controls, houseOrbitLimits(true));
      controls.target.fromArray(view.target);
      controls.update();
      // A clamped flight can never reach its goal and renders forever when idle.
      expect(camera.position.distanceTo(eye)).toBeLessThan(.001);
      controls.dispose();
    });
  }
});
