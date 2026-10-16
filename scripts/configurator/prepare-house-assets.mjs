/** Run from an isolated tooling environment containing gltf-transform 4.2.1,
 * sharp 0.35.5 and meshoptimizer 0.24.0. One process/model at a time; 2 GiB heap.
 * Inputs and output directories are explicit. Masters are never overwritten.
 */
import {NodeIO,getBounds,Logger} from '@gltf-transform/core';
import {ALL_EXTENSIONS,EXTTextureWebP,EXTMeshoptCompression} from '@gltf-transform/extensions';
import {dedup,flatten,join,prune,weld,weldPrimitive,normals} from '@gltf-transform/functions';
import {MeshoptEncoder,MeshoptDecoder,MeshoptSimplifier} from 'meshoptimizer';
import sharp from 'sharp';import fs from 'node:fs';import crypto from 'node:crypto';
const [slug,file,out,mappingFile,reportPath]=process.argv.slice(2);
if(!reportPath||fs.realpathSync(file)===out)throw Error('Provide slug, source, new output, mappings, report.');
const available=Number(fs.readFileSync('/proc/meminfo','utf8').match(/MemAvailable:\s+(\d+)/)[1])/1024;
if(available<2048)throw Error('Less than 2 GiB available; defer conversion.');
sharp.concurrency(1);sharp.cache(false);await MeshoptEncoder.ready;await MeshoptDecoder.ready;await MeshoptSimplifier.ready;
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder,'meshopt.decoder':MeshoptDecoder});
const d=await io.read(file);d.setLogger(new Logger(Logger.Verbosity.WARN));const root=d.getRoot();const mappings=JSON.parse(fs.readFileSync(mappingFile))[slug];
const sourceNodes=root.listNodes(),removed=[],reducedProfiles=[],surfaceMaterials=new Map();
const taggedMaterial=(material,surfaces)=>{
 const key=root.listMaterials().indexOf(material)+'|'+surfaces.join(',');
 if(!surfaceMaterials.has(key)){
  if(material.getAlphaMode()==='BLEND')throw Error('A finish must never replace glazing.');
  const clone=material.clone();
  clone.setName((material.getName()||'Authored material')+' · '+surfaces.join(' / '));
  clone.setExtras({...clone.getExtras(),oknoSurfaces:surfaces,oknoBackfaceCeiling:!!mappings.backfaceCeiling&&surfaces.includes('internal-ceiling')});
  surfaceMaterials.set(key,clone);
 }
 return surfaceMaterials.get(key);
};
for(const [i,n]of sourceNodes.entries()){
 let mesh=n.getMesh();if(!mesh)continue;const b=getBounds(n);
 const outside=slug==='forza'?(b.min[0]>15||b.max[2]<-10):slug==='kray'?b.max[0]<5:slug==='suite'?(mesh.listPrimitives().every(p=>!p.getMaterial())||b.min[0]<-58.3||b.max[0]>-46.3||b.min[2]<12.4||b.max[2]>27.85||b.max[1]>8):false;
 if(outside||mappings?.removeNodes?.includes(i)){removed.push({node:i,name:n.getName(),bounds:b});n.setMesh(null);continue;}
 if(mappings.reduceProfiles?.includes(i)){
  const owned=d.createMesh(mesh.getName());
  for(const primitive of mesh.listPrimitives()){
   const material=primitive.getMaterial(),p=primitive.clone();
   if(p.listSemantics().some(s=>!['POSITION','NORMAL'].includes(s))||material?.getBaseColorTexture())throw Error('Profile reduction requires untextured position/normal geometry.');
   const before=p.getIndices()?.getCount()??p.getAttribute('POSITION').getCount();
   p.setAttribute('NORMAL',null);weldPrimitive(p,{overwrite:true});
   const [indices,error]=MeshoptSimplifier.simplify(new Uint32Array(p.getIndices().getArray()),p.getAttribute('POSITION').getArray(),3,Math.floor(before*.05/3)*3,.0005,['ErrorAbsolute']);
   if(error>.000501||!indices.length)throw Error('Profile simplification exceeded 0.5 mm bound.');
   p.setIndices(d.createAccessor().setType('SCALAR').setArray(indices).setBuffer(p.getAttribute('POSITION').getBuffer()));
   owned.addPrimitive(p);reducedProfiles.push({node:i,before:before/3,after:indices.length/3,errorMetres:error});
  }
  n.setMesh(owned);mesh=owned;
 }
 const surfaces=Object.entries(mappings?.groups||{}).filter(([,ids])=>ids.includes(i)).map(([key])=>key);
 const split=mappings?.splitWalls?.node===i?mappings.splitWalls:null;
 const splitRoof=mappings.splitRoof&&surfaces.includes('external-roof');
 if(!surfaces.length&&!split)continue;
 // A source mesh can be instanced by unrelated parts. Clone its primitives before
 // changing semantic materials, while retaining shared accessors until flattening.
 const owned=d.createMesh(mesh.getName()).setWeights(mesh.getWeights());
 for(const primitive of mesh.listPrimitives())owned.addPrimitive(primitive.clone());
 n.setMesh(owned);
 for(const p of owned.listPrimitives()){
  const material=p.getMaterial();if(!material)continue;
  if(split||splitRoof){
   const position=p.getAttribute('POSITION'),indices=p.getIndices();
   const buckets=splitRoof?{'external-roof':[],'internal-ceiling':[]}:{'external-wall':[],'internal-wall':[],authored:[]};
   const onPlane=(vertices,planes)=>planes.some(([axis,value,maxX])=>vertices.every(v=>Math.abs(v[axis]-value)<split.tolerance&&(maxX===undefined||v[0]<=maxX)&&(split.minY===undefined||v[1]>=split.minY-.001)));
   for(let t=0;t<(indices?.getCount()??position.getCount());t+=3){
    const ids=[0,1,2].map(k=>indices?indices.getScalar(t+k):t+k);
    const vertices=ids.map(id=>position.getElement(id,[]));
    const vertical=Math.max(...vertices.map(v=>v[1]))-Math.min(...vertices.map(v=>v[1]))>.01;
    let surface;
    if(splitRoof){
     const matrix=n.getWorldMatrix(),world=vertices.map(v=>[0,1,2].map(a=>matrix[a]*v[0]+matrix[4+a]*v[1]+matrix[8+a]*v[2]+matrix[12+a]));
     const u=world[1].map((v,a)=>v-world[0][a]),v=world[2].map((v,a)=>v-world[0][a]);
     const cross=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
     surface=cross[1]/(Math.hypot(...cross)||1)<-.15?'internal-ceiling':'external-roof';
    }else surface=vertical&&onPlane(vertices,split.exteriorPlanes)?'external-wall':vertical&&onPlane(vertices,split.interiorPlanes)?'internal-wall':'authored';
    buckets[surface].push(...ids);
   }
   owned.removePrimitive(p);
   for(const [surface,ids]of Object.entries(buckets))if(ids.length){
    const part=p.clone().setIndices(d.createAccessor().setType('SCALAR').setArray(new Uint32Array(ids)).setBuffer(position.getBuffer()));
    if(surface!=='authored')part.setMaterial(taggedMaterial(material,[surface]));
    owned.addPrimitive(part);
   }
  }else p.setMaterial(taggedMaterial(material,surfaces));
 }
}
// Keep authored pane geometry and frames. Clear overlapping dark panes without
// transmission render targets; Tengo's already accepted glazing is unchanged.
for(const index of mappings.glazingNodes||[]){
 const node=sourceNodes[index],mesh=node.getMesh(),owned=d.createMesh(mesh.getName());
 for(const primitive of mesh.listPrimitives()){
  const material=primitive.getMaterial().clone().setAlphaMode('BLEND');
  owned.addPrimitive(primitive.clone().setMaterial(material));
 }
 node.setMesh(owned);
}
if(slug!=='tengo')for(const material of root.listMaterials())if(material.getAlphaMode()==='BLEND'){
 const color=material.getBaseColorFactor();
 material.setBaseColorFactor([.72,.79,.82,Math.min(color[3],.16)]).setRoughnessFactor(.12).setMetallicFactor(0);
 material.setExtras({...material.getExtras(),oknoGlazing:true});
}
if(mappings.interiorView)root.listScenes()[0].setExtras({...root.listScenes()[0].getExtras(),oknoInteriorView:mappings.interiorView});
// Serial texture processing avoids decoding several 8192px masters concurrently.
const textureSizes=[];for(const t of root.listTextures()){
 const before=t.getSize();const data=await sharp(t.getImage(),{limitInputPixels:100000000}).resize({width:1024,height:1024,fit:'inside',withoutEnlargement:true}).webp({quality:90,effort:3}).toBuffer();t.setImage(new Uint8Array(data)).setMimeType('image/webp');textureSizes.push({before,after:t.getSize()});
}
d.createExtension(EXTTextureWebP).setRequired(true);
await d.transform(prune(),dedup(),normals(),flatten(),join(),weld(),prune());
d.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({method:EXTMeshoptCompression.EncoderMethod.FILTER});
await io.write(out,d);const check=await io.read(out),cr=check.getRoot();const bounds=getBounds(cr.listScenes()[0]);let triangles=0;for(const n of cr.listNodes())for(const p of n.getMesh()?.listPrimitives()||[])triangles+=(p.getIndices()?.getCount()??p.getAttribute('POSITION').getCount())/3;
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const report={slug,sourceBytes:fs.statSync(file).size,sourceHash:hash(file),bytes:fs.statSync(out).size,sha256:hash(out),metersPerUnit:1,bounds,dimensions:bounds.max.map((v,i)=>v-bounds.min[i]),nodes:cr.listNodes().length,triangles,removed,reducedProfiles,textureSizes,materials:cr.listMaterials().length,peakRssMiB:Math.round(process.resourceUsage().maxRSS/1024),surfaces:[...new Set(cr.listMaterials().flatMap(m=>m.getExtras().oknoSurfaces||[]))]};fs.writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({...report,removed:removed.length,reducedProfiles:reducedProfiles.length,textureSizes:undefined}));
