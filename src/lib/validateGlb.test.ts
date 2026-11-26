// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { triangleGlb } from '@/test/glbFixture';
import { validateGlb } from './validateGlb';

const validatorSource = ts.transpileModule(readFileSync(new URL('./validateGlb.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

// If the resource guard regresses, terminate only a disposable process, not the test worker.
function isolatedValidation(bytes: Buffer) {
  return execFileSync(process.execPath, ['-e', `${validatorSource}
    try { exports.validateGlb(require('node:fs').readFileSync(0)); process.stdout.write('accepted'); }
    catch (error) { process.stdout.write(error.message); }
  `], { input: bytes, timeout: 2000, encoding: 'utf8' });
}

const sparsePosition = (count: number, componentType = 5126) => ({
  componentType, count, type: 'VEC3',
  sparse: { count: 1, indices: { bufferView: 0, componentType: 5121 }, values: { bufferView: 0 } },
});

function fullySparseGlb(count: number, indexAccessor = false, repeats = 1, representation: 'primitives' | 'nodes' = 'primitives') {
  const payloadLength = Math.ceil(count * 7 / 4) * 4;
  const payload = Buffer.alloc(payloadLength);
  for (let i = 0; i < count; i++) payload.writeUInt32LE(i, i * 4);
  const position = { componentType: 5121, count, type: 'VEC3',
    sparse: { count, indices: { bufferView: 0, componentType: 5125 }, values: { bufferView: 1 } } };
  const header = triangleGlb({
    buffers: [{ byteLength: payloadLength }],
    bufferViews: [{ buffer: 0, byteLength: count * 4 }, { buffer: 0, byteOffset: count * 4, byteLength: count * 3 }],
    accessors: indexAccessor
      ? [{ bufferView: 1, componentType: 5121, count: 3, type: 'VEC3' }, { ...position, type: 'SCALAR' }]
      : [position],
    meshes: [{ primitives: Array.from({ length: representation === 'primitives' ? repeats : 1 }, () => ({ attributes: { POSITION: 0 }, ...(indexAccessor ? { indices: 1 } : {}) })) }],
    ...(representation === 'nodes' ? { nodes: Array.from({ length: repeats }, () => ({ mesh: 0 })), scenes: [{ nodes: Array.from({ length: repeats }, (_, index) => index) }] } : {}),
  }, []);
  const bytes = Buffer.concat([header, payload]);
  bytes.writeUInt32LE(bytes.length, 8);
  bytes.writeUInt32LE(payloadLength, header.length - 8);
  return bytes;
}

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
  it.each([5126, 5121])('rejects enormous implicit sparse POSITION arrays (%i) before scanning them', componentType => {
    const bytes = triangleGlb({ accessors: [sparsePosition(1_000_000_000_000, componentType)] });
    expect(bytes.length).toBeLessThan(600);
    expect(isolatedValidation(bytes)).toMatch(/too complex/);
  });
  it('applies the same work limit to sparse index arrays', () => {
    const bytes = triangleGlb({
      accessors: [
        { bufferView: 0, componentType: 5126, count: 3, type: 'VEC3' },
        { ...sparsePosition(Number.MAX_SAFE_INTEGER, 5121), type: 'SCALAR' },
      ],
      meshes: [{ primitives: [{ attributes: { POSITION: 0 }, indices: 1 }] }],
    });
    expect(isolatedValidation(bytes)).toMatch(/too complex/);
  });
  it('also limits dense quantized geometry with a complete backing buffer', () => {
    const count = 8_000_001, length = Math.ceil(count * 3 / 4) * 4;
    const header = triangleGlb({
      buffers: [{ byteLength: length }], bufferViews: [{ buffer: 0, byteLength: length }],
      accessors: [{ bufferView: 0, componentType: 5121, count, type: 'VEC3' }],
    }, []);
    const bytes = Buffer.concat([header, Buffer.alloc(length)]);
    bytes.writeUInt32LE(bytes.length, 8);
    bytes.writeUInt32LE(length, header.length - 8);
    expect(() => validateGlb(bytes)).toThrow(/too complex/);
  });
  it('reserves sparse patch work before constructing its replacement map', () => {
    const position = sparsePosition(6_000_000);
    position.sparse.count = 6_000_000;
    const bytes = triangleGlb({ accessors: [position] });
    expect(() => validateGlb(bytes)).toThrow(/too complex/);
  });
  it.each([100_001, 1_000_000, 3_000_000])('rejects fully backed sparse allocation of %i entries', count => {
    expect(isolatedValidation(fullySparseGlb(count))).toMatch(/Reduce sparse vertex or index replacements/);
  });
  it('bounds sparse index replacement allocations as well as positions', () => {
    expect(isolatedValidation(fullySparseGlb(1_000_000, true))).toMatch(/Reduce sparse vertex or index replacements/);
  });
  it.each(['primitives', 'nodes'] as const)('bounds aggregate sparse allocation across repeated %s', representation => {
    expect(isolatedValidation(fullySparseGlb(60_000, false, 2, representation))).toMatch(/Reduce sparse vertex or index replacements/);
  });
  it('retains ordinary sparse geometry up to the allocation boundary', () => {
    expect(isolatedValidation(fullySparseGlb(100_000))).toBe('accepted');
  });
  it('resets the sparse allocation budget for each upload', () => {
    const bytes = fullySparseGlb(60_000);
    expect(validateGlb(bytes)).toEqual({ meshes: 1 });
    expect(validateGlb(bytes)).toEqual({ meshes: 1 });
  });
  it.each(['primitives', 'nodes'])('bounds aggregate work across repeated %s', representation => {
    const primitive = { attributes: { POSITION: 0 } };
    const bytes = triangleGlb({
      accessors: [sparsePosition(1_000_000)],
      ...(representation === 'primitives'
        ? { meshes: [{ primitives: Array.from({ length: 9 }, () => primitive) }] }
        : { nodes: Array.from({ length: 9 }, () => ({ mesh: 0 })), scenes: [{ nodes: Array.from({ length: 9 }, (_, index) => index) }] }),
    });
    expect(() => validateGlb(bytes)).toThrow(/too complex/);
  });
  it.each([false, true])('retains bounded sparse geometry with dense base: %s', denseBase => {
    const position = { ...sparsePosition(3), ...(denseBase ? { bufferView: 0 } : {}) };
    expect(validateGlb(triangleGlb({ accessors: [position] }))).toEqual({ meshes: 1 });
  });
  it('keeps validation budgets independent between uploads', () => {
    const bytes = triangleGlb({ accessors: [sparsePosition(1000)] });
    expect(validateGlb(bytes)).toEqual({ meshes: 1 });
    expect(validateGlb(bytes)).toEqual({ meshes: 1 });
  });
});
