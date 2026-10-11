"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { ChevronDown, ExternalLink, FileImage, Film, LockKeyhole, Save, Send, Type, UploadCloud } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { adminPages, type ContentField, type ContentPage, type ContentSection } from "@/data/adminContent";
import { homeVariantDefaults, signatureGalleryDefaults } from "@/data/adminContent";
import { initialProjectItems } from "@/data/projectCollections";
import { initialGlobePinItems } from "@/data/globePinCollections";
import { initialHospitalitySelections } from "@/data/hospitalitySelectedWork";
import { journalDefaultCollections } from "@/lib/journalCollections";
import { collectionDefinitionsForPage, type CollectionDefinition, type ContentCollections, type ContentItem } from "@/lib/contentCollections";
import CollectionEditor from "@/components/admin/CollectionEditor";
import JournalArticleCollectionEditor from "@/components/admin/JournalArticleCollectionEditor";
import ProjectsCollectionEditor from "@/components/admin/ProjectsCollectionEditor";
import GlobePinsEditor from "@/components/admin/GlobePinsEditor";
import HospitalitySelectionEditor from "@/components/admin/HospitalitySelectionEditor";
import GlobalBrandPreview from "@/components/admin/GlobalBrandPreview";
import { uploadMedia, type UploadProgress } from "@/components/admin/uploadMedia";
import localPorts from "../../../config/local-ports.json";
import styles from "./AdminStudio.module.css";
import { preferNewerSnapshot } from "./snapshotOrder";
import type { GeocodePlace } from "@/lib/projectGeocoding";
import { signatureModelDefaults, signaturePlanDefaults } from "@/lib/signatureCollections";
import { footerLinkDefaults } from "@/lib/footerLinkCollections";
import { parseProcessDayRange } from "@/lib/processDayRange";
import SignatureModelPanel from "./SignatureModelPanel";

type Snapshot = { revision: number; draftRevision: number; published: Record<string, string>; draft: Record<string, string>; publishedCollections: ContentCollections; draftCollections: ContentCollections; history: { revision: number; publishedCollections: ContentCollections; publishedAt: string }[]; demoExpiresAt?: string };
type View = "content" | "site";

const subscribeToLocation = () => () => {};
const enquiryOptionDefaults: Record<string, readonly string[]> = {
  "home.land-status": ["I own it", "I'm buying it", "I'm still looking"],
  "home.home-type": ["Cabins / villas", "Family home", "Hospitality", "Developer project"],
  "home.timeline": ["This year", "Next year", "Exploring"],
  "hospitality.programme": ["Cabins / villas", "Resort / Hotel", "Other"],
  "hospitality.keys": ["5–10", "11–25", "26+"],
  "hospitality.timeline": ["This year", "Next year", "Exploring"],
  "press.nature": ["Press feature", "Partnership", "Career", "Other"],
};
function enquiryOptions(values: Record<string, string> = {}): ContentCollections {
  return Object.fromEntries(Object.entries(enquiryOptionDefaults).map(([group, names]) => [
    `enquiry.options.${group}`,
    names.map((name, index) => ({ id: `${group.replace(/\./g, "-")}-${index + 1}`, fields: { value: name, label: values[`enquiry.${group}.option-${index + 1}`] ?? name } })),
  ]));
}
const fallbackCollections: ContentCollections = {
  "home.variants": homeVariantDefaults,
  "projects.globePins": initialGlobePinItems,
  "projects.records": initialProjectItems,
  "hospitality.selectedWork": initialHospitalitySelections,
  ...journalDefaultCollections(),
  ...enquiryOptions(),
  ...signatureGalleryDefaults,
  "signature.models": signatureModelDefaults,
  "signature.plans": signaturePlanDefaults(),
  ...footerLinkDefaults(),
};
const legacyJournalItemIds = new Set([
  ...journalDefaultCollections()["journal.press"].map(item => item.id),
  ...journalDefaultCollections()["journal.notes"].map(item => item.id),
]);
function editableSections(page: ContentPage) {
  const sections = page.sections.filter(section => page.id === "journal" ? !legacyJournalItemIds.has(section.id) && !section.id.startsWith("post-") : page.id === "projects" ? section.id === "project-library" || !section.id.startsWith("project-") : page.id === "signature" ? !section.id.includes("-plan-") : true);
  // V1 has one editing source, shared with the published-home opening selector.
  // Historical scalar fields remain readable when the collection has not been saved.
  if (page.id === "hero-v1") return sections.filter(section => section.id !== 'opening');
  return page.id === "footer" ? sections.map(section => ["footer-homes", "footer-explore", "footer-okno"].includes(section.id) ? { ...section, fields: section.fields.filter(field => field.id.endsWith(".heading")) } : section) : sections;
}

function mergeLegacyHeroValues(items: ContentItem[], values: Record<string, string>): ContentItem[] {
  const mappings: Record<string, Record<string, string>> = {
    "hero-v1": { openingVideo: "hero-v1.opening.intro-video", scrollVideo: "hero-v1.opening.scroll-video", poster: "hero-v1.opening.start-image", endImage: "hero-v1.opening.end-image", introLastFrame: "hero-v1.opening.intro-last-frame", openingAlt: "hero-v1.opening.start-alt", endAlt: "hero-v1.opening.end-alt", accessibleTitle: "hero-v1.opening.accessible-title", tagline: "hero-v1.opening.tagline" },
    "hero-v2": { openingVideo: "hero-v2.opening.journey-video", loopVideo: "hero-v2.opening.island-loop", poster: "hero-v2.opening.journey-poster", loopPoster: "hero-v2.opening.island-poster", accessibleTitle: "hero-v2.opening.accessible-title" },
  };
  return items.map(item => ({ ...item, fields: { ...item.fields, ...Object.fromEntries(Object.entries(mappings[item.id] ?? {}).flatMap(([key, fieldId]) => values[fieldId] !== undefined ? [[key, values[fieldId]]] : [])) } }));
}

