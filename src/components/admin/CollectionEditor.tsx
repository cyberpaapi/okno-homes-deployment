"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp, Copy, Plus, Trash2, UploadCloud } from "lucide-react";
import type { CollectionDefinition, CollectionField, ContentItem } from "@/lib/contentCollections";
import styles from "./CollectionEditor.module.css";

type Props = {
  definition: CollectionDefinition;
  items: ContentItem[];
  onChange: (items: ContentItem[]) => void;
  onUpload: (file: File) => Promise<string>;
  disabled?: boolean;
  focusedId?: string;
};

function freshId(base: string, items: ContentItem[]) {
  const stem = base.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "") || "item";
  let value = stem;
  let suffix = 2;
  while (items.some(item => item.id === value)) value = `${stem}-${suffix++}`;
  return value;
}

function itemName(item: ContentItem, label: string) {
  return item.fields.title || item.fields.name || item.fields.label || item.fields.source || `${label} · ${item.id}`;
}

// Action hierarchy adapts the retrieved 21st.dev originui Button 143 source;
// the item disclosure/field pairing follows the retrieved cnippet-dev 24854/26101 source.
export default function CollectionEditor({ definition, items, onChange, onUpload, disabled = false, focusedId }: Props) {
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState("");
  const [recentRemoval, setRecentRemoval] = useState<{ item: ContentItem; index: number } | null>(null);
  const locked = disabled || Boolean(uploading);
  const visibleItems = items.map((item, index) => ({ item, index })).filter(({ item }) => !focusedId || item.id === focusedId);

  function update(index: number, item: ContentItem) {
    onChange(items.map((entry, position) => position === index ? item : entry));
  }
  function updateField(index: number, key: string, value: string) {
    update(index, { ...items[index], fields: { ...items[index].fields, [key]: value } });
  }
  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }
  function add() {
    if (items.length >= (definition.maxItems ?? 200)) return;
    const id = freshId(`new-${definition.itemLabel.replace(/\s+/g, "-")}`, items);
    const fields = Object.fromEntries(definition.fields.map(field => [field.key, field.kind === "choice" ? field.options?.[0]?.value ?? "" : ""]));
    onChange([...items, { id, fields }]);
    setRecentRemoval(null);
  }
  function duplicate(index: number) {
    if (items.length >= (definition.maxItems ?? 200)) return;
    const source = items[index];
    const id = freshId(`${source.id}-copy`, items);
    const next = [...items];
    next.splice(index + 1, 0, { id, fields: { ...source.fields } });
    onChange(next);
    setRecentRemoval(null);
  }
  function remove(index: number) {
    setRecentRemoval({ item: items[index], index });
    onChange(items.filter((_, position) => position !== index));
  }
  function undoRemove() {
    if (!recentRemoval || items.some(item => item.id === recentRemoval.item.id)) return;
    const next = [...items];
    next.splice(Math.min(recentRemoval.index, next.length), 0, recentRemoval.item);
    onChange(next);
    setRecentRemoval(null);
  }
  async function upload(index: number, field: CollectionField, file?: File) {
    if (!file) return;
    const isImage = field.kind === "image";
    if (!(isImage ? ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"].includes(file.type) : file.type === "video/mp4" || file.type === "video/webm")) {
      setError(`Choose a supported ${isImage ? "image" : "MP4 or WebM video"} for ${field.label.toLowerCase()}.`);
      return;
    }
    if (file.size === 0 || file.size > 100 * 1024 * 1024) {
      setError("The local upload limit is 100 MB. Choose a smaller file.");
      return;
    }
    setError("");
    setUploading(`${items[index].id}.${field.key}`);
    try {
      const url = await onUpload(file);
      updateField(index, field.key, url);
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setUploading("");
    }
  }

  return <div className={styles.collection}>
    <div className={styles.intro}>
      <div><strong>{focusedId ? itemName(visibleItems[0]?.item ?? { id: focusedId, fields: {} }, definition.itemLabel) : definition.label}</strong><p>{focusedId ? "Opening media and text · Shared sections follow below" : `${items.length} ${items.length === 1 ? definition.itemLabel : `${definition.itemLabel}s`} · Use Move up and Move down to reorder`}</p></div>
      {!focusedId && <button className={styles.primary} type="button" disabled={locked || items.length >= (definition.maxItems ?? 200)} onClick={add}><Plus size={16} aria-hidden="true" /> Add {definition.itemLabel}</button>}
    </div>
    {error && <p className={styles.error} role="alert">{error}</p>}
    {recentRemoval && <div className={styles.undo} role="status"><span>{itemName(recentRemoval.item, definition.itemLabel)} removed from this draft.</span><button type="button" onClick={undoRemove}>Undo</button></div>}
    {visibleItems.length === 0 && <p className={styles.empty}>{focusedId ? "This opening is no longer in the draft. Choose another opening from Home." : `No ${definition.itemLabel}s in this draft. Add one to begin.`}</p>}
    <div className={styles.items}>
      {visibleItems.map(({ item, index }) => <details className={styles.item} key={item.id}>
        <summary><span className={styles.order}>{index + 1}</span><span className={styles.itemName}>{itemName(item, definition.itemLabel)}<small>{item.id}</small></span><span className={styles.summaryHint}>Edit</span></summary>
        <div className={styles.body}>
          <div className={styles.identity}><label htmlFor={`${definition.id}-${item.id}-id`}>Stable page ID</label><input id={`${definition.id}-${item.id}-id`} value={item.id} maxLength={80} disabled={locked} onChange={event => update(index, { ...item, id: event.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "-") })} /><small>Changing a published ID can change its link. Use a short, unique name.</small></div>
          {definition.fields.filter(field => definition.id !== "home.variants" || (item.fields.template === "v1" ? !["loopVideo", "loopPoster", "buttonLabel"].includes(field.key) : !["scrollVideo", "endImage", "introLastFrame", "endAlt", "tagline"].includes(field.key))).map(field => {
            const controlId = `${definition.id}-${item.id}-${field.key}`;
            const value = item.fields[field.key] ?? "";
            return <div className={styles.field} key={field.key}>
              <label htmlFor={controlId}>{field.label}{field.required && <span className={styles.required}>Required to publish</span>}</label>
              {field.help && <p className={styles.help}>{field.help}</p>}
              {field.kind === "choice" ? <select id={controlId} value={value} disabled={locked} onChange={event => updateField(index, field.key, event.target.value)}>{field.options?.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
                : field.kind === "json" ? <textarea id={controlId} value={value} disabled={locked} rows={3} spellCheck={false} onChange={event => updateField(index, field.key, event.target.value)} />
                : field.kind === "text" && (field.key === "description" || field.key === "excerpt" || field.key === "summary") ? <textarea id={controlId} value={value} disabled={locked} rows={3} onChange={event => updateField(index, field.key, event.target.value)} />
                : <input id={controlId} type={field.kind === "url" ? "url" : "text"} value={value} disabled={locked} onChange={event => updateField(index, field.key, event.target.value)} />}
              {(field.kind === "image" || field.kind === "video") && <div className={styles.mediaTools}>
                {value && (field.kind === "image" ? <Image src={value} alt={`${field.label} preview`} width={180} height={112} unoptimized /> : <video src={value} controls muted preload="none" aria-label={`${field.label} preview`} />)}
                <label className={styles.upload}><UploadCloud size={15} aria-hidden="true" /><span>{uploading === `${item.id}.${field.key}` ? "Uploading…" : `Replace ${field.kind}`}</span><input type="file" accept={field.kind === "image" ? "image/jpeg,image/png,image/webp,image/avif,image/gif" : "video/mp4,video/webm"} disabled={locked} onChange={event => { void upload(index, field, event.target.files?.[0]); event.target.value = ""; }} /></label>
              </div>}
            </div>;
          })}
          <div className={styles.actions}>
            <button type="button" disabled={locked || index === 0} onClick={() => move(index, -1)}><ArrowUp size={15} aria-hidden="true" /> Move up</button>
            <button type="button" disabled={locked || index === items.length - 1} onClick={() => move(index, 1)}><ArrowDown size={15} aria-hidden="true" /> Move down</button>
            <button type="button" disabled={locked || items.length >= (definition.maxItems ?? 200)} onClick={() => duplicate(index)}><Copy size={15} aria-hidden="true" /> Duplicate</button>
            <button type="button" className={styles.remove} disabled={locked} onClick={() => remove(index)}><Trash2 size={15} aria-hidden="true" /> Remove</button>
          </div>
        </div>
      </details>)}
    </div>
  </div>;
}
