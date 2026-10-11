"use client";

// The searchable picker adapts cnippet-dev's 21st.dev Combobox 26105. Nested
// disclosures adapt 24854; fields, actions and media adapt 26101, 143 and 19201.
// The linked-gallery photo choice adapts the same 26105 combobox source to a
// native select so dozens of images remain keyboard-operable without lag.
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import Image from 'next/image';
import { ArrowDown, ArrowUp, ChevronsUpDown, Search, Trash2, UploadCloud } from 'lucide-react';
import type { ContentItem } from '@/lib/contentCollections';
import base from './CollectionEditor.module.css';
import styles from './HospitalitySelectionEditor.module.css';

type Props = { items: ContentItem[]; projects: ContentItem[]; onChange: (items: ContentItem[]) => void; disabled: boolean; onUpload: (file: File) => Promise<string> };
type GalleryPhoto = { id: string; src: string; alt: string };

function galleryPhotos(value: string | undefined): GalleryPhoto[] {
  try {
    const parsed: unknown = JSON.parse(value || '[]');
    return Array.isArray(parsed) ? parsed.filter((photo): photo is GalleryPhoto => Boolean(photo && typeof photo.id === 'string' && typeof photo.src === 'string' && photo.src && typeof photo.alt === 'string' && photo.alt)) : [];
  } catch { return []; }
}

function uniqueId(stem: string, items: ContentItem[]) {
  let id = stem;
  let number = 2;
  while (items.some(item => item.id === id)) id = `${stem}-${number++}`;
  return id;
}

function InitialDetails({ initialOpen, className, children }: { initialOpen: boolean; className: string; children: ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null);
  const openOnMount = useRef(initialOpen);
  useEffect(() => { if (openOnMount.current && ref.current) ref.current.open = true; }, []);
  return <details ref={ref} className={className}>{children}</details>;
}

function ProjectPicker({ projects, value, onPick, disabled, label, unavailable = [] }: {
  projects: ContentItem[]; value?: string; onPick: (projectId: string) => void; disabled: boolean; label: string; unavailable?: string[];
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const listId = useId();
  const search = useRef<HTMLInputElement>(null);
  const options = projects.filter(project => project.fields.status !== 'archived' && project.fields.title && !unavailable.includes(project.id) &&
    `${project.fields.title} ${project.id}`.toLowerCase().includes(query.trim().toLowerCase()));
  const selected = projects.find(project => project.id === value && project.fields.status !== 'archived');
  useEffect(() => { if (open) search.current?.focus(); }, [open]);
  function choose(id: string) { onPick(id); setOpen(false); setQuery(''); setActive(0); }
  return <div className={styles.picker} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
    <button className={styles.pickerTrigger} type="button" disabled={disabled} aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(value => !value)}>
      <span>{selected?.fields.title || (value ? `Missing project: ${value}` : label)}</span><ChevronsUpDown size={15} aria-hidden="true" />
    </button>
    {open && <div className={styles.pickerPopup}>
      <label className={styles.pickerSearch}><Search size={16} aria-hidden="true" /><span className={styles.srOnly}>Search projects</span><input ref={search} role="combobox" aria-label="Search projects" aria-expanded="true" aria-controls={listId} aria-activedescendant={options[active] ? `${listId}-${options[active].id}` : undefined}
        value={query} onChange={event => { setQuery(event.target.value); setActive(0); }} onKeyDown={event => {
          if (event.key === 'Escape') { event.preventDefault(); setOpen(false); }
          if (event.key === 'ArrowDown') { event.preventDefault(); setActive(index => Math.min(options.length - 1, index + 1)); }
          if (event.key === 'ArrowUp') { event.preventDefault(); setActive(index => Math.max(0, index - 1)); }
          if (event.key === 'Enter' && options[active]) { event.preventDefault(); choose(options[active].id); }
        }} placeholder="Find a project by name" /></label>
      <div id={listId} role="listbox" className={styles.pickerList} aria-label="Projects">
        {options.map((project, index) => <button id={`${listId}-${project.id}`} role="option" aria-selected={project.id === value} data-active={active === index} key={project.id} type="button" onMouseEnter={() => setActive(index)} onClick={() => choose(project.id)}>
          {project.fields.coverSrc && <Image src={project.fields.coverSrc} alt="" width={48} height={36} unoptimized />}
          <span>{project.fields.title}<small>/projects/{project.fields.slug || project.id}</small></span>
        </button>)}
        {!options.length && <p className={styles.pickerEmpty}>No matching published project. Add or complete it under Projects first.</p>}
      </div>
    </div>}
  </div>;
}

