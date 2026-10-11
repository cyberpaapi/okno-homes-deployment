import { Box3, Color, DoubleSide, Float32BufferAttribute, Group, InstancedMesh, Matrix4, Mesh, MeshStandardMaterial, PlaneGeometry, Quaternion, RepeatWrapping, SRGBColorSpace, Texture, TextureLoader, Vector3, type BufferGeometry, type Material, type WebGLRenderer } from "three";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { terrainHeight, woodlandLayout, type LandscapePlacement } from "./woodlandLayout";

export function createWoodland(renderer: WebGLRenderer, changed: () => void) {
  const root = new Group();
  root.name = "OKNO shared woodland setting";
  let disposed = false;
  const geometries = new Set<BufferGeometry>(), materials = new Set<Material>(), textures = new Set<Texture>();
  const sharedMaterials = new Map<string, Material>();
  const layout = woodlandLayout();
  const terrain = new PlaneGeometry(180, 180, 128, 128);
  terrain.rotateX(-Math.PI / 2);
  const positions = terrain.getAttribute("position");
  for (let i=0; i<positions.count; i++) positions.setY(i,terrainHeight(positions.getX(i),positions.getZ(i)));
  terrain.computeVertexNormals();
  const pathTexture = new TextureLoader().load("/configurator/original/textures/stone.jpg",()=>changed());
  pathTexture.wrapS=pathTexture.wrapT=RepeatWrapping; textures.add(pathTexture);
  const groundMaterial = new MeshStandardMaterial({color:"#889174",roughness:1,bumpScale:.045});
  groundMaterial.onBeforeCompile = shader => {
    shader.uniforms.pathTexture = {value:pathTexture};
    shader.vertexShader = "varying vec3 landscapePosition;\n" + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace("#include <begin_vertex>","#include <begin_vertex>\nlandscapePosition = position;");
    shader.fragmentShader = "uniform sampler2D pathTexture;\nvarying vec3 landscapePosition;\n" + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace("#include <color_fragment>", `#include <color_fragment>
      float patches = sin(landscapePosition.x*.43 + sin(landscapePosition.z*.32))*sin(landscapePosition.z*.28);
      diffuseColor.rgb *= .86 + .22 * patches;
      float pathCenter = 9.0 + sin(landscapePosition.z*.12)*2.0;
      float path = (1.0-smoothstep(1.05,1.6,abs(landscapePosition.x-pathCenter))) * smoothstep(-1.0,3.0,landscapePosition.z);
      diffuseColor.rgb = mix(diffuseColor.rgb, pow(texture2D(pathTexture,landscapePosition.xz*.65).rgb,vec3(2.2))*.65,path);`);
  };
  const ground = new Mesh(terrain,groundMaterial);ground.receiveShadow=true;root.add(ground);
  geometries.add(terrain);materials.add(groundMaterial);
  const groundReady = new TextureLoader().loadAsync("/configurator/original/textures/meadow-grass.jpg").then(texture=>{
    if(disposed){texture.dispose();return;}
    texture.colorSpace=SRGBColorSpace;texture.wrapS=texture.wrapT=RepeatWrapping;texture.repeat.setScalar(80);
    texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());textures.add(texture);
    groundMaterial.map=groundMaterial.bumpMap=texture;groundMaterial.needsUpdate=true;changed();
  });
  const addAsset = async (name:string, placements:LandscapePlacement[], whole:boolean) => {
    const gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(`/configurator/landscape/v1/${name}.gltf`);
    const sourceMeshes: Mesh[]=[];
    const discardMaterials = new Set<Material>(), discardTextures = new Set<Texture>();
    gltf.scene.updateMatrixWorld(true);
    gltf.scene.traverse(object=>{
      if(!(object instanceof Mesh))return;
      const canonical = (material: Material) => {
        const key=name.replace('_near','')+':'+(material.name || material.uuid);
        const shared=sharedMaterials.get(key);
        if(!shared){sharedMaterials.set(key,material);return material;}
        if(shared!==material){discardMaterials.add(material);for(const value of Object.values(material))if(value instanceof Texture)discardTextures.add(value);}
        return shared;
      };
      object.material=Array.isArray(object.material)?object.material.map(canonical):canonical(object.material);
      sourceMeshes.push(object);geometries.add(object.geometry);
      for(const material of Array.isArray(object.material)?object.material:[object.material]){
        materials.add(material);
        for(const value of Object.values(material))if(value instanceof Texture)textures.add(value);
      }
    });
    discardMaterials.forEach(material=>material.dispose());
    discardTextures.forEach(texture=>{if(!textures.has(texture))texture.dispose();});
    if(disposed){
      sourceMeshes.forEach(mesh=>mesh.geometry.dispose());
      for(const material of materials)material.dispose();for(const texture of textures)texture.dispose();return;
    }
    const allBounds=new Box3().setFromObject(gltf.scene);
    sourceMeshes.forEach((mesh,index)=>{
      const bounds=whole?allBounds:new Box3().setFromObject(mesh),size=bounds.getSize(new Vector3()),center=bounds.getCenter(new Vector3());
      if(size.y < .0001)return;
      const geometry=mesh.geometry.clone();
      // Compressed attributes must be decoded to floats before world transforms.
      for(const name of ["position","normal"]){
        const attribute=geometry.getAttribute(name);
        if(!attribute)continue;
        const values=new Float32Array(attribute.count*3);
        for(let i=0;i<attribute.count;i++){values[i*3]=attribute.getX(i);values[i*3+1]=attribute.getY(i);values[i*3+2]=attribute.getZ(i);}
        geometry.setAttribute(name,new Float32BufferAttribute(values,3));
      }
      geometry.applyMatrix4(mesh.matrixWorld);
      geometry.translate(-center.x,-bounds.min.y,-center.z);
      geometry.scale(1/size.y,1/size.y,1/size.y);geometries.add(geometry);
      const instances=whole?placements:placements.filter((_,i)=>i%sourceMeshes.length===index);
      if(!instances.length)return;
      const instance=new InstancedMesh(geometry,mesh.material,instances.length);
      instance.name=`Woodland ${name} ${index}`;
      instance.castShadow=name!=='grass_medium_01' && name!=='fir_tree_01';instance.receiveShadow=true;
      for(const material of Array.isArray(mesh.material)?mesh.material:[mesh.material]){
        if(material instanceof MeshStandardMaterial){material.envMapIntensity=.6;material.side=DoubleSide;}
      }
      const matrix=new Matrix4(),orientation=new Quaternion(),up=new Vector3(0,1,0);
      instances.forEach((p,i)=>{
        orientation.setFromAxisAngle(up,p.rotation);
        matrix.compose(new Vector3(p.x,terrainHeight(p.x,p.z)-.025,p.z),orientation,new Vector3(p.height,p.height,p.height));
        instance.setMatrixAt(i,matrix);
        instance.setColorAt(i,new Color().setScalar(.88+(i%5)*.03));
      });
      instance.instanceMatrix.needsUpdate=true;instance.computeBoundingSphere();root.add(instance);
    });
    sourceMeshes.forEach(mesh=>{geometries.delete(mesh.geometry);mesh.geometry.dispose();});
    root.updateMatrixWorld(true);changed();
  };
  const ready=Promise.allSettled([
    groundReady,
    addAsset('fir_tree_01',layout.trees.filter(p=>Math.hypot(p.x,p.z)>=21),true),
    addAsset('fir_tree_01_near',layout.trees.filter(p=>Math.hypot(p.x,p.z)<21),true),
    addAsset('rock_moss_set_01',layout.rocks,false),
    addAsset('fern_02',layout.ferns,false),
    addAsset('grass_medium_01',layout.grass,false),
  ]).then(results=>results.every(result=>result.status==='fulfilled'));
  return {root,ready,dispose(){disposed=true;root.removeFromParent();root.traverse(object=>{if(object instanceof InstancedMesh)object.dispose();});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());root.clear();}};
}
