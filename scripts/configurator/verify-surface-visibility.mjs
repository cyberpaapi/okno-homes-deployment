/** Run from the checkout using the isolated derivative tooling dependencies.
 * Checks the first visible face at fixed architectural points, not just tag presence.
 */
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {MeshoptDecoder} from 'meshoptimizer';
import {createRequire} from 'node:module';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const T=await import(createRequire(process.cwd()+'/package.json').resolve('three'));
await MeshoptDecoder.ready;
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});
const manifest=JSON.parse(fs.readFileSync('src/data/configurator/signatureAssetManifest.json'));
const fixtures=JSON.parse(fs.readFileSync('scripts/configurator/surface-visibility-probes.json'));
const results=[];
for(const [slug,asset]of Object.entries(manifest)){
 const doc=await io.read('public'+asset.url),meshes=[];
 for(const mat of doc.getRoot().listMaterials()){
  const tags=mat.getExtras().oknoSurfaces||[];
  assert(tags.length<=1,`${slug}: shared roof and ceiling material`);
  assert(!mat.getExtras().oknoBackfaceCeiling,`${slug}: occluded BackSide ceiling`);
  if(mat.getAlphaMode()==='BLEND')assert.equal(tags.length,0,`${slug}: finish would overwrite glass`);
 }
 for(const n of doc.getRoot().listNodes())for(const p of n.getMesh()?.listPrimitives()||[]){
  const material=p.getMaterial(),geometry=new T.BufferGeometry();
  geometry.setAttribute('position',new T.BufferAttribute(p.getAttribute('POSITION').getArray(),3));
  if(p.getIndices())geometry.setIndex(new T.BufferAttribute(p.getIndices().getArray(),1));
  const mesh=new T.Mesh(geometry,new T.MeshBasicMaterial({side:material?.getDoubleSided()?T.DoubleSide:T.FrontSide}));
  mesh.applyMatrix4(new T.Matrix4().fromArray(n.getWorldMatrix()));mesh.updateMatrixWorld();
  mesh.userData={surfaces:material?.getExtras().oknoSurfaces||[],glass:material?.getAlphaMode()==='BLEND'};meshes.push(mesh);
 }
 for(const probe of fixtures[slug]){
  const ray=new T.Raycaster(new T.Vector3(...probe.origin),new T.Vector3(...probe.direction));
  const intersections=ray.intersectObjects(meshes,false);
  const hit=probe.expected==='glazing'?intersections[0]:intersections.find(h=>!h.object.userData.glass);
  assert(hit,`${slug}/${probe.name}: no visible surface`);
  const data=hit.object.userData;
  assert(probe.expected==='glazing'?data.glass:data.surfaces.includes(probe.expected),`${slug}/${probe.name}: expected ${probe.expected}, got ${JSON.stringify(data)}`);
  results.push({slug,...probe,distance:hit.distance,actual:data});
 }
 const view=doc.getRoot().listScenes()[0].getExtras().oknoInteriorView;
 assert(view?.position?.length===3&&view?.target?.length===3,`${slug}: missing interior camera`);
 for(const mesh of meshes){mesh.geometry.dispose();mesh.material.dispose();}
}
const report={passed:results.length,results};
if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({passed:results.length,models:Object.keys(manifest)},null,2));
