import { describe, expect, it } from 'vitest';
import { BoxGeometry, Group, Mesh, MeshStandardMaterial } from 'three';
import { meshApplications, zoneApplications } from './surfaceMapping';
import { registerOptions } from './registerOptions';
import finishes from '@/data/configurator/antigravity/finishes.json';

describe('model surface contract and PDF register', () => {
  it('uses explicit mappings before ancestor tags without changing shared materials', () => {
    const material = new MeshStandardMaterial();
    const wall = new Mesh(new BoxGeometry(), material); wall.name = 'Facade';
    const window = new Mesh(new BoxGeometry(), material); window.name = 'Glass';
    const parent = new Group(); parent.userData.housePartKey = 'ext_roof'; parent.add(wall);
    expect(meshApplications(wall, { ext_wall: ['Facade'] })).toEqual(['external-wall']);
    expect(meshApplications(wall)).toEqual(['external-roof']);
    expect(meshApplications(window)).toEqual([]);
    expect(material.userData).toEqual({});
  });
  it('supports the naming convention and preserves reviewed independent skins', () => {
    const mesh = new Mesh(new BoxGeometry(), new MeshStandardMaterial());
    mesh.name = 'int_wall__bedroom';
    expect(meshApplications(mesh)).toEqual(['internal-wall']);
    mesh.name = 'Roof'; mesh.material.userData.oknoSurfaces = ['external-roof', 'internal-ceiling'];
    expect(meshApplications(mesh)).toEqual(['external-roof', 'internal-ceiling']);
  });
  it('matches every row of the supplied PDF application matrix, page 9', () => {
    // Independently transcribed from the original PDF; columns R/W/F/C/I.
    const matrix = ['11010','11010','11010','10000','10000','10000','10000','10000','11011','01011','10011','01011','01011','01000','01011','01011','00011','00100','00100','00110','00110','00111','00111','00111','00101','00010'];
    expect(registerOptions).toHaveLength(26);
    for (const [index, row] of matrix.entries()) {
      const expected = Object.values(zoneApplications).filter((_, column) => row[column] === '1');
      const option = registerOptions.find(item => item.registerNumber === String(index + 1).padStart(2, '0'))!;
      expect(option.approvedApplications).toEqual(expected);
      expect(finishes[index].name).toBe(option.name);
      expect(finishes[index].apps.map(zone => zoneApplications[zone])).toEqual(expected);
    }
  });
});
