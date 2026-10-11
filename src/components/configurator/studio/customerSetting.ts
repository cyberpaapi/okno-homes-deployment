import { Color, DirectionalLight, EquirectangularReflectionMapping, Fog, HemisphereLight, PCFSoftShadowMap, PMREMGenerator, Scene, Vector3, type Box3, type Texture, type WebGLRenderer, type WebGLRenderTarget } from "three";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { Sky } from "three/addons/objects/Sky.js";
import { createWoodland } from "./woodlandScene";
export type CustomerLighting = "day" | "golden";

// The house occupies a separate scene group; this shared site has no model IDs.
export function createCustomerSetting(scene: Scene, renderer: WebGLRenderer, render: () => void) {
  let disposed = false;
  let interiorView = false;
  let environment: WebGLRenderTarget | undefined;
  let outdoorEnvironment: WebGLRenderTarget | undefined;
  let hdr: Texture | undefined;
  const sky = new Sky();
  sky.scale.setScalar(450);
  const uniforms = sky.material.uniforms;
  uniforms.turbidity.value = 5;
  uniforms.mieCoefficient.value = .004;
  uniforms.mieDirectionalG.value = .8;
  const sun = new DirectionalLight("#fff2dc", 3.2);
  sun.castShadow = true;
  sun.shadow.mapSize.setScalar(matchMedia("(max-width: 700px)").matches ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -22, right: 22, top: 22, bottom: -22, near: .1, far: 85 });
  sun.shadow.camera.updateProjectionMatrix();
  sun.shadow.bias = -.00012;
  sun.shadow.normalBias = .025;
  const ambient = new HemisphereLight("#e4efff", "#655746", .8);
  scene.add(sky, sun, sun.target, ambient);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
  // Reuse shadows during orbit; refresh only for objects, cutaways and lighting.
  renderer.shadowMap.autoUpdate = false;
  const invalidate = () => { renderer.shadowMap.needsUpdate = true; };
  const woodland = createWoodland(renderer, () => { if(!disposed){invalidate();render();} });
  scene.add(woodland.root);
  const lighting = (mode: CustomerLighting) => {
    const golden = mode === "golden";
    const direction = new Vector3(-.65, golden ? .4 : .95, .7).normalize();
    sun.position.copy(direction).multiplyScalar(35);
    sun.color.set(golden ? "#ffd2a0" : "#fff2dc");
    sun.intensity = golden ? 3.5 : 3.2;
    ambient.intensity = golden ? .75 : 1.05;
    uniforms.sunPosition.value.copy(direction);
    uniforms.rayleigh.value = golden ? 2.4 : 1.6;
    scene.fog = new Fog(golden ? "#d2d2bb" : "#d4deda", 40, 100);
    renderer.toneMappingExposure = golden ? .94 : 1.02;
    if (outdoorEnvironment) {
      scene.environment = outdoorEnvironment.texture;
      scene.environmentIntensity = .8;
      invalidate(); return;
    }
    const generator = new PMREMGenerator(renderer), environmentScene = new Scene();
    const visible = sky.visible;
    sky.visible = true;
    environmentScene.add(sky);
    const next = generator.fromScene(environmentScene, .04, .1, 600);
    scene.add(sky); sky.visible = visible;
    environment?.dispose(); environment = next;
    scene.environment = next.texture;
    scene.environmentIntensity = .65;
    generator.dispose(); invalidate();
  };
  lighting("day");
  // HDR supplies reflections only. Everything visible around the house is geometry.
  void new RGBELoader().loadAsync("/configurator/environments/spruit-sunrise-2k.hdr").then(texture => {
    if (disposed) { texture.dispose(); return; }
    hdr = texture; texture.mapping = EquirectangularReflectionMapping;
    const generator = new PMREMGenerator(renderer);
    outdoorEnvironment = generator.fromEquirectangular(texture); generator.dispose();
    scene.environment = outdoorEnvironment.texture; scene.environmentIntensity = .8;
    render();
  }).catch(() => { /* Procedural sky lighting remains available offline. */ });
  return {
    ready: woodland.ready,
    lighting,
    invalidate,
    place(bounds: Box3) { woodland.root.position.y = bounds.min.y - .025; woodland.root.updateMatrixWorld(true); invalidate(); },
    cutaway(interior: boolean) {
      if(interior === interiorView)return;
      interiorView = interior;
      woodland.root.visible = sky.visible = !interior;
      scene.background = interior ? new Color("#18221e") : null;
      invalidate();
    },
    dispose() {
      disposed = true; woodland.dispose(); scene.remove(sky, sun, sun.target, ambient);
      sky.geometry.dispose(); sky.material.dispose();
      environment?.dispose(); outdoorEnvironment?.dispose(); hdr?.dispose(); sun.shadow.dispose();
    },
  };
}
