import type { Mesh, Material, Object3D } from 'three';
import type { MaterialApplicationId } from '@/data/configurator';

export const zoneApplications: Record<string, MaterialApplicationId> = {
  ext_roof: 'external-roof', ext_wall: 'external-wall', flooring: 'flooring',
  int_ceiling: 'internal-ceiling', int_wall: 'internal-wall',
};

/** Explicit admin mappings win. Never guess surfaces from colour or mesh position. */
export function meshApplications(mesh: Mesh, mapping: Record<string, string[]> = {}): MaterialApplicationId[] {
  const names = [mesh.name, mesh.userData.name].filter(Boolean);
  const explicit = Object.entries(mapping).filter(([, values]) => names.some(name => values.includes(name)));
  if (explicit.length) return explicit.map(([zone]) => zoneApplications[zone]).filter(Boolean);
  let node: Object3D | null = mesh;
  while (node) {
    const tag = node.userData.housePartKey;
    if (typeof tag === 'string' && zoneApplications[tag]) return [zoneApplications[tag]];
    const prefix = node.name.split('__')[0];
    if (node.name.includes('__') && zoneApplications[prefix]) return [zoneApplications[prefix]];
    node = node.parent;
  }
  const materials: Material[] = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  return [...new Set(materials.flatMap(material => {
    const tag = material.userData.housePartKey;
    if (typeof tag === 'string' && zoneApplications[tag]) return [zoneApplications[tag]];
    const apps = material.userData.oknoSurfaces;
    return Array.isArray(apps) ? apps.filter(app => Object.values(zoneApplications).includes(app)) : [];
  }))];
}
