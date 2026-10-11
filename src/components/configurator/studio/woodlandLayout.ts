export type LandscapePlacement = { x: number; z: number; height: number; rotation: number };
const random = (seed: number) => { const n = Math.sin(seed * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); };
export function terrainHeight(x: number, z: number) {
  const edge = Math.min(1, Math.max(0, (Math.hypot(x, z) - 10) / 14));
  if (edge === 0) return 0;
  return edge * edge * (.65 * Math.sin(x * .16) + .85 * Math.cos(z * .13) + .4 * Math.sin((x + z) * .22));
}
// Fixed coordinates/seeds keep the site identical across house models and reloads.
export function woodlandLayout() {
  const trees: LandscapePlacement[] = Array.from({ length: 28 }, (_, i) => {
    const angle = (100 + i * 9.1) * Math.PI / 180;
    const radius = 18 + random(i + 3) * 15;
    return { x: Math.cos(angle) * radius, z: Math.sin(angle) * radius, height: 10 + random(i + 40) * 8, rotation: random(i + 70) * Math.PI * 2 };
  });
  const rocks: LandscapePlacement[] = [[-8, 6], [-9, 5], [-10, 7], [8, -7], [9, -8], [-7, -10], [12, 10], [14, 11], [-12, -13], [16, -5], [-8, 10], [11, -12]].map(([x,z],i) => ({x,z,height:.55+random(i+90)*.85,rotation:random(i+100)*Math.PI*2}));
  const plants = (count: number, seed: number, low: number, high: number) => Array.from({length:count}, (_,i) => {
    const a=random(i+seed)*Math.PI*2, radius=9+random(i+seed+count)*19;
    return {x:Math.cos(a)*radius,z:Math.sin(a)*radius,height:low+random(i+seed+count*2)*(high-low),rotation:random(i+seed+count*3)*Math.PI*2};
  }).filter(p => !(p.z>0 && Math.abs(p.x-(9+Math.sin(p.z*.12)*2))<1.8));
  return {trees,rocks,ferns:plants(48,210,.45,.95),grass:plants(260,810,.22,.55)};
}
