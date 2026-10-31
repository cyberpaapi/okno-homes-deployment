// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { validateGlb } from './validateGlb';
function glb(extra: Record<string, unknown> = {}) {
  const json = Buffer.from(JSON.stringify({asset:{version:'2.0'},meshes:[{primitives:[]}], ...extra}));
  const padded = Math.ceil(json.length / 4) * 4;
  const result = Buffer.alloc(20 + padded, 32);
  result.writeUInt32LE(0x46546c67,0); result.writeUInt32LE(2,4); result.writeUInt32LE(result.length,8);
  result.writeUInt32LE(padded,12); result.writeUInt32LE(0x4e4f534a,16); json.copy(result,20);
  return result;
}
describe('uploaded GLB validation', () => {
  it('accepts a self-contained glTF 2 model', () => expect(validateGlb(glb())).toEqual({meshes:1}));
  it.each(['https://example.com/texture.png','../texture.png','file:///private.bin'])('rejects external texture references %s', uri => expect(() => validateGlb(glb({images:[{uri}]}))).toThrow(/self-contained/));
  it('rejects disguised and truncated files', () => {
    expect(() => validateGlb(Buffer.from('<script>alert(1)</script>'))).toThrow();
    expect(() => validateGlb(glb().subarray(0,30))).toThrow();
  });
  it('rejects geometry that requires unbundled decoders', () => expect(() => validateGlb(glb({extensionsRequired:['KHR_draco_mesh_compression']}))).toThrow(/unsupported decoder/));
});