function mergeLegacyProjectValues(items: ContentItem[], values: Record<string, string>): ContentItem[] {
  return items.map(item => {
    const prefix = `projects.${item.id}.`;
    const original = item.fields;
    const gallery = JSON.parse(original.gallery || "[]") as { id: string; src: string; alt: string }[];
    const films = JSON.parse(original.films || "[]") as { id: string; src: string; poster: string; title: string }[];
    const coverIndex = gallery.findIndex(image => image.src === original.coverSrc);
    const updatedGallery = gallery.map((image, index) => ({ ...image,
      src: values[`${prefix}image-${index + 1}.src`] ?? image.src,
      alt: values[`${prefix}image-${index + 1}.alt`] ?? image.alt,
    }));
    const updatedFilms = films.map((film, index) => ({ ...film,
      src: values[`${prefix}film-${index + 1}.src`] ?? film.src,
      poster: values[`${prefix}film-${index + 1}.poster`] ?? film.poster,
      title: values[`${prefix}film-${index + 1}.title`] ?? film.title,
    }));
    return { ...item, fields: { ...original,
      title: values[`${prefix}title`] ?? original.title,
      description: values[`${prefix}description`] ?? original.description,
      coverSrc: coverIndex >= 0 ? updatedGallery[coverIndex].src : original.coverSrc,
      coverAlt: coverIndex >= 0 ? updatedGallery[coverIndex].alt : original.coverAlt,
      gallery: JSON.stringify(updatedGallery), films: JSON.stringify(updatedFilms),
      previewSrc: values[`${prefix}preview`] ?? original.previewSrc,
    } };
  });
}
function siteOriginSnapshot() {
  const onAdminPort = window.location.hostname === "127.0.0.1" && window.location.port === String(localPorts.admin);
  return onAdminPort ? `http://127.0.0.1:${localPorts.website}` : window.location.origin;
}

async function readAdminSnapshot(credential: string): Promise<Snapshot> {
  const response = await fetch("/api/admin/content", { headers: { Authorization: `Bearer ${credential}` }, cache: "no-store" });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Could not connect to the local editor.");
  return result as Snapshot;
}

function connectedMessage(next: Snapshot) {
  return next.demoExpiresAt
    ? `Local test token connected. It expires ${new Date(next.demoExpiresAt).toLocaleString()}. Publish changes to update the live demo.`
    : "Editor connected.";
}

// Adapted from 21st.dev originui Button 143: one consistent action vocabulary.
function ActionButton({ children, variant = "primary", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "quiet" }) {
  return <button {...props} className={`${styles.action} ${styles[variant]} ${props.className ?? ""}`}>{children}</button>;
}

// Adapted from 21st.dev joyco File Dropzone 19201. The upload stays inside its field.
export function MediaDropzone({ field, onUploaded, busy }: { field: ContentField; onUploaded: (file: File) => void; busy: boolean }) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const accept = field.kind === "image" ? "image/jpeg,image/png,image/webp,image/avif,image/gif" : "video/mp4,video/webm";
  function choose(file?: File) {
    if (!file) return;
    if (busy) return;
    if (!accept.split(",").includes(file.type)) { setError("Choose a supported image or video format."); return; }
    if (file.size > 100 * 1024 * 1024) { setError("The local upload limit is 100 MB."); return; }
    setError("");
    onUploaded(file);
  }
  return <div className={styles.uploadWrap}>
    <label className={styles.dropzone} data-dragging={dragging}
      onDragEnter={() => setDragging(true)}
      onDragLeave={() => setDragging(false)}
      onDragOver={event => { event.preventDefault(); setDragging(true); }}
      onDrop={event => { event.preventDefault(); setDragging(false); choose(event.dataTransfer.files[0]); }}>
      <input type="file" accept={accept} disabled={busy} onChange={event => { choose(event.currentTarget.files?.[0]); event.currentTarget.value = ""; }} />
      <UploadCloud aria-hidden="true" size={22} />
      <strong>{busy ? "Uploading…" : "Drop a replacement here, or browse"}</strong>
      <span>{field.kind === "image" ? "JPEG, PNG, WebP, AVIF or GIF" : "MP4 or WebM"} · up to 100 MB</span>
    </label>
    {error && <p className={styles.error} role="alert">{error}</p>}
  </div>;
}

function PageLink({ page, selected, onSelect, nested = false }: { page: ContentPage; selected: string; onSelect: (id: string) => void; nested?: boolean }) {
  const hasChildren = Boolean(page.children?.length);
  const [expanded, setExpanded] = useState(page.id === "home");
  if (hasChildren) return <details className={styles.navGroup} open={expanded} onToggle={event => setExpanded(event.currentTarget.open)}>
    <summary className={styles.navSummary}><span>{page.label}</span><ChevronDown aria-hidden="true" size={16} /></summary>
    <div className={styles.navChildren}>
      {page.sections.length > 0 && <button className={styles.navLink} data-selected={selected === page.id} data-nested type="button" onClick={() => onSelect(page.id)}><span>{page.label} overview</span><span className={styles.navCount}>{editableSections(page).reduce((count, section) => count + section.fields.length, 0) + collectionDefinitionsForPage(page.id).length || "—"}</span></button>}
      {page.children?.map(child => <PageLink key={child.id} page={child} selected={selected} onSelect={onSelect} nested />)}
    </div>
  </details>;
  return <button className={styles.navLink} data-selected={selected === page.id} data-nested={nested} onClick={() => onSelect(page.id)} type="button">
    <span>{page.label}</span><span className={styles.navCount}>{editableSections(page).reduce((count, section) => count + section.fields.length, 0) + collectionDefinitionsForPage(page.id).length || "—"}</span>
  </button>;
}

function findPage(id: string, pages: readonly ContentPage[] = adminPages): ContentPage | undefined {
  for (const page of pages) {
    if (page.id === id) return page;
    const child = findPage(id, page.children ?? []);
    if (child) return child;
  }
}

