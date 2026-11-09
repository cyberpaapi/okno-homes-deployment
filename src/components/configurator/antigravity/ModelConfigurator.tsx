"use client";

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { ContentItem } from '@/lib/contentCollections';
import { useSiteCollection } from '@/lib/useSiteContent';
import { resolveConfigurator, type ConfiguratorSettings } from '@/lib/configuratorSettings';
import { signatureAsset } from '@/data/configurator/signatureAssets';
import styles from './ModelConfigurator.module.css';

const SuppliedConfigurator = dynamic(() => import('../supplied/SuppliedConfigurator'), { ssr: false });

export default function ModelConfigurator({ slug, roster }: { slug: string; roster: ContentItem[] }) {
  const models = useSiteCollection('signature.models', roster);
  const model = models.find(item => item.id === slug);
  const payload = JSON.stringify(model ? resolveConfigurator(model, models) : null);
  // CMS polls must not reload geometry or discard a customer's selections.
  const settings = useMemo<ConfiguratorSettings | null>(() => JSON.parse(payload), [payload]);
  const asset = useMemo(() => settings ? {
    slug, name: settings.name, url: settings.url, metersPerUnit: settings.scale,
    identity: 'House preview. Individual plan layouts may differ.',
  } : model?.fields.configuratorMode === 'legacy' ? signatureAsset(slug) : undefined, [settings, slug, model?.fields.configuratorMode]);
  if (!asset) return <main className={styles.unavailable}><h1>{model?.fields.name || 'House'} configurator</h1><p>The 3D model is not available yet.</p><a href="/models/signature">Back to models</a></main>;
  return <SuppliedConfigurator asset={asset} settings={settings ?? undefined} />;
}
