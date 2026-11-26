type BufferView = { buffer: number; byteOffset?: number; byteLength: number; byteStride?: number };
type Accessor = { bufferView?: number; byteOffset?: number; componentType: number; count: number; type: string; sparse?: { count: number; indices: { bufferView: number; byteOffset?: number; componentType: number }; values: { bufferView: number; byteOffset?: number } } };
type Manifest = {
  asset?: { version?: string }; buffers?: { byteLength: number; uri?: string }[]; images?: { uri?: string }[];
  bufferViews?: BufferView[]; accessors?: Accessor[]; extensionsRequired?: string[];
  meshes?: { primitives?: { attributes?: { POSITION?: number }; indices?: number; mode?: number }[] }[];
  nodes?: { mesh?: number; children?: number[] }[]; scenes?: { nodes?: number[] }[]; scene?: number;
};
const whole = (value: number, minimum = 0) => Number.isSafeInteger(value) && value >= minimum;
const geometryError = () => new Error('The GLB must contain drawable geometry in its opening scene, with valid POSITION vertices and buffers.');

/** Accept self-contained glTF 2 GLBs with geometry reachable from the scene the viewer opens. */
export function validateGlb(bytes: Uint8Array) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (bytes.length < 24 || view.getUint32(0, true) !== 0x46546c67 || view.getUint32(4, true) !== 2 || view.getUint32(8, true) !== bytes.length) throw new Error('Choose a valid glTF 2 binary (.glb) model.');
  const jsonLength = view.getUint32(12, true);
  if (view.getUint32(16, true) !== 0x4e4f534a || jsonLength % 4 || jsonLength > 8 * 1024 * 1024 || jsonLength + 20 > bytes.length) throw new Error('Invalid GLB model manifest.');
  const data = JSON.parse(new TextDecoder().decode(bytes.subarray(20, 20 + jsonLength))) as Manifest;
  if (data.asset?.version !== '2.0' || !Array.isArray(data.meshes) || !data.meshes.length) throw new Error('The GLB must contain a glTF 2 house mesh.');
  for (const resource of [...(data.buffers || []), ...(data.images || [])]) {
    if (resource.uri && (typeof resource.uri !== 'string' || !/^data:(?:image\/(?:png|jpeg|webp)|application\/octet-stream);base64,/.test(resource.uri))) throw new Error('Export a self-contained GLB with all textures and buffers embedded.');
  }
  const supported = new Set(['KHR_materials_unlit', 'KHR_materials_clearcoat', 'KHR_materials_transmission', 'KHR_materials_ior', 'KHR_materials_specular', 'KHR_materials_volume', 'KHR_materials_emissive_strength', 'KHR_materials_sheen', 'KHR_materials_iridescence', 'KHR_materials_anisotropy', 'KHR_materials_dispersion', 'KHR_texture_transform', 'KHR_mesh_quantization', 'KHR_lights_punctual', 'EXT_texture_webp', 'EXT_texture_avif', 'EXT_mesh_gpu_instancing']);
  if ((data.extensionsRequired || []).some(name => !supported.has(name))) throw new Error('Export an uncompressed GLB with embedded JPEG, PNG or WebP textures; this file needs an unsupported decoder.');
  let binary: Uint8Array | undefined;
  let offset = 20 + jsonLength;
  while (offset < bytes.length) {
    if (offset + 8 > bytes.length) throw new Error('Truncated GLB model.');
    const length = view.getUint32(offset, true), type = view.getUint32(offset + 4, true);
    if (length % 4 || offset + 8 + length > bytes.length) throw new Error('Invalid GLB chunk length.');
    if (type === 0x004e4942) {
      if (binary) throw new Error('Invalid duplicate GLB binary chunk.');
      binary = bytes.subarray(offset + 8, offset + 8 + length);
    }
    offset += 8 + length;
  }
  const buffers = (data.buffers || []).map((buffer, index) => {
    const payload = buffer.uri ? Uint8Array.from(atob(buffer.uri.split(',')[1]), character => character.charCodeAt(0)) : index === 0 ? binary : undefined;
    if (!payload || !whole(buffer.byteLength, 1) || buffer.byteLength > payload.length) throw geometryError();
    return payload.subarray(0, buffer.byteLength);
  });
  function values(bufferView: number, byteOffset: number, count: number, width: number, componentType: number, packed = false) {
    const entry = whole(bufferView) ? data.bufferViews?.[bufferView] : undefined;
    const buffer = entry && whole(entry.buffer) ? buffers[entry.buffer] : undefined;
    const size = ({ 5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4 } as Record<number, number>)[componentType];
    if (!entry || !buffer || !size || !whole(byteOffset) || !whole(entry.byteOffset ?? 0) || !whole(entry.byteLength, 1)) throw geometryError();
    const stride = packed ? width * size : entry.byteStride ?? width * size;
    if (!whole(stride, width * size) || stride % size || byteOffset % size || byteOffset + (count - 1) * stride + width * size > entry.byteLength || (entry.byteOffset ?? 0) + entry.byteLength > buffer.length) throw geometryError();
    const raw = new DataView(buffer.buffer, buffer.byteOffset + (entry.byteOffset ?? 0), entry.byteLength);
    return (index: number, component: number) => {
      const location = byteOffset + index * stride + component * size;
      switch (componentType) {
        case 5120: return raw.getInt8(location);
        case 5121: return raw.getUint8(location);
        case 5122: return raw.getInt16(location, true);
        case 5123: return raw.getUint16(location, true);
        case 5125: return raw.getUint32(location, true);
        default: return raw.getFloat32(location, true);
      }
    };
  }
  function accessor(index: number, type: 'VEC3' | 'SCALAR', allowed: number[]) {
    const item = whole(index) ? data.accessors?.[index] : undefined;
    if (!item || item.type !== type || !allowed.includes(item.componentType) || !whole(item.count, 1) || (item.bufferView === undefined && !item.sparse)) throw geometryError();
    const width = type === 'VEC3' ? 3 : 1;
    const base = item.bufferView === undefined ? () => 0 : values(item.bufferView, item.byteOffset ?? 0, item.count, width, item.componentType);
    const sparse = new Map<number, number[]>();
    if (item.sparse) {
      const patch = item.sparse;
      if (!whole(patch.count, 1) || patch.count > item.count || ![5121, 5123, 5125].includes(patch.indices.componentType)) throw geometryError();
      const indices = values(patch.indices.bufferView, patch.indices.byteOffset ?? 0, patch.count, 1, patch.indices.componentType, true);
      const replacements = values(patch.values.bufferView, patch.values.byteOffset ?? 0, patch.count, width, item.componentType, true);
      let previous = -1;
      for (let i = 0; i < patch.count; i++) {
        const vertex = indices(i, 0);
        if (vertex <= previous || vertex >= item.count) throw geometryError();
        sparse.set(vertex, Array.from({ length: width }, (_, component) => replacements(i, component)));
        previous = vertex;
      }
    }
    return { count: item.count, get: (vertex: number, component: number) => sparse.get(vertex)?.[component] ?? base(vertex, component) };
  }
  const opening = data.scene ?? 0;
  const scene = whole(opening) ? data.scenes?.[opening] : undefined;
  if (!scene || !Array.isArray(scene.nodes) || !scene.nodes.length || !Array.isArray(data.nodes)) throw geometryError();
  const pending: [number, boolean][] = scene.nodes.map(index => [index, false]);
  const active = new Set<number>(), visited = new Set<number>();
  let drawable = false;
  while (pending.length) {
    const [index, leaving] = pending.pop()!;
    if (leaving) { active.delete(index); visited.add(index); continue; }
    if (!whole(index) || !data.nodes[index] || active.has(index)) throw geometryError();
    if (visited.has(index)) continue;
    active.add(index); pending.push([index, true]);
    const node = data.nodes[index];
    if (node.children !== undefined && !Array.isArray(node.children)) throw geometryError();
    for (const child of node.children || []) pending.push([child, false]);
    if (node.mesh === undefined) continue;
    const mesh = whole(node.mesh) ? data.meshes[node.mesh] : undefined;
    if (!mesh || !Array.isArray(mesh.primitives)) throw geometryError();
    for (const primitive of mesh.primitives) {
      if (primitive.attributes?.POSITION === undefined) continue;
      const position = accessor(primitive.attributes.POSITION, 'VEC3', [5120, 5121, 5122, 5123, 5126]);
      for (let vertex = 0; vertex < position.count; vertex++) for (let component = 0; component < 3; component++) if (!Number.isFinite(position.get(vertex, component))) throw geometryError();
      let count = position.count;
      if (primitive.indices !== undefined) {
        const indices = accessor(primitive.indices, 'SCALAR', [5121, 5123, 5125]);
        count = indices.count;
        for (let i = 0; i < count; i++) if (indices.get(i, 0) >= position.count) throw geometryError();
      }
      const mode = primitive.mode ?? 4;
      if (!whole(mode) || mode > 6) throw geometryError();
      if (count >= (mode === 0 ? 1 : mode <= 3 ? 2 : 3)) drawable = true;
    }
  }
  if (!drawable) throw geometryError();
  return { meshes: data.meshes.length };
}
