import fs from 'node:fs';import crypto from 'node:crypto';import assert from 'node:assert/strict';
const manifest=JSON.parse(fs.readFileSync('src/data/configurator/signatureAssetManifest.json','utf8'));
const checks=[];
const mappings=JSON.parse(fs.readFileSync('scripts/configurator/asset-surfaces-v2.json'));
const architecturalNodes=new Set(Object.values(mappings.kray.groups).flat());
for(const node of mappings.kray.reduceProfiles)assert(!architecturalNodes.has(node),'Profile reduction must not touch finish surfaces.');
assert(manifest.kray.triangles<450000,'Kray exceeded its geometry budget.');
assert(manifest.kray.bytes<8*1024*1024,'Kray exceeded its transfer budget.');
for(const[slug,asset]of Object.entries(manifest)){
 const b=fs.readFileSync('public'+asset.url);assert.equal(b.readUInt32LE(0),0x46546c67);assert.equal(b.readUInt32LE(4),2);assert.equal(b.readUInt32LE(8),b.length);assert.equal(b.length,asset.bytes);assert.equal(crypto.createHash('sha256').update(b).digest('hex'),asset.sha256);
 const gltf=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)).toString());const surfaces=new Set(gltf.materials.flatMap(m=>m.extras?.oknoSurfaces||[]));
 for(const surface of ['external-wall','external-roof','internal-wall','internal-ceiling','flooring'])assert(surfaces.has(surface),`${slug}: ${surface}`);
 assert.equal(asset.metersPerUnit,1);assert(gltf.extensionsRequired.includes('EXT_meshopt_compression'));assert(gltf.extensionsRequired.includes('EXT_texture_webp'));assert(b.length<16*1024*1024);
 checks.push({slug,bytes:b.length,hash:asset.sha256,surfaces:[...surfaces]});
}
const before=fs.readFileSync('src/components/configurator/supplied/cabinScene.ts.source','utf8');const after=fs.readFileSync('src/components/configurator/supplied/cabinScene.js','utf8');
for(const shader of ['vertexShader','fragmentShader']){const pattern=new RegExp(shader+':\\s*`([^`]*)`');assert.equal(after.match(pattern)?.[1],before.match(pattern)?.[1],shader+' changed');}
console.log(JSON.stringify({assets:checks,shaderSourceUnchanged:true},null,2));
