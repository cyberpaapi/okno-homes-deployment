import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { createWoodland } from "../studio/woodlandScene";

const root = "/configurator/environments/";
const skies = {
    day: ["kloofendal-day.webp", false],
    daylight: ["kloofendal-day-1k.hdr", true],
    golden: ["spruit-sunrise-2k.hdr", true],
    forest: ["woodland-clearing.webp", false],
};

// Beds follow the building perimeter. The front approach stays open for every footprint.
function plantingLayout(size) {
    const halfX = size.x / 2, halfZ = size.z / 2;
    const trees = [], grass = [], ferns = [], rocks = [];
    let seed = 833;
    const random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
    const plant = (x, z, height) => ({ x, z, height, rotation: random() * Math.PI * 2 });
    const beds = [
        [-halfX - .90, halfZ * .54, .90, 2.8], [halfX + 1.35, -halfZ * .18, .95, 3.25],
        [halfX - .55, halfZ + .96, 1.55, .61], [-halfX + .8, -halfZ - 1.43, 2.9, 1.05],
    ];
    for (const [x,z,width,depth] of beds) {
        for (let i=0;i<39;i++) {
            const a = random()*Math.PI*2, r = Math.sqrt(random());
            const px=x+Math.cos(a)*r*width, pz=z+Math.sin(a)*r*depth;
            if (i<5) ferns.push(plant(px,pz,.32+random()*.34));
            else if (i<7) rocks.push(plant(px,pz,.17+random()*.24));
            else grass.push(plant(px,pz,.20+random()*.34));
        }
    }
    for (let i=0;i<15;i++) {
        const a=2.3+i*.205+random()*.09, r=i===3||i===5?19+random():22+random()*7.2;
        trees.push(plant(r*Math.cos(a),r*Math.sin(a),5+random()*6.8));
    }
    return {trees,grass,ferns,rocks};
}

// The starting point and direction are measured at the foot of each house's steps.
function entrancePath(approach, invalidate) {
    if (!Array.isArray(approach) || approach.length !== 4 || !approach.every(Number.isFinite)) return null;
    const [x, z, dx, dz] = approach;
    const root = new THREE.Group();
    root.position.set(x, 0, z);
    root.rotation.y = Math.atan2(dx, dz);
    const texture = new THREE.TextureLoader().load("/textures/stone.jpg", invalidate);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    const stone = new THREE.MeshStandardMaterial({
        map: texture, bumpMap: texture, bumpScale: .016, roughness: .91, color: "#b5b1a5",
    });
    const lengths = [.73, .60, .67, .56, .63, .68];
    const widths = [1.38, 1.29, 1.31, 1.23, 1.26, 1.22];
    const shapes = [];
    let distance = .065;
    lengths.forEach((length, i) => {
        const slab = new RoundedBoxGeometry(widths[i], .095, length, 2, .025);
        shapes.push(slab);
        const step = new THREE.Mesh(slab, stone);
        step.position.set(.11 * Math.sin(i * .74), .018 + .005 * Math.sin(i), distance + length / 2);
        step.rotation.y = .022 * Math.sin(i * 2);
        step.receiveShadow = step.castShadow = true;
        root.add(step);
        distance += length + .10;
    });
    return { root, dispose() { root.removeFromParent(); shapes.forEach(g => g.dispose()); stone.dispose(); texture.dispose(); } };
}

export function createHouseDaylight(scene,renderer,invalidate) {
    const fallback = scene.environment;
    const textures=new Map(), pending=new Set();
    let setting="meadow", golden=false, disposed=false, garden=null, footpath=null, footprint="";
    function request(key) {
        if (textures.has(key)||pending.has(key)) return;
        pending.add(key);
        const [file,hdr]=skies[key], loader=hdr?new RGBELoader():new THREE.TextureLoader();
        loader.load(root+file,texture=>{
            if (disposed) {texture.dispose();return;}
            if (!hdr) texture.colorSpace=THREE.SRGBColorSpace;
            texture.mapping=THREE.EquirectangularReflectionMapping;
            textures.set(key,texture); refresh();
        },undefined,()=>{pending.delete(key);});
    }
    function refresh() {
        const sky=setting==="forest"?"forest":golden?"golden":"day";
        const env=golden?"golden":"daylight";
        request(env);
        const outdoor=setting==="meadow"||setting==="forest";
        if (outdoor) request(sky);
        scene.background=outdoor ? textures.get(sky)??null : null;
        scene.environment=textures.get(env)??fallback;
        scene.environmentIntensity=golden?.74:.84;
        scene.backgroundRotation.y=-1.62;scene.environmentRotation.y=-1.62;
        scene.backgroundIntensity=golden?.78:1.04;
        scene.backgroundBlurriness=.015;
        if (garden) garden.root.visible=outdoor;
        if (footpath) footpath.root.visible=outdoor;
        invalidate();
    }
    refresh();
    return {
        setting(value){setting=value;refresh();},
        lighting(value){golden=value==="golden";refresh();},
        place(size,approach){
            const key=size.toArray().map(n=>n.toFixed(2)).join("/");
            if(key===footprint)return;
            footprint=key;garden?.dispose();footpath?.dispose();
            footpath=entrancePath(approach,()=>{if(!disposed)invalidate();});
            if(footpath)scene.add(footpath.root);
            garden=createWoodland(renderer,()=>{if(!disposed){renderer.shadowMap.needsUpdate=true;invalidate();}},plantingLayout(size),false);
            scene.add(garden.root);refresh();
        },
        dispose(){
            disposed=true;garden?.dispose();footpath?.dispose();scene.background=null;scene.environment=fallback;
            for(const texture of textures.values())texture.dispose();
        }
    };
}

export function setWindowReflections(material) {
    material.depthWrite=false;
    material.roughness=.065;
    material.metalness=.42;
    material.envMapIntensity=1.22;
    material.onBeforeCompile=shader=>{
        // Fresnel makes oblique panes reflective while a front view still reveals the interior.
        shader.fragmentShader=shader.fragmentShader.replace("#include <opaque_fragment>",`
            float incidence=1.0-clamp(abs(dot(normal,normalize(vViewPosition))),0.0,1.0);
            diffuseColor.a=mix(diffuseColor.a,.76,pow(incidence,3.0));
            #include <opaque_fragment>
        `);
    };
}
