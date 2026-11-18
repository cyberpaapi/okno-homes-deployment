"use client";

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { ContentItem } from '@/lib/contentCollections';
import { useSiteCollection } from '@/lib/useSiteContent';
import { resolveConfigurator, type ConfiguratorSettings } from '@/lib/configuratorSettings';
import { signatureAsset } from '@/data/configurator/signatureAssets';
import styles from './ModelConfigurator.module.css';
import { catalogueBase, pricingCollection, validRupees } from '@/lib/configuratorPricing';

const SuppliedConfigurator = dynamic(() => import('../supplied/SuppliedConfigurator'), { ssr: false });

export default function ModelConfigurator({ slug, roster, initialPrices = [], initialPlans = [], variant }: {
  slug: string; roster: ContentItem[]; initialPrices?: ContentItem[]; initialPlans?: ContentItem[]; variant?: string;
}) {
  const models = useSiteCollection('signature.models', roster);
  const rates = useSiteCollection(pricingCollection, initialPrices).find(item => item.id === slug)?.fields ?? {};
  const plans = useSiteCollection('signature.plans', initialPlans);
  const base = validRupees(rates.base) ? Number(rates.base) : catalogueBase(slug, plans, variant);
  const model = models.find(item => item.id === slug) ?? (signatureAsset(slug) ? roster.find(item => item.id === slug) : undefined);
  const payload = JSON.stringify(model ? resolveConfigurator(model, models) : null);
  // CMS polls must not reload geometry or discard a customer's selections.
  const settings = useMemo<ConfiguratorSettings | null>(() => JSON.parse(payload), [payload]);
  const asset = useMemo(() => settings ? {
    slug, name: settings.name, url: settings.url, metersPerUnit: settings.scale,
    identity: 'House preview. Individual plan layouts may differ.',
  } : model?.fields.configuratorMode === 'legacy' ? signatureAsset(slug) : undefined, [settings, slug, model?.fields.configuratorMode]);
  if (!asset) return <main className={styles.unavailable}><h1>{model?.fields.name || 'House'} configurator</h1><p>The 3D model is not available yet.</p><a href="/models/signature">Back to models</a></main>;
  return <SuppliedConfigurator asset={asset} settings={settings ?? undefined} pricing={{ base, rates }} variant={variant} />;
}
