'use client';

import { useState } from 'react';
import { MATERIAL_FINISHES } from '@/data/configurator/materials';
import { MATERIAL_APPLICATION_IDS, type MaterialApplicationId } from '@/data/configurator/types';
import assets from '@/data/configurator/signatureAssetManifest.json';
import { resolveConfigurator } from '@/lib/configuratorSettings';
import { catalogueBase, materialIds, materialsKey, priceKey, rupees } from '@/lib/configuratorPricing';
import type { ContentItem } from '@/lib/contentCollections';
import styles from './SignatureModelPanel.module.css';

export default function ConfiguratorPrices({ roster, plans, items, disabled, onChange }: {
  roster: ContentItem[]; plans: ContentItem[]; items: ContentItem[]; disabled: boolean; onChange: (value: ContentItem[]) => void;
}) {
  const houses = new Map(Object.keys(assets).map(id => [id, id.charAt(0).toUpperCase() + id.slice(1)]));
  for (const house of roster) if (resolveConfigurator(house, roster)) houses.set(house.id, house.fields.name || house.id);
  const [chosenHouse, setHouse] = useState('forza');
  const house = houses.has(chosenHouse) ? chosenHouse : houses.keys().next().value ?? '';
  const [surface, setSurface] = useState<MaterialApplicationId>('external-wall');
  const fields = items.find(item => item.id === house)?.fields ?? {};
  const fallback = catalogueBase(house, plans);
  const assigned = materialIds(fields, surface);
  const approved = MATERIAL_FINISHES.filter(f => f.approvedApplications.includes(surface));
  const unassigned = approved.filter(f => !assigned.includes(f.id));
  const [adding, setAdding] = useState('');
  function change(key: string, value: string) {
    const next = { ...fields };
    if (value === '') delete next[key]; else next[key] = value;
    const other = items.filter(item => item.id !== house);
    onChange(Object.keys(next).length ? [...other, { id: house, fields: next }] : other);
  }
  function assign(ids: string[]) { change(materialsKey(surface), JSON.stringify(ids)); setAdding(''); }
  return <div className={styles.body}>
    <p className={styles.note}>Choose a house, assign its approved materials to each component, and enter the price adjustment for each material. Save, then Publish to update the customer configurator.</p>
    <label>House<select aria-label="House" value={house} disabled={disabled} onChange={e => { setHouse(e.target.value); setAdding(''); }}>{Array.from(houses, ([id, name]) => <option value={id} key={id}>{name}</option>)}</select></label>
    <label>House base price (INR)<input type="number" min="0" max="9999999999" step="1" disabled={disabled} value={fields.base ?? ''} onChange={e => change('base', e.target.value)} placeholder={fallback === null ? 'Price on request' : rupees(fallback)} />
      <small>Sets one base for this house. Leave blank to use the selected plan’s published starting price.</small></label>
    <label>Component<select aria-label="Component" value={surface} disabled={disabled} onChange={e => { setSurface(e.target.value as MaterialApplicationId); setAdding(''); }}>{MATERIAL_APPLICATION_IDS.map(id => <option key={id} value={id}>{id.replaceAll('-', ' ')}</option>)}</select></label>
    <p className={styles.note}>Enter the additional INR amount for the whole component. Zero means included. A blank finish price requires confirmation.</p>
    {approved.filter(f => assigned.includes(f.id)).map(f => {
      const key = priceKey(surface, f.id);
      return <div className={styles.subcard} key={key}><label>{f.name} (INR)<input type="number" min="0" max="9999999999" step="1" disabled={disabled} value={fields[key] ?? ''} placeholder="Price on request" onChange={e => change(key, e.target.value)} /></label><button type="button" disabled={disabled} onClick={() => assign(assigned.filter(id => id !== f.id))} aria-label={`Remove ${f.name} from ${surface.replaceAll('-', ' ')}`}>Remove material</button></div>;
    })}
    {!assigned.length && <p className={styles.note}>No materials assigned to this component. Its original model finish remains visible.</p>}
    {unassigned.length > 0 && <div className={styles.subcard}><label>Add material<select aria-label="Add material" value={unassigned.some(f => f.id === adding) ? adding : ''} disabled={disabled} onChange={e => setAdding(e.target.value)}><option value="">Choose an approved material</option>{unassigned.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select></label><button type="button" disabled={disabled || !unassigned.some(f => f.id === adding)} onClick={() => assign([...assigned, adding])}>Add material to component</button></div>}
  </div>;
}