export default function HospitalitySelectionEditor({ items, projects, onChange, disabled, onUpload }: Props) {
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState('');
  const [recentRemoval, setRecentRemoval] = useState<{ item: ContentItem; index: number } | null>(null);
  const [newId, setNewId] = useState('');
  const selectedIds = items.map(item => item.fields.projectId).filter(Boolean);
  function update(index: number, item: ContentItem) { onChange(items.map((entry, position) => position === index ? item : entry)); }
  function field(index: number, key: string, value: string) { update(index, { ...items[index], fields: { ...items[index].fields, [key]: value } }); }
  function choosePhoto(index: number, galleryPhotoId: string) {
    update(index, { ...items[index], fields: { ...items[index].fields, galleryPhotoId, imageSrcOverride: '', imageAltOverride: '' } });
  }
  function add(projectId: string) {
    const id = uniqueId(`selected-${projectId}`, items);
    onChange([...items, { id, fields: { projectId, galleryPhotoId: '', nameOverride: '', kindOverride: '', descriptionOverride: '', imageSrcOverride: '', imageAltOverride: '' } }]);
    setNewId(id); setRecentRemoval(null);
  }
  function move(index: number, offset: number) {
    const target = index + offset;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }
  function remove(index: number) { setRecentRemoval({ item: items[index], index }); onChange(items.filter((_, position) => position !== index)); }
  function undo() {
    if (!recentRemoval || items.some(item => item.id === recentRemoval.item.id)) return;
    const next = [...items]; next.splice(Math.min(recentRemoval.index, next.length), 0, recentRemoval.item); onChange(next); setRecentRemoval(null);
  }
  async function upload(file: File | undefined, index: number) {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'].includes(file.type)) { setError('Choose a JPEG, PNG, WebP, AVIF or GIF photograph.'); return; }
    if (file.size > 100 * 1024 * 1024) { setError('The local upload limit is 100 MB.'); return; }
    setError(''); setUploading(items[index].id);
    try { update(index, { ...items[index], fields: { ...items[index].fields, galleryPhotoId: '', imageSrcOverride: await onUpload(file) } }); }
    catch (cause) { setError((cause as Error).message); }
    finally { setUploading(''); }
  }
  return <div className={base.collection}>
    <div className={base.intro}><div><strong>Hospitality selected work</strong><p>Choose projects from the shared library, then arrange their order. Removing a selection leaves its project intact.</p></div></div>
    <div className={styles.addRow}><span>Add a project to this page</span><ProjectPicker projects={projects} label="Select project" disabled={disabled || items.length >= 100} unavailable={selectedIds} onPick={add} /></div>
    {error && <p className={base.error} role="alert">{error}</p>}
    {recentRemoval && <div className={base.undo} role="status"><span>{recentRemoval.item.fields.nameOverride || projects.find(project => project.id === recentRemoval.item.fields.projectId)?.fields.title || recentRemoval.item.id} removed from this draft.</span><button type="button" onClick={undo}>Undo</button></div>}
    {!items.length && <p className={base.empty}>No selected work. Choose a project above to show it on Hospitality.</p>}
    <div className={base.items}>{items.map((item, index) => {
      const project = projects.find(entry => entry.id === item.fields.projectId && entry.fields.status !== 'archived');
      const photos = galleryPhotos(project?.fields.gallery);
      const selectedPhoto = photos.find(photo => photo.id === item.fields.galleryPhotoId);
      const isLegacy = item.id.startsWith('legacy-') && !item.fields.projectId;
      const name = item.fields.nameOverride || project?.fields.title || 'Untitled selection';
      const image = item.fields.imageSrcOverride || selectedPhoto?.src || project?.fields.coverSrc || '';
      const photoSource = item.fields.imageSrcOverride ? '__custom__' : item.fields.galleryPhotoId || '__cover__';
      return <InitialDetails className={base.item} key={item.id} initialOpen={items.length === 1 || item.id === newId}>
        <summary><span className={base.order}>{index + 1}</span><span className={base.itemName}>{name}<small>{isLegacy ? 'Existing standalone Hospitality card' : project ? `From /projects/${project.fields.slug || project.id}` : 'Project missing'}</small></span><span className={base.summaryHint}>Edit</span></summary>
        <div className={base.body}>
          <div className={base.field}><label>Linked project</label><ProjectPicker projects={projects} value={item.fields.projectId} label={isLegacy ? 'Link this card to a verified project' : 'Select project'} disabled={disabled} unavailable={selectedIds.filter(id => id !== item.fields.projectId)} onPick={id => update(index, { ...item, fields: { ...item.fields, projectId: id, galleryPhotoId: '' } })} />
            {isLegacy && <p className={base.help}>This card reused a photograph from Projects under a different name. Link it only after confirming the identity.</p>}</div>
          <div className={base.field}><label htmlFor={`hospitality-${item.id}-name`}>Display name {isLegacy && <span className={base.required}>Required for standalone cards</span>}</label><input id={`hospitality-${item.id}-name`} value={item.fields.nameOverride || ''} placeholder={project?.fields.title || ''} disabled={disabled} onChange={event => field(index, 'nameOverride', event.target.value)} /><p className={base.help}>Leave empty to inherit the linked project title.</p></div>
          <div className={base.field}><label htmlFor={`hospitality-${item.id}-kind`}>Category</label><input id={`hospitality-${item.id}-kind`} value={item.fields.kindOverride || ''} disabled={disabled} onChange={event => field(index, 'kindOverride', event.target.value)} /></div>
          <div className={base.field}><label htmlFor={`hospitality-${item.id}-description`}>Description</label><textarea id={`hospitality-${item.id}-description`} rows={3} value={item.fields.descriptionOverride || ''} disabled={disabled} onChange={event => field(index, 'descriptionOverride', event.target.value)} /><p className={base.help}>Leave empty to inherit the linked project description.</p></div>
          {project && <div className={base.field}><label htmlFor={`hospitality-${item.id}-gallery-photo`}>Photo from linked project</label><select id={`hospitality-${item.id}-gallery-photo`} value={photoSource} disabled={disabled} onChange={event => { if (event.target.value !== '__custom__') choosePhoto(index, event.target.value === '__cover__' ? '' : event.target.value); }}>
            <option value="__cover__">Use project cover</option>
            {item.fields.imageSrcOverride && <option value="__custom__">Current custom photograph</option>}
            {photos.map((photo, photoIndex) => <option key={photo.id} value={photo.id}>{photoIndex + 1}. {photo.alt}</option>)}
            {item.fields.galleryPhotoId && !selectedPhoto && <option value={item.fields.galleryPhotoId}>Previously chosen photo is unavailable</option>}
          </select><p className={base.help}>Choosing a project photo or cover replaces this card’s custom photograph without changing the Project gallery.</p></div>}
          <div className={base.field}><label htmlFor={`hospitality-${item.id}-image`}>Custom photograph override {isLegacy && <span className={base.required}>Required for standalone cards</span>}</label><input id={`hospitality-${item.id}-image`} value={item.fields.imageSrcOverride || ''} placeholder={selectedPhoto?.src || project?.fields.coverSrc || ''} disabled={disabled} onChange={event => update(index, { ...item, fields: { ...item.fields, galleryPhotoId: event.target.value ? '' : item.fields.galleryPhotoId, imageSrcOverride: event.target.value } })} />
            <div className={base.mediaTools}>{image && <Image src={image} alt="Hospitality card preview" width={180} height={112} unoptimized />}
              <label className={base.upload}><UploadCloud size={15} aria-hidden="true" />{uploading === item.id ? 'Uploading…' : 'Upload photograph'}<input type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" disabled={disabled || Boolean(uploading)} onChange={event => { void upload(event.target.files?.[0], index); event.target.value = ''; }} /></label></div></div>
          <div className={base.field}><label htmlFor={`hospitality-${item.id}-alt`}>Photograph description {(isLegacy || item.fields.imageSrcOverride) && <span className={base.required}>Required for a custom photograph</span>}</label><input id={`hospitality-${item.id}-alt`} value={item.fields.imageAltOverride || ''} placeholder={selectedPhoto?.alt || project?.fields.coverAlt || ''} disabled={disabled} onChange={event => field(index, 'imageAltOverride', event.target.value)} /></div>
          <div className={base.actions}><button type="button" disabled={disabled || index === 0} onClick={() => move(index, -1)}><ArrowUp size={15} aria-hidden="true" /> Move up</button><button type="button" disabled={disabled || index === items.length - 1} onClick={() => move(index, 1)}><ArrowDown size={15} aria-hidden="true" /> Move down</button><button type="button" className={base.remove} disabled={disabled} onClick={() => remove(index)}><Trash2 size={15} aria-hidden="true" /> Remove selection</button></div>
        </div>
      </InitialDetails>;
    })}</div>
  </div>;
}
