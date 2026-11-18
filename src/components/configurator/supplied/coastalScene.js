import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

const coastAssets = "/configurator/coast/v1/";
const tau = Math.PI * 2;
const seaLevel = -.58;
const smooth = THREE.MathUtils.smoothstep;
function coastRadius(a) {
    return 1 + .125*Math.sin(3*a+.4) + .07*Math.sin(5*a-1.3) + .033*Math.sin(8*a+1.5);
}
function groundHeight(t,a) {
    const dunes = (.27 + .18*Math.sin(a*4-.6)) * smooth(t,.52,.70) * (1-smooth(t,.72,.90));
    return -.025 + dunes - .92*smooth(t,.78,1.14) - 1.1*smooth(t,1.13,1.36);
}
function makeBeach(rx,rz) {
    const positions=[], colors=[], uvs=[], indices=[], shade=new THREE.Color();
    const rings=54, segments=148;
    for(let r=0;r<=rings;r++) for(let s=0;s<=segments;s++) {
        const a=s*tau/segments, t=r/rings*1.35, radius=t*coastRadius(a);
        const x=Math.cos(a)*radius*rx,z=Math.sin(a)*radius*rz;
        const height=groundHeight(t,a);
        const dry=smooth(height,-.65,-.21), patch=.5+.5*Math.sin(x*.51+Math.sin(z*.42))*Math.cos(z*.63);
        shade.setRGB(.52+.48*dry,.58+.42*dry,.64+.36*dry).multiplyScalar(.95+.055*patch);
        shade.lerp(new THREE.Color(.53,.63,.39),dunePatches(x,z,t)*.71);
        positions.push(x,height,z);uvs.push(x/3.2,z/3.2);colors.push(shade.r,shade.g,shade.b);
        if(r<rings && s<segments){const i=r*(segments+1)+s,j=i+segments+1;indices.push(i,i+1,j,i+1,j+1,j);}
    }
    const g=new THREE.BufferGeometry();
    g.setAttribute("position",new THREE.Float32BufferAttribute(positions,3));
    g.setAttribute("uv",new THREE.Float32BufferAttribute(uvs,2));
    g.setAttribute("color",new THREE.Float32BufferAttribute(colors,3));
    g.setIndex(indices);g.computeVertexNormals();return g;
}