// Adapted from 21st.dev ddoemonn Segmented Control 23552: controlled radio
// group, sliding selection, roving arrow/Home/End keys and reduced motion.
function SegmentedChoice({ field, value, onChange, disabled }: { field: ContentField; value: string; onChange: (value: string) => void; disabled: boolean }) {
  const options = field.options ?? [];
  const selected = Math.max(0, options.findIndex(option => option.value === value));
  const reduced = useReducedMotion();
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const move = (index: number) => { buttons.current[index]?.focus(); onChange(options[index].value); };
  return <div id={field.id} className={styles.segmented} role="radiogroup" aria-labelledby={`${field.id}-label`} style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
    <motion.span className={styles.segmentedThumb} aria-hidden="true" style={{ width: `${100 / options.length}%` }} animate={{ x: `${selected * 100}%` }} transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 34, mass: .45 }} />
    {options.map((option, index) => <button key={option.value} ref={node => { buttons.current[index] = node; }} type="button" role="radio" aria-checked={index === selected} tabIndex={index === selected ? 0 : -1} disabled={disabled} onClick={() => onChange(option.value)} onKeyDown={event => {
      if (["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"].includes(event.key)) event.preventDefault();
      if (event.key === "ArrowRight" || event.key === "ArrowDown") move((index + 1) % options.length);
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") move((index - 1 + options.length) % options.length);
      if (event.key === "Home") move(0);
      if (event.key === "End") move(options.length - 1);
    }}>{option.label}</button>)}
  </div>;
}

function FieldEditor({ field, value, published, changed, busy, onChange, onSave, onUpload, homeVariants, journalPress }: {
  field: ContentField; value: string; published: string; changed: boolean; busy: boolean;
  onChange: (value: string) => void; onSave: () => void; onUpload: (file: File) => void; homeVariants?: ContentItem[]; journalPress?: ContentItem[];
}) {
  const Icon = field.kind === "video" ? Film : field.kind === "image" ? FileImage : Type;
  const shownJournalPress = journalPress?.filter(item => item.fields.visibility !== "hidden");
  const invalidDayRange = /^process\.(?:details\.phase-[1-5]|stage-[a-z-]+)\.days$/.test(field.id) && Boolean(value.trim()) && !parseProcessDayRange(value);
  return <div className={styles.field}>
    <div className={styles.fieldHeading}><Icon size={17} aria-hidden="true" /><div><label id={`${field.id}-label`} htmlFor={field.kind === "choice" && field.id !== "home.publishing.hero" ? undefined : field.id}>{field.label}</label><small>{field.id === "home.publishing.hero" || field.id === "journal.hero.featured-id" ? "Choice" : field.kind === "text" ? "Text" : field.kind === "image" ? "Image" : field.kind === "video" ? "Video" : "Choice"}</small></div></div>
    {field.help && <p className={styles.fieldHelp}>{field.help}</p>}
    <div className={styles.fieldBody}>
      {field.id === "home.publishing.hero" ? <select id={field.id} value={value} onChange={event => onChange(event.target.value)} disabled={busy}>{homeVariants?.map(item => <option key={item.id} value={item.id}>{item.fields.name || item.id}</option>)}</select> : field.id === "journal.hero.featured-id" ? <select id={field.id} value={value} onChange={event => onChange(event.target.value)} disabled={busy}>
        {value !== "none" && !shownJournalPress?.some(item => item.id === value) && <option value={value}>Selected story hidden or removed · choose a replacement</option>}
        <option value="none">No featured story</option>
        {shownJournalPress?.map(item => <option key={item.id} value={item.id}>{item.fields.title || item.id}</option>)}
      </select> : field.kind === "text" && /^models\.signature\.[a-z0-9-]+\.variant-\d+\.(area|price)$/.test(field.id) ? <input id={field.id} className={styles.shortTextInput} type="text" maxLength={80} value={value} onChange={event => onChange(event.target.value)} /> : field.kind === "text" ? <textarea id={field.id} value={value} onChange={event => onChange(event.target.value)} rows={Math.min(6, Math.max(2, Math.ceil(value.length / 55)))} /> : field.kind === "choice" ? <SegmentedChoice field={field} value={value} onChange={onChange} disabled={busy} /> : <>
        <div className={styles.mediaSample}>
          {field.kind === "image" ? <Image src={value} alt={`${field.label} draft preview`} width={640} height={360} unoptimized /> : <video src={value} controls muted preload="none" aria-label={`${field.label} draft preview`} />}
        </div>
        <MediaDropzone field={field} onUploaded={onUpload} busy={busy} />
        <input id={field.id} className={styles.pathInput} value={value} onChange={event => onChange(event.target.value)} aria-label={`${field.label} local path`} />
      </>}
      <div className={styles.fieldFooter}><span className={invalidDayRange ? styles.fieldWarning : undefined}>{invalidDayRange ? value === published ? "Saved range is invalid; the website shows the original until corrected." : "Invalid range; correct it before saving." : value === published ? "Matches live site" : "Unpublished change"}</span><div className={styles.fieldActions}><ActionButton variant="quiet" disabled={value === field.defaultValue || busy} onClick={() => onChange(field.defaultValue)} type="button">Use original</ActionButton><ActionButton variant="secondary" disabled={!changed || busy} onClick={onSave} type="button"><Save size={15} /> Save draft</ActionButton></div></div>
    </div>
  </div>;
}

