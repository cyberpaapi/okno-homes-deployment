import { describe, it, expect } from "vitest";
import { Box3, BufferGeometry, Float32BufferAttribute, Mesh, Vector3 } from "three";
import fs from "node:fs";
import path from "node:path";
import manifest from "@/data/configurator/signatureAssetManifest.json";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { PerspectiveCamera } from "three";
import { houseBounds, housePlacement, houseViews, houseOrbitLimits } from "./modelFraming";

describe("physical house framing", () => {
  it("retains different physical sizes while grounding and centering offset masters", () => {
    const small = housePlacement(new Box3(new Vector3(20, -.6, -40), new Vector3(25, 4, -32)));
    const large = housePlacement(new Box3(new Vector3(4, -.6, -43), new Vector3(20, 4, -31)));
    expect(small.scale).toBe(1); expect(large.scale).toBe(1);
    expect(large.size.x / small.size.x).toBe(3.2);
    expect(small.position.y).toBeCloseTo(.6);
    expect(small.position.x).toBe(-22.5);
  });
  it("grounds actual rotated vertices instead of the empty corners of their local bounds", () => {
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute([0, 0, 0, 2, 2, 0, 0, 2, 1], 3));
    const model = new Mesh(geometry);
    model.rotation.z = -Math.PI / 4;
    model.position.y = 3;
    const bounds = houseBounds(model);
    expect(new Box3().setFromObject(model).min.y).toBeLessThan(bounds.min.y - 1);
    for (const scale of [1, .01]) {
      const placement = housePlacement(bounds, scale);
      expect(bounds.min.y * scale + placement.position.y).toBeCloseTo(0);
      expect(placement.size.y).toBeCloseTo(Math.SQRT2 * scale);
    }
    geometry.dispose();
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
