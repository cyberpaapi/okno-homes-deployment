/** Natural Earth 1:50m admin-0 countries (public domain).
 * Source: https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_50m_admin_0_countries.geojson
 * Usage: node scripts/build-projects-cartography.mjs /path/to/source.geojson
 * Simplifies to sub-pixel geographic detail at the atlas's 435px diameter.
 */
import fs from 'node:fs';
import { geoArea, geoOrthographic, geoPath, geoGraticule10 } from 'd3';
const source = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
function simplify(points, tolerance = .075) {
  if (points.length < 3) return points;
  const a = points[0], b = points.at(-1), dx = b[0] - a[0], dy = b[1] - a[1], length = dx * dx + dy * dy;
  let furthest = 0, at = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const p = points[i], t = length ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / length)) : 0;
    const distance = (p[0] - a[0] - t * dx) ** 2 + (p[1] - a[1] - t * dy) ** 2;
    if (distance > furthest) { furthest = distance;at = i; }
  }
  return furthest > tolerance ** 2 ? [...simplify(points.slice(0, at + 1), tolerance).slice(0, -1), ...simplify(points.slice(at), tolerance)] : [a, b];
}
function ring(points) {
  const result = simplify(points);
  const rounded = (result.length < 4 ? points : result).map(p => p.map(x => Math.round(x * 10000) / 10000));
  const area = coordinates => geoArea({ type: 'Polygon', coordinates: [coordinates] });
  // A tiny ring can reverse winding after rounding. D3 then fills the globe's
  // complement, so preserve its original geometry when that happens.
  return (area(points) > Math.PI) !== (area(rounded) > Math.PI) ? points : rounded;
}
const geography = { type: 'FeatureCollection', features: source.features.map(feature => ({ type: 'Feature', properties: {}, geometry: { type: feature.geometry.type, coordinates: feature.geometry.type === 'MultiPolygon' ? feature.geometry.coordinates.map(p => p.map(ring)) : feature.geometry.coordinates.map(ring) } })) };
const output = 'public/assets/projects/atlas';
fs.writeFileSync(`${output}/countries-50m.geojson`, JSON.stringify(geography));
const path = geoPath(geoOrthographic().translate([250, 250]).scale(247).rotate([-73.407, -18.754, 0]));
fs.writeFileSync(`${output}/graphite-poster.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500"><path d="${path({ type: 'Sphere' })}" fill="#f4f3ee" stroke="#a8a59b" stroke-width=".65"/><path d="${path(geography)}" fill="#d8ddcd" stroke="#89927d" stroke-width=".55"/><path d="${path(geoGraticule10())}" fill="none" stroke="#88857c" opacity=".24" stroke-width=".5"/></svg>`);
console.log(`Built ${geography.features.length} geographical features; ${fs.statSync(`${output}/countries-50m.geojson`).size} bytes.`);
