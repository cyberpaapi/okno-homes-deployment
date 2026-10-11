import { describe, expect, it } from "vitest";
import { BoxGeometry, Group, Mesh, MeshBasicMaterial, Vector3 } from "three";
import { structureBounds } from "./frameBounds";
describe("original model framing", () => {
  it("frames the structure while preserving a distant source object", () => {
    const root = new Group(),
      house = new Mesh(new BoxGeometry(7, 4, 9), new MeshBasicMaterial()),
      outlier = new Mesh(
        new BoxGeometry(0.01, 0.1, 0.01),
        new MeshBasicMaterial(),
      );
    outlier.position.x = 100;
    root.add(house, outlier);
    const bounds = structureBounds(root);
    expect(bounds.getSize(new Vector3()).x).toBe(7);
    expect(root.children).toHaveLength(2);
    expect(outlier.visible).toBe(true);
  });
});
