import {
  ACESFilmicToneMapping,
  DirectionalLight,
  Group,
  HemisphereLight,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Raycaster,
  Scene,
  SRGBColorSpace,
  Texture,
  TextureLoader,
  Vector2,
  Vector3,
  WebGLRenderer,
  type Material,
  type BufferGeometry,
  RepeatWrapping,
  Matrix4,
  DoubleSide,
  FrontSide,
  BackSide,
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { PMREMGenerator } from "three";
import { MATERIAL_FINISHES } from "@/data/configurator";
import { finishImage, type StudioFinish } from "@/data/configurator/studio/finishes";
import type { Surface } from "@/data/configurator/studio/catalogue";
import pbrLuminance from "@/data/configurator/studio/pbrLuminance.json";
import { finishRendering, addFinishRelief } from "./finishRendering";
import { createCustomerSetting, type CustomerLighting } from "./customerSetting";
import { structureBounds } from "./frameBounds";
import { projectGeometryInModelSpace } from "../materialProjection";
export type SceneState = {
  view?: "exterior" | "interior";
  activeSurface?: string;
  roofAssembly?: number[];
  finishes?: readonly StudioFinish[];
  groups: Surface[];
  choices: Record<string, string>;
  selected: number[];
  isolate: boolean;
  original: boolean;
};
export type StudioController = {
  update: (state: SceneState) => void;
  fit: () => void;
  dispose: () => void;
  lighting?: (mode: CustomerLighting) => void;
};
export async function createStudioScene(
  canvas: HTMLCanvasElement,
  url: string,
  signal: AbortSignal,
  onProgress: (value: number) => void,
  onPick: (id: number, add: boolean) => void,
  onMaterialError: (message: string | null) => void = () => {},
  customer = false,
): Promise<StudioController> {
  let disposed = false,
    revision = 0;
  let currentView = "exterior", currentSurface = "";
  const renderer = new WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  const scene = new Scene(),
    camera = new PerspectiveCamera(38, 1, 0.01, 1000);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = false;
  controls.enablePan = true;
  const stage = new Group();
  scene.add(stage);
  const ambient = new HemisphereLight(0xf1f0e8, 0x333d36, .8);
  scene.add(ambient);
  const key = new DirectionalLight(0xffefd5, 2.6);
  key.position.set(5, 10, 8);
  scene.add(key);
  const fill = new DirectionalLight(0xbbd9df, .7);
  fill.position.set(-8, 5, -3);
  scene.add(fill);
  const room = new RoomEnvironment(),
    pmrem = new PMREMGenerator(renderer),
    env = pmrem.fromScene(room);
  scene.environment = env.texture;
  room.dispose();
  pmrem.dispose();
  const meshes = new Map<number, Mesh[]>(),
    originals = new Map<Mesh, Material | Material[]>();
  const textures = new Set<Texture>(),
    materials = new Set<Material>(),
    geometries = new Set<BufferGeometry>();
  const loadedMaterials = new Map<
    string,
    Promise<MeshStandardMaterial | null>
  >();
  const projected = new Set<Mesh>();
  const undersides = new Map<Mesh, Mesh>();
  const sidedMaterials = new Map<string, MeshStandardMaterial>();
  const sided = (material: MeshStandardMaterial, side: typeof FrontSide | typeof BackSide) => {
    const key = material.uuid + ":" + side;
    if (!sidedMaterials.has(key)) { const copy = material.clone(); copy.onBeforeCompile = material.onBeforeCompile; copy.customProgramCacheKey = material.customProgramCacheKey; copy.side = side; sidedMaterials.set(key, copy); materials.add(copy); }
    return sidedMaterials.get(key)!;
  };
  const highlight = new MeshStandardMaterial({
    color: 0xc1a568,
    emissive: 0x6e5424,
    emissiveIntensity: 0.65,
    roughness: 0.65,
    side: DoubleSide,
  });
  materials.add(highlight);
  let renderFrame = 0;
  const render = () => {
    if (disposed) return;
    if (!customer) { renderer.render(scene, camera); return; }
    if (renderFrame) return;
    renderFrame = requestAnimationFrame(() => {
      renderFrame = 0;
      if (!disposed) renderer.render(scene, camera);
    });
  };
  const setting = customer ? createCustomerSetting(scene, renderer, render) : null;
  if (setting) { ambient.visible = key.visible = fill.visible = false; }
  const resize = () => {
    if (disposed) return;
    const w = Math.max(1, canvas.clientWidth),
      h = Math.max(1, canvas.clientHeight);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    render();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  controls.addEventListener("change", render);
  const fit = () => {
    const box = structureBounds(stage),
      size = box.getSize(new Vector3()),
      center = box.getCenter(new Vector3());
    const radius = size.length() * 0.5;
    const distance =
      (radius /
        Math.sin(
          Math.min(
            (camera.fov * Math.PI) / 360,
            Math.atan(Math.tan((camera.fov * Math.PI) / 360) * camera.aspect),
          ),
        )) *
      1.05;
    const ceiling = currentView === "interior" && currentSurface === "internal-ceiling";
    camera.position.copy(center).add(
      new Vector3(1, ceiling ? -.9 : currentView === "interior" ? 1.9 : customer ? .36 : .6, 1.25).normalize().multiplyScalar(distance),
    );
    controls.target.copy(center);
    controls.maxPolarAngle = customer && currentView === "exterior" ? Math.PI / 2.05 : Math.PI;
    controls.minDistance = radius * 0.15;
    controls.maxDistance = radius * 12;
    camera.near = Math.max(0.001, radius / 1000);
    camera.far = radius * 100;
    camera.updateProjectionMatrix();
    controls.update();
    render();
  };
  const ray = new Raycaster(),
    pointer = new Vector2();
  let down = [0, 0];
  const pointerDown = (e: PointerEvent) => {
    down = [e.clientX, e.clientY];
  };
  const pointerUp = (e: PointerEvent) => {
    if (
      Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 5 ||
      e.button !== 0
    )
      return;
    const rect = canvas.getBoundingClientRect();
    pointer.set(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      (-(e.clientY - rect.top) / rect.height) * 2 + 1,
    );
    ray.setFromCamera(pointer, camera);
    const hit = ray.intersectObjects(
      [...originals.keys()].filter((m) => m.visible),
      false,
    )[0];
    if (hit)
      onPick(
        hit.object.userData.studioPart,
        e.shiftKey || e.ctrlKey || e.metaKey,
      );
  };
  canvas.addEventListener("pointerdown", pointerDown);
  canvas.addEventListener("pointerup", pointerUp);
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(renderFrame);
    revision++;
    observer.disconnect();
    controls.dispose();
    canvas.removeEventListener("pointerdown", pointerDown);
    canvas.removeEventListener("pointerup", pointerUp);
    signal.removeEventListener("abort", dispose);
    for (const g of geometries) g.dispose();
    for (const m of materials) m.dispose();
    for (const t of textures) t.dispose();
    setting?.dispose();
    env.dispose();
    scene.clear();
    renderer.dispose();
    renderer.forceContextLoss();
  };
  signal.addEventListener("abort", dispose, { once: true });
  try {
    resize();
    const response = await fetch(url, { signal });
    if (!response.ok) throw new Error("The 3D model could not be loaded.");
    const total = Number(response.headers.get("x-model-bytes") || response.headers.get("content-length")),
      reader = response.body?.getReader();
    if (!reader) throw new Error("Model stream unavailable.");
    const chunks: Uint8Array[] = [];
    let received = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      received += value.byteLength;
      onProgress(total ? Math.min(1, received / total) : 0);
    }
    const bytes = new Uint8Array(received);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    chunks.length = 0;
    if (signal.aborted) throw new DOMException("Aborted", "AbortError");
    const gltf = await new GLTFLoader().parseAsync(bytes.buffer, "");
    gltf.scene.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      if (customer) {
        const list = Array.isArray(object.material) ? object.material : [object.material];
        object.castShadow = list.some(m => !(m.transparent && m.opacity < .8) && !("transmission" in m && Number(m.transmission) > .2));
        object.receiveShadow = true;
      }
      geometries.add(object.geometry);
      for (const material of Array.isArray(object.material)
        ? object.material
        : [object.material]) {
        materials.add(material);
        for (const v of Object.values(material))
          if (v instanceof Texture) textures.add(v);
      }
      let node = object;
      let id: number | undefined;
      while (node) {
        id = gltf.parser.associations.get(node)?.nodes;
        if (id !== undefined) break;
        node = node.parent as Mesh;
      }
      if (id !== undefined) {
        object.userData.studioPart = id;
        meshes.set(id, [...(meshes.get(id) || []), object]);
        originals.set(object, object.material);
      }
    });
    if (disposed) {
      for (const g of geometries) g.dispose();
      for (const m of materials) m.dispose();
      for (const t of textures) t.dispose();
      throw new DOMException("Aborted", "AbortError");
    }
    stage.add(gltf.scene);
    const box = structureBounds(stage),
      size = box.getSize(new Vector3());
    const factor = 12 / Math.max(size.x, size.y, size.z);
    gltf.scene.scale.multiplyScalar(factor);
    const bounds = structureBounds(stage),
      center = bounds.getCenter(new Vector3());
    // Position the supplied house on the fixed site; source vertices stay unchanged.
    if (customer) center.y = bounds.min.y;
    gltf.scene.position.sub(center);
    stage.updateMatrixWorld(true);
    setting?.place(structureBounds(stage));
    if (setting && !await setting.ready) throw new Error("The landscape could not load. Retry the 3D preview.");
    if (disposed) throw new DOMException("Aborted", "AbortError");
    fit();
    const textureCache = new Map<string, Promise<Texture>>();
    const resolvedTextures = new Map<string, Texture>();
    const finishMaterials = new Map<string, MeshStandardMaterial>();
    const pendingFinishes = new Set<string>();
    const anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    const loadTexture = (url: string, color: boolean, repeat: number, rotation = 0) => {
      const key = `${url}:${color}:${repeat}:${rotation}`;
      if (!textureCache.has(key)) {
        const promise = new TextureLoader().loadAsync(url).then(texture => {
          if (disposed) { texture.dispose(); throw new Error("Scene disposed"); }
          if (color) texture.colorSpace = SRGBColorSpace;
          texture.wrapS = texture.wrapT = RepeatWrapping;
          texture.repeat.setScalar(repeat);
          texture.rotation = rotation;
          texture.anisotropy = anisotropy;
          textures.add(texture);
          resolvedTextures.set(key, texture);
          return texture;
        }).catch(error => { textureCache.delete(key); throw error; });
        textureCache.set(key, promise);
      }
      return textureCache.get(key)!;
    };
    const loadFinish = (id: string, library: readonly StudioFinish[]) => {
      if (loadedMaterials.has(id)) return loadedMaterials.get(id)!;
      const finish = library.find((f) => f.id === id);
      if (!finish) return Promise.resolve(null);
      const profile = finishRendering(finish);
      pendingFinishes.add(id);
      const promise = (async () => {
        const root = `/configurator/pbr/v1/${profile.asset}`;
        const rotation = profile.relief === "slats" ? Math.PI / 2 : 0;
        const [map, normalMap, roughnessMap] = profile.asset
          ? await Promise.all([
            loadTexture(`${root}/Color.webp`, true, profile.repeat, rotation),
            loadTexture(`${root}/NormalGL.webp`, false, profile.repeat, rotation),
            loadTexture(`${root}/Roughness.webp`, false, profile.repeat, rotation),
          ])
          : [profile.relief === "seams" ? null : await loadTexture(finishImage(id), true, profile.repeat), null, null];
        if (disposed) return null;
        const material = new MeshStandardMaterial({
          map, normalMap, roughnessMap,
          // Source samples remain the fallback for custom and specific roof patterns.
          bumpMap: !profile.asset && profile.relief === "none" ? map : null,
          bumpScale: finish.family === "thatched-roof" ? .045 : .012,
          roughness: profile.roughness,
          metalness: profile.metalness,
          envMapIntensity: .7,
          polygonOffset: true,
          polygonOffsetFactor: -1,
          polygonOffsetUnits: -1,
          side: DoubleSide,
        });
        material.normalScale.setScalar(profile.normal);
        addFinishRelief(material, profile, pbrLuminance[profile.asset as keyof typeof pbrLuminance]);
        material.userData.finishId = id;
        materials.add(material);
        finishMaterials.set(id, material);
        return material;
      })().catch(() => { loadedMaterials.delete(id); return null; }).finally(() => pendingFinishes.delete(id));
      loadedMaterials.set(id, promise);
      return promise;
    };
    const releaseUnusedFinishes = (state: SceneState) => {
      if (pendingFinishes.size) return;
      const keep = new Set(state.groups.filter(g => g.enabled).map(g => state.choices[g.id] || g.defaultFinish));
      // A failed replacement keeps the last visible material until retry succeeds.
      for (const mesh of [...originals.keys(), ...undersides.values()]) {
        for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
          if (material.userData.finishId) keep.add(material.userData.finishId);
        }
      }
      for (const [id, material] of finishMaterials) {
        if (keep.has(id)) continue;
        material.dispose(); materials.delete(material); finishMaterials.delete(id); loadedMaterials.delete(id);
      }
      for (const [key, material] of sidedMaterials) {
        if (keep.has(material.userData.finishId)) continue;
        material.dispose(); materials.delete(material); sidedMaterials.delete(key);
      }
      const used = new Set<Texture>();
      for (const material of materials) for (const value of Object.values(material)) if (value instanceof Texture) used.add(value);
      for (const [key, texture] of resolvedTextures) {
        if (used.has(texture)) continue;
        texture.dispose(); textures.delete(texture); resolvedTextures.delete(key); textureCache.delete(key);
      }
      canvas.dataset.finishTextureCount = String(resolvedTextures.size);
    };
    let lastShadowState = "";
    const update = (state: SceneState) => {
      const current = ++revision,
        selected = new Set(state.selected);
      const viewChanged = currentView !== (state.view || "exterior") || (currentSurface === "internal-ceiling") !== (state.activeSurface === "internal-ceiling");
      currentView = state.view || "exterior";
      currentSurface = state.activeSurface || "";
      setting?.cutaway(currentView === "interior" || state.isolate);
      const hiddenRoof = new Set(currentView === "interior" ? state.roofAssembly : []);
      const ceilingParts = new Set(state.groups.find(g => g.id === "internal-ceiling")?.parts || []);
      const ceilingView = currentView === "interior" && currentSurface === "internal-ceiling";
      if (ceilingView) for (const id of ceilingParts) hiddenRoof.delete(id);
      const grouped = new Set(state.groups.filter(g => g.enabled).flatMap(g => g.parts));
      const backParts = new Set(state.groups.filter(g => g.enabled && g.side === "back").flatMap(g => g.parts));
      const apply = (finishes: Map<string, MeshStandardMaterial | null>) => {
        if (disposed || current !== revision) return;
        for (const underside of undersides.values()) underside.visible = false;
        for (const [mesh, material] of originals) {
          if (state.original || !grouped.has(mesh.userData.studioPart)) mesh.material = material;
          mesh.visible =
            (!ceilingView || ceilingParts.has(mesh.userData.studioPart)) && !hiddenRoof.has(mesh.userData.studioPart) && (!state.isolate ||
            selected.size === 0 ||
            selected.has(mesh.userData.studioPart));
        }
        if (!state.original)
          for (const group of state.groups) {
            if (!group.enabled) continue;
            const material = finishes.get(
              state.choices[group.id] || group.defaultFinish,
            );
            if (!material) continue;
            for (const id of group.parts)
              for (const mesh of meshes.get(id) || []) {
                if (!projected.has(mesh)) {
                  const geometry = projectGeometryInModelSpace(
                    mesh.geometry,
                    new Matrix4().copy(mesh.matrixWorld),
                    1,
                  );
                  geometries.add(geometry);
                  mesh.geometry = geometry;
                  projected.add(mesh);
                }
                if (group.side === "back") {
                  let underside = undersides.get(mesh);
                  if (!underside) {
                    underside = new Mesh(mesh.geometry, sided(material, BackSide));
                    underside.receiveShadow = customer;
                    underside.matrix.copy(mesh.matrix); underside.matrixAutoUpdate = false;
                    mesh.parent?.add(underside); undersides.set(mesh, underside);
                  }
                  underside.material = sided(material, BackSide);
                  underside.visible = !state.isolate && (!hiddenRoof.has(id) || ceilingView);
                  if (ceilingView) mesh.visible = false;
                } else mesh.material = backParts.has(id) ? sided(material, FrontSide) : material;
              }
          }
        for (const id of selected)
          for (const mesh of meshes.get(id) || []) mesh.material = highlight;
        const shadowState = JSON.stringify([currentView, ceilingView, state.isolate, state.isolate ? state.selected : [], state.original]);
        if (shadowState !== lastShadowState) { setting?.invalidate(); lastShadowState = shadowState; }
        render();
        if (finishes.size || state.original) {
          canvas.dataset.materialChoices = JSON.stringify(state.choices);
          canvas.dataset.materialRevision = String(current);
        }
      };
      if (state.original) onMaterialError(null);
      apply(new Map());
      if (viewChanged) fit();
      if (!state.original)
        void Promise.all(
          state.groups
            .filter((g) => g.enabled)
            .map(async (g) => {
              const id = state.choices[g.id] || g.defaultFinish;
              return [id, await loadFinish(id, state.finishes || MATERIAL_FINISHES)] as const;
            }),
        ).then((entries) => {
          if (disposed || current !== revision) return;
          onMaterialError(entries.some(([, material]) => !material) ? "A material sample could not load. Retry to finish updating your preview." : null);
          apply(new Map(entries));
          releaseUnusedFinishes(state);
        });
    };
    return { update, fit, dispose, lighting: setting ? mode => { setting.lighting(mode); render(); } : undefined };
  } catch (error) {
    dispose();
    throw error;
  }
}
