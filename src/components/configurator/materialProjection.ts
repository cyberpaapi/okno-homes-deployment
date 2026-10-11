import {
  BufferAttribute,
  BufferGeometry,
  Matrix4,
  Vector3,
} from "three";

/**
 * Generates temporary UVs in one shared model coordinate space for the
 * UV-less fullcode preview GLB. The source geometry is never mutated.
 */
export function projectGeometryInModelSpace(
  source: BufferGeometry,
  matrix: Matrix4,
  metersPerTile = 1,
) {
  const safeScale = Math.max(0.05, metersPerTile);
  const geometry = source.index ? source.toNonIndexed() : source.clone();
  const position = geometry.getAttribute("position");

  if (!position || position.count < 3) return geometry;

  const uv = new Float32Array(position.count * 2);
  const a = new Vector3();
  const b = new Vector3();
  const c = new Vector3();
  const edgeAB = new Vector3();
  const edgeAC = new Vector3();
  const normal = new Vector3();

  const write = (index: number, point: Vector3, axis: "x" | "y" | "z") => {
    if (axis === "x") {
      uv[index * 2] = point.z / safeScale;
      uv[index * 2 + 1] = point.y / safeScale;
    } else if (axis === "y") {
      uv[index * 2] = point.z / safeScale;
      uv[index * 2 + 1] = point.x / safeScale;
    } else {
      uv[index * 2] = point.x / safeScale;
      uv[index * 2 + 1] = point.y / safeScale;
    }
  };

  for (let index = 0; index + 2 < position.count; index += 3) {
    a.fromBufferAttribute(position, index).applyMatrix4(matrix);
    b.fromBufferAttribute(position, index + 1).applyMatrix4(matrix);
    c.fromBufferAttribute(position, index + 2).applyMatrix4(matrix);
    edgeAB.subVectors(b, a);
    edgeAC.subVectors(c, a);
    normal.crossVectors(edgeAB, edgeAC);

    const normalX = Math.abs(normal.x);
    const normalY = Math.abs(normal.y);
    const normalZ = Math.abs(normal.z);
    const axis =
      normalX >= normalY && normalX >= normalZ
        ? "x"
        : normalY >= normalZ
          ? "y"
          : "z";

    write(index, a, axis);
    write(index + 1, b, axis);
    write(index + 2, c, axis);
  }

  geometry.setAttribute("uv", new BufferAttribute(uv, 2));
  geometry.userData.oknoProjection = {
    space: "model",
    metersPerTile: safeScale,
    method: "face-dominant-v2",
  };

  return geometry;
}
