import type { ContentItem } from './contentCollections';
import finishes from '@/data/configurator/antigravity/finishes.json';
import assets from '@/data/configurator/signatureAssetManifest.json';

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
  if (fields.configuratorSource && !/^[a-z0-9-]{1,80}$/.test(fields.configuratorSource)) return 'Choose a model from the house library.';
  if (fields.configuratorSource && fields.configuratorModel) return 'Choose either a linked model or an uploaded GLB.';
  if (fields.configuratorModel && !validModelPath(fields.configuratorModel)) return 'Upload a self-contained GLB model or choose a local .glb path.';
  if (fields.configuratorScale && (!Number.isFinite(Number(fields.configuratorScale)) || Number(fields.configuratorScale) < .0001 || Number(fields.configuratorScale) > 1000)) return '3D model scale must be between 0.0001 and 1000 metres per unit.';
  const assigned = new Set<string>();
  for (const [zone, label] of configuratorZones) {
    const value = fields[`finish_${zone}`];
    if (value && !finishes.some(f => f.id === value && f.apps.includes(zone))) return `Choose an available ${label.toLowerCase()} finish.`;
    if ((fields[`meshes_${zone}`] ?? '').length > 4000) return `The ${label.toLowerCase()} mesh list is too long.`;
    for (const name of new Set((fields[`meshes_${zone}`] || '').split('\n').map(value => value.trim()).filter(Boolean))) {
      if (assigned.has(name)) return `Mesh ${name} is assigned to more than one surface. Use separate meshes for independent finishes.`;
      assigned.add(name);
    }
  }
  return null;
}
export function resolveConfigurator(model: ContentItem, roster: ContentItem[] = [], visited = new Set<string>()): ConfiguratorSettings | null {
  const fields = model.fields;
  if (visited.has(model.id)) return null;
  visited.add(model.id);
  if (fields.configuratorMode === 'legacy') return null;
  if (configuratorSettingsError(fields)) return null;
  if (fields.configuratorSource) {
    const source = roster.find(item => item.id === fields.configuratorSource) ??
      (Object.hasOwn(assets, fields.configuratorSource) ? { id: fields.configuratorSource, fields: {} } : undefined);
    const linked = source && resolveConfigurator(source, roster, visited);
    if (!linked) return null;
    return { ...linked, slug: model.id, name: fields.name || model.id,
      defaults: Object.fromEntries(configuratorZones.map(([zone]) => [zone, fields[`finish_${zone}`] || linked.defaults[zone] || ''])),
    };
  }
  const builtIn = Object.hasOwn(assets, model.id) ? assets[model.id as keyof typeof assets] : undefined;
  const custom = fields.configuratorModel;
  if (configuratorSettingsError(fields) || (!custom && !builtIn)) return null;
  return {
    slug: model.id, name: fields.name || model.id,
    profile: custom ? 'custom' : model.id,
    url: custom || builtIn!.url, scale: Number(fields.configuratorScale || builtIn?.metersPerUnit || 1),
    defaults: Object.fromEntries(configuratorZones.map(([zone]) => [zone, fields[`finish_${zone}`] || ''])),
    mapping: Object.fromEntries(configuratorZones.map(([zone]) => [zone, (fields[`meshes_${zone}`] || '').split('\n').map(s => s.trim()).filter(Boolean)])),
  };
}
