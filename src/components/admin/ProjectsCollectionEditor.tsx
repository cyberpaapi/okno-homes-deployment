"use client";

// Nested disclosures adapt cnippet-dev's 21st.dev 24854; labeled controls adapt
// 26101, media replacement adapts joyco 19201, and actions adapt originui 143.
import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react';
import Image from 'next/image';
import { ArrowDown, ArrowUp, Copy, Film, ImagePlus, Plus, Trash2, UploadCloud } from 'lucide-react';
import type { ContentItem } from '@/lib/contentCollections';
import base from './CollectionEditor.module.css';
import styles from './ProjectsCollectionEditor.module.css';

type Props = { items: ContentItem[]; onChange: (items: ContentItem[]) => void; disabled: boolean; onUpload: (file: File) => Promise<string> };
type Photo = { id: string; src: string; alt: string; width?: number; height?: number };
type FilmItem = { id: string; src: string; poster: string; title: string; duration?: number; width?: number; height?: number };

function entries<T extends { id: string }>(value: string | undefined): T[] {
  try {
    const parsed: unknown = JSON.parse(value || '[]');
    return Array.isArray(parsed) ? parsed.filter((item): item is T => Boolean(item && typeof item === 'object' && typeof item.id === 'string')) : [];
  } catch { return []; }
}
function uniqueId(stem: string, values: string[]) {
  let id = stem;
  let number = 2;
  while (values.includes(id)) id = `${stem}-${number++}`;
  return id;
}
function move<T>(values: T[], index: number, offset: number): T[] {
  const target = index + offset;
  if (target < 0 || target >= values.length) return values;
  const next = [...values];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}
function slugHistory(value: string | undefined): string[] {
  try {
    const parsed: unknown = JSON.parse(value || '[]');
    return Array.isArray(parsed) ? parsed.filter((entry): entry is string => typeof entry === 'string') : [];
  } catch { return []; }
}

function InitialDetails({ initialOpen, className, children }: { initialOpen: boolean; className: string; children: ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null);
  const openOnMount = useRef(initialOpen);
  useEffect(() => { if (openOnMount.current && ref.current) ref.current.open = true; }, []);
  return <details ref={ref} className={className}>{children}</details>;
}

function SlugField({ id, slug, used, disabled, onCommit }: { id: string; slug: string; used: string[]; disabled: boolean; onCommit: (next: string) => void }) {
  const [draft, setDraft] = useState(slug);
  const [error, setError] = useState('');
  const controlId = `project-${id}-slug`;
  function commit() {
    const next = draft.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
    if (!next) { setError('Enter a page address.'); return; }
    if (next !== slug && used.includes(next)) { setError('Another project already uses this address.'); return; }
    setError(''); setDraft(next);
    if (next !== slug) onCommit(next);
  }
  return <div className={base.identity}><label htmlFor={controlId}>Page address</label>
    <input id={controlId} value={draft} maxLength={80} disabled={disabled} aria-invalid={!!error} onChange={event => { setDraft(event.target.value); setError(''); }} onBlur={commit} onKeyDown={event => { if (event.key === 'Enter') event.currentTarget.blur(); }} />
    {error && <small role="alert">{error}</small>}
    <small>This forms /projects/{slug}. Earlier addresses redirect after publication. Internal project ID: {id}.</small>
  </div>;
}

