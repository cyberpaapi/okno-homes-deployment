// Supplied scene adapted for named house assets, physical units and demand rendering.
// Original procedural geometry, materials, lighting and shader strings are retained in cabinScene.ts.source.
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { housePlacement, houseViews, houseOrbitLimits } from "./modelFraming";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { projectGeometryInModelSpace } from "./materialProjection.mjs";
const W = 5.2, D = 6.4, F = .46, E = 3.06, R = 4.61, A = Math.atan2(R - E, W / 2), S = Math.hypot(W / 2, R - E);
const box = (p, s, v, m, r = [0, 0, 0], name = "Part") => { const o = new THREE.Mesh(new THREE.BoxGeometry(...s), m); o.position.set(...v); o.rotation.set(...r); o.castShadow = o.receiveShadow = true; o.name = name; p.add(o); return o; };
export function createScene(mount, onReady, onSelection, onHistory = () => { }, customerModel = false) {
    let disposed = false, invalidate = () => {};
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    const gl = renderer.getContext(), debug = gl.getExtension("WEBGL_debug_renderer_info");
    const softwareRendering = debug && /swiftshader|llvmpipe|software/i.test(String(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL)));
    const displayPixelRatio = Math.min(devicePixelRatio, softwareRendering ? .85 : innerWidth < 700 ? 1.35 : 1.7);
    const animateWater = !matchMedia("(prefers-reduced-motion: reduce)").matches;
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(displayPixelRatio);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.02;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate = false;
    renderer.shadowMap.needsUpdate = true;
    renderer.domElement.role = "img";
    renderer.domElement.ariaLabel = "Interactive 3D Studio Cabin";
    mount.append(renderer.domElement);
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog("#cbd1c2", 18, 52);
    const camera = new THREE.PerspectiveCamera(innerWidth < 700 ? 48 : 40, mount.clientWidth / mount.clientHeight, .08, 100);
    const cameraOffset = () => {
        if (customerModel && innerWidth < 700) camera.setViewOffset(mount.clientWidth, mount.clientHeight, 0, -mount.clientHeight * .13, mount.clientWidth, mount.clientHeight);
        else camera.clearViewOffset();
    };
    cameraOffset();
    camera.position.set(9.6, 5.3, 10.8);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.65, .25);
    controls.enableDamping = true;
    controls.dampingFactor = .055;
    controls.minDistance = 3.4;
    controls.maxDistance = 22;
    controls.maxPolarAngle = Math.PI / 2.03;
    controls.autoRotate = true;
    controls.autoRotateSpeed = .5;
    controls.zoomToCursor = true;
    const pmrem = new THREE.PMREMGenerator(renderer), room = new RoomEnvironment(), envTarget = pmrem.fromScene(room, .04), env = envTarget.texture;
    scene.environment = env;
    scene.environmentIntensity = .64;
    const loader = new THREE.TextureLoader(), cache = new Map();
    const tex = (path, x = 2, y = 2) => { const k = path + x + y; if (cache.has(k))
        return cache.get(k); const t = loader.load(path, texture => { if (disposed) texture.dispose(); else invalidate(); }); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(x, y); t.anisotropy = renderer.capabilities.getMaxAnisotropy(); cache.set(k, t); return t; };
    const mat = (path, color, rough = .75, metal = 0, x = 2, y = 2) => new THREE.MeshStandardMaterial({ map: tex(path, x, y), bumpMap: tex(path, x, y), bumpScale: .025, color, roughness: rough, metalness: metal });
    const M = {
        cladding: mat("/textures/cedar.jpg", "#c78b55", .72, 0, 2.6, 1.5), timber: mat("/textures/oak.jpg", "#d8bb8f", .55, 0, 2.2, 2.2), roof: mat("/textures/zinc.jpg", "#42484c", .34, .76, 2.2, 1.2), frames: mat("/textures/bronze.jpg", "#2a2925", .28, .82, 1, 1), deck: mat("/textures/larch.jpg", "#a87955", .74, 0, 3.2, 2.4), foundation: mat("/textures/concrete.jpg", "#b8b5ae", .9, 0, 2.4, 2.4),
        glass: new THREE.MeshPhysicalMaterial({ color: "#d9edf0", roughness: .08, transmission: .72, thickness: .08, ior: 1.46, transparent: true, opacity: .46, depthWrite: false, side: THREE.DoubleSide }), plaster: mat("/textures/lime-plaster.jpg", "#eee7d9", .9, 0, 2.5, 1.8), fabric: new THREE.MeshStandardMaterial({ color: "#a8a599", roughness: .98 }), dark: new THREE.MeshStandardMaterial({ color: "#30332f", roughness: .86 }), metal: new THREE.MeshStandardMaterial({ color: "#242624", roughness: .3, metalness: .78 }), polished: mat("/textures/polished-concrete.jpg", "#d0cdc5", .72, 0, 2.1, 1.3), terrazzo: mat("/textures/terrazzo.jpg", "#ddd2bd", .7, 0, 1.3, 1.3), rattan: mat("/textures/woven-rattan.jpg", "#bd8c54", .92, 0, 1.8, 1.8), bulb: new THREE.MeshStandardMaterial({ color: "#fff1ca", emissive: "#ffad55", emissiveIntensity: 5 })
    };
    const cabin = new THREE.Group();
    cabin.name = "Studio Cabin · 24 m²";
    box(cabin, [5.62, .32, 6.82], [0, .18, 0], M.foundation, [0, 0, 0], "Concrete plinth");
    box(cabin, [5.1, .14, 6.25], [0, F - .02, 0], M.timber);
    box(cabin, [W, 2.6, .18], [0, F + 1.3, -D / 2], M.cladding, [0, 0, 0], "Rear cladding");
    box(cabin, [.18, 2.6, D], [-W / 2, F + 1.3, 0], M.cladding, [0, 0, 0], "West cladding");
    const wz = .15, ww = 1.75, wb = 1.38, wh = 1.18, front = D / 2 - (wz + ww / 2), rear = wz - ww / 2 + D / 2;
    box(cabin, [.18, 2.6, front], [W / 2, F + 1.3, wz + ww / 2 + front / 2], M.cladding);
    box(cabin, [.18, 2.6, rear], [W / 2, F + 1.3, -D / 2 + rear / 2], M.cladding);
    box(cabin, [.18, wb - F, ww], [W / 2, F + (wb - F) / 2, wz], M.cladding);
    box(cabin, [.18, E - wb - wh, ww], [W / 2, wb + wh + (E - wb - wh) / 2, wz], M.cladding);
    box(cabin, [.21, .075, ww + .16], [W / 2 + .04, wb - .04, wz], M.timber);
    box(cabin, [.16, .06, ww + .16], [W / 2 + .06, wb + wh + .03, wz], M.frames);
    [-1, 1].forEach(q => box(cabin, [.16, wh + .12, .06], [W / 2 + .06, wb + wh / 2, wz + q * (ww / 2 + .03)], M.frames));
    box(cabin, [.025, wh - .08, ww - .08], [W / 2 + .015, wb + wh / 2, wz], M.glass);
    const shape = new THREE.Shape();
    shape.moveTo(-2.48, F + .1);
    shape.lineTo(2.48, F + .1);
    shape.lineTo(2.48, E - .05);
    shape.lineTo(0, R - .13);
    shape.lineTo(-2.48, E - .05);
    shape.closePath();
    const glass = new THREE.Mesh(new THREE.ShapeGeometry(shape), M.glass);
    glass.position.z = D / 2 + .012;
    glass.renderOrder = 3;
    cabin.add(glass);
    [-1.72, -.86, 0, .86, 1.72].forEach(x => { const top = E + Math.max(0, (R - E) * (1 - Math.abs(x) / (W / 2))); box(cabin, [.055, top - F - .13, .09], [x, F + (top - F) / 2, D / 2 + .065], M.frames); });
    [1.28, 2.05, E - .08].forEach(y => box(cabin, [5.06, .05, .09], [0, y, D / 2 + .065], M.frames));
    box(cabin, [S - .14, .075, .09], [-W / 4, E + (R - E) / 2, D / 2 + .07], M.frames, [0, 0, A]);
    box(cabin, [S - .14, .075, .09], [W / 4, E + (R - E) / 2, D / 2 + .07], M.frames, [0, 0, -A]);
    box(cabin, [.92, 2.18, .12], [1.63, F + 1.09, D / 2 + .13], M.timber);
    box(cabin, [.48, 1.48, .025], [1.63, F + 1.3, D / 2 + .2], M.glass);
    box(cabin, [.035, .42, .035], [1.96, F + 1.06, D / 2 + .23], M.metal);
    const ry = E + (R - E) / 2;
    box(cabin, [S + .28, .09, 6.84], [-W / 4, ry, 0], M.roof, [0, 0, A]);
    box(cabin, [S + .28, .09, 6.84], [W / 4, ry, 0], M.roof, [0, 0, -A]);
    [-1, 1].forEach(q => { for (let z = -3.18; z <= 3.18; z += .53)
        box(cabin, [S + .12, .055, .034], [q * W / 4, ry + .075, z], M.roof, [0, 0, q < 0 ? A : -A], "Raised roof seam"); });
    const ridge = new THREE.Mesh(new THREE.CylinderGeometry(.105, .105, 6.94, 16, 1, false, 0, Math.PI), M.roof);
    ridge.rotation.x = Math.PI / 2;
    ridge.position.set(0, R + .1, 0);
    cabin.add(ridge);
    for (let z = -2.95; z <= 2.95; z += .42)
        box(cabin, [.028, 2.55, .035], [-W / 2 - .105, F + 1.3, z], M.frames);
    for (let x = -2.35; x <= 2.35; x += .42)
        box(cabin, [.028, 2.55, .035], [x, F + 1.3, -D / 2 - .105], M.frames);
    box(cabin, [4.92, 2.38, .08], [0, F + 1.24, -D / 2 + .13], M.plaster);
    for (let i = 0; i < 4; i++)
        box(cabin, [.74, .82, .58], [-2.04 + i * .78, F + .41, -D / 2 + .42], M.timber);
    box(cabin, [3.1, .08, .66], [-.86, F + .86, -D / 2 + .43], M.polished);
    box(cabin, [2.25, .34, .86], [-.85, F + .33, .48], M.fabric);
    box(cabin, [2.22, .72, .25], [-.85, F + .72, .1], M.fabric, [-.12, 0, 0]);
    box(cabin, [1.32, .055, .66], [-.78, F + .45, 1.54], M.terrazzo);
    [-.95, .15].forEach(x => { box(cabin, [.018, .72, .018], [x, 2.83, -1.25], M.metal); const b = new THREE.Mesh(new THREE.SphereGeometry(.075, 12, 8), M.bulb); b.position.set(x, 2.34, -1.25); cabin.add(b); });
    for (let x = -2.82; x <= 2.82; x += .145)
        box(cabin, [.125, .075, 2.12], [x, F - .11, D / 2 + 1.04], M.deck);
    box(cabin, [1.7, .17, 1.05], [1.55, .09, D / 2 + 2.42], M.foundation);
    box(cabin, [1.18, .17, .72], [1.55, -.08, D / 2 + 2.7], M.foundation);
    const chair = (x, z, r) => { const g = new THREE.Group(); g.position.set(x, F + .06, z); g.rotation.y = r; box(g, [.68, .08, .7], [0, .32, 0], M.rattan, [-.08, 0, 0]); box(g, [.68, .75, .08], [0, .69, -.32], M.rattan, [-.18, 0, 0]); cabin.add(g); };
    chair(-1.25, D / 2 + 1.05, -.18);
    chair(.05, D / 2 + 1.25, .24);
    scene.add(cabin);
    const groundTex = tex("/textures/meadow-grass.jpg", 18, 18), groundMaterial = new THREE.MeshStandardMaterial({ map: groundTex, bumpMap: groundTex, bumpScale: .085, color: "#82936d", roughness: 1 }), ground = new THREE.Mesh(new THREE.CircleGeometry(32, 96), groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    const landscapeProps = new THREE.Group(), stoneMat = mat("/textures/stone.jpg", "#8b8c82", .98, 0, 1.4, 1.4), rand = (i) => { const v = Math.sin(i * 91.13) * 43758.54; return v - Math.floor(v); };
    for (let i = 0; i < 24; i++) {
        const a = rand(i) * Math.PI * 2, r = 7 + rand(i + 5) * 18, o = new THREE.Mesh(new THREE.DodecahedronGeometry(.3 + rand(i + 9) * .65, 1), stoneMat);
        o.position.set(Math.cos(a) * r, .12, Math.sin(a) * r);
        o.scale.set(1.3, .6, .9);
        o.castShadow = true;
        landscapeProps.add(o);
    }
    scene.add(landscapeProps);
    const waterMaterial = new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uWarm: { value: 0 } }, transparent: true, depthWrite: true,
        vertexShader: `uniform float uTime;varying vec3 vWorld;void main(){vec3 p=position;p.z+=sin(p.x*.18+uTime*.85)*.055+sin(p.y*.24-uTime*.62)*.04;vec4 world=modelMatrix*vec4(p,1.);vWorld=world.xyz;gl_Position=projectionMatrix*viewMatrix*world;}`,
        fragmentShader: `uniform float uTime;uniform float uWarm;varying vec3 vWorld;void main(){float rx=sin(vWorld.x*.34+uTime*.9)+sin(vWorld.z*.23-uTime*.7);float rz=cos(vWorld.z*.31-uTime*.8)+cos(vWorld.x*.2+uTime*.55);vec3 normal=normalize(vec3(rx*.045,1.,rz*.045));vec3 viewDir=normalize(cameraPosition-vWorld);float fresnel=pow(1.-max(dot(normal,viewDir),0.),2.4);float glitter=pow(max(dot(reflect(normalize(vec3(.42,-.82,.38)),normal),viewDir),0.),90.);vec3 deep=mix(vec3(.025,.19,.24),vec3(.16,.18,.18),uWarm);vec3 sky=mix(vec3(.37,.67,.73),vec3(.72,.48,.25),uWarm);vec3 color=mix(deep,sky,.22+fresnel*.68)+glitter*vec3(1.,.86,.62)*.75;gl_FragColor=vec4(color,.94);}`
    });
    const water = new THREE.Mesh(new THREE.PlaneGeometry(180, 180, 96, 96), waterMaterial);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -.18;
    water.receiveShadow = true;
    const islandWorld = new THREE.Group(), islandLand = new THREE.Group();
    islandWorld.name = "Procedural full island";
    islandWorld.visible = false;
    islandWorld.add(water, islandLand);
    scene.add(islandWorld);
    const islandGrassMaterial = mat("/textures/meadow-grass.jpg", "#71845a", .96, 0, 7, 7), islandRockMaterial = mat("/textures/stone.jpg", "#77776c", .98, 0, 4, 3), islandShoreMaterial = mat("/textures/sandstone.jpg", "#c3ad82", .96, 0, 5, 4);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: "#563a25", roughness: .98 }), palmMaterial = new THREE.MeshStandardMaterial({ color: "#3f7028", roughness: .94, side: THREE.DoubleSide }), coconutMaterial = new THREE.MeshStandardMaterial({ color: "#5b3820", roughness: .94 });
    const hemi = new THREE.HemisphereLight("#eaf3ff", "#77725e", 1.25), sun = new THREE.DirectionalLight("#fff2d2", 4.4), fill = new THREE.DirectionalLight("#bfd8ff", .82);
    sun.position.set(-8, 13, 7);
    sun.castShadow = true;
    sun.shadow.mapSize.set(innerWidth < 700 ? 1024 : 2048, innerWidth < 700 ? 1024 : 2048);
    sun.shadow.camera.left = sun.shadow.camera.bottom = -12;
    sun.shadow.camera.right = sun.shadow.camera.top = 12;
    sun.shadow.bias = -.0002;
    sun.shadow.normalBias = .025;
    fill.position.set(8, 5, -8);
    scene.add(hemi, sun, fill);
    const inside = new THREE.PointLight("#ffb86e", 15, 7, 1.9);
    inside.position.set(-.4, 2.3, -1.2);
    scene.add(inside);
    let presets = { hero: [new THREE.Vector3(9.6, 5.25, 10.8), new THREE.Vector3(0, 1.62, .35)], front: [new THREE.Vector3(.1, 2.55, 12.4), new THREE.Vector3(0, 1.95, 1.1)], side: [new THREE.Vector3(11.8, 3.25, 1.2), new THREE.Vector3(0, 1.62, 0)], rear: [new THREE.Vector3(-8.9, 3.7, -10.2), new THREE.Vector3(0, 1.55, -.4)], plan: [new THREE.Vector3(.01, 15.5, .01), new THREE.Vector3()], inside: [new THREE.Vector3(1.85, 1.72, 4.55), new THREE.Vector3(-.45, 1.35, -.6)] };
    let cp = null, ct = null, imported = null, raf = 0, physicalScale = 1, importedPixelRatio = displayPixelRatio, activeBackground = "meadow", activeHouseView = "hero";
    const stopCameraFlight = () => { cp = ct = null; };
    controls.addEventListener("start", stopCameraFlight);
    const importStage = new THREE.Group();
    importStage.name = "OKNO imported model viewport transform";
    scene.add(importStage);
    const selected = new Set();
    const deleted = new Set();
    const originalMaterials = new Map();
    const originalGeometries = new Map();
    const appliedMaterials = new Map();
    const history = [];
    const selectionHelpers = new THREE.Group();
    selectionHelpers.name = "Selection outlines";
    scene.add(selectionHelpers);
    const partData = (mesh) => {
        var _a;
        const okno = mesh.userData.okno || {};
        const material = Array.isArray(mesh.material) ? (_a = mesh.material[0]) === null || _a === void 0 ? void 0 : _a.name : mesh.material.name;
        return {
            id: okno.sourceName || mesh.uuid,
            name: okno.definitionName || okno.sourceName || mesh.name || "Unnamed part",
            category: okno.category,
            material: okno.finishName || material || "Original material",
            groupId: okno.editGroupId,
            groupName: okno.editGroupName
        };
    };
    const publishSelection = () => {
        selectionHelpers.traverse(o => {
            if (o instanceof THREE.LineSegments) {
                o.geometry.dispose();
                (Array.isArray(o.material) ? o.material : [o.material]).forEach(material => material.dispose());
            }
        });
        selectionHelpers.clear();
        const visible = [...selected].filter(mesh => mesh.visible);
        if (visible.length > 24) {
            const bounds = new THREE.Box3();
            visible.forEach(mesh => bounds.union(new THREE.Box3().setFromObject(mesh)));
            const helper = new THREE.Box3Helper(bounds, "#eab66e");
            helper.material.depthTest = false;
            helper.renderOrder = 99;
            selectionHelpers.add(helper);
        }
        else
            visible.forEach(mesh => {
                const helper = new THREE.BoxHelper(mesh, "#eab66e");
                helper.material.depthTest = false;
                helper.material.transparent = true;
                helper.material.opacity = .92;
                helper.renderOrder = 99;
                selectionHelpers.add(helper);
            });
        onSelection([...selected].map(partData));
    };
    const clearSelection = () => { selected.clear(); publishSelection(); };
    const importedMeshes = () => {
        const meshes = [];
        imported?.traverse(o => { if (o instanceof THREE.Mesh) meshes.push(o); });
        return meshes;
    };
    const pushHistory = () => {
        if (!imported)
            return;
        history.push({ meshes: importedMeshes().map(mesh => ({ mesh, material: mesh.material, visible: mesh.visible, deleted: deleted.has(mesh), selected: selected.has(mesh), okno: Object.assign({}, (mesh.userData.okno || {})) })) });
        if (history.length > 20)
            history.shift();
        onHistory(history.length);
    };
    const editGroups = () => {
        const rows = new Map();
        importedMeshes().forEach(mesh => { const okno = mesh.userData.okno || {}, id = String(okno.editGroupId || ""); if (!id)
            return; const category = (okno.editGroupCustom ? undefined : (okno.editGroupCategory || okno.category)), current = rows.get(id); if (current) {
            current.count++;
            if (!current.category && category)
                current.category = category;
        }
        else
            rows.set(id, { id, name: String(okno.editGroupName || "Group"), count: 1, category }); });
        return [...rows.values()].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    };
    const groupMembers = (mesh) => { var _a; const id = (_a = mesh.userData.okno) === null || _a === void 0 ? void 0 : _a.editGroupId; return id ? importedMeshes().filter(candidate => { var _a; return candidate.visible && ((_a = candidate.userData.okno) === null || _a === void 0 ? void 0 : _a.editGroupId) === id; }) : [mesh]; };
    const groupSelection = (category, label, custom = false) => {
        if (selected.size < 2)
            return;
        const used = new Set(editGroups().map(group => group.name)), base = label.trim() || "Group";
        let name = base;
        if (custom) {
            let number = 2;
            while (used.has(name))
                name = `${base} ${number++}`;
        }
        else {
            let number = 1;
            while (used.has(`${base} ${number}`))
                number++;
            name = `${base} ${number}`;
        }
        pushHistory();
        const group = { id: THREE.MathUtils.generateUUID(), name, count: selected.size, category };
        selected.forEach(mesh => { const okno = Object.assign(Object.assign(Object.assign({}, (mesh.userData.okno || {})), (category ? { category, editGroupCategory: category } : {})), { editGroupId: group.id, editGroupName: group.name, editGroupCustom: custom }); if (custom)
            delete okno.editGroupCategory; mesh.userData.okno = okno; });
        publishSelection();
        if (category === "foundation")
            rebuildIsland();
        return group;
    };
    const ungroupSelection = () => {
        if (![...selected].some(mesh => { var _a; return (_a = mesh.userData.okno) === null || _a === void 0 ? void 0 : _a.editGroupId; }))
            return 0;
        pushHistory();
        const touched = new Set();
        let count = 0;
        selected.forEach(mesh => { const okno = mesh.userData.okno || {}; if (okno.editGroupId) {
            touched.add(okno.editGroupId);
            count++;
        } delete okno.editGroupId; delete okno.editGroupName; delete okno.editGroupCategory; delete okno.editGroupCustom; mesh.userData.okno = okno; });
        for (const id of touched) {
            const remaining = importedMeshes().filter(mesh => { var _a; return ((_a = mesh.userData.okno) === null || _a === void 0 ? void 0 : _a.editGroupId) === id; });
            if (remaining.length < 2)
                remaining.forEach(mesh => { delete mesh.userData.okno.editGroupId; delete mesh.userData.okno.editGroupName; delete mesh.userData.okno.editGroupCategory; delete mesh.userData.okno.editGroupCustom; });
        }
        publishSelection();
        return count;
    };
    const addSelectionToGroup = (id) => {
        const group = editGroups().find(row => row.id === id);
        if (!group || !selected.size)
            return 0;
        pushHistory();
        selected.forEach(mesh => { mesh.userData.okno = Object.assign(Object.assign(Object.assign({}, (mesh.userData.okno || {})), (group.category ? { category: group.category, editGroupCategory: group.category, editGroupCustom: false } : { editGroupCustom: true })), { editGroupId: group.id, editGroupName: group.name }); });
        publishSelection();
        if (group.category === "foundation")
            rebuildIsland();
        return selected.size;
    };
    const deleteEditGroup = (id) => {
        const meshes = importedMeshes().filter(mesh => { var _a; return ((_a = mesh.userData.okno) === null || _a === void 0 ? void 0 : _a.editGroupId) === id; });
        if (!meshes.length)
            return 0;
        pushHistory();
        meshes.forEach(mesh => { const okno = mesh.userData.okno || {}; delete okno.editGroupId; delete okno.editGroupName; delete okno.editGroupCategory; delete okno.editGroupCustom; mesh.userData.okno = okno; });
        publishSelection();
        return meshes.length;
    };
    const disposeImported = () => {
        if (!imported)
            return;
        const geometries = new Set(originalGeometries.values());
        const materials = new Set();
        imported.traverse(o => { if (o instanceof THREE.Mesh) {
            geometries.add(o.geometry);
            (Array.isArray(o.material) ? o.material : [o.material]).forEach(material => materials.add(material));
        } });
        originalMaterials.forEach(value => (Array.isArray(value) ? value : [value]).forEach(material => materials.add(material)));
        geometries.forEach(geometry => geometry.dispose());
        const sharedApplied = new Set(appliedMaterials.values()), materialTextures = new Set();
        materials.forEach(material => {
            if (sharedApplied.has(material))
                return;
            Object.values(material).forEach(value => { if (value instanceof THREE.Texture)
                materialTextures.add(value); });
            material.dispose();
        });
        materialTextures.forEach(texture => { texture.dispose(); texture.source.data?.close?.(); });
        importStage.clear();
        imported = null;
        originalMaterials.clear();
        originalGeometries.clear();
        deleted.clear();
        history.length = 0;
        onHistory(0);
    };
    const robustBounds = () => {
        if (!imported)
            return null;
        imported.updateMatrixWorld(true);
        const rows = importedMeshes().filter(mesh => mesh.visible).map(mesh => {
            const bounds = new THREE.Box3().setFromObject(mesh);
            return { bounds, center: bounds.getCenter(new THREE.Vector3()) };
        }).filter(row => !row.bounds.isEmpty());
        if (!rows.length)
            return null;
        const median = (axis) => rows.map(row => row.center[axis]).sort((a, b) => a - b)[Math.floor(rows.length / 2)];
        const center = new THREE.Vector3(median("x"), median("y"), median("z"));
        const distances = rows.map(row => row.center.distanceTo(center)).sort((a, b) => a - b);
        const cutoff = distances[Math.floor((distances.length - 1) * .95)];
        const core = new THREE.Box3();
        rows.forEach(row => { if (row.center.distanceTo(center) <= cutoff)
            core.union(row.bounds); });
        return core.isEmpty() ? new THREE.Box3().setFromObject(imported) : core;
    };
    const disposeIslandLand = () => {
        const geometries = new Set();
        islandLand.traverse(o => { if (o instanceof THREE.Mesh)
            geometries.add(o.geometry); });
        geometries.forEach(geometry => geometry.dispose());
        islandLand.clear();
    };
    const islandShape = (radiusX, radiusZ, offset = 0, seed = 1) => {
        const shape = new THREE.Shape();
        for (let i = 0; i < 64; i++) {
            const angle = i / 64 * Math.PI * 2;
            const wobble = 1 + Math.sin(angle * 3 + seed) * .045 + Math.sin(angle * 7 - seed * .7) * .025 + (rand(i + seed * 71) - .5) * .035;
            const x = Math.cos(angle) * (radiusX + offset) * wobble, z = Math.sin(angle) * (radiusZ + offset) * wobble;
            if (i === 0)
                shape.moveTo(x, z);
            else
                shape.lineTo(x, z);
        }
        shape.closePath();
        return shape;
    };
    const islandFootprint = () => {
        if (imported && importStage.visible) {
            imported.updateMatrixWorld(true);
            const foundation = new THREE.Box3();
            let found = false;
            importedMeshes().forEach(mesh => {
                var _a;
                if (mesh.visible && ((_a = mesh.userData.okno) === null || _a === void 0 ? void 0 : _a.category) === "foundation") {
                    const bounds = new THREE.Box3().setFromObject(mesh);
                    if (!bounds.isEmpty()) {
                        foundation.union(bounds);
                        found = true;
                    }
                }
            });
            const bounds = found ? foundation : robustBounds();
            if (bounds && !bounds.isEmpty())
                return { center: bounds.getCenter(new THREE.Vector3()), size: bounds.getSize(new THREE.Vector3()) };
        }
        return { center: new THREE.Vector3(), size: new THREE.Vector3(5.62, .32, 6.82) };
    };
    const rebuildIsland = () => {
        if (activeBackground !== "full-island")
            return;
        disposeIslandLand();
        const { center, size } = islandFootprint(), radiusX = Math.max(size.x * .75 + 7, 13), radiusZ = Math.max(size.z * .75 + 7, 13);
        islandLand.position.set(center.x, 0, center.z);
        const shore = new THREE.Mesh(new THREE.ExtrudeGeometry(islandShape(radiusX, radiusZ, .52, 3), { depth: .34, bevelEnabled: true, bevelSegments: 2, bevelSize: .18, bevelThickness: .12, curveSegments: 4 }), [islandShoreMaterial, islandRockMaterial]);
        shore.rotation.x = Math.PI / 2;
        shore.position.y = -.02;
        shore.receiveShadow = true;
        shore.castShadow = true;
        shore.name = "Natural island shoreline";
        islandLand.add(shore);
        const land = new THREE.Mesh(new THREE.ExtrudeGeometry(islandShape(radiusX, radiusZ, 0, 7), { depth: .62, bevelEnabled: true, bevelSegments: 3, bevelSize: .24, bevelThickness: .16, curveSegments: 4 }), [islandGrassMaterial, islandRockMaterial]);
        land.rotation.x = Math.PI / 2;
        land.position.y = .12;
        land.receiveShadow = true;
        land.castShadow = true;
        land.name = "Foundation-scaled island terrain";
        islandLand.add(land);
        const treeCount = Math.max(10, Math.min(14, Math.round((radiusX + radiusZ) * .45))), frondsPerTree = 12, trunkGeometry = new THREE.CylinderGeometry(.12, .2, 2.1, 10, 2).translate(0, 1.05, 0), frondGeometry = new THREE.BufferGeometry(), frondPositions = [], frondIndices = [];
        for (let i = 0; i <= 6; i++) {
            const t = i / 6, x = t * 2.85, y = -.58 * t * t, width = .035 + Math.sin(Math.PI * t) * .3;
            frondPositions.push(x, y, -width, x, y, width);
            if (i < 6) {
                const a = i * 2, b = a + 1, c = a + 2, d = a + 3;
                frondIndices.push(a, c, b, b, c, d);
            }
        }
        frondGeometry.setAttribute("position", new THREE.Float32BufferAttribute(frondPositions, 3));
        frondGeometry.setIndex(frondIndices);
        frondGeometry.computeVertexNormals();
        const trunks = new THREE.InstancedMesh(trunkGeometry, trunkMaterial, treeCount), fronds = new THREE.InstancedMesh(frondGeometry, palmMaterial, treeCount * frondsPerTree), coconutGeometry = new THREE.SphereGeometry(.12, 8, 6), coconuts = new THREE.InstancedMesh(coconutGeometry, coconutMaterial, treeCount * 3), matrix = new THREE.Matrix4();
        trunks.name = "Distant coconut palm trunks";
        fronds.name = "Light green coconut palm fronds";
        coconuts.name = "Coconut clusters";
        trunks.castShadow = fronds.castShadow = coconuts.castShadow = true;
        trunks.receiveShadow = fronds.receiveShadow = true;
        for (let i = 0; i < treeCount; i++) {
            const angle = Math.PI * 1.03 + i / Math.max(1, treeCount - 1) * Math.PI * .44 + (rand(i + 111) - .5) * .07, edge = .91 + rand(i + 211) * .055, x = Math.cos(angle) * radiusX * edge, z = Math.sin(angle) * radiusZ * edge, height = 3.7 + rand(i + 311) * 1.7, rotation = rand(i + 511) * Math.PI;
            matrix.compose(new THREE.Vector3(x, .09, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rotation, 0)), new THREE.Vector3(.72, height / 2.1, .72));
            trunks.setMatrixAt(i, matrix);
            for (let j = 0; j < frondsPerTree; j++) {
                const index = i * frondsPerTree + j, azimuth = rotation + j / frondsPerTree * Math.PI * 2 + (rand(index + 711) - .5) * .22, length = .82 + rand(index + 811) * .3;
                matrix.compose(new THREE.Vector3(x, .08 + height, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, azimuth, (rand(index + 911) - .5) * .14)), new THREE.Vector3(length, .8 + rand(index + 1011) * .32, .92));
                fronds.setMatrixAt(index, matrix);
            }
            for (let j = 0; j < 3; j++) {
                const index = i * 3 + j, azimuth = rotation + j / 3 * Math.PI * 2;
                matrix.compose(new THREE.Vector3(x + Math.cos(azimuth) * .17, .08 + height - .16, z + Math.sin(azimuth) * .17), new THREE.Quaternion(), new THREE.Vector3(1, 1, 1));
                coconuts.setMatrixAt(index, matrix);
            }
        }
        trunks.instanceMatrix.needsUpdate = fronds.instanceMatrix.needsUpdate = coconuts.instanceMatrix.needsUpdate = true;
        islandLand.add(trunks, fronds, coconuts);
        controls.maxDistance = Math.max(35, Math.max(radiusX, radiusZ) * 2.2);
        renderer.shadowMap.needsUpdate = true;
    };
    const applyViewLimits = () => {
        if (!customerModel) return;
        // Interior eye-level/upward views and nearby walls must not be clamped
        // against exterior orbit limits, which would keep the camera flight alive.
        Object.assign(controls, houseOrbitLimits(activeHouseView === "inside"));
    };
    const applyInteriorView = () => {
        const view = imported?.userData.oknoInteriorView;
        if (view?.position?.length === 3 && view?.target?.length === 3) {
            presets.inside = [view.position, view.target].map(point => importStage.localToWorld(new THREE.Vector3(...point)));
        }
    };
    const frameImported = () => {
        importStage.position.set(0, 0, 0);
        importStage.rotation.set(0, 0, 0);
        importStage.scale.setScalar(1);
        importStage.updateMatrixWorld(true);
        const bounds = customerModel ? new THREE.Box3().setFromObject(imported) : robustBounds();
        if (!bounds)
            return;
        const size = bounds.getSize(new THREE.Vector3()), center = bounds.getCenter(new THREE.Vector3());
        const placement = housePlacement(bounds, physicalScale);
        const scale = customerModel ? placement.scale : 8 / (Math.max(size.x, size.y, size.z) || 1);
        importStage.scale.setScalar(scale);
        importStage.position.copy(customerModel ? placement.position : new THREE.Vector3(-center.x * scale, -bounds.min.y * scale + .03, -center.z * scale));
        importStage.updateMatrixWorld(true);
        controls.minDistance = 2.2;
        controls.maxDistance = Math.max(35, size.length() * scale * 4);
        camera.far = 250;
        camera.updateProjectionMatrix();
        cp = new THREE.Vector3(10.4, 6.2, 11.8);
        ct = new THREE.Vector3(0, Math.min(3.2, size.y * scale * .42), 0);
        controls.autoRotate = false;
        if (customerModel) {
            presets = houseViews(placement.size, camera.fov, camera.aspect);
            applyInteriorView();
            [cp, ct] = presets.hero.map(v => v.clone());
            scene.fog.near = Math.max(18, placement.size.length() * 2);
            scene.fog.far = Math.max(52, placement.size.length() * 6);
            const radius = placement.size.length() * .6 + 1;
            landscapeProps.children.forEach(o => { if (Math.hypot(o.position.x, o.position.z) < radius) o.visible = false; });
            const shadowExtent = Math.max(12, radius);
            sun.shadow.camera.left = sun.shadow.camera.bottom = -shadowExtent;
            sun.shadow.camera.right = sun.shadow.camera.top = shadowExtent;
            sun.shadow.camera.updateProjectionMatrix();
        }
        rebuildIsland();
        renderer.shadowMap.needsUpdate = true;
    };
    const modelMatrixFor = (mesh) => {
        importStage.updateMatrixWorld(true);
        mesh.updateMatrixWorld(true);
        return new THREE.Matrix4().copy(importStage.matrixWorld).invert().multiply(mesh.matrixWorld);
    };
    const undo = () => {
        const snapshot = history.pop();
        if (!snapshot)
            return false;
        selected.clear();
        deleted.clear();
        snapshot.meshes.forEach(state => {
            const originalGeometry = originalGeometries.get(state.mesh) || state.mesh.geometry;
            if (state.mesh.geometry !== originalGeometry)
                state.mesh.geometry.dispose();
            const projected = state.okno.projection === "model-face-v2" && Boolean(state.okno.finishTexture);
            state.mesh.geometry = projected ? projectGeometryInModelSpace(originalGeometry, modelMatrixFor(state.mesh), Number(state.okno.finishScale) || 1) : originalGeometry;
            state.mesh.material = state.material;
            state.mesh.visible = state.visible;
            state.mesh.userData.okno = Object.assign({}, state.okno);
            if (state.deleted)
                deleted.add(state.mesh);
            if (state.selected && state.visible)
                selected.add(state.mesh);
        });
        publishSelection();
        onHistory(history.length);
        rebuildIsland();
        renderer.shadowMap.needsUpdate = true;
        return true;
    };
    const materialFor = (finish, name) => {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const roughness = (_a = finish.roughness) !== null && _a !== void 0 ? _a : .72, metalness = (_b = finish.metalness) !== null && _b !== void 0 ? _b : 0;
        const key = [name, finish.kind, finish.texture, finish.color, roughness, metalness, finish.transmission, finish.opacity, finish.ior, finish.thickness, finish.clearcoat].join("|");
        const existing = appliedMaterials.get(key);
        if (existing)
            return existing;
        const material = finish.kind === "glass"
            ? new THREE.MeshPhysicalMaterial({ name, color: finish.color, roughness, metalness: 0, transmission: (_c = finish.transmission) !== null && _c !== void 0 ? _c : .9, opacity: (_d = finish.opacity) !== null && _d !== void 0 ? _d : .42, ior: (_e = finish.ior) !== null && _e !== void 0 ? _e : 1.46, thickness: (_f = finish.thickness) !== null && _f !== void 0 ? _f : .08, clearcoat: (_g = finish.clearcoat) !== null && _g !== void 0 ? _g : .12, transparent: true, depthWrite: false, envMapIntensity: 1.25, side: THREE.DoubleSide })
            : new THREE.MeshStandardMaterial({ name, map: finish.texture ? tex(finish.texture, 1, 1) : null, color: "#ffffff", roughness, metalness, envMapIntensity: 1.08, side: THREE.DoubleSide });
        material.userData.oknoFinish = { name, kind: finish.kind || "surface", texture: finish.texture || "", metersPerTile: (_h = finish.scale) !== null && _h !== void 0 ? _h : 1 };
        appliedMaterials.set(key, material);
        return material;
    };
    const applyMeshes = (meshes, finish, name) => {
        var _a;
        const material = materialFor(finish, name), metersPerTile = (_a = finish.scale) !== null && _a !== void 0 ? _a : 1;
        for (const mesh of meshes) {
            if (!originalMaterials.has(mesh))
                originalMaterials.set(mesh, mesh.material);
            const originalGeometry = originalGeometries.get(mesh) || mesh.geometry;
            if (mesh.geometry !== originalGeometry)
                mesh.geometry.dispose();
            mesh.geometry = finish.texture ? projectGeometryInModelSpace(originalGeometry, modelMatrixFor(mesh), metersPerTile) : originalGeometry;
            mesh.material = material;
            mesh.userData.okno = Object.assign(Object.assign({}, (mesh.userData.okno || {})), { finishName: name, finishKind: finish.kind || "surface", finishTexture: finish.texture || "", finishScale: metersPerTile, projection: finish.texture ? "model-face-v2" : "none" });
        }
    };
    const applySelection = (finish, name) => {
        if (!selected.size)
            return;
        pushHistory();
        applyMeshes(selected, finish, name);
        publishSelection();
    };
    const restoreMeshes = (meshes) => {
        for (const mesh of meshes) {
            const original = originalMaterials.get(mesh), originalGeometry = originalGeometries.get(mesh);
            if (original)
                mesh.material = original;
            if (originalGeometry && mesh.geometry !== originalGeometry) {
                mesh.geometry.dispose();
                mesh.geometry = originalGeometry;
            }
            const okno = mesh.userData.okno || {};
            delete okno.finishName;
            delete okno.finishKind;
            delete okno.finishTexture;
            delete okno.finishScale;
            delete okno.projection;
            mesh.userData.okno = okno;
        }
    };
    const categoryCounts = () => {
        const counts = { cladding: 0, timber: 0, roof: 0, frames: 0, deck: 0, foundation: 0 };
        importedMeshes().forEach(mesh => { var _a; const category = (_a = mesh.userData.okno) === null || _a === void 0 ? void 0 : _a.category; if (category && category in counts)
            counts[category]++; });
        return counts;
    };
    const raycaster = new THREE.Raycaster(), pointerDown = new THREE.Vector2(), pointerUp = new THREE.Vector2();
    const pointerPosition = (event, target) => {
        const rect = renderer.domElement.getBoundingClientRect();
        target.set(event.clientX - rect.left, event.clientY - rect.top);
    };
    const onPointerDown = (event) => pointerPosition(event, pointerDown);
    const onPointerUp = (event) => {
        var _a;
        pointerPosition(event, pointerUp);
        if (customerModel || !imported || !importStage.visible || pointerDown.distanceTo(pointerUp) > 5)
            return;
        const rect = renderer.domElement.getBoundingClientRect();
        const ndc = new THREE.Vector2(pointerUp.x / rect.width * 2 - 1, -pointerUp.y / rect.height * 2 + 1);
        raycaster.setFromCamera(ndc, camera);
        const hit = (_a = raycaster.intersectObjects(importedMeshes().filter(mesh => mesh.visible), false)[0]) === null || _a === void 0 ? void 0 : _a.object;
        const multi = event.ctrlKey || event.metaKey || event.shiftKey;
        if (!(hit instanceof THREE.Mesh)) {
            if (!multi)
                clearSelection();
            return;
        }
        const members = groupMembers(hit), allSelected = members.every(mesh => selected.has(mesh));
        if (!multi)
            selected.clear();
        if (multi && allSelected)
            members.forEach(mesh => selected.delete(mesh));
        else
            members.forEach(mesh => selected.add(mesh));
        publishSelection();
    };
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointerup", onPointerUp);
    let frames = 0, previousFrameTime = performance.now();
    const render = () => {
        raf = 0;
        if (disposed || document.hidden) return;
        const now = performance.now(), delta = Math.min(.25, (now - previousFrameTime) / 1000); previousFrameTime = now;
        if (cp && ct) {
            const alpha = 1 - Math.exp(-6 * delta);
            camera.position.lerp(cp, alpha); controls.target.lerp(ct, alpha);
            if (camera.position.distanceTo(cp) < .025 && controls.target.distanceTo(ct) < .025) {
                camera.position.copy(cp); controls.target.copy(ct); cp = ct = null;
            }
        }
        if (animateWater && islandWorld.visible) waterMaterial.uniforms.uTime.value += .012;
        const changed = controls.update(delta);
        renderer.render(scene, camera);
        mount.dataset.renderFrames = String(++frames);
        mount.dataset.drawCalls = String(renderer.info.render.calls);
        mount.dataset.triangles = String(renderer.info.render.triangles);
        if (cp || controls.autoRotate || changed || (animateWater && islandWorld.visible)) invalidate();
    };
    invalidate = () => { if (!disposed && !document.hidden && !mount.dataset.contextLost && !raf) raf = requestAnimationFrame(render); };
    controls.addEventListener("change", invalidate);
    const visibility = () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else invalidate(); };
    document.addEventListener("visibilitychange", visibility);
    renderer.domElement.addEventListener("webglcontextlost", event => { event.preventDefault(); cancelAnimationFrame(raf); raf = 0; mount.dataset.contextLost = "true"; });
    const restored = () => { delete mount.dataset.contextLost; renderer.shadowMap.needsUpdate = true; invalidate(); };
    renderer.domElement.addEventListener("webglcontextrestored", restored);
    invalidate();
    onReady();
    const observer = new ResizeObserver(() => {
        applyViewLimits();
        camera.fov = customerModel && activeHouseView === "inside" ? 70 : innerWidth < 700 ? 48 : 40;
        camera.aspect = mount.clientWidth / Math.max(1, mount.clientHeight); cameraOffset(); camera.updateProjectionMatrix();
        renderer.setSize(mount.clientWidth, mount.clientHeight);
        if (customerModel && imported) {
            const size = new THREE.Box3().setFromObject(imported).getSize(new THREE.Vector3()).multiplyScalar(physicalScale);
            presets = houseViews(size, innerWidth < 700 ? 48 : 40, camera.aspect);
            applyInteriorView();
            if (controls.autoRotate) {
                cp = ct = null;
                camera.position.copy(presets[activeHouseView][0]);
                controls.target.copy(presets[activeHouseView][1]);
                controls.update();
            } else [cp, ct] = presets[activeHouseView].map(v => v.clone());
        }
        invalidate();
    });
    observer.observe(mount);
    const api = {
        finish: (g, f) => { const m = M[g], rep = { cladding: [2.6, 1.5], timber: [2.2, 2.2], roof: [2.2, 1.2], frames: [1, 1], deck: [3.2, 2.4], foundation: [2.4, 2.4] }; if (f.texture) {
            m.map = tex(f.texture, ...rep[g]);
            m.bumpMap = g === "frames" ? null : m.map;
        } m.color.set(f.color); if (f.roughness != null)
            m.roughness = f.roughness; if (f.metalness != null)
            m.metalness = f.metalness; m.needsUpdate = true; },
        surface: (application, finish, name) => {
            const meshes = importedMeshes().filter(mesh => {
                const material = originalMaterials.get(mesh) || mesh.material;
                return !mesh.userData.oknoBackFace && !Array.isArray(material) && material.userData.oknoSurfaces?.includes(application);
            });
            // Projection is cached on each mesh and re-used on subsequent finish choices.
            for (const mesh of meshes) {
                const source = originalMaterials.get(mesh) || mesh.material;
                if (source.userData.oknoBackfaceCeiling) {
                    let back = mesh.userData.oknoCeiling;
                    if (!back) {
                        const backMaterial = source.clone(); backMaterial.side = THREE.BackSide;
                        back = new THREE.Mesh(mesh.geometry, backMaterial); back.userData.oknoBackFace = true; back.name = "Independent ceiling back face";
                        mesh.material = source; source.side = THREE.FrontSide;
                        mesh.add(back); originalMaterials.set(back, backMaterial); originalGeometries.set(back, back.geometry);
                        mesh.userData.oknoCeiling = back;
                    }
                    if (application === "internal-ceiling") {
                        if (!back.userData.oknoProjected) {
                            back.geometry = projectGeometryInModelSpace(originalGeometries.get(back), modelMatrixFor(back), 1);
                            back.userData.oknoProjected = true;
                        }
                        const material = materialFor(finish, name + " ceiling"); material.side = THREE.BackSide;
                        back.material = material;
                        continue;
                    }
                }
                // Include application and culling in the cache key: paired source skins
                // must keep independent finishes and their authored facing direction.
                const material = materialFor(finish, name + " " + application + " " + source.side);
                material.side = source.side;
                if (source.userData.oknoBackfaceCeiling) material.side = THREE.FrontSide;
                if (!mesh.userData.oknoProjected) {
                    const original = originalGeometries.get(mesh) || mesh.geometry;
                    mesh.geometry = projectGeometryInModelSpace(original, modelMatrixFor(mesh), 1);
                    mesh.userData.oknoProjected = true;
                }
                mesh.material = material;
            }
            renderer.shadowMap.needsUpdate = true;
            return meshes.length;
        },
        light: m => { const g = m === "golden"; sun.color.set(g ? "#ffbf78" : "#fff2d2"); sun.intensity = g ? 4.9 : 4.4; sun.position.set(g ? -10 : -8, g ? 6.5 : 13, g ? 12 : 7); hemi.intensity = g ? .92 : 1.25; inside.intensity = g ? 22 : 15; renderer.toneMappingExposure = g ? .96 : 1.02; waterMaterial.uniforms.uWarm.value = g ? 1 : 0; renderer.shadowMap.needsUpdate = true; },
        background: v => { const wasFull = activeBackground === "full-island"; activeBackground = v; const full = v === "full-island"; ground.visible = landscapeProps.visible = !full; islandWorld.visible = full; scene.fog?.color.set(full ? "#afc6c8" : "#cbd1c2"); if (full) {
            rebuildIsland();
            if (!wasFull) {
                const { center } = islandFootprint();
                cp = new THREE.Vector3(center.x + 17, 9.8, center.z + 21);
                ct = new THREE.Vector3(center.x, 1.35, center.z);
                controls.autoRotate = false;
            }
        }
        else {
            disposeIslandLand();
            controls.maxDistance = importStage.visible ? 35 : 22;
            const settings = { meadow: { texture: "/textures/meadow-grass.jpg", color: "#82936d", repeat: 18, bump: .085 }, forest: { texture: "/textures/grass.jpg", color: "#667357", repeat: 20, bump: .1 }, hill: { texture: "/textures/meadow-grass.jpg", color: "#8c986d", repeat: 18, bump: .075 }, island: { texture: "/textures/stone.jpg", color: "#aaa99d", repeat: 15, bump: .12 } }, choice = settings[v], map = tex(choice.texture, choice.repeat, choice.repeat);
            groundMaterial.map = map;
            groundMaterial.bumpMap = map;
            groundMaterial.bumpScale = choice.bump;
            groundMaterial.color.set(choice.color);
            groundMaterial.needsUpdate = true;
        } renderer.shadowMap.needsUpdate = true; },
        moveCamera: (direction, distance = .46) => { cp = ct = null; controls.autoRotate = false; const forward = camera.getWorldDirection(new THREE.Vector3()); forward.y = 0; if (forward.lengthSq() < .0001)
            forward.set(0, 0, -1);
        else
            forward.normalize(); const right = new THREE.Vector3().crossVectors(forward, camera.up).normalize(), delta = direction === "forward" ? forward : direction === "backward" ? forward.negate() : direction === "right" ? right : right.negate(); delta.multiplyScalar(distance); camera.position.add(delta); controls.target.add(delta); controls.update(); },
        view: v => { activeHouseView = v; applyViewLimits(); camera.fov = customerModel && v === "inside" ? 70 : innerWidth < 700 ? 48 : 40; camera.updateProjectionMatrix(); [cp, ct] = presets[v].map(x => x.clone()); controls.autoRotate = false; },
        turn: v => { controls.autoRotate = v; },
        glb: async (f, metersPerUnit = 1) => {
            const gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(await f.arrayBuffer(), "");
            if (disposed) {
                const geometries = new Set(), materials = new Set(), textures = new Set();
                gltf.scene.traverse(o => { if(o.isMesh) { geometries.add(o.geometry); (Array.isArray(o.material)?o.material:[o.material]).forEach(m => materials.add(m)); } });
                materials.forEach(m => { Object.values(m).forEach(t => { if(t?.isTexture) textures.add(t); }); m.dispose(); });
                geometries.forEach(g => g.dispose()); textures.forEach(t => { t.dispose(); t.source.data?.close?.(); });
                throw new DOMException("Aborted", "AbortError");
            }
            physicalScale = metersPerUnit;
            history.length = 0;
            onHistory(0);
            clearSelection();
            disposeImported();
            imported = gltf.scene;
            imported.name = imported.name || "OKNO edited model";
            let parts = 0, triangles = 0, labeled = 0;
            imported.traverse(o => {
                if (!(o instanceof THREE.Mesh))
                    return;
                parts++;
                const geometry = o.geometry;
                triangles += geometry.index ? geometry.index.count / 3 : geometry.getAttribute("position").count / 3;
                const okno = o.userData.okno || {};
                if (okno.category)
                    labeled++;
                if (okno.deleted) {
                    o.visible = false;
                    deleted.add(o);
                }
                for (const material of Array.isArray(o.material) ? o.material : [o.material]) {
                    if (material.userData.oknoGlazing) material.depthWrite = false;
                }
                o.castShadow = (Array.isArray(o.material) ? o.material : [o.material]).some(m => !m.transparent && !(m.transmission > .2)); o.receiveShadow = true;
                originalMaterials.set(o, o.material);
                originalGeometries.set(o, o.geometry);
            });
            importedPixelRatio = Math.min(displayPixelRatio, triangles > 1500000 ? 1 : triangles > 750000 ? 1.15 : triangles > 300000 ? 1.15 : displayPixelRatio);
            renderer.setPixelRatio(importedPixelRatio);
            importStage.add(imported);
            importStage.visible = true;
            cabin.visible = false;
            frameImported();
            renderer.domElement.ariaLabel = "Interactive 3D Signature house";
            mount.dataset.modelLoaded = "true";
            invalidate();
            return { parts, triangles: Math.round(triangles), labeled, categories: categoryCounts() };
        },
        cabin: () => { renderer.setPixelRatio(displayPixelRatio); importStage.visible = false; cabin.visible = true; clearSelection(); [cp, ct] = presets.hero.map(x => x.clone()); rebuildIsland(); renderer.shadowMap.needsUpdate = true; },
        showImported: () => { if (imported) {
            renderer.setPixelRatio(importedPixelRatio);
            importStage.visible = true;
            cabin.visible = false;
            frameImported();
        } },
        clearSelection,
        selectAll: () => { selected.clear(); importedMeshes().forEach(mesh => { if (mesh.visible)
            selected.add(mesh); }); publishSelection(); },
        selectCategory: g => { selected.clear(); importedMeshes().forEach(mesh => { var _a; if (mesh.visible && ((_a = mesh.userData.okno) === null || _a === void 0 ? void 0 : _a.category) === g)
            selected.add(mesh); }); publishSelection(); },
        selectEditGroup: id => { selected.clear(); importedMeshes().forEach(mesh => { var _a; if (mesh.visible && ((_a = mesh.userData.okno) === null || _a === void 0 ? void 0 : _a.editGroupId) === id)
            selected.add(mesh); }); publishSelection(); },
        editGroups,
        groupSelection,
        ungroupSelection,
        addSelectionToGroup,
        deleteEditGroup,
        labelSelection: g => { if (!selected.size)
            return; pushHistory(); selected.forEach(mesh => { mesh.userData.okno = Object.assign(Object.assign({}, (mesh.userData.okno || {})), { category: g }); }); publishSelection(); if (g === "foundation")
            rebuildIsland(); },
        applySelection,
        applyCategory: (g, f, name) => { const meshes = importedMeshes().filter(mesh => { var _a; return mesh.visible && ((_a = mesh.userData.okno) === null || _a === void 0 ? void 0 : _a.category) === g; }); if (!meshes.length)
            return 0; pushHistory(); selected.clear(); meshes.forEach(mesh => selected.add(mesh)); applyMeshes(meshes, f, name); publishSelection(); return meshes.length; },
        restoreSelection: () => { if (!selected.size)
            return; pushHistory(); restoreMeshes(selected); publishSelection(); },
        restoreCategory: g => { const meshes = importedMeshes().filter(mesh => { var _a; return ((_a = mesh.userData.okno) === null || _a === void 0 ? void 0 : _a.category) === g; }); if (!meshes.length)
            return 0; pushHistory(); restoreMeshes(meshes); publishSelection(); return meshes.length; },
        categoryCounts,
        deleteSelection: () => { if (!selected.size)
            return; pushHistory(); selected.forEach(mesh => { mesh.visible = false; mesh.userData.okno = Object.assign(Object.assign({}, (mesh.userData.okno || {})), { deleted: true }); deleted.add(mesh); }); clearSelection(); rebuildIsland(); renderer.shadowMap.needsUpdate = true; },
        restoreDeleted: () => { if (!deleted.size)
            return; pushHistory(); deleted.forEach(mesh => { mesh.visible = true; const okno = mesh.userData.okno || {}; delete okno.deleted; mesh.userData.okno = okno; }); deleted.clear(); publishSelection(); rebuildIsland(); renderer.shadowMap.needsUpdate = true; },
        undo,
        frameImported,
        exportGlb: async () => {
            if (!imported)
                throw new Error("Import a model before exporting.");
            const result = await new GLTFExporter().parseAsync(imported, { binary: true, embedImages: true, onlyVisible: true, maxTextureSize: 2048 });
            if (!(result instanceof ArrayBuffer))
                throw new Error("GLB export did not return binary data.");
            return new Blob([result], { type: "model/gltf-binary" });
        },
        dispose: () => {
            disposed = true;
            cancelAnimationFrame(raf);
            document.removeEventListener("visibilitychange", visibility);
            controls.removeEventListener("change", invalidate);
            renderer.domElement.removeEventListener("webglcontextrestored", restored);
            observer.disconnect();
            controls.dispose();
            controls.removeEventListener("start", stopCameraFlight);
            renderer.domElement.removeEventListener("pointerdown", onPointerDown);
            renderer.domElement.removeEventListener("pointerup", onPointerUp);
            disposeImported();
            appliedMaterials.forEach(material => material.dispose());
            appliedMaterials.clear();
            scene.traverse(o => { if (o instanceof THREE.Mesh) {
                o.geometry.dispose();
                (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m.dispose());
            } });
            cache.forEach(t => t.dispose());
            envTarget.dispose();
            sun.shadow.dispose();
            env.dispose();
            room.dispose();
            pmrem.dispose();
            renderer.dispose();
            renderer.domElement.remove();
        }
    };
    for (const key of ["finish", "surface", "light", "background", "moveCamera", "view", "turn"]) {
        const action = api[key]; api[key] = (...args) => { if (key === "view" || key === "turn") previousFrameTime = performance.now(); const result = action(...args); invalidate(); return result; };
    }
    return api;
}
