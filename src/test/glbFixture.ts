/** A complete indexed-free triangle GLB, including the scene graph and actual vertex bytes. */
export function triangleGlb(extra: Record<string, unknown> = {}, positions = [0, 0, 0, 1, 0, 0, 0, 1, 0]) {
  const payload = Buffer.alloc(positions.length * 4);
  positions.forEach((value, index) => payload.writeFloatLE(value, index * 4));
  const manifest = { asset: { version: '2.0' }, scene: 0, scenes: [{ nodes: [0] }], nodes: [{ mesh: 0 }],
    meshes: [{ primitives: [{ attributes: { POSITION: 0 } }] }],
    buffers: [{ byteLength: payload.length }], bufferViews: [{ buffer: 0, byteLength: payload.length }],
    accessors: [{ bufferView: 0, componentType: 5126, count: positions.length / 3, type: 'VEC3', min: [0, 0, 0], max: [1, 1, 0] }], ...extra };
  const json = Buffer.from(JSON.stringify(manifest));
  const padded = Math.ceil(json.length / 4) * 4;
  const binaryLength = Math.ceil(payload.length / 4) * 4;
  const result = Buffer.alloc(28 + padded + binaryLength);
  result.fill(32, 20, 20 + padded);
  result.writeUInt32LE(0x46546c67, 0); result.writeUInt32LE(2, 4); result.writeUInt32LE(result.length, 8);
  result.writeUInt32LE(padded, 12); result.writeUInt32LE(0x4e4f534a, 16); json.copy(result, 20);
  result.writeUInt32LE(binaryLength, 20 + padded); result.writeUInt32LE(0x004e4942, 24 + padded); payload.copy(result, 28 + padded);
  return result;
}
