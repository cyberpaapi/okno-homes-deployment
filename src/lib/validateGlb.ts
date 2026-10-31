/** Accept self-contained glTF 2 GLBs, never files referencing another host or local path. */
export function validateGlb(bytes: Uint8Array) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (bytes.length < 24 || view.getUint32(0, true) !== 0x46546c67 || view.getUint32(4, true) !== 2 || view.getUint32(8, true) !== bytes.length) throw new Error('Choose a valid glTF 2 binary (.glb) model.');
  const jsonLength = view.getUint32(12, true);
  if (view.getUint32(16, true) !== 0x4e4f534a || jsonLength > 8 * 1024 * 1024 || jsonLength + 20 > bytes.length) throw new Error('Invalid GLB model manifest.');
  const data = JSON.parse(new TextDecoder().decode(bytes.subarray(20, 20 + jsonLength)));
  if (data.asset?.version !== '2.0' || !Array.isArray(data.meshes) || !data.meshes.length) throw new Error('The GLB must contain a glTF 2 house mesh.');
  for (const resource of [...(data.buffers || []), ...(data.images || [])]) {
    if (resource.uri && !/^data:(?:image\/(?:png|jpeg|webp)|application\/octet-stream);base64,/.test(resource.uri)) throw new Error('Export a self-contained GLB with all textures and buffers embedded.');
  }
  const supported = new Set(['KHR_materials_unlit', 'KHR_materials_clearcoat', 'KHR_materials_transmission', 'KHR_materials_ior', 'KHR_materials_specular', 'KHR_materials_volume', 'KHR_materials_emissive_strength', 'KHR_materials_sheen', 'KHR_materials_iridescence', 'KHR_materials_anisotropy', 'KHR_materials_dispersion', 'KHR_texture_transform', 'KHR_mesh_quantization', 'KHR_lights_punctual', 'EXT_texture_webp', 'EXT_texture_avif', 'EXT_mesh_gpu_instancing']);
  if ((data.extensionsRequired || []).some((name: string) => !supported.has(name))) throw new Error('Export an uncompressed GLB with embedded JPEG, PNG or WebP textures; this file needs an unsupported decoder.');
  let offset = 20 + jsonLength;
  while (offset < bytes.length) {
    if (offset + 8 > bytes.length) throw new Error('Truncated GLB model.');
    offset += 8 + view.getUint32(offset, true);
    if (offset > bytes.length || offset % 4) throw new Error('Invalid GLB chunk length.');
  }
  return { meshes: data.meshes.length };
}