// World-space waves retain their scale when the house or camera changes.
function seaMaterial(rx,rz,time,warm,sand,ripples) {
    const m=new THREE.MeshStandardMaterial({roughness:.24,metalness:.085,envMapIntensity:.52});
    m.onBeforeCompile=shader=>{
        Object.assign(shader.uniforms,{coastSize:{value:new THREE.Vector2(rx,rz)},clockSeconds:time,sunset:warm,seaFloor:{value:sand},windMap:{value:ripples}});
        shader.vertexShader="varying vec2 coastPosition;\n"+shader.vertexShader;
        shader.vertexShader=shader.vertexShader.replace("#include <begin_vertex>","#include <begin_vertex>\ncoastPosition = position.xz;");
        shader.fragmentShader=`varying vec2 coastPosition;
            uniform vec2 coastSize;uniform float clockSeconds,sunset;uniform sampler2D seaFloor,windMap;
            float coastHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
            float seaNoise(vec2 p){vec2 i=floor(p),u=fract(p);u=u*u*(3.-2.*u);
            return mix(mix(coastHash(i),coastHash(i+vec2(1,0)),u.x),mix(coastHash(i+vec2(0,1)),coastHash(i+1.),u.x),u.y);}
            vec2 seaSlope(vec2 p,float time){
                vec2 n=vec2(0.);float amp=.065, freq=1.7;
                for(int i=0;i<6;i++){
                    float k=float(i), angle=.51+sin(k*2.16)*.93;vec2 dir=vec2(cos(angle),sin(angle));
                    float phase=dot(p,dir)*freq+time*(.75+.42*k)+sin(dot(p,vec2(.24,-.35))+k)*1.2;
                    n+=dir*amp*cos(phase)/(1.+length(fwidth(p))*freq*.85);freq*=1.79;amp*=.78;
                }return n;
            }
            `+shader.fragmentShader;
        shader.fragmentShader=shader.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
            vec2 p=coastPosition, q=p/coastSize;float angle=atan(q.y,q.x);
            float shore=1.+.125*sin(3.*angle+.4)+.07*sin(5.*angle-1.3)+.033*sin(8.*angle+1.5);
            float distanceToShore=(length(q)/shore-0.985)*min(coastSize.x,coastSize.y);
            vec2 fetchA=texture2D(windMap,p*.23+clockSeconds*vec2(.016,.008)).rg*2.-1.;
            vec2 fetchB=texture2D(windMap,p.yx*.65-clockSeconds*vec2(.014,.022)).gr*2.-1.;
            vec2 slope=seaSlope(p,clockSeconds)*.43+fetchA*.21+fetchB*.10;
            float patches=seaNoise(p*.14)+.35*seaNoise(p*.63);
            float depth=smoothstep(-.65,8.2,distanceToShore+patches*.82);
            vec3 bottom=texture2D(seaFloor,p*.30+slope*.59).rgb;
            vec3 lagoon=vec3(.037,.34,.28)*(.70+bottom*.51);
            vec3 openSea=mix(vec3(.009,.118,.16),vec3(.021,.17,.20),patches*.6);
            vec3 sea=mix(lagoon,openSea,depth);
            float caustic=pow(max(0.,1.-abs(sin(p.x*2.3+p.y*.8+slope.x*8.+clockSeconds*.44)*.58+sin(p.y*2.1+slope.y*7.)*.45)*3.),3.);
            sea+=vec3(.025,.046,.038)*caustic*(1.-depth);
            float wash=distanceToShore+(.25+.4*seaNoise(p*.75))*sin(clockSeconds*.82+angle*8.)+.45*(patches-.7);
            float lace=seaNoise(p*4.7+slope)+.5*seaNoise(p*10.4);
            float foam=(1.-smoothstep(.06,.42,abs(wash)))*smoothstep(.32,.82,lace);
            sea=mix(sea,vec3(.75,.83,.79),foam*.83);
            diffuseColor.rgb=sea*mix(vec3(1.),vec3(1.05,.82,.67),sunset);
        `);
        shader.fragmentShader=shader.fragmentShader.replace("#include <normal_fragment_maps>",`#include <normal_fragment_maps>
            normal=normalize(mat3(viewMatrix)*normalize(vec3(-slope.x,1.,-slope.y)));`);
    };
    return m;
}

// Each frond has its own central rib and two ranks of folded, tapered leaflets.
function palmCrown() {
    const pos=[],colors=[],leaf=new THREE.Color();let seed=981;
    const rnd=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
    const triangle=(a,b,c,t)=>{pos.push(...a,...b,...c);for(const shade of [1,.87,1.08]) colors.push(leaf.r*t*shade,leaf.g*t*shade,leaf.b*t*shade);};
    for(let f=0;f<20;f++){
        const a=f*2.39996+rnd()*.19,young=f/20,h=.69+1.42*young,L=2.9-young*1.48+rnd()*.54;
        const bend=.26+(1-young)*1.65,cs=Math.cos(a),sn=Math.sin(a);
        leaf.setHSL(.197+rnd()*.045,.33+rnd()*.18,.29+young*.13+rnd()*.09,THREE.SRGBColorSpace);
        const point=(t,lateral=0,drop=0)=>[cs*L*t-sn*lateral,h*Math.sin(t*2.02)-bend*t*t+young*young*1.4*t+drop,sn*L*t+cs*lateral];
        for(let k=1;k<26;k++){
            const t=k/27,len=(.12+.61*Math.sin(Math.PI*t)**.65)*(1-young*.36);
            triangle(point(t-.037,-.019),point(t,.018),point(t+.01,-.016),1.14);
            for(const side of [-1,1]){
                const off=len*(.82+rnd()*.21),tip=point(t+.11,side*off,-.21-.42*off);
                const v0=point(t-.025),v1=point(t+.023),ridge=point(t+.044,side*off*.53,-.035);
                triangle(v0,ridge,tip,1.02);triangle(ridge,v1,tip,.74);
            }
        }
    }
    const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.Float32BufferAttribute(pos,3));g.setAttribute("color",new THREE.Float32BufferAttribute(colors,3));g.computeVertexNormals();return g;
}
function addPalms(root, rx,rz,materials,geometries) {
    const profile=[];
    for(let i=0;i<=96;i++){
        const t=i/96, radius=.095+.13*(1-t)**2+(i%3===0?.016:0);
        profile.push(new THREE.Vector2(radius,5*t));
    }
    const trunk=new THREE.LatheGeometry(profile,12),positions=trunk.attributes.position;
    for(let i=0;i<positions.count;i++){const y=positions.getY(i);positions.setX(i,positions.getX(i)+.037*y*y);}
    trunk.computeVertexNormals();
    const crown=palmCrown(),bark=new THREE.MeshStandardMaterial({color:"#786859",roughness:.92}),leaves=new THREE.MeshStandardMaterial({vertexColors:true,side:THREE.DoubleSide,roughness:.75});
    materials.push(bark,leaves);geometries.push(trunk,crown);
    // Staggered groves leave clear sight lines from the principal facade.
    const plantings=[[-.76,.16,.94],[-.80,-.02,1.18],[-.70,.32,.70],[-.40,-.66,1.26],[-.52,-.67,.79],[.40,-.71,.94],[.57,-.64,1.2]];
    const stems=new THREE.InstancedMesh(trunk,bark,plantings.length),crowns=new THREE.InstancedMesh(crown,leaves,plantings.length);
    const o=new THREE.Object3D(),tip=new THREE.Matrix4().makeTranslation(.925,4.94,0);
    plantings.forEach(([x,z,k],i)=>{
        const a=Math.atan2(z,x),u=Math.hypot(x,z)/coastRadius(a);
        o.position.set(x*rx,groundHeight(u,a)-.045,z*rz);o.scale.setScalar(k);o.rotation.y=i*2.38;o.updateMatrix();
        stems.setMatrixAt(i,o.matrix);crowns.setMatrixAt(i,o.matrix.clone().multiply(tip));
    });
    stems.castShadow=crowns.castShadow=true;stems.receiveShadow=crowns.receiveShadow=true;
    root.add(stems,crowns);
}
function dunePatches(x,z,t) {
    const windward=.52+.34*Math.sin(x*.72+z*.37)+.18*Math.cos(z*.92-x*.21);
    return smooth(t,.44,.58)*(1-smooth(t,.76,.91))*smooth(windward,.15,.73);
}
function addBeachGrass(root,rx,rz,size,materials,geometries) {
    let seed=734;
    const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
    const vertices=[],colors=[];
    for(let i=0;i<48;i++){
        const a=random()*tau,r=.14*Math.sqrt(random()),dx=Math.cos(a),dz=Math.sin(a);
        const x=dx*r,z=dz*r,h=.12+.23*random(),w=.005+.007*random(),lean=.025+.18*random();
        const point=(t,side)=>[x+dx*lean*t*t+dz*side*w*(1-t),h*(t-.25*t*t),z+dz*lean*t*t-dx*side*w*(1-t)];
        const base=new THREE.Color().setHSL(.19+random()*.035,.32,.24,THREE.SRGBColorSpace);
        const tip=new THREE.Color().setHSL(.115+random()*.055,.42,.58,THREE.SRGBColorSpace);
        for(const [t,side] of [[0,1],[0,-1],[.60,1],[.60,1],[0,-1],[.60,-1],[.60,1],[.60,-1],[1,0]]){
            vertices.push(...point(t,side));const c=base.clone().lerp(tip,t);colors.push(c.r,c.g,c.b);
        }
    }
    const geo=new THREE.BufferGeometry();
    geo.setAttribute("position",new THREE.Float32BufferAttribute(vertices,3));geo.setAttribute("color",new THREE.Float32BufferAttribute(colors,3));geo.computeVertexNormals();geometries.push(geo);
    const mat=new THREE.MeshStandardMaterial({vertexColors:true,side:THREE.DoubleSide,roughness:.96});materials.push(mat);
    const placements=[];
    for(let i=0;i<95;i++){
        const a=random()*tau,t=.49+random()*.38,r=t*coastRadius(a);
        const x=Math.cos(a)*r*rx,z=Math.sin(a)*r*rz;
        if(dunePatches(x,z,t)<.32)continue;
        for(let j=0;j<8;j++){
            const px=x+(random()-.5)*1.2,pz=z+(random()-.5)*1.2;
            if(Math.abs(px)<size.x*.5+.6 && Math.abs(pz)<size.z*.5+.6)continue;
            const angle=Math.atan2(pz/rz,px/rx),local=Math.hypot(px/rx,pz/rz)/coastRadius(angle);
            placements.push([px,groundHeight(local,angle)-.03,pz,random()*tau,.59+random()*.92]);
        }
    }
    const grass=new THREE.InstancedMesh(geo,mat,placements.length),o=new THREE.Object3D();
    placements.forEach(([x,y,z,a,k],i)=>{o.position.set(x,y,z);o.rotation.y=a;o.scale.setScalar(k);o.updateMatrix();grass.setMatrixAt(i,o.matrix);});
    grass.receiveShadow=true;root.add(grass);
}

export function createCoast(size,tex,draw) {
    const rx=Math.max(10,size.x*.72+5.1),rz=Math.max(10.5,size.z*.72+5.5);
    const root=new THREE.Group(), time={value:0},warm={value:0},materials=[],geometries=[];
    const sand=tex(coastAssets+"sand.webp",1,1),normal=tex(coastAssets+"sand-normal.webp",1,1,true);
    const beachMaterial=new THREE.MeshStandardMaterial({map:sand,normalMap:normal,normalScale:new THREE.Vector2(.54,.54),roughness:.90,vertexColors:true});
    const beachGeo=makeBeach(rx,rz), beach=new THREE.Mesh(beachGeo,beachMaterial);
    beach.receiveShadow=true;root.add(beach);
    const seaGeo=new THREE.PlaneGeometry(440,440).rotateX(-Math.PI/2),waterMaterial=seaMaterial(rx,rz,time,warm,sand,tex(coastAssets+"wind-ripples.webp",1,1,true));
    const ocean=new THREE.Mesh(seaGeo,waterMaterial);ocean.position.y=seaLevel;ocean.receiveShadow=true;root.add(ocean);
    geometries.push(beachGeo,seaGeo);materials.push(beachMaterial,waterMaterial);
    addPalms(root,rx,rz,materials,geometries);
    addBeachGrass(root,rx,rz,size,materials,geometries);
    let disposed=false, rockTextures=new Set();
    new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).load(coastAssets+"rock-cluster.glb",gltf=>{
        const source=gltf.scene,used=new Set();source.traverse(o=>{if(o.isMesh){geometries.push(o.geometry);for(const m of [].concat(o.material))used.add(m);}});
        const textures=new Set();used.forEach(m=>{for(const value of Object.values(m))if(value?.isTexture)textures.add(value);});
        if(disposed){source.traverse(o=>{if(o.isMesh)o.geometry.dispose()});used.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());return;}
        const shapes=[];
        source.updateMatrixWorld(true);
        source.traverse(o=>{
            if(!o.isMesh)return;
            const rock=o.clone(false);rock.matrixAutoUpdate=false;rock.matrix.copy(o.matrixWorld);
            const wrap=new THREE.Group();wrap.add(rock);
            const bounds=new THREE.Box3().setFromObject(wrap,true), center=bounds.getCenter(new THREE.Vector3());
            wrap.position.set(-center.x,-bounds.min.y,-center.z);
            const normalized=new THREE.Group();normalized.add(wrap);normalized.scale.setScalar(1/(bounds.max.y-bounds.min.y));
            shapes.push(normalized);
        });
        const shelves=[[.31,.90,.86],[-.83,.48,1.33],[.93,-.20,1.16],[-.23,-.98,.95],[.98,.46,.68]];
        for(const [j,[sx,sz,k]] of shelves.entries()) for(let i=0;i<7;i++){
            const bearing=i*2.39996+j*1.33,distance=i===0?0:.062+((i*13+j*3)%8)*.016;
            const x=sx+Math.cos(bearing)*distance,z=sz+Math.sin(bearing)*distance;
            const a=Math.atan2(z,x),t=Math.hypot(x,z)/coastRadius(a),h=k*(i===0?1:i<3?.62:.25);
            const group=new THREE.Group();group.add(shapes[(i+j)%shapes.length].clone(true));
            group.scale.set(h*(1.1+.08*(i%3)),h*.89,h);group.rotation.y=bearing;
            group.position.set(x*rx,Math.max(-1.20,groundHeight(t,a))-h*.18,z*rz);
            group.traverse(o=>{if(o.isMesh)o.castShadow=o.receiveShadow=true;});root.add(group);
        }
        materials.push(...used);rockTextures=textures;draw();
    });
    return {root,extent:Math.max(rx,rz),time,warm,dispose(){
        disposed=true;root.removeFromParent();root.traverse(o=>{if(o.isInstancedMesh)o.dispose();});
        for(const g of new Set(geometries))g.dispose();for(const m of materials)m.dispose();for(const t of rockTextures)t.dispose();root.clear();
    }};
}
