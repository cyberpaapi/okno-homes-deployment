import { MATERIAL_FINISHES } from '@/data/configurator/materials';
import { MATERIAL_APPLICATION_IDS, type MaterialApplicationId } from '@/data/configurator/types';
import { exploreVariantId } from '@/data/configurator/studio/variantIds';
import { oknoModels } from '@/data/models';
import type { ContentItem } from './contentCollections';

export const pricingCollection = 'signature.pricing';
export const priceKey = (surface: MaterialApplicationId, finish: string) => surface + '.' + finish;
export const materialsKey = (surface: MaterialApplicationId) => 'materials.' + surface;
export const validRupees = (text: string) => /^\d{1,10}$/.test(text);
export const rupees = (amount: number) => '₹' + amount.toLocaleString('en-IN');
export const pricingFields = [
  { key: 'base', label: 'House base price', kind: 'text' as const },
  ...MATERIAL_APPLICATION_IDS.map(surface => ({ key: materialsKey(surface), label: surface + ' materials', kind: 'json' as const })),
  ...MATERIAL_FINISHES.flatMap(finish => finish.approvedApplications.map(surface => ({
    key: priceKey(surface, finish.id), label: surface + ' / ' + finish.name, kind: 'text' as const,
  }))),
];

export function catalogueBase(slug: string, plans: ContentItem[], variant?: string) {
  const owned = plans.filter(plan => plan.fields.modelId === slug);
  const legacy = oknoModels.find(house => house.slug === slug)?.variants ?? [];
  const prices = owned.length ? owned.map(plan => plan.fields.price) : legacy.map(plan => plan.price.display);
  const index = variant ? prices.findIndex((_, i) => exploreVariantId(slug, i) === variant) : 0;
  const match = prices[index]?.trim().match(/^(?:Indicative\s+)?(?:₹|INR)\s*([\d,]+(?:\.\d+)?)\s*(lakh|crore)?$/i);
  if (!match) return null;
  const units = match[2]?.toLowerCase();
  const value = Math.round(Number(match[1].replaceAll(',', '')) * (units === 'lakh' ? 100000 : units === 'crore' ? 10000000 : 1));
  return Number.isSafeInteger(value) ? value : null;
}

export type PriceSchedule = { base: number | null; rates: Record<string, string> };
/** Missing lists preserve existing catalogues. An explicit empty list offers no finishes. */
export function materialIds(rates: PriceSchedule['rates'], surface: MaterialApplicationId): string[] {
  const approved = MATERIAL_FINISHES.filter(finish => finish.approvedApplications.includes(surface)).map(finish => finish.id);
  const raw = rates[materialsKey(surface)];
  if (raw === undefined || raw === '') return approved;
  try {
    const ids: unknown = JSON.parse(raw);
    return Array.isArray(ids) ? ids.filter((id): id is string => typeof id === 'string' && approved.includes(id)) : [];
  } catch { return []; }
}
export function materialAllowed(rates: PriceSchedule['rates'], surface: MaterialApplicationId, finish: string) {
  return materialIds(rates, surface).includes(finish);
}
export function materialsError(fields: Record<string, string>): string | null {
  for (const surface of MATERIAL_APPLICATION_IDS) {
    const raw = fields[materialsKey(surface)];
    if (raw === undefined || raw === '') continue;
    try {
      const ids: unknown = JSON.parse(raw);
      const approved = MATERIAL_FINISHES.filter(finish => finish.approvedApplications.includes(surface)).map(finish => finish.id);
      if (!Array.isArray(ids) || ids.some(id => typeof id !== 'string' || !approved.includes(id)) || new Set(ids).size !== ids.length) return `Choose unique approved materials for ${surface.replaceAll('-', ' ')}.`;
    } catch { return `Choose valid materials for ${surface.replaceAll('-', ' ')}.`; }
  }
  return null;
}
export function finishPrice(rates: PriceSchedule['rates'], surface: MaterialApplicationId, finish: string) {
  if (!materialAllowed(rates, surface, finish)) return null;
  const raw = rates[priceKey(surface, finish)];
  return raw && validRupees(raw) ? Number(raw) : null;
}
export function estimate(schedule: PriceSchedule, selected: Partial<Record<MaterialApplicationId,string>>, counts: Record<string,number>) {
  let extras = 0;
  let pending = schedule.base === null;
  const lines = MATERIAL_APPLICATION_IDS.map(surface => {
    const available = Boolean(counts[surface]);
    const finish = available ? MATERIAL_FINISHES.find(f => f.id === selected[surface] && f.approvedApplications.includes(surface)) : undefined;
    const amount = finish ? finishPrice(schedule.rates, surface, finish.id) : 0;
    if (amount === null) pending = true;
    else extras += amount;
    return { surface, available, finish, amount };
  });
  return { base: schedule.base, lines, extras, total: pending ? null : schedule.base! + extras };
}
