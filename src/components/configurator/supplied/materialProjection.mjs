import * as THREE from "three";

/**
 * Generates UVs in a shared model coordinate system. Every triangle uses one
 * projection axis, so smoothing normals cannot split or stretch a face.
 */
export function projectGeometryInModelSpace(source,matrix,metersPerTile=1){
  const safeScale=Math.max(.05,metersPerTile);
  const geometry=source.index?source.toNonIndexed():source.clone();
  const position=geometry.getAttribute("position");
  if(!position||position.count<3)return geometry;
  const uv=new Float32Array(position.count*2);
  const a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3();
  const edgeAB=new THREE.Vector3(),edgeAC=new THREE.Vector3(),normal=new THREE.Vector3();
  const write=(index,point,axis)=>{
    if(axis==="x"){uv[index*2]=point.z/safeScale;uv[index*2+1]=point.y/safeScale}
    else if(axis==="y"){uv[index*2]=point.z/safeScale;uv[index*2+1]=point.x/safeScale}
    else{uv[index*2]=point.x/safeScale;uv[index*2+1]=point.y/safeScale}
  };
  for(let i=0;i+2<position.count;i+=3){
    a.fromBufferAttribute(position,i).applyMatrix4(matrix);
    b.fromBufferAttribute(position,i+1).applyMatrix4(matrix);
    c.fromBufferAttribute(position,i+2).applyMatrix4(matrix);
    edgeAB.subVectors(b,a);edgeAC.subVectors(c,a);normal.crossVectors(edgeAB,edgeAC);
    const nx=Math.abs(normal.x),ny=Math.abs(normal.y),nz=Math.abs(normal.z);
    const axis=nx>=ny&&nx>=nz?"x":ny>=nz?"y":"z";
    write(i,a,axis);write(i+1,b,axis);write(i+2,c,axis);
  }
  geometry.setAttribute("uv",new THREE.BufferAttribute(uv,2));
  geometry.userData.oknoProjection={space:"model",metersPerTile:safeScale,method:"face-dominant-v2"};
  return geometry;
}