export default function ProjectsCollectionEditor({ items, onChange, disabled, onUpload }: Props) {
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState('');
  const [recentRemoval, setRecentRemoval] = useState<{ item: ContentItem; index: number } | null>(null);
  const [newId, setNewId] = useState('');

  function update(index: number, item: ContentItem) { onChange(items.map((entry, position) => position === index ? item : entry)); }
  function field(index: number, key: string, value: string) {
    update(index, { ...items[index], fields: { ...items[index].fields, [key]: value } });
  }
  function media(index: number, key: 'gallery' | 'films', value: Photo[] | FilmItem[]) { field(index, key, JSON.stringify(value)); }
  function add() {
    if (items.length >= 200) return;
    const id = uniqueId('new-project', items.map(item => item.id));
    const next = [...items];
    next.splice(items.filter(item => item.fields.status !== 'archived').length, 0, { id, fields: { title: '', status: 'active', slug: id, slugHistory: '[]', showInProjects: 'true', category: '', location: '', description: '', coverSrc: '', coverAlt: '', gallery: '[]', films: '[]', previewSrc: '', previewPoster: '' } });
    onChange(next);
    setNewId(id);
    setRecentRemoval(null);
  }
  function duplicate(index: number) {
    if (items.length >= 200) return;
    const original = items[index];
    const id = uniqueId(`${original.id}-copy`, items.map(item => item.id));
    const next = [...items];
    next.splice(Math.min(index + 1, items.filter(item => item.fields.status !== 'archived').length), 0, { id, fields: { ...original.fields, status: 'active', slug: id, slugHistory: '[]', title: `${original.fields.title || original.id} copy` } });
    onChange(next);
    setNewId(id);
  }
  function remove(index: number) {
    setRecentRemoval({ item: items[index], index });
    const next = items.filter((_, position) => position !== index);
    next.push({ ...items[index], fields: { ...items[index].fields, status: 'archived' } });
    onChange(next);
  }
  function undo() {
    if (!recentRemoval) return;
    const index = items.findIndex(item => item.id === recentRemoval.item.id);
    if (index < 0) return;
    const next = items.filter((_, position) => position !== index);
    next.splice(Math.min(recentRemoval.index, next.length), 0, recentRemoval.item);
    onChange(next);
    setRecentRemoval(null);
  }
  function restore(index: number) {
    const next = items.filter((_, position) => position !== index);
    next.splice(items.filter(item => item.fields.status !== 'archived').length, 0, { ...items[index], fields: { ...items[index].fields, status: 'active' } });
    onChange(next);
    setRecentRemoval(null);
  }
  function reorder(index: number, offset: number) {
    const other = items[index + offset];
    if (!other || (items[index].fields.status === 'archived') !== (other.fields.status === 'archived')) return;
    onChange(move(items, index, offset));
  }
  async function upload(file: File | undefined, token: string, image: boolean, apply: (url: string) => void) {
    if (!file) return;
    if (!(image ? ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'].includes(file.type) : ['video/mp4', 'video/webm'].includes(file.type))) {
      setError(`Choose a supported ${image ? 'image' : 'MP4 or WebM video'}.`); return;
    }
    if (file.size > 100 * 1024 * 1024) { setError('The local upload limit is 100 MB.'); return; }
    setError(''); setUploading(token);
    try { apply(await onUpload(file)); }
    catch (cause) { setError((cause as Error).message); }
    finally { setUploading(''); }
  }
  function uploadControl(token: string, image: boolean, apply: (url: string) => void) {
    return <label className={base.upload}><UploadCloud size={15} aria-hidden="true" />{uploading === token ? 'Uploading…' : image ? 'Upload photograph' : 'Upload film'}
      <input type="file" accept={image ? 'image/jpeg,image/png,image/webp,image/avif,image/gif' : 'video/mp4,video/webm'} disabled={disabled || Boolean(uploading)}
        onChange={event => { void upload(event.target.files?.[0], token, image, apply); event.target.value = ''; }} />
    </label>;
  }

  return <div className={base.collection}>
    <div className={base.intro}><div><strong>Projects</strong><p>{items.filter(item => item.fields.status !== 'archived').length} active · {items.filter(item => item.fields.status === 'archived').length} archived. Opening a project shows its media in page order.</p></div>
      <button className={base.primary} type="button" disabled={disabled || items.length >= 200} onClick={add}><Plus size={16} aria-hidden="true" /> Add project</button></div>
    {error && <p className={base.error} role="alert">{error}</p>}
    {recentRemoval && <div className={base.undo} role="status"><span>{recentRemoval.item.fields.title || recentRemoval.item.id} archived in this draft.</span><button type="button" onClick={undo}>Undo</button></div>}
    {!items.length && <p className={base.empty}>No projects are selected for publication. Add a project to begin.</p>}
    <div className={base.items}>{items.map((item, index) => {
      const photos = entries<Photo>(item.fields.gallery);
      const films = entries<FilmItem>(item.fields.films);
      const title = item.fields.title || 'Untitled project';
      const slug = item.fields.slug || item.id;
      const archived = item.fields.status === 'archived';
      const firstArchived = archived && (index === 0 || items[index - 1].fields.status !== 'archived');
      return <Fragment key={item.id}>{firstArchived && <h3 className={styles.archiveHeading}>Archived projects <small>Restore to make these pages available again.</small></h3>}<InitialDetails className={base.item} initialOpen={items.length === 1 || item.id === newId}>
        <summary><span className={base.order}>{index + 1}</span><span className={base.itemName}>{title}<small>{archived ? 'Archived · restore to show on the website' : `${item.fields.showInProjects === 'false' ? 'Library only · ' : ''}/projects/${slug}`}</small></span><span className={base.summaryHint}>Edit</span></summary>
        <div className={base.body}>
          <SlugField key={slug} id={item.id} slug={slug} used={items.filter(entry => entry.id !== item.id).flatMap(entry => [entry.fields.slug || entry.id, ...slugHistory(entry.fields.slugHistory)])} disabled={disabled} onCommit={nextSlug => {
            update(index, { ...item, fields: { ...item.fields, slug: nextSlug, slugHistory: JSON.stringify([...new Set([...slugHistory(item.fields.slugHistory), slug])].filter(previous => previous !== nextSlug)) } });
          }} />
          <div className={styles.toggleRow}><input id={`project-${item.id}-visibility`} type="checkbox" checked={item.fields.showInProjects !== 'false'} disabled={disabled} onChange={event => field(index, 'showInProjects', event.target.checked ? 'true' : 'false')} /><label htmlFor={`project-${item.id}-visibility`}>Show in Projects</label><small>Turn off to keep this active project in the shared library and Hospitality picker without adding it to the Projects showcase or index.</small></div>
          <div className={base.field}><label htmlFor={`project-${item.id}-title`}>Project title <span className={base.required}>Required to publish</span></label><input id={`project-${item.id}-title`} value={item.fields.title || ''} disabled={disabled} onChange={event => field(index, 'title', event.target.value)} /></div>
          <div className={base.field}><label htmlFor={`project-${item.id}-category`}>Project type / category</label><input id={`project-${item.id}-category`} value={item.fields.category || ''} disabled={disabled} onChange={event => field(index, 'category', event.target.value)} /><small className={base.help}>Required when this project is selected for Hospitality unless its card has a category override.</small></div>
          <div className={base.field}><label htmlFor={`project-${item.id}-location`}>Project detail location</label><input id={`project-${item.id}-location`} value={item.fields.location || ''} disabled={disabled} placeholder="City, region, country" onChange={event => field(index, 'location', event.target.value)} /><small className={base.help}>Shown on this project page only. Globe locations are managed separately above the project library.</small></div>
          <div className={base.field}><label htmlFor={`project-${item.id}-description`}>Description</label><textarea id={`project-${item.id}-description`} value={item.fields.description || ''} disabled={disabled} rows={3} onChange={event => field(index, 'description', event.target.value)} /></div>
          <div className={base.field}><label htmlFor={`project-${item.id}-cover`}>Cover photograph <span className={base.required}>Required to publish</span></label><input id={`project-${item.id}-cover`} value={item.fields.coverSrc || ''} disabled={disabled} onChange={event => field(index, 'coverSrc', event.target.value)} />
            <div className={base.mediaTools}>{item.fields.coverSrc && <Image src={item.fields.coverSrc} alt="Current cover" width={180} height={112} unoptimized />}{uploadControl(`${item.id}.cover`, true, url => field(index, 'coverSrc', url))}</div></div>
          <div className={base.field}><label htmlFor={`project-${item.id}-cover-alt`}>Cover description <span className={base.required}>Required to publish</span></label><input id={`project-${item.id}-cover-alt`} value={item.fields.coverAlt || ''} disabled={disabled} onChange={event => field(index, 'coverAlt', event.target.value)} /></div>
          <div className={base.field}><label htmlFor={`project-${item.id}-preview`}>Showcase preview film</label><input id={`project-${item.id}-preview`} value={item.fields.previewSrc || ''} disabled={disabled} onChange={event => field(index, 'previewSrc', event.target.value)} />
            <div className={base.mediaTools}>{item.fields.previewSrc && <video src={item.fields.previewSrc} controls muted preload="none" aria-label="Current showcase preview" />}{uploadControl(`${item.id}.preview`, false, url => field(index, 'previewSrc', url))}</div></div>
          <div className={base.field}><label htmlFor={`project-${item.id}-preview-poster`}>Showcase preview poster</label><input id={`project-${item.id}-preview-poster`} value={item.fields.previewPoster || ''} disabled={disabled} onChange={event => field(index, 'previewPoster', event.target.value)} />
            <small className={base.help}>Optional. The cover photograph is used when no separate preview poster is supplied.</small><div className={base.mediaTools}>{(item.fields.previewPoster || item.fields.coverSrc) && <Image src={item.fields.previewPoster || item.fields.coverSrc} alt="Current showcase poster" width={180} height={112} unoptimized />}{uploadControl(`${item.id}.previewPoster`, true, url => field(index, 'previewPoster', url))}{item.fields.previewPoster && <button type="button" className={styles.useCover} disabled={disabled} onClick={() => field(index, 'previewPoster', '')}>Use cover instead</button>}</div></div>

          <div className={styles.mediaSection}><div className={styles.mediaHeading}><div><strong>Photographs</strong><p>Add, remove or reorder images inside this project. The cover remains available if this list is empty.</p></div><button type="button" className={base.primary} disabled={disabled || photos.length >= 100} onClick={() => media(index, 'gallery', [...photos, { id: crypto.randomUUID(), src: '', alt: '' }])}><ImagePlus size={15} aria-hidden="true" /> Add photograph</button></div>
            <div className={base.items}>{photos.map((photo, photoIndex) => <InitialDetails className={base.item} key={photo.id} initialOpen={!photo.src}>
              <summary><span className={base.order}>{photoIndex + 1}</span><span className={base.itemName}>{photo.alt || `Photograph ${photoIndex + 1}`}</span><span className={base.summaryHint}>Edit</span></summary>
              <div className={base.body}><div className={base.field}><label htmlFor={`project-${item.id}-photo-${photo.id}-src`}>Image <span className={base.required}>Required to publish</span></label><input id={`project-${item.id}-photo-${photo.id}-src`} value={photo.src} disabled={disabled} onChange={event => media(index, 'gallery', photos.map((entry, position) => position === photoIndex ? { ...entry, src: event.target.value } : entry))} />
                <div className={base.mediaTools}>{photo.src && <Image src={photo.src} alt="Photograph preview" width={180} height={112} unoptimized />}{uploadControl(`${item.id}.photo.${photo.id}`, true, url => media(index, 'gallery', photos.map((entry, position) => position === photoIndex ? { ...entry, src: url } : entry)))}</div></div>
                <div className={base.field}><label htmlFor={`project-${item.id}-photo-${photo.id}-alt`}>Image description <span className={base.required}>Required to publish</span></label><input id={`project-${item.id}-photo-${photo.id}-alt`} value={photo.alt} disabled={disabled} onChange={event => media(index, 'gallery', photos.map((entry, position) => position === photoIndex ? { ...entry, alt: event.target.value } : entry))} /></div>
                <div className={base.actions}><button type="button" disabled={disabled || photoIndex === 0} onClick={() => media(index, 'gallery', move(photos, photoIndex, -1))}><ArrowUp size={15} /> Move up</button><button type="button" disabled={disabled || photoIndex === photos.length - 1} onClick={() => media(index, 'gallery', move(photos, photoIndex, 1))}><ArrowDown size={15} /> Move down</button><button type="button" className={base.remove} disabled={disabled} onClick={() => media(index, 'gallery', photos.filter((_, position) => position !== photoIndex))}><Trash2 size={15} /> Remove image</button></div>
              </div></InitialDetails>)}</div>
          </div>

          <div className={styles.mediaSection}><div className={styles.mediaHeading}><div><strong>Films</strong><p>Each film has its own poster and title. Zero films hides the film controls on the website.</p></div><button type="button" className={base.primary} disabled={disabled || films.length >= 50} onClick={() => media(index, 'films', [...films, { id: crypto.randomUUID(), src: '', poster: '', title: '' }])}><Film size={15} aria-hidden="true" /> Add film</button></div>
            <div className={base.items}>{films.map((film, filmIndex) => <InitialDetails className={base.item} key={film.id} initialOpen={!film.src}>
              <summary><span className={base.order}>{filmIndex + 1}</span><span className={base.itemName}>{film.title || `Film ${filmIndex + 1}`}</span><span className={base.summaryHint}>Edit</span></summary>
              <div className={base.body}>
                <div className={base.field}><label htmlFor={`project-${item.id}-film-${film.id}-title`}>Film title <span className={base.required}>Required to publish</span></label><input id={`project-${item.id}-film-${film.id}-title`} value={film.title} disabled={disabled} onChange={event => media(index, 'films', films.map((entry, position) => position === filmIndex ? { ...entry, title: event.target.value } : entry))} /></div>
                <div className={base.field}><label htmlFor={`project-${item.id}-film-${film.id}-src`}>Film source <span className={base.required}>Required to publish</span></label><input id={`project-${item.id}-film-${film.id}-src`} value={film.src} disabled={disabled} onChange={event => media(index, 'films', films.map((entry, position) => position === filmIndex ? { ...entry, src: event.target.value } : entry))} />
                  <div className={base.mediaTools}>{film.src && <video src={film.src} controls muted preload="none" aria-label={`${film.title || 'Film'} preview`} />}{uploadControl(`${item.id}.film.${film.id}`, false, url => media(index, 'films', films.map((entry, position) => position === filmIndex ? { ...entry, src: url } : entry)))}</div></div>
                <div className={base.field}><label htmlFor={`project-${item.id}-film-${film.id}-poster`}>Poster image <span className={base.required}>Required to publish</span></label><input id={`project-${item.id}-film-${film.id}-poster`} value={film.poster} disabled={disabled} onChange={event => media(index, 'films', films.map((entry, position) => position === filmIndex ? { ...entry, poster: event.target.value } : entry))} />
                  <div className={base.mediaTools}>{film.poster && <Image src={film.poster} alt="Film poster preview" width={180} height={112} unoptimized />}{uploadControl(`${item.id}.poster.${film.id}`, true, url => media(index, 'films', films.map((entry, position) => position === filmIndex ? { ...entry, poster: url } : entry)))}</div></div>
                <div className={base.actions}><button type="button" disabled={disabled || filmIndex === 0} onClick={() => media(index, 'films', move(films, filmIndex, -1))}><ArrowUp size={15} /> Move up</button><button type="button" disabled={disabled || filmIndex === films.length - 1} onClick={() => media(index, 'films', move(films, filmIndex, 1))}><ArrowDown size={15} /> Move down</button><button type="button" className={base.remove} disabled={disabled} onClick={() => media(index, 'films', films.filter((_, position) => position !== filmIndex))}><Trash2 size={15} /> Remove film</button></div>
              </div></InitialDetails>)}</div>
          </div>

          <div className={base.actions}><button type="button" disabled={disabled || index === 0 || (items[index - 1].fields.status === 'archived') !== archived} onClick={() => reorder(index, -1)}><ArrowUp size={15} /> Move project up</button><button type="button" disabled={disabled || index === items.length - 1 || (items[index + 1].fields.status === 'archived') !== archived} onClick={() => reorder(index, 1)}><ArrowDown size={15} /> Move project down</button><button type="button" disabled={disabled || items.length >= 200} onClick={() => duplicate(index)}><Copy size={15} /> Duplicate</button>{archived
            ? <button type="button" disabled={disabled} onClick={() => restore(index)}><Plus size={15} /> Restore project</button>
            : <button type="button" className={base.remove} disabled={disabled} onClick={() => remove(index)}><Trash2 size={15} /> Archive project</button>}</div>
        </div>
      </InitialDetails></Fragment>;
    })}</div>
  </div>;
}
