import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { GLOBE_RADIUS, geographicPoint, setGlobeOrientation } from './globeCoordinates';

describe('project pins on the textured globe', () => {
  it('places coordinates on the same surface as SphereGeometry texture UVs', () => {
    const geometry = new THREE.SphereGeometry(GLOBE_RADIUS, 128, 64);
    const positions = geometry.getAttribute('position');
    const uv = geometry.getAttribute('uv');

    for (const [latitude, longitude] of [[18, 65], [-12, -70], [54, 122]] as const) {
      const targetU = (longitude + 180) / 360;
      const targetV = (latitude + 90) / 180;
      let closest = 0;
      let smallestUvDistance = Infinity;
      for (let index = 0; index < uv.count; index++) {
        const distance = Math.hypot(uv.getX(index) - targetU, uv.getY(index) - targetV);
        if (distance < smallestUvDistance) {
          smallestUvDistance = distance;
          closest = index;
        }
      }
      const surfacePoint = new THREE.Vector3().fromBufferAttribute(positions, closest);
      expect(geographicPoint([latitude, longitude]).distanceTo(surfacePoint)).toBeLessThan(0.03);
    }
    geometry.dispose();
  });

  it('keeps a focused coordinate at the center and moves it with the sphere', () => {
    const earth = new THREE.Object3D();
    const point = geographicPoint([18, 65]);
    setGlobeOrientation(earth, -65, -18);
    const centered = point.clone().applyQuaternion(earth.quaternion);
    expect(centered.x).toBeCloseTo(0, 6);
    expect(centered.y).toBeCloseTo(0, 6);
    expect(centered.z).toBeCloseTo(GLOBE_RADIUS, 6);

    setGlobeOrientation(earth, -65 + 180, -18);
    expect(point.clone().applyQuaternion(earth.quaternion).z).toBeLessThan(0);
  });
});
