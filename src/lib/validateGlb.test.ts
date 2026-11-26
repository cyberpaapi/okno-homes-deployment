// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { triangleGlb } from '@/test/glbFixture';
import { validateGlb } from './validateGlb';

describe('uploaded GLB validation', () => {
  it('accepts a self-contained glTF 2 model with reachable vertex bytes', () => expect(validateGlb(triangleGlb())).toEqual({ meshes: 1 }));
  it.each(['https://example.com/texture.png', '../texture.png', 'file:///private.bin'])('rejects external texture references %s', uri => expect(() => validateGlb(triangleGlb({ images: [{ uri }] }))).toThrow(/self-contained/));
  it('rejects disguised and truncated files', () => {
    expect(() => validateGlb(Buffer.from('<script>alert(1)</script>'))).toThrow();
    expect(() => validateGlb(triangleGlb().subarray(0, 30))).toThrow();
  });
  it('rejects geometry that requires unbundled decoders', () => expect(() => validateGlb(triangleGlb({ extensionsRequired: ['KHR_draco_mesh_compression'] }))).toThrow(/unsupported decoder/));
  it.each([
    { meshes: [{ primitives: [] }] },
    { meshes: [{ primitives: [{ attributes: {} }] }] },
    { nodes: [{ name: 'Empty group' }] },
    { scene: 1, scenes: [{ nodes: [0] }, { nodes: [] }] },
    { scenes: [{ nodes: [9] }] },
    { nodes: [{ children: [0] }] },
    { accessors: [{ bufferView: 0, componentType: 5126, count: 4, type: 'VEC3' }] },
    { bufferViews: [{ buffer: 0, byteOffset: 36, byteLength: 36 }] },
    { buffers: [{ byteLength: 80 }] },
  ])('rejects empty, unreachable or out-of-range geometry %j', extra => expect(() => validateGlb(triangleGlb(extra))).toThrow(/drawable geometry/));
  it('requires finite vertex payloads', () => expect(() => validateGlb(triangleGlb({}, [0, 0, 0, Number.NaN, 0, 0, 0, 1, 0]))).toThrow(/drawable geometry/));
  it('follows nested scene nodes and the selected scene', () => {
    expect(validateGlb(triangleGlb({ scene: 1, scenes: [{ nodes: [] }, { nodes: [0] }], nodes: [{ children: [1] }, { mesh: 0 }] }))).toEqual({ meshes: 1 });
  });
  it('validates indexed geometry against its vertex payload', () => {
    const bytes = triangleGlb({
      bufferViews: [{ buffer: 0, byteLength: 36 }, { buffer: 0, byteOffset: 36, byteLength: 6 }],
      accessors: [{ bufferView: 0, componentType: 5126, count: 3, type: 'VEC3' }, { bufferView: 1, componentType: 5123, count: 3, type: 'SCALAR' }],
      meshes: [{ primitives: [{ attributes: { POSITION: 0 }, indices: 1 }] }],
    }, [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0]);
    bytes.writeUInt16LE(0, bytes.length - 12); bytes.writeUInt16LE(1, bytes.length - 10); bytes.writeUInt16LE(2, bytes.length - 8);
    expect(validateGlb(bytes)).toEqual({ meshes: 1 });
    bytes.writeUInt16LE(3, bytes.length - 8);
    expect(() => validateGlb(bytes)).toThrow(/drawable geometry/);
  });
});
