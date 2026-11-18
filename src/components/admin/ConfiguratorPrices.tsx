'use client';

import { useState } from 'react';
import { MATERIAL_FINISHES } from '@/data/configurator/materials';
import { MATERIAL_APPLICATION_IDS, type MaterialApplicationId } from '@/data/configurator/types';
import assets from '@/data/configurator/signatureAssetManifest.json';
import { resolveConfigurator } from '@/lib/configuratorSettings';
import { catalogueBase, priceKey, rupees } from '@/lib/configuratorPricing';
import type { ContentItem } from '@/lib/contentCollections';
import styles from './SignatureModelPanel.module.css';

export default function ConfiguratorPrices({ roster, plans, items, disabled, onChange }: {
  roster: ContentItem[]; plans: ContentItem[]; items: ContentItem[]; disabled: boolean; onChange: (value: ContentItem[]) => void;
}) {
  const houses = new Map(Object.keys(assets).map(id => [id, id.charAt(0).toUpperCase() + id.slice(1)]));
  for (const house of roster) if (resolveConfigurator(house, roster)) houses.set(house.id, house.fields.name || house.id);
  const [house, setHouse] = useState('forza');
  const [surface, setSurface] = useState<MaterialApplicationId>('external-wall');
  const fields = items.find(item => item.id === house)?.fields ?? {};
  const fallback = catalogueBase(house, plans);
  function change(key: string, value: string) {
    const next = { ...fields };
    if (value === '') delete next[key]; else next[key] = value;
    const other = items.filter(item => item.id !== house);
    onChange(Object.keys(next).length ? [...other, { id: house, fields: next }] : other);
  }
  return <div className={styles.body}>
    <label>House<select aria-label="House" value={house} disabled={disabled} onChange={e => setHouse(e.target.value)}>{Array.from(houses, ([id, name]) => <option value={id} key={id}>{name}</option>)}</select></label>
    <label>House base price (INR)<input type="number" min="0" max="9999999999" step="1" disabled={disabled} value={fields.base ?? ''} onChange={e => change('base', e.target.value)} placeholder={fallback === null ? 'Price on request' : rupees(fallback)} />
      <small>Sets one base for this house. Leave blank to use the selected plan’s published starting price.</small></label>
    <label>Component<select aria-label="Component" value={surface} disabled={disabled} onChange={e => setSurface(e.target.value as MaterialApplicationId)}>{MATERIAL_APPLICATION_IDS.map(id => <option key={id} value={id}>{id.replace('-', ' ')}</option>)}</select></label>
    <p className={styles.note}>Enter the additional INR amount for the whole component. Zero means included. A blank finish price requires confirmation.</p>
    {MATERIAL_FINISHES.filter(f => f.approvedApplications.includes(surface)).map(f => {
      const key = priceKey(surface, f.id);
      return <label key={key}>{f.name} (INR)<input type="number" min="0" max="9999999999" step="1" disabled={disabled} value={fields[key] ?? ''} placeholder="Price on request" onChange={e => change(key, e.target.value)} /></label>;
    })}
  </div>;
}
