"use client";

// Bordered nested disclosure adapted from 21st.dev Nested Bordered Accordion
// 24854 by cnippet-dev. Field grouping follows their Field with Textarea 26101;
// action variants follow originui Button 143; image selection follows joyco's
// File Dropzone 19201. The retrieved source is recorded in docs/admin-system.md.
import Image from "next/image";
import { ChevronDown, ChevronUp, Copy, ImagePlus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { ContentItem } from "@/lib/contentCollections";
import { journalArticleAliases, parseJournalSections, type JournalSection } from "@/lib/journalCollections";
import styles from "./JournalArticleCollectionEditor.module.css";

type Props = {
  items: ContentItem[];
  onChange: (items: ContentItem[]) => void;
  disabled: boolean;
  onUpload: (file: File) => Promise<string>;
};

function id() { return crypto.randomUUID(); }
function move<T>(items: T[], from: number, to: number): T[] {
  if (to < 0 || to >= items.length) return items;
  const next = [...items];
  next.splice(to, 0, ...next.splice(from, 1));
  return next;
}

function TextField({ label, value, onChange, disabled, multiline = false, required = false, hint, onBlur, maxLength }: {
  label: string; value: string; onChange: (value: string) => void; disabled: boolean;
  multiline?: boolean; required?: boolean; hint?: string; onBlur?: () => void; maxLength?: number;
}) {
  return <label className={styles.field}>
    <span>{label}{required && <strong aria-label="required"> *</strong>}</span>
    {multiline
      ? <textarea value={value} onChange={event => onChange(event.target.value)} disabled={disabled} rows={3} />
      : <input value={value} onChange={event => onChange(event.target.value)} onBlur={onBlur} maxLength={maxLength} disabled={disabled} />}
    {hint && <small>{hint}</small>}
  </label>;
}

function ImageField({ label, value, onChange, disabled, onUpload, required = false, alt = "" }: {
  label: string; value: string; onChange: (value: string) => void; disabled: boolean;
  onUpload: Props["onUpload"]; required?: boolean; alt?: string;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return <div className={styles.imageField}>
    <span className={styles.imageLabel}>{label}{required && <strong aria-label="required"> *</strong>}</span>
    {value && <div className={styles.imagePreview}><Image src={value} alt={alt || "Current photograph"} width={480} height={280} unoptimized /></div>}
    <div className={styles.imageActions}>
      <label className={styles.fileButton} aria-disabled={disabled || busy}>
        <ImagePlus size={16} aria-hidden="true" /> {busy ? "Uploading…" : value ? "Replace photograph" : "Choose photograph"}
        <input type="file" accept="image/png,image/jpeg,image/webp,image/avif,image/gif" disabled={disabled || busy}
          onChange={async event => {
            const input = event.currentTarget;
            const file = input.files?.[0];
            if (!file) return;
            setBusy(true); setError("");
            try { onChange(await onUpload(file)); }
            catch (cause) { setError(cause instanceof Error ? cause.message : "Upload failed. Try again."); }
            finally { setBusy(false); input.value = ""; }
          }} />
      </label>
      {value && !required && <button type="button" className={styles.smallButton} disabled={disabled} onClick={() => onChange("")}>Remove image</button>}
    </div>
    {error && <p className={styles.error} role="alert">{error}</p>}
  </div>;
}

export default function JournalArticleCollectionEditor({ items, onChange, disabled, onUpload }: Props) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");
  const [slugDraft, setSlugDraft] = useState<Record<string, string>>({});
  const [slugError, setSlugError] = useState("");
  const updateItem = (itemIndex: number, change: (item: ContentItem) => ContentItem) => onChange(items.map((item, index) => index === itemIndex ? change(item) : item));
  const updateField = (itemIndex: number, key: string, value: string) => updateItem(itemIndex, item => ({ ...item, fields: { ...item.fields, [key]: value } }));
  const addArticle = () => {
    const newId = `new-article-${id().slice(0, 8)}`;
    onChange([...items, { id: newId, fields: { recordId: newId, slugHistory: "[]", title: "", category: "", excerpt: "", image: "", imageAlt: "", heroCaption: "", sections: "[]" } }]);
    setActiveId(newId);
  };
  return <div className={styles.editor}>
    <div className={styles.heading}>
      <div><h3>Journal articles</h3><p>Choose an article, then edit its cover and reading sections in order. A photograph and meaningful body are required to publish.</p></div>
      <button type="button" className={styles.primaryButton} disabled={disabled || items.length >= 200} onClick={addArticle}><Plus size={17} aria-hidden="true" /> Add article</button>
    </div>
    {items.length === 0 && <p className={styles.empty}>No articles yet. Add one to build the reading page.</p>}
    <div className={styles.list}>
      {items.map((item, itemIndex) => {
        const sections = parseJournalSections(item.fields.sections ?? "[]");
        const setSections = (next: JournalSection[]) => updateField(itemIndex, "sections", JSON.stringify(next));
        const updateSection = (sectionIndex: number, change: (section: JournalSection) => JournalSection) => setSections(sections.map((section, index) => index === sectionIndex ? change(section) : section));
        const isOpen = activeId === item.id;
        return <section className={styles.article} key={item.id}>
          <button className={styles.articleTrigger} type="button" aria-expanded={isOpen} aria-controls={`journal-article-editor-${item.id}`}
            onClick={() => { setActiveId(isOpen ? "" : item.id); setSlugError(""); }}>
            <span className={styles.articleNumber}>{String(itemIndex + 1).padStart(2, "0")}</span>
            <span className={styles.articleName}><strong>{item.fields.title || "Untitled draft"}</strong><small>/journal/{item.id} · {sections.length} {sections.length === 1 ? "section" : "sections"}</small></span>
            <ChevronDown size={18} aria-hidden="true" className={isOpen ? styles.rotated : ""} />
          </button>
          {isOpen && <div className={styles.articleBody} id={`journal-article-editor-${item.id}`}>
            <div className={styles.actions}>
              <button type="button" className={styles.smallButton} disabled={disabled || itemIndex === 0} onClick={() => onChange(move(items, itemIndex, itemIndex - 1))}><ChevronUp size={15} /> Move up</button>
              <button type="button" className={styles.smallButton} disabled={disabled || itemIndex === items.length - 1} onClick={() => onChange(move(items, itemIndex, itemIndex + 1))}><ChevronDown size={15} /> Move down</button>
              <button type="button" className={styles.smallButton} disabled={disabled || items.length >= 200} onClick={() => {
                const copyId = `${item.id.slice(0, 60)}-copy-${id().slice(0, 4)}`;
                onChange([...items.slice(0, itemIndex + 1), { ...item, id: copyId, fields: { ...item.fields, recordId: copyId, slugHistory: "[]", title: `${item.fields.title || "Untitled"} copy` } }, ...items.slice(itemIndex + 1)]);
                setActiveId(copyId);
              }}><Copy size={15} /> Duplicate</button>
              <button type="button" className={styles.removeButton} disabled={disabled} onClick={() => { onChange(items.filter((_, index) => index !== itemIndex)); setActiveId(items[itemIndex + 1]?.id ?? items[itemIndex - 1]?.id ?? ""); }}><Trash2 size={15} /> Remove article</button>
            </div>
            <div className={styles.fieldGrid}>
              <TextField label="Page address" value={slugDraft[item.id] ?? item.id} disabled={disabled} required maxLength={80} hint="Lowercase letters, numbers and hyphens. Previously published addresses redirect here."
                onChange={value => setSlugDraft(previous => ({ ...previous, [item.id]: value }))}
                onBlur={() => {
                  const value = (slugDraft[item.id] ?? item.id).trim();
                  if (!value || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) || items.some((other, index) => index !== itemIndex && (other.id === value || journalArticleAliases(other).includes(value)))) { setSlugError("Use a unique address with lowercase letters, numbers and hyphens."); return; }
                  setSlugError("");
                  if (value !== item.id) {
                    updateItem(itemIndex, current => ({ ...current, id: value, fields: {
                      ...current.fields,
                      recordId: current.fields.recordId || current.id,
                      slugHistory: JSON.stringify([...journalArticleAliases(current).filter(alias => alias !== value), ...(current.id.startsWith("new-article-") ? [] : [current.id])]),
                    } }));
                    setActiveId(value);
                  }
                  setSlugDraft(previous => { const next = { ...previous }; delete next[item.id]; return next; });
                }} />
              <TextField label="Category" value={item.fields.category ?? ""} disabled={disabled} required onChange={value => updateField(itemIndex, "category", value)} />
            </div>
            {slugError && <p className={styles.error} role="alert">{slugError}</p>}
            <TextField label="Article title" value={item.fields.title ?? ""} disabled={disabled} required onChange={value => updateField(itemIndex, "title", value)} />
            <TextField label="Introduction" value={item.fields.excerpt ?? ""} disabled={disabled} required multiline onChange={value => updateField(itemIndex, "excerpt", value)} />
            <ImageField label="Cover photograph" value={item.fields.image ?? ""} alt={item.fields.imageAlt} disabled={disabled} required onUpload={onUpload} onChange={value => updateField(itemIndex, "image", value)} />
            <TextField label="Cover image description" value={item.fields.imageAlt ?? ""} disabled={disabled} required onChange={value => updateField(itemIndex, "imageAlt", value)} />
            <TextField label="Cover caption" value={item.fields.heroCaption ?? ""} disabled={disabled} onChange={value => updateField(itemIndex, "heroCaption", value)} />
            <div className={styles.sectionHead}><div><h4>Reading sections</h4><p>Sections appear in this order on the article page and in its contents menu.</p></div>
              <button type="button" className={styles.smallButton} disabled={disabled} onClick={() => setSections([...sections, { id: id(), heading: "", paragraphs: [{ id: id(), text: "" }] }])}><Plus size={15} /> Add section</button></div>
            {sections.map((section, sectionIndex) => <details className={styles.section} key={section.id}>
              <summary><span>{String(sectionIndex + 1).padStart(2, "0")}. {section.heading || "Untitled section"}</span><ChevronDown size={17} aria-hidden="true" /></summary>
              <div className={styles.sectionBody}>
                <div className={styles.actions}>
                  <button type="button" className={styles.smallButton} disabled={disabled || sectionIndex === 0} onClick={() => setSections(move(sections, sectionIndex, sectionIndex - 1))}>Move up</button>
                  <button type="button" className={styles.smallButton} disabled={disabled || sectionIndex === sections.length - 1} onClick={() => setSections(move(sections, sectionIndex, sectionIndex + 1))}>Move down</button>
                  <button type="button" className={styles.smallButton} disabled={disabled} onClick={() => setSections([
                    ...sections.slice(0, sectionIndex + 1),
                    { ...section, id: id(), paragraphs: section.paragraphs.map(paragraph => ({ ...paragraph, id: id() })) },
                    ...sections.slice(sectionIndex + 1),
                  ])}><Copy size={15} aria-hidden="true" /> Duplicate section</button>
                  <button type="button" className={styles.removeButton} disabled={disabled} onClick={() => setSections(sections.filter((_, index) => index !== sectionIndex))}>Remove section</button>
                </div>
                <TextField label="Section heading" value={section.heading} disabled={disabled} required onChange={value => updateSection(sectionIndex, current => ({ ...current, heading: value }))} />
                {section.paragraphs.map((paragraph, paragraphIndex) => <div className={styles.paragraph} key={paragraph.id}>
                  <TextField label={`Paragraph ${paragraphIndex + 1}`} value={paragraph.text} disabled={disabled} multiline required onChange={value => updateSection(sectionIndex, current => ({ ...current, paragraphs: current.paragraphs.map(block => block.id === paragraph.id ? { ...block, text: value } : block) }))} />
                  <button type="button" className={styles.removeButton} disabled={disabled} onClick={() => updateSection(sectionIndex, current => ({ ...current, paragraphs: current.paragraphs.filter(block => block.id !== paragraph.id) }))}>Remove paragraph</button>
                </div>)}
                <button type="button" className={styles.smallButton} disabled={disabled} onClick={() => updateSection(sectionIndex, current => ({ ...current, paragraphs: [...current.paragraphs, { id: id(), text: "" }] }))}><Plus size={15} /> Add paragraph</button>
                <ImageField label="Section photograph" value={section.image ?? ""} alt={section.imageAlt} disabled={disabled} onUpload={onUpload} onChange={value => updateSection(sectionIndex, current => ({ ...current, image: value }))} />
                {section.image && <><TextField label="Section image description" value={section.imageAlt ?? ""} disabled={disabled} required onChange={value => updateSection(sectionIndex, current => ({ ...current, imageAlt: value }))} />
                  <TextField label="Section image caption" value={section.imageCaption ?? ""} disabled={disabled} onChange={value => updateSection(sectionIndex, current => ({ ...current, imageCaption: value }))} /></>}
              </div>
            </details>)}
          </div>}
        </section>;
      })}
    </div>
  </div>;
}
