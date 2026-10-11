import * as THREE from 'three';

export const GLOBE_RADIUS = 0.87;

// SphereGeometry maps longitude -180..180 from the left to right of the
// equirectangular earth-relief texture. Keep pin geometry in that same space.
export function geographicPoint([latitude, longitude]: readonly [number, number]) {
  const lat = THREE.MathUtils.degToRad(latitude);
  const lon = THREE.MathUtils.degToRad(longitude);
  const equatorRadius = GLOBE_RADIUS * Math.cos(lat);
  return new THREE.Vector3(
    equatorRadius * Math.cos(lon),
    GLOBE_RADIUS * Math.sin(lat),
    -equatorRadius * Math.sin(lon),
  );
}

export function setGlobeOrientation(sphere: THREE.Object3D, longitude: number, latitude: number) {
  // Apply the east/west turn first, then tilt the selected latitude toward the camera.
  sphere.rotation.set(
    THREE.MathUtils.degToRad(-latitude),
    THREE.MathUtils.degToRad(longitude - 90),
    0,
    'XYZ',
  );
}