export default function AdminStudio() {
  const [selectedId, setSelectedId] = useState("homepage");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(true);
  const [view, setView] = useState<View>("content");
  const [token, setToken] = useState("");
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [local, setLocal] = useState<Record<string, string>>({});
  const [localCollections, setLocalCollections] = useState<ContentCollections>({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const uploadControllerRef = useRef<AbortController | null>(null);
  const siteOrigin = useSyncExternalStore(subscribeToLocation, siteOriginSnapshot, () => null);
  const previewRef = useRef<HTMLIFrameElement>(null);
  const connect = useCallback(async (credential: string) => {
    setBusy(true); setError("");
    try { const next = await readAdminSnapshot(credential); setToken(credential); setSnapshot(next); setMessage(connectedMessage(next)); }
    catch (cause) { setError((cause as Error).message); }
    finally { setBusy(false); }
  }, []);
  useEffect(() => {
    if (window.location.hostname !== "127.0.0.1" || window.location.port !== String(localPorts.admin)) return;
    const params = new URLSearchParams(window.location.hash.slice(1));
    const demoToken = params.get("demo-token");
    if (!demoToken) return;
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    queueMicrotask(() => { void connect(demoToken); });
  }, [connect]);
  const homeVariants = collectionFor(collectionDefinitionsForPage("homepage")[0]);
  const sharedHomeSections = adminPages[0].children?.find(child => child.id === "hero-v1")?.sections.slice(1) ?? [];
  const customHomePages: ContentPage[] = homeVariants
    .filter(item => item.id !== "hero-v1" && item.id !== "hero-v2")
    .map(item => ({ id: `hero-variant:${item.id}`, label: item.fields.name || item.id, href: `/hero/${item.id}`, sections: sharedHomeSections }));
  const navigationPages: ContentPage[] = [{ ...adminPages[0], children: [...(adminPages[0].children ?? []), ...customHomePages] }, ...adminPages.slice(1)];
  const page = findPage(selectedId, navigationPages) ?? adminPages[0].children![0];
  const selectedCustomVariant = page.id.startsWith("hero-variant:") ? page.id.slice("hero-variant:".length) : null;
  const previewHref = selectedCustomVariant ? "/" : page.href;
  const visibleSections = editableSections(page);
  const totalMapped = visibleSections.reduce((count, section) => count + section.fields.length, 0);
  const draftCount = snapshot ? Object.keys(snapshot.draft).length + Object.keys(snapshot.draftCollections ?? {}).length : 0;

  const previewValues = useMemo(() => ({ ...(snapshot?.draft ?? {}), ...local, ...(selectedId.startsWith("hero-variant:") ? { "home.publishing.hero": selectedId.slice("hero-variant:".length) } : {}) }), [snapshot?.draft, local, selectedId]);
  const previewCollections = useMemo(() => ({ ...(snapshot?.publishedCollections ?? {}), ...(snapshot?.draftCollections ?? {}), ...localCollections }), [snapshot?.publishedCollections, snapshot?.draftCollections, localCollections]);
  useEffect(() => {
    if (siteOrigin) previewRef.current?.contentWindow?.postMessage({ type: "OKNO_CMS_PREVIEW", values: previewValues, collections: previewCollections }, siteOrigin);
  }, [previewValues, previewCollections, view, selectedId, siteOrigin]);
  const pageUrl = siteOrigin ? `${siteOrigin}${page.href}` : page.href;
  const previewPageUrl = siteOrigin ? `${siteOrigin}${previewHref}` : previewHref;

  function valueFor(field: ContentField) { return local[field.id] ?? snapshot?.draft[field.id] ?? snapshot?.published[field.id] ?? field.defaultValue; }
  function publishedFor(field: ContentField) { return snapshot?.published[field.id] ?? field.defaultValue; }
  function collectionFor(definition: CollectionDefinition): ContentItem[] {
    if (Object.hasOwn(localCollections, definition.id)) return localCollections[definition.id];
    if (snapshot && Object.hasOwn(snapshot.draftCollections ?? {}, definition.id)) return snapshot.draftCollections[definition.id];
    if (snapshot && Object.hasOwn(snapshot.publishedCollections ?? {}, definition.id)) return snapshot.publishedCollections[definition.id];
    const fallback = fallbackCollections[definition.id] ?? [];
    if (definition.id === "home.variants") return mergeLegacyHeroValues(fallback, { ...(snapshot?.published ?? {}), ...(snapshot?.draft ?? {}) });
    if (definition.id === "projects.records") return mergeLegacyProjectValues(fallback, { ...(snapshot?.published ?? {}), ...(snapshot?.draft ?? {}) });
    if (definition.id.startsWith("journal.")) return (journalDefaultCollections({ ...(snapshot?.published ?? {}), ...(snapshot?.draft ?? {}) }) as ContentCollections)[definition.id] ?? fallback;
    if (definition.id.startsWith("enquiry.options.")) return enquiryOptions({ ...(snapshot?.published ?? {}), ...(snapshot?.draft ?? {}) })[definition.id] ?? fallback;
    if (definition.id === "signature.plans") return signaturePlanDefaults({ ...(snapshot?.published ?? {}), ...(snapshot?.draft ?? {}) });
    if (definition.id.startsWith("footer.links.")) return footerLinkDefaults({ ...(snapshot?.published ?? {}), ...(snapshot?.draft ?? {}) })[definition.id] ?? fallback;
    return fallback;
  }

  async function authenticated(url: string, method = "GET", body?: BodyInit, json = false) {
    const response = await fetch(url, { method, body, headers: { Authorization: `Bearer ${token}`, ...(json ? { "Content-Type": "application/json" } : {}) }, cache: "no-store" });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Request failed.");
    return result;
  }

  async function save(field: ContentField) {
    if (!snapshot) return;
    setBusy(true); setError("");
    try {
      const orbit = field.id.match(/^models\.signature\.([a-z0-9-]+)\.orbit-film$/);
      const related = orbit ? [`models.signature.${orbit[1]}.detail-film`, `models.signature.${orbit[1]}.poster`] : [];
      const preparedSet = Boolean(orbit) && related.every(id => Object.hasOwn(local, id));
      const values = preparedSet ? Object.fromEntries([field.id, ...related].map(id => [id, local[id] ?? valueFor(field)])) : null;
      const next = await authenticated("/api/admin/content", "PATCH", JSON.stringify(values ? { values, revision: snapshot.revision, draftRevision: snapshot.draftRevision } : { id: field.id, value: valueFor(field), revision: snapshot.revision, draftRevision: snapshot.draftRevision }), true) as Snapshot;
      setSnapshot(previous => preferNewerSnapshot(previous, next)); setLocal(previous => { const copy = { ...previous }; for (const id of values ? Object.keys(values) : [field.id]) delete copy[id]; return copy; });
      setMessage(`${preparedSet ? "Rotation films and poster" : field.label} saved as a draft. Publish to update the site.`);
    } catch (cause) { setError((cause as Error).message); }
    finally { setBusy(false); }
  }

  async function upload(field: ContentField, file: File) {
    if (!snapshot) { setError("Connect with the admin token before uploading."); return; }
    setError("");
    try {
      const orbit = field.id.match(/^models\.signature\.([a-z0-9-]+)\.orbit-film$/);
      const result = await uploadFile(file, orbit ? "signature-orbit" : undefined);
      setLocal(previous => ({ ...previous, [field.id]: result.url,
        ...(orbit && result.detailUrl && result.posterUrl ? {
          [`models.signature.${orbit[1]}.detail-film`]: result.detailUrl,
          [`models.signature.${orbit[1]}.poster`]: result.posterUrl,
        } : {}),
      }));
      setMessage(`${file.name} ${result.prepared ? "prepared for smooth 24 fps seeking" : "uploaded"}. ${orbit ? "Save the rotation master to stage all three assets" : "Save this field as a draft"}, then publish.${result.warning ? ` ${result.warning}` : ""}`);
    } catch (cause) { if ((cause as Error).name === "AbortError") setMessage("Upload cancelled. The live media and draft are unchanged."); else setError((cause as Error).message); }
  }

  async function uploadFile(file: File, profile?: "signature-orbit") {
    if (uploadControllerRef.current) throw new Error("Finish or cancel the current upload first.");
    const controller = new AbortController();
    uploadControllerRef.current = controller;
    setBusy(true);
    try { return await uploadMedia(file, token, controller.signal, setUploadProgress, profile); }
    finally { uploadControllerRef.current = null; setUploadProgress(null); setBusy(false); }
  }

  async function uploadCollectionFile(file: File) {
    if (!snapshot) throw new Error("Connect with the admin token before uploading.");
    const result = await uploadFile(file);
    return result.url as string;
  }

  async function saveCollection(definition: CollectionDefinition) {
    if (!snapshot) return;
    setBusy(true); setError("");
    try {
      const next = await authenticated("/api/admin/content", "PATCH", JSON.stringify({ collectionId: definition.id, items: collectionFor(definition), revision: snapshot.revision, draftRevision: snapshot.draftRevision }), true) as Snapshot;
      setSnapshot(previous => preferNewerSnapshot(previous, next));
      setLocalCollections(previous => { const copy = { ...previous }; delete copy[definition.id]; return copy; });
      setMessage(`${definition.label} saved as a draft. Publish to update the site.`);
    } catch (cause) { setError((cause as Error).message); }
    finally { setBusy(false); }
  }

  async function saveSignatureCollections() {
    if (!snapshot) return;
    setBusy(true); setError("");
    try {
      const modelsDefinition = collectionDefinitionsForPage("signature").find(item => item.id === "signature.models")!;
      const plansDefinition = collectionDefinitionsForPage("signature").find(item => item.id === "signature.plans")!;
      const modelResult = Object.hasOwn(localCollections, "signature.models")
        ? await authenticated("/api/admin/content", "PATCH", JSON.stringify({ collectionId: "signature.models", items: collectionFor(modelsDefinition), revision: snapshot.revision, draftRevision: snapshot.draftRevision }), true) as Snapshot
        : snapshot;
      if (modelResult !== snapshot) {
        setSnapshot(previous => preferNewerSnapshot(previous, modelResult));
        setLocalCollections(previous => { const copy = { ...previous }; delete copy["signature.models"]; return copy; });
      }
      if (Object.hasOwn(localCollections, "signature.plans")) {
        const planResult = await authenticated("/api/admin/content", "PATCH", JSON.stringify({ collectionId: "signature.plans", items: collectionFor(plansDefinition), revision: modelResult.revision, draftRevision: modelResult.draftRevision }), true) as Snapshot;
        setSnapshot(previous => preferNewerSnapshot(previous, planResult));
        setLocalCollections(previous => { const copy = { ...previous }; delete copy["signature.plans"]; return copy; });
      }
      setMessage("Signature roster and plans saved as a draft. Publish to update the site.");
    } catch (cause) { setError((cause as Error).message); }
    finally { setBusy(false); }
  }

  function collectionPanel(definition: CollectionDefinition, focusedId?: string) {
    const items = collectionFor(definition);
    const activeIds = new Set(items.map(item => item.id));
    const previousItems = new Map<string, ContentItem>();
    for (const item of fallbackCollections[definition.id] ?? []) previousItems.set(item.id, item);
    for (const revision of snapshot?.history ?? []) for (const item of revision.publishedCollections?.[definition.id] ?? []) previousItems.set(item.id, item);
    const restorable = [...previousItems.values()].filter(item => !activeIds.has(item.id));
    const persisted = snapshot && Object.hasOwn(snapshot.draftCollections ?? {}, definition.id) ? snapshot.draftCollections[definition.id]
      : snapshot && Object.hasOwn(snapshot.publishedCollections ?? {}, definition.id) ? snapshot.publishedCollections[definition.id]
      : definition.id.startsWith("footer.links.") ? footerLinkDefaults({ ...(snapshot?.published ?? {}), ...(snapshot?.draft ?? {}) })[definition.id] ?? []
      : fallbackCollections[definition.id] ?? [];
    const changed = JSON.stringify(items) !== JSON.stringify(persisted);
    return <div className={styles.collectionSection} key={definition.id}>
      {definition.id === "journal.articles"
        ? <JournalArticleCollectionEditor items={items} onChange={updated => setLocalCollections(previous => ({ ...previous, [definition.id]: updated }))} disabled={busy || !snapshot} onUpload={uploadCollectionFile} />
        : definition.id === "projects.globePins"
        ? <GlobePinsEditor items={items} onChange={updated => setLocalCollections(previous => ({ ...previous, [definition.id]: updated }))} disabled={busy || !snapshot} onLookupLocation={async query => {
          const payload = await authenticated(`/api/admin/geocode?q=${encodeURIComponent(query)}`) as { results: GeocodePlace[] };
          return payload.results;
        }} />
        : definition.id === "projects.records"
        ? <ProjectsCollectionEditor items={items} onChange={updated => setLocalCollections(previous => ({ ...previous, [definition.id]: updated }))} disabled={busy || !snapshot} onUpload={uploadCollectionFile} />
        : definition.id === "hospitality.selectedWork"
        ? <HospitalitySelectionEditor items={items} projects={collectionFor(collectionDefinitionsForPage("projects").find(item => item.id === "projects.records")!)} onChange={updated => setLocalCollections(previous => ({ ...previous, [definition.id]: updated }))} disabled={busy || !snapshot} onUpload={uploadCollectionFile} />
        : <CollectionEditor definition={definition} items={items} focusedId={focusedId} onChange={updated => setLocalCollections(previous => ({ ...previous, [definition.id]: updated }))} disabled={busy || !snapshot} onUpload={uploadCollectionFile} />}
      {!focusedId && restorable.length > 0 && <details className={styles.restoreItems}><summary>Restore removed {definition.itemLabel}s ({restorable.length})</summary><div>{restorable.map(item => <div key={item.id}><span>{item.fields.title || item.fields.name || item.fields.label || item.fields.source || item.id}<small>{item.id}</small></span><ActionButton type="button" variant="quiet" disabled={busy || !snapshot || items.length >= (definition.maxItems ?? 200)} onClick={() => setLocalCollections(previous => ({ ...previous, [definition.id]: [...items, item] }))}>Restore</ActionButton></div>)}</div></details>}
      <div className={styles.collectionSave}><span>{changed ? "Unpublished collection changes" : "Matches saved collection"}</span><ActionButton variant="secondary" type="button" disabled={!snapshot || busy || !changed} onClick={() => void saveCollection(definition)}><Save size={15} /> Save {definition.label}</ActionButton></div>
    </div>;
  }

  function collectionsAfter(sectionId: string) {
    const definitions = collectionDefinitionsForPage(page.id);
    if (page.id === "projects") return definitions.filter(definition => sectionId === "globe-pins" ? definition.id === "projects.globePins" : sectionId === "project-library" ? definition.id === "projects.records" : false);
    if (page.id === "hospitality" && sectionId === "projects") return definitions;
    if (page.id === "journal") {
      const key = sectionId === "press-intro" ? "journal.press" : sectionId === "notes-intro" ? "journal.notes" : sectionId === "archive" ? "journal.articles" : "";
      return definitions.filter(definition => definition.id === key);
    }
    if (page.id === "signature" && sectionId.endsWith("-explore")) {
      return definitions.filter(definition => definition.id === `signature.gallery.${sectionId.slice(0, -8)}`);
    }
    if (page.id === "footer" && sectionId.startsWith("footer-") && ["footer-homes", "footer-explore", "footer-okno"].includes(sectionId)) {
      return definitions.filter(definition => definition.id === `footer.links.${sectionId.slice(7)}`);
    }
    if (page.id === "enquiry") {
      const group = sectionId === "home-tab" ? "home." : sectionId === "hospitality-tab" ? "hospitality." : sectionId === "press-tab" ? "press." : "";
      return group ? definitions.filter(definition => definition.id.startsWith(`enquiry.options.${group}`)) : [];
    }
    return [];
  }

  function sectionPanel(section: ContentSection, index: number) {
    return <div key={`${page.id}:${section.id}`}><details className={styles.section}>
      <summary><span className={styles.sectionOrder}>{String(index + 1).padStart(2, "0")}</span><span className={styles.sectionName}>{section.label}<small>{section.fields.length ? `${section.fields.length} connected fields` : collectionsAfter(section.id).length ? "Connected collection" : "Mapping in progress"}</small></span><ChevronDown aria-hidden="true" size={20} /></summary>
      <div className={styles.sectionBody}>
        {section.note && <p className={styles.unmapped}>{section.note}</p>}
        {section.fields.map(field => <FieldEditor key={field.id} field={field} value={valueFor(field)} published={publishedFor(field)} changed={Boolean(snapshot && valueFor(field) !== (snapshot.draft[field.id] ?? snapshot.published[field.id] ?? field.defaultValue))} busy={busy} onChange={value => setLocal(previous => ({ ...previous, [field.id]: value }))} onSave={() => void save(field)} onUpload={file => void upload(field, file)} homeVariants={field.id === "home.publishing.hero" ? collectionFor(collectionDefinitionsForPage("homepage")[0]) : undefined} journalPress={field.id === "journal.hero.featured-id" ? collectionFor(collectionDefinitionsForPage("journal").find(definition => definition.id === "journal.press")!) : undefined} />)}
        {section.id === "global-brand" && <GlobalBrandPreview values={{ ...(snapshot?.published ?? {}), ...previewValues }} />}
        {(page.id === "footer" || page.id === "projects") && collectionsAfter(section.id).map(definition => collectionPanel(definition))}
      </div>
    </details>{page.id !== "footer" && page.id !== "projects" && collectionsAfter(section.id).map(definition => collectionPanel(definition))}</div>;
  }

  function signaturePanels() {
    const roster = collectionFor(collectionDefinitionsForPage("signature").find(definition => definition.id === "signature.models")!);
    const plans = collectionFor(collectionDefinitionsForPage("signature").find(definition => definition.id === "signature.plans")!);
    const baseIds = new Set(signatureModelDefaults.map(item => item.id));
    const customIds = new Set(roster.map(item => item.id));
    const previousModels = new Map<string, ContentItem>(signatureModelDefaults.map(item => [item.id,item]));
    const previousPlans = new Map<string, ContentItem>(signaturePlanDefaults().map(item => [item.id,item]));
    for (const revision of [...(snapshot?.history ?? []), { publishedCollections: snapshot?.publishedCollections ?? {} }]) {
      for (const item of revision.publishedCollections?.["signature.models"] ?? []) previousModels.set(item.id,item);
      for (const item of revision.publishedCollections?.["signature.plans"] ?? []) previousPlans.set(item.id,item);
    }
    const restorable = [...previousModels.values()].filter(item => !customIds.has(item.id));
    const changed = Object.hasOwn(localCollections, "signature.models") || Object.hasOwn(localCollections, "signature.plans");
    const addModel = () => {
      let index = 1;
      while (customIds.has(`new-model-${index}`)) index++;
      const id = `new-model-${index}`;
      setLocalCollections(previous => ({ ...previous,
        "signature.models": [...roster, { id, fields: { name: `New model ${index}`, exploreAction: "Explore details", features: JSON.stringify([{ title: "", copy: "" },{ title: "", copy: "" },{ title: "", copy: "" }]), gallery: "[]" } }],
        "signature.plans": [...plans, { id: `${id}-plan-1`, fields: { modelId: id, name: "Studio", area: "Area on request", price: "Price on request", spaces: "Spaces on request" } }],
      }));
    };
    return <>
      <div className={styles.signatureToolbar}><div><strong>Signature model library</strong><p>{roster.length} models · Open a model for its media, story, Explore detail, preview images and plans.</p></div><ActionButton type="button" disabled={busy || !snapshot || roster.length >= 24} onClick={addModel}>Add model</ActionButton></div>
      {visibleSections.filter(section => !/^(forza|kray|gaze|tengo|trib|octapod)-/.test(section.id)).map((section,index) => sectionPanel(section,index))}
      {roster.map((record,index) => {
        const ownedPlans = plans.filter(plan => plan.fields.modelId === record.id);
        const ownedSections = visibleSections.filter(section => section.id.startsWith(`${record.id}-`) && !section.id.includes("-plan-"));
        return <details key={`${page.id}:model:${record.id}`} className={styles.modelTray}>
          <summary><span className={styles.sectionOrder}>{String(index+1).padStart(2,"0")}</span><span className={styles.sectionName}>{record.fields.name || record.id}<small>{ownedPlans.length} {ownedPlans.length === 1 ? "plan" : "plans"} · rotation, story, Explore and previews</small></span><ChevronDown size={20} aria-hidden="true" /></summary>
          <div className={styles.modelBody}>
            {baseIds.has(record.id) && ownedSections.map((section,sectionIndex) => sectionPanel(section,sectionIndex))}
            <SignatureModelPanel
              model={record} plans={ownedPlans} builtIn={baseIds.has(record.id)} disabled={busy || !snapshot}
              canMoveUp={index > 0} canMoveDown={index < roster.length - 1}
              onMoveModel={direction => setLocalCollections(previous => {
                const next = [...roster]; const target = index + direction;
                [next[index], next[target]] = [next[target], next[index]];
                return { ...previous, "signature.models": next };
              })}
              onModelChange={updated => setLocalCollections(previous => ({ ...previous, "signature.models": roster.map(item => item.id === updated.id ? updated : item) }))}
              onModelIdChange={nextId => {
                if (!nextId || roster.some(item => item.id === nextId && item.id !== record.id)) return false;
                if (nextId === record.id) return true;
                setLocalCollections(previous => ({ ...previous,
                  "signature.models": roster.map(item => item.id === record.id ? { ...item, id: nextId } : item),
                  "signature.plans": plans.map(plan => plan.fields.modelId === record.id ? { ...plan, fields: { ...plan.fields, modelId: nextId } } : plan),
                }));
                return true;
              }}
              onRemoveModel={() => setLocalCollections(previous => ({ ...previous,
                "signature.models": roster.filter(item => item.id !== record.id),
                "signature.plans": plans.filter(plan => plan.fields.modelId !== record.id),
              }))}
              onPlansChange={updated => setLocalCollections(previous => ({ ...previous, "signature.plans": [...plans.filter(plan => plan.fields.modelId !== record.id), ...updated] }))}
              onUpload={async (file,rotation) => {
                const result = await uploadFile(file,rotation ? "signature-orbit" : undefined);
                return { url: result.url, detailUrl: result.detailUrl, posterUrl: result.posterUrl };
              }}
            />
          </div>
        </details>;
      })}
      {restorable.length > 0 && <details className={styles.restoreItems}><summary>Restore removed models ({restorable.length})</summary><div>{restorable.map(item => <div key={item.id}><span>{item.fields.name || item.id}</span><ActionButton type="button" variant="quiet" disabled={busy || !snapshot || roster.length >= 24} onClick={() => setLocalCollections(previous => ({ ...previous, "signature.models": [...roster,item], "signature.plans": [...plans,...[...previousPlans.values()].filter(plan => plan.fields.modelId === item.id && !plans.some(current => current.id === plan.id))] }))}>Restore</ActionButton></div>)}</div></details>}
      {!roster.length && <p className={styles.unmapped}>Add a Signature model before publishing.</p>}
      <div className={styles.signatureSave}><span>{changed ? "Unpublished roster or plan changes" : "Roster and plans match the saved draft"}</span><ActionButton variant="secondary" type="button" disabled={!changed || busy || !snapshot} onClick={() => void saveSignatureCollections()}><Save size={15}/> Save Signature models and plans</ActionButton></div>
    </>;
  }

  async function publish() {
    if (!snapshot || !draftCount) return;
    setBusy(true); setError("");
    try {
      const next = await authenticated("/api/admin/content", "PUT", JSON.stringify({ revision: snapshot.revision, draftRevision: snapshot.draftRevision }), true) as Snapshot;
      setSnapshot(previous => preferNewerSnapshot(previous, next)); setMessage(`Published revision ${next.revision}. Open site pages update shortly.`);
    } catch (cause) { setError((cause as Error).message); }
    finally { setBusy(false); }
  }

  return <div className={styles.studio} data-admin-studio>
    <aside className={styles.sidebar} aria-label="Website page hierarchy">
      <div className={styles.brand}><span className={styles.brandMark}>OKNO</span><span>CONTENT STUDIO</span></div>
      <div className={styles.version}>Final Showcase <strong>2026-10-05</strong></div>
      <button className={styles.mobileNavToggle} type="button" aria-expanded={mobileMenuOpen} aria-controls="admin-page-nav" onClick={() => setMobileMenuOpen(open => !open)}>Pages in website order <ChevronDown size={18} aria-hidden="true" /></button>
      <div className={styles.navTitle}>Pages in website order</div>
      <nav id="admin-page-nav" data-mobile-open={mobileMenuOpen}>{navigationPages.map(page => <PageLink key={page.id} page={page} selected={selectedId} onSelect={id => { setSelectedId(id); setView("content"); setMobileMenuOpen(false); }} />)}</nav>
      <div className={styles.sidebarFoot}>Older demo is archived separately.<br />This editor targets Final Showcase only.</div>
    </aside>
    <main className={styles.main}>
      <header className={styles.topbar}>
        <div><p className={styles.context}>Website / {page.label}</p><h1>{page.label}</h1><p className={styles.subtitle}>Edit content in the same order it appears on this page.</p></div>
        <div className={styles.topActions}>{snapshot && <ActionButton variant="secondary" disabled={busy} type="button" onClick={() => { uploadControllerRef.current?.abort(); setToken(""); setSnapshot(null); setLocal({}); setLocalCollections({}); setError(""); setMessage("Disconnected. Enter your key to reconnect."); }}>Disconnect</ActionButton>}<a href={pageUrl} target="_blank" rel="noopener noreferrer" className={styles.siteLink}>Open page <ExternalLink size={16} /></a><ActionButton disabled={!snapshot || !draftCount || busy} onClick={publish} type="button"><Send size={16} /> Publish {draftCount ? `${draftCount} draft${draftCount === 1 ? "" : "s"}` : "changes"}</ActionButton></div>
      </header>
      {!snapshot && <div className={styles.auth}>
        <LockKeyhole size={19} aria-hidden="true" /><div><strong>Connect the content studio</strong><p>Enter your admin action key. Reload or disconnect to clear access from this tab.</p></div>
        <input type="password" aria-label="Admin token" autoComplete="off" value={token} onChange={event => setToken(event.target.value)} onKeyDown={event => { if (event.key === "Enter") void connect(token); }} />
        <ActionButton variant="secondary" disabled={!token || busy} onClick={() => void connect(token)} type="button">Connect</ActionButton>
      </div>}
      {message && <p className={styles.notice} role="status">{message}</p>}
      {error && <p className={styles.error} role="alert">{error}</p>}
      {uploadProgress && <div className={styles.uploadProgress} role="status" aria-live="polite">
        <div><strong>{uploadProgress.name}</strong><span>{uploadProgress.stage}{uploadProgress.percent === null ? "" : ` · ${uploadProgress.percent}%`}</span></div>
        <progress max={100} value={uploadProgress.percent ?? undefined} aria-label={`${uploadProgress.name} upload progress`} />
        <ActionButton variant="secondary" type="button" onClick={() => uploadControllerRef.current?.abort()}>Cancel upload</ActionButton>
      </div>}
      <div className={styles.tabList} role="tablist" aria-label="Editor view">
        <button id="admin-content-tab" role="tab" tabIndex={view === "content" ? 0 : -1} aria-controls="admin-content-panel" aria-selected={view === "content"} onClick={() => setView("content")} onKeyDown={event => { if (event.key === "ArrowRight") { setView("site"); document.getElementById("admin-site-tab")?.focus(); } }}>Page content</button>
        <button id="admin-site-tab" role="tab" tabIndex={view === "site" ? 0 : -1} aria-controls="admin-site-panel" aria-selected={view === "site"} onClick={() => setView("site")} onKeyDown={event => { if (event.key === "ArrowLeft") { setView("content"); document.getElementById("admin-content-tab")?.focus(); } }}>Draft site preview</button>
      </div>
      {view === "content" ? <div id="admin-content-panel" aria-labelledby="admin-content-tab" className={styles.workspace} role="tabpanel">
        <div className={styles.editorColumn}>
          <div className={styles.sectionIntro}><h2>Sections</h2><p>{`${totalMapped ? `${totalMapped} connected field${totalMapped === 1 ? "" : "s"}` : "Fields are being mapped"} · Expand a section to edit its content.`}</p></div>
          {(page.id === "homepage" || page.id === "hero-v1" || selectedCustomVariant) && collectionDefinitionsForPage("homepage").map(definition => collectionPanel(definition, page.id === "hero-v1" ? 'hero-v1' : selectedCustomVariant ?? undefined))}
          {page.id === "signature" ? signaturePanels() : visibleSections.map((section,index) => sectionPanel(section,index))}
          {!visibleSections.length && !collectionDefinitionsForPage(page.id).length && <p className={styles.unmapped}>Choose one of the Home variants in the left panel.</p>}
        </div>
        <aside className={styles.previewColumn} aria-label="Page position preview"><div className={styles.previewTop}><div><strong>On the website</strong><span>Draft preview · {selectedCustomVariant ? `${page.href} opening` : page.href}</span></div><a href={pageUrl} target="_blank" rel="noopener noreferrer"><ExternalLink size={16} aria-hidden="true" /><span className={styles.srOnly}>Open full page</span></a></div><iframe ref={previewRef} key={`${page.id}:${snapshot?.revision ?? 0}`} title={`${page.label} draft preview`} src={siteOrigin ? previewPageUrl : undefined} loading="lazy" onLoad={() => { if (siteOrigin) previewRef.current?.contentWindow?.postMessage({ type: "OKNO_CMS_PREVIEW", values: previewValues, collections: previewCollections }, siteOrigin); }} /></aside>
      </div> : <div id="admin-site-panel" aria-labelledby="admin-site-tab" className={styles.fullPreview} role="tabpanel"><iframe ref={previewRef} key={`${page.id}:${snapshot?.revision ?? 0}`} title={`${page.label} draft site preview`} src={siteOrigin ? previewPageUrl : undefined} onLoad={() => { if (siteOrigin) previewRef.current?.contentWindow?.postMessage({ type: "OKNO_CMS_PREVIEW", values: previewValues, collections: previewCollections }, siteOrigin); }} /></div>}
    </main>
  </div>;
}
