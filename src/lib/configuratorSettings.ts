import type { ContentItem } from './contentCollections';
import finishes from '@/data/configurator/antigravity/finishes.json';
import assets from '@/data/configurator/antigravity/assets.json';

export const configuratorZones = [
  ['ext_roof', 'External roof'], ['ext_wall', 'External wall'], ['flooring', 'Flooring'],
  ['int_ceiling', 'Internal ceiling'], ['int_wall', 'Internal wall'],
] as const;
export const configuratorFinishes = finishes;
export type ConfiguratorSettings = {
  slug: string; name: string; profile: string; url: string; scale: number;
  defaults: Record<string, string>; mapping: Record<string, string[]>;
};
export function validModelPath(value: string) {
  return /^\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_.-]+\.glb$/.test(value) && !value.includes('..');
}
export function configuratorSettingsError(fields: Record<string, string>): string | null {
  if (fields.configuratorModel && !validModelPath(fields.configuratorModel)) return 'Upload a self-contained GLB model or choose a local .glb path.';
  if (fields.configuratorScale && (!Number.isFinite(Number(fields.configuratorScale)) || Number(fields.configuratorScale) < .0001 || Number(fields.configuratorScale) > 1000)) return '3D model scale must be between 0.0001 and 1000 metres per unit.';
  for (const [zone, label] of configuratorZones) {
    const value = fields[`finish_${zone}`];
    if (value && !finishes.some(f => f.id === value && f.apps.includes(zone))) return `Choose an available ${label.toLowerCase()} finish.`;
    if ((fields[`meshes_${zone}`] ?? '').length > 4000) return `The ${label.toLowerCase()} mesh list is too long.`;
  }
  return null;
}
export function resolveConfigurator(model: ContentItem): ConfiguratorSettings | null {
  const fields = model.fields;
  if (fields.configuratorMode === 'legacy') return null;
  const builtIn = Object.hasOwn(assets, model.id) ? assets[model.id as keyof typeof assets] : undefined;
  const custom = fields.configuratorModel;
  if (configuratorSettingsError(fields) || (!custom && !builtIn)) return null;
  return {
    slug: model.id, name: fields.name || model.id,
    profile: custom ? 'custom' : model.id,
    url: custom || builtIn!.url, scale: Number(fields.configuratorScale || 1),
    defaults: Object.fromEntries(configuratorZones.map(([zone]) => [zone, fields[`finish_${zone}`] || ''])),
    mapping: Object.fromEntries(configuratorZones.map(([zone]) => [zone, (fields[`meshes_${zone}`] || '').split('\n').map(s => s.trim()).filter(Boolean)])),
  };
}
