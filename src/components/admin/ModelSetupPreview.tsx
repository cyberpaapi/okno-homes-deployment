"use client";

import { useEffect, useRef, useState } from 'react';
import { createScene, type SceneApi, type SurfaceReport } from '@/components/configurator/supplied/cabinScene';
import { registerOptions } from '@/components/configurator/supplied/registerOptions';
import { zoneApplications } from '@/components/configurator/supplied/surfaceMapping';
import { configuratorZones, type ConfiguratorSettings } from '@/lib/configuratorSettings';
import styles from './SignatureModelPanel.module.css';

// Reuses Content Studio fields/buttons; the canvas is the recovered cabin scene.
export default function ModelSetupPreview({ settings, disabled, linked, onMap }: {
  settings: ConfiguratorSettings; disabled: boolean; linked: boolean;
  onMap: (name: string, zone: string) => void;
}) {
  const mount = useRef<HTMLDivElement>(null);
  const api = useRef<SceneApi | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [report, setReport] = useState<SurfaceReport | null>(null);
  const [search, setSearch] = useState('');
  const { url, scale } = settings;
  const mapping = JSON.stringify(settings.mapping);
  const defaults = JSON.stringify(settings.defaults);

  useEffect(() => {
    let cancelled = false;
    let scene: SceneApi | undefined;
    const abort = new AbortController();
    const timeout = window.setTimeout(() => abort.abort(), 60000);
    async function start() {
      try {
        scene = createScene(mount.current!, () => {}, () => {}, undefined, true);
        api.current = scene; scene.turn(false);
        const response = await fetch(url, { signal: abort.signal });
        if (!response.ok) throw new Error('The uploaded model could not load. Upload it again and retry.');
        const blob = await response.blob();
        if (cancelled) return;
        await scene.glb(blob, scale);
        if (!cancelled) setReady(true);
      } catch (cause) {
        if (!cancelled) { setError(cause instanceof Error ? cause.message : 'The preview could not load. Retry with a self-contained GLB.'); scene?.dispose(); scene = undefined; api.current = null; }
      } finally { window.clearTimeout(timeout); }
    }
    void start();
    return () => { cancelled = true; window.clearTimeout(timeout); abort.abort(); scene?.dispose(); api.current = null; };
  }, [url, scale, attempt]);

  useEffect(() => {
    if (!ready || !api.current) return;
    api.current.resetSurfaces();
    const next = api.current.mapSurfaces(JSON.parse(mapping));
    setReport(next);
    for (const [zone, id] of Object.entries(JSON.parse(defaults))) {
      const app = zoneApplications[zone];
      const option = registerOptions.find(item => item.registerNumber === id && item.approvedApplications.includes(app));
      if (option && next.counts[app]) api.current.surface(app, option.preview, option.name);
    }
  }, [ready, mapping, defaults]);

  return <section aria-label="Draft 3D model preview" className={styles.setup}>
    <p className={styles.note}>Draft preview · changes appear here before publishing. The model is centred and fitted automatically, with its proportions preserved.</p>
    <div ref={mount} className={styles.modelCanvas} />
    {!ready && !error && <p role="status">Preparing model…</p>}
    {error && <p role="alert">{error} <button type="button" onClick={() => { setError(''); setAttempt(value => value + 1); }}>Retry preview</button></p>}
    <div className={styles.row}>{(['hero', 'front', 'side', 'plan', 'inside'] as const).map(view => <button type="button" key={view} disabled={!ready} onClick={() => api.current?.view(view)}>{view === 'hero' ? 'Fit model' : view.charAt(0).toUpperCase() + view.slice(1)}</button>)}</div>
    {report && <>
      <dl className={styles.surfaceCounts}>{configuratorZones.map(([zone, label]) => <div key={zone}><dt>{label}</dt><dd>{report.counts[zoneApplications[zone]] || 'Not mapped'}</dd></div>)}</dl>
      {configuratorZones.some(([zone]) => !report.counts[zoneApplications[zone]]) && <p role="status" className={styles.note}>Some surfaces are not mapped. Customers cannot change those surfaces until you map them or upload separate meshes.</p>}
      <details><summary>Inspect and assign mesh surfaces</summary>
        <p className={styles.note}>{linked ? 'Geometry and surface mappings come from the linked house. Edit that source house to change them.' : 'Select a surface for each mesh. Automatic uses GLB tags or the supplied model’s existing mapping. Furniture and glazing should remain Automatic with no surface.'}</p>
        <label>Find a mesh<input value={search} onChange={event => setSearch(event.target.value)} placeholder="Mesh name" /></label>
        <div className={styles.meshList}>{report.meshes.filter(mesh => mesh.name.toLowerCase().includes(search.toLowerCase())).map((mesh, index) => <label key={`${mesh.name}-${index}`}>
          {mesh.name || '(Unnamed mesh — name it in the 3D source)'}
          <small>{mesh.applications.join(', ') || 'Original material'}{!mesh.supported && ' · split material slots into separate meshes'}</small>
          <select aria-label={`Surface for ${mesh.name || 'unnamed mesh'}`} disabled={disabled || linked || !mesh.name || !mesh.supported} value={Object.entries(settings.mapping).find(([, names]) => names.includes(mesh.name))?.[0] || ''} onChange={event => onMap(mesh.name, event.target.value)}>
            <option value="">Automatic</option>{configuratorZones.map(([zone, label]) => <option key={zone} value={zone}>{label}</option>)}
          </select>
        </label>)}</div>
      </details>
    </>}
  </section>;
}
