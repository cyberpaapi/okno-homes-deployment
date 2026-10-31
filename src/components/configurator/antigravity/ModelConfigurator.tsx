"use client";

import { useEffect, useRef, useState } from 'react';
import type { ContentItem } from '@/lib/contentCollections';
import { useSiteCollection } from '@/lib/useSiteContent';
import { resolveConfigurator } from '@/lib/configuratorSettings';
import { oknoModels, gazePrototype } from "@/data/models";
import { signatureAsset } from '@/data/configurator/signatureAssets';
import dynamic from 'next/dynamic';
const SuppliedConfigurator = dynamic(() => import('../supplied/SuppliedConfigurator')); 
import styles from './ModelConfigurator.module.css';

export default function ModelConfigurator({ slug, roster }: { slug: string; roster: ContentItem[] }) {
  const models = useSiteCollection('signature.models', roster);
  const legacy = [...oknoModels, gazePrototype].find(item => item.slug === slug);
  const model = models.find(item => item.id === slug) ?? (legacy ? {id: slug, fields: {name: legacy.name}} : undefined);
  const settings = model ? resolveConfigurator(model) : null;
  const payload = JSON.stringify(settings);
  const frame = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (payload === "null") return;
    const send = () => frame.current?.contentWindow?.postMessage({ type: 'OKNO_CONFIGURATOR_INIT', settings: JSON.parse(payload) }, window.location.origin);
    const receive = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow) return;
      if (event.data?.type === 'OKNO_CONFIGURATOR_READY') send();
      if (event.data?.type === 'OKNO_CONFIGURATOR_ERROR') setError('The 3D experience could not load. Please try again.');
      if (event.data?.type === 'OKNO_CONFIGURATOR_LOADED') setError('');
    };
    window.addEventListener('message', receive);
    send();
    return () => window.removeEventListener('message', receive);
  // The serialized settings prevent CMS polling from restarting the viewer.
  }, [payload, attempt]);
  if (!model) return <main className={styles.unavailable}><h1>Model unavailable</h1><a href="/models/signature">Back to models</a></main>;
  if (!settings) return <SuppliedConfigurator asset={signatureAsset(slug)} requestedName={model.fields.name} />;
  return <main className={styles.root} data-configurator="antigravity" data-model={slug}>
    <iframe key={attempt} ref={frame} className={styles.frame} src="/configurator/antigravity/viewer.html" title={`${model.fields.name} interactive house configurator`} allow="fullscreen" />
    {error && <div className={styles.error} role="alert"><p>{error}</p><button onClick={() => { setError(''); setAttempt(v => v + 1); }}>Try again</button><a href="/models/signature">Back to models</a></div>}
  </main>;
}
