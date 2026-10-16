import { Box3, MathUtils, Vector3 } from "three";

/** glTF house derivatives use metres. Camera fitting never rescales geometry. */
export function housePlacement(bounds: Box3, metersPerUnit = 1) {
  if (!Number.isFinite(metersPerUnit) || metersPerUnit <= 0 || bounds.isEmpty()) throw new Error("Invalid house scale or bounds.");
  const size = bounds.getSize(new Vector3()).multiplyScalar(metersPerUnit);
  const center = bounds.getCenter(new Vector3()).multiplyScalar(metersPerUnit);
  return { scale: metersPerUnit, position: new Vector3(-center.x, -bounds.min.y * metersPerUnit + .005, -center.z), size };
}

export function houseViews(size: Vector3, fov: number, aspect: number) {
  const horizontal = 2 * Math.atan(Math.tan(MathUtils.degToRad(fov / 2)) * aspect);
  // Leave space for the existing finish panel and model copy; portrait uses its lower drawer.
  const fit = Math.max(size.length() / (2 * Math.tan(Math.min(MathUtils.degToRad(fov), horizontal) / 2)), 7) * (aspect > 1.2 ? 1.25 : 1.12);
  const target = new Vector3(0, size.y * .44, 0);
  const at = (x: number, y: number, z: number) => [target.clone().add(new Vector3(x, y, z).normalize().multiplyScalar(fit)), target.clone()] as [Vector3, Vector3];
  return {
    hero: at(1, .5, 1), front: at(0, .12, 1), side: at(1, .16, 0), rear: at(-.75, .32, -1), plan: at(0, 1, .001),
    inside: [new Vector3(size.x * .12, Math.min(size.y * .5, 2.25), size.z * .35), new Vector3(0, Math.min(size.y * .45, 1.9), -size.z * .2)] as [Vector3, Vector3],
  };
}

/** Allow room-scale, level and upward views without exterior orbit clamps. */
export function houseOrbitLimits(interior: boolean) {
  return { minDistance: interior ? .15 : 2.2, maxPolarAngle: interior ? Math.PI - .01 : Math.PI / 2.03 };
}
