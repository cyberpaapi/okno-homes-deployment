import "server-only";

import { timingSafeEqual } from "node:crypto";
import { mkdir, readFile, rename, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { contentFieldsById } from "@/data/adminContent";
import { initialProjectItems } from "@/data/projectCollections";
import { initialHospitalitySelections } from "@/data/hospitalitySelectedWork";
import { homeVariantDefaults } from "@/data/homeVariants";
import { pressEntries, publicationLogos } from "@/components/journal/journalData";
import { journalArticleFallbacks, journalDefaultCollections } from "@/lib/journalCollections";
import { collectionDefinitionsById, type ContentCollections, type ContentItem } from "@/lib/contentCollections";
import { localDestination } from "@/lib/localDestination";
import { localDemoCredentialForRequest, readLocalDemoCredential } from "@/lib/localDemoAuth";
import { globePinCoordinatesError } from "@/lib/projectCoordinates";
import { validFooterSocialHref } from "@/data/footerContent";
import { signatureModelDefaults, signaturePlanDefaults } from "@/lib/signatureCollections";
import { parseProcessDayRange } from "@/lib/processDayRange";
import { cloudStorageEnabled, readCloudContent, writeCloudContent, cloudMediaExists, publicAssetExists } from "@/lib/cloudStorage";
import contentSeed from "../../config/content-seed.json";

export type ContentSnapshot = {
  revision: number;
  draftRevision: number;
  published: Record<string, string>;
  draft: Record<string, string>;
  publishedCollections: ContentCollections;
  draftCollections: ContentCollections;
  history: { revision: number; published: Record<string, string>; publishedCollections: ContentCollections; publishedAt: string }[];
};

const directory = path.join(process.cwd(), ".okno-content");
const file = path.join(directory, "content.json");
const empty: ContentSnapshot = { revision: 0, draftRevision: 0, published: {}, draft: {}, publishedCollections: {}, draftCollections: {}, history: [] };
const trustedJournalSvgLogos = new Set(Object.values(publicationLogos).filter(value => value.endsWith(".svg")));
const localActionFields = new Set([
  "home.timeline.action-href", "home.signature.action-href", "home.bespoke.action-href",
  "home.sustainability.action-href", "home.editorial.journal.href", "home.editorial.about.href",
  "projects.intro.action-href", "projects.detail.return-href",
  "hospitality.opening.action-href", "hospitality.closing.action-href",
  "sustainability.ending.action-href",
]);
let queue = Promise.resolve();

function processTextLimit(id: string): number | null {
  if (/^process\.details\.phase-[1-5]\.title$/.test(id)) return 44;
  if (/^process\.details\.phase-[1-5]\.copy$/.test(id)) return 240;
  if (/^process\.details\.phase-[1-5]\.alt$/.test(id)) return 200;
  if (/^process\.details\.phase-[1-5]\.days$/.test(id)) return 24;
  if (/^process\.stage-[a-z-]+\.title$/.test(id)) return 48;
  if (/^process\.stage-[a-z-]+\.copy$/.test(id)) return 220;
  if (/^process\.stage-[a-z-]+\.days$/.test(id)) return 24;
  if (/^process\.stage-[a-z-]+\.label$/.test(id)) return 48;
  if (/^process\.sequence\.rail-(heading|summary)$/.test(id)) return 64;
  return null;
}

function validateProcessPublish(values: Record<string, string>) {
  for (let index = 1; index <= 5; index++) {
    const prefix = `process.details.phase-${index}`;
    for (const key of ["days", "title", "alt"] as const) {
      const id = `${prefix}.${key}`;
      const value = values[id] ?? contentFieldsById.get(id)?.defaultValue ?? "";
      if (!value.trim()) throw new Error(`Process timeline / phase ${index}: ${key === "alt" ? "describe its photograph" : `keep its ${key}`} before publishing.`);
    }
  }
}

function cleanEntries(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).filter(([key, entry]) => contentFieldsById.has(key) && typeof entry === "string"));
}

function cleanCollections(value: unknown): ContentCollections {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const collections: ContentCollections = {};
  for (const [key, rawItems] of Object.entries(value)) {
    if (!collectionDefinitionsById.has(key) || !Array.isArray(rawItems)) continue;
    const items: ContentItem[] = [];
    const seen = new Set<string>();
    for (const rawItem of rawItems) {
      if (!rawItem || typeof rawItem !== "object" || Array.isArray(rawItem)) continue;
      const item = rawItem as Record<string, unknown>;
      if (typeof item.id !== "string" || !/^[a-z0-9][a-z0-9_-]{0,79}$/i.test(item.id) || seen.has(item.id)) continue;
      const fields = item.fields;
      if (!fields || typeof fields !== "object" || Array.isArray(fields)) continue;
      const allowed = new Set(collectionDefinitionsById.get(key)?.fields.map(field => field.key));
      const safeFields = Object.fromEntries(Object.entries(fields).filter((entry): entry is [string, string] => allowed.has(entry[0]) && typeof entry[1] === "string"));
      seen.add(item.id);
      items.push({ id: item.id, fields: safeFields });
    }
    collections[key] = items;
  }
  return collections;
}

function normalizeContent(parsed: Partial<ContentSnapshot>): ContentSnapshot {
    return {
      revision: Number.isSafeInteger(parsed.revision) && (parsed.revision ?? 0) >= 0 ? parsed.revision! : 0,
      draftRevision: Number.isSafeInteger(parsed.draftRevision) && (parsed.draftRevision ?? 0) >= 0 ? parsed.draftRevision! : 0,
      published: cleanEntries(parsed.published),
      draft: cleanEntries(parsed.draft),
      publishedCollections: cleanCollections(parsed.publishedCollections),
      draftCollections: cleanCollections(parsed.draftCollections),
      history: Array.isArray(parsed.history) ? parsed.history.filter(item => item && Number.isSafeInteger(item.revision) && typeof item.publishedAt === "string").map(item => ({ revision: item.revision, published: cleanEntries(item.published), publishedCollections: cleanCollections(item.publishedCollections), publishedAt: item.publishedAt })) : [],
    };
}

async function readContentWithVersion() {
  if (cloudStorageEnabled()) {
    const stored = await readCloudContent();
    return { snapshot: normalizeContent((stored?.value ?? contentSeed) as Partial<ContentSnapshot>), etag: stored?.etag };
  }
  try { return { snapshot: normalizeContent(JSON.parse(await readFile(file, "utf8")) as Partial<ContentSnapshot>), etag: undefined }; }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return { snapshot: { ...empty, published: {}, draft: {}, publishedCollections: {}, draftCollections: {} }, etag: undefined };
    throw error;
  }
}

export async function readContent(): Promise<ContentSnapshot> {
  return (await readContentWithVersion()).snapshot;
}

async function updateContent(change: (current: ContentSnapshot) => ContentSnapshot): Promise<ContentSnapshot> {
  let release: () => void = () => undefined;
  const next = new Promise<void>(resolve => { release = resolve; });
  const previous = queue;
  queue = next;
  await previous;
  try {
    const { snapshot, etag } = await readContentWithVersion();
    const updated = change(snapshot);
    if (cloudStorageEnabled()) { await writeCloudContent(updated, etag); return updated; }
    await mkdir(directory, { recursive: true });
    const temporary = path.join(directory, `content.${process.pid}.${Date.now()}.tmp`);
    await writeFile(temporary, JSON.stringify(updated, null, 2), { mode: 0o600 });
    await rename(temporary, file);
    return updated;
  } finally {
    release();
  }
}

export function adminTokenConfigured() {
  return Boolean((process.env.OKNO_CMS_ADMIN_TOKEN && process.env.OKNO_CMS_ADMIN_TOKEN.length >= 8) || readLocalDemoCredential());
}

function matchesToken(configured: string | undefined, supplied: string | undefined) {
  if (!configured || configured.length < 8 || !supplied) return false;
  const first = Buffer.from(configured);
  const second = Buffer.from(supplied);
  return first.length === second.length && timingSafeEqual(first, second);
}

export function demoAccessExpiresAt(request: Request) {
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const demo = localDemoCredentialForRequest(request);
  return matchesToken(demo?.token, supplied) ? demo?.expiresAt : null;
}

export function isAdminAuthorized(request: Request) {
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (matchesToken(process.env.OKNO_CMS_ADMIN_TOKEN, supplied)) return true;
  return Boolean(demoAccessExpiresAt(request));
}

export function validateContentValue(id: string, value: string): string | null {
  const field = contentFieldsById.get(id);
  if (!field) return "Unknown content field.";
  if (value.length > (field.kind === "text" ? 4000 : 512)) return "Value is too long.";
  if (field.kind === "text") {
    const processLimit = processTextLimit(id);
    if (processLimit !== null && (value.length > processLimit || (!id.endsWith(".copy") && /[\r\n]/.test(value)))) return `Keep this Process timeline field within ${processLimit} characters${id.endsWith(".copy") ? "" : " and on one line"}.`;
    if (/^process\.(?:details\.phase-[1-5]|stage-[a-z-]+)\.days$/.test(id) && value.trim() && !parseProcessDayRange(value)) return "Use a short label and a day range within 01–90, such as Days 01–10 or Weeks 01–03.";
    if (/^models\.signature\.[a-z0-9-]+\.variant-\d+\.(area|price)$/.test(id) && (!value.trim() || value.length > 80 || /[\r\n]/.test(value))) return "Enter a single-line area or price of up to 80 characters.";
    if (/^footer\.social\.[a-z-]+\.href$/.test(id) && !validFooterSocialHref(value)) return "Use a secure HTTPS social profile address.";
    if (/^footer\.(?:homes|explore|okno)\.[a-z-]+\.href$/.test(id) && localDestination(value, "") !== value) return "Use a same-site path beginning with /.";
    if (/^footer\.(?:homes|explore|okno)\.[a-z-]+\.href$/.test(id) && !value.startsWith("/")) return "Use a same-site path beginning with /.";
    if (/^footer\.(?:homes|explore|okno)\.(?:heading|[a-z-]+\.label)$/.test(id) && !value.trim()) return "Keep a visible column heading or link label.";
    if (/^footer\.social\.(?:navigation-label|[a-z-]+\.name)$/.test(id) && !value.trim()) return "Keep an accessible social name.";
    if (localActionFields.has(id) && localDestination(value, "") !== value) return "Use a same-site path beginning with / or an in-page #anchor.";
    return null;
  }
  if (field.kind === "choice") return field.options?.some(option => option.value === value) ? null : "Choose one of the listed options.";
  if (field.kind === "image" && value === field.defaultValue && (/^brand\.logo\./.test(id) || /^footer\.social\.[a-z-]+\.icon$/.test(id)) && /\.(?:svg|ico)$/i.test(value)) return null;
  if (field.kind === "image" && value === field.defaultValue && /^journal\.entry-press-[a-z0-9-]+\.logo$/.test(id) && trustedJournalSvgLogos.has(value)) return null;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\") || value.includes("..") || /[?#]/.test(value)) {
    return "Media must use a local site path.";
  }
  if (field.kind === "image" && !/\.(png|jpe?g|webp|avif|gif)$/i.test(value)) return "Choose an image file.";
  if (field.kind === "video" && !/\.(mp4|webm)$/i.test(value)) return "Choose a video file.";
  return null;
}

async function mediaExists(value: string) {
  const upload = value.match(/^\/api\/site-media\/([a-f0-9]{64}\.(?:png|jpg|webp|avif|gif|mp4|webm))$/);
  if (value.startsWith("/api/") && !upload) return false;
  if (cloudStorageEnabled()) return upload ? cloudMediaExists(upload[1]) : publicAssetExists(value);
  const resolved = upload
    ? path.join(directory, "media", upload[1])
    // Next's metadata icon is served from app/, not the public directory.
    : value === "/favicon.ico" ? path.join(process.cwd(), "src", "app", "favicon.ico")
      : path.join(process.cwd(), "public", value.slice(1));
  try { return (await stat(resolved)).isFile(); } catch { return false; }
}

export async function saveDraft(id: string, value: string, revision: number, draftRevision: number) {
  return saveFieldsDraft({ [id]: value }, revision, draftRevision);
}

export async function saveFieldsDraft(rawValues: unknown, revision: number, draftRevision: number) {
  if (!rawValues || typeof rawValues !== "object" || Array.isArray(rawValues)) throw new Error("Invalid content fields.");
  const entries = Object.entries(rawValues);
  if (!entries.length || entries.length > 100) throw new Error("Choose between 1 and 100 content fields to save.");
  const values: Record<string, string> = {};
  for (const [id, value] of entries) {
    if (typeof value !== "string") throw new Error(`Invalid value for ${id}.`);
    const error = validateContentValue(id, value);
    if (error) throw new Error(`${id}: ${error}`);
    if (["image", "video"].includes(contentFieldsById.get(id)?.kind ?? "") && !(await mediaExists(value))) {
      throw new Error(`${id}: this media path does not exist on the local website.`);
    }
    values[id] = value;
  }
  return updateContent(current => {
    if (current.revision !== revision) throw new Error("The published content changed. Reload before saving.");
    if (current.draftRevision !== draftRevision) throw new Error("The draft content changed. Reload before saving.");
    return { ...current, draftRevision: current.draftRevision + 1, draft: { ...current.draft, ...values } };
  });
}

function validateDraftItems(collectionId: string, value: unknown): ContentItem[] {
  const definition = collectionDefinitionsById.get(collectionId);
  if (!definition) throw new Error("Unknown collection.");
  if (!Array.isArray(value) || value.length > (definition.maxItems ?? 200)) throw new Error("Collection has too many items.");
  const allowed = new Map(definition.fields.map(field => [field.key, field]));
  const ids = new Set<string>();
  const items: ContentItem[] = [];
  for (const raw of value) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("Invalid collection item.");
    const { id, fields } = raw as Record<string, unknown>;
    if (typeof id !== "string" || !/^[a-z0-9][a-z0-9_-]{0,79}$/i.test(id) || ids.has(id)) throw new Error("Each item needs a unique stable ID.");
    if (!fields || typeof fields !== "object" || Array.isArray(fields)) throw new Error("Invalid item fields.");
    const validated: Record<string, string> = {};
    for (const [key, rawField] of Object.entries(fields)) {
      const field = allowed.get(key);
      if (!field || typeof rawField !== "string" || rawField.length > (field.kind === "json" ? 200000 : 8000)) throw new Error(`Invalid ${key} field in ${id}.`);
      if (field.kind === "choice" && rawField && !field.options?.some(option => option.value === rawField)) throw new Error(`Choose a listed ${field.label.toLowerCase()} in ${id}.`);
      if (field.kind === "url" && rawField && !validDestination(rawField)) throw new Error(`Use a local path or HTTPS link for ${field.label.toLowerCase()} in ${id}.`);
      if (collectionId.startsWith("footer.links.") && key === "href" && rawField && (!rawField.startsWith("/") || localDestination(rawField, "") !== rawField || rawField.includes(".."))) throw new Error(`Use a same-site path for the Footer link in ${id}.`);
      if ((field.kind === "image" || field.kind === "video") && rawField && !validMediaPath(rawField, field.kind) && !(collectionId === "journal.press" && key === "logo" && trustedJournalSvgLogos.has(rawField))) throw new Error(`Choose a local ${field.kind} path for ${field.label.toLowerCase()} in ${id}.`);
      if (field.kind === "json" && rawField) {
        try { JSON.parse(rawField); } catch { throw new Error(`${field.label} in ${id} must contain valid structured content.`); }
      }
      validated[key] = rawField;
    }
    ids.add(id);
    items.push({ id, fields: validated });
  }
  if (JSON.stringify(items).length > 600000) throw new Error("Collection is too large to save.");
  return items;
}

function validMediaPath(value: string, kind: "image" | "video") {
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\") || value.includes("..") || /[?#]/.test(value)) return false;
  return kind === "image" ? /\.(png|jpe?g|webp|avif|gif)$/i.test(value) : /\.(mp4|webm)$/i.test(value);
}

function validDestination(value: string) {
  if (value.startsWith("/") && !value.startsWith("//")) return !value.includes("\\") && !value.includes("..") && !/[?#]/.test(value);
  try { return new URL(value).protocol === "https:"; } catch { return false; }
}

export async function saveCollectionDraft(collectionId: string, rawItems: unknown, revision: number, draftRevision: number) {
  const items = validateDraftItems(collectionId, rawItems);
  for (const item of items) {
    for (const field of collectionDefinitionsById.get(collectionId)!.fields) {
      if ((field.kind === "image" || field.kind === "video") && item.fields[field.key] && !(await mediaExists(item.fields[field.key]))) {
        throw new Error(`${field.label} in ${item.id} does not exist on the local website.`);
      }
    }
    for (const [pathValue, kind] of nestedMediaPaths(collectionId, item)) {
      if (!validMediaPath(pathValue, kind) || !(await mediaExists(pathValue))) throw new Error(`${item.id}: a nested ${kind} path is invalid or missing.`);
    }
  }
  return updateContent(current => {
    if (current.revision !== revision) throw new Error("The published content changed. Reload before saving.");
    if (current.draftRevision !== draftRevision) throw new Error("The draft content changed. Reload before saving.");
    return { ...current, draftRevision: current.draftRevision + 1, draftCollections: { ...current.draftCollections, [collectionId]: items } };
  });
}

function nestedMediaPaths(collectionId: string, item: ContentItem): [string, "image" | "video"][] {
  const paths: [string, "image" | "video"][] = [];
  const parse = (key: string) => {
    try { return JSON.parse(item.fields[key] || "[]") as unknown; } catch { return []; }
  };
  if (collectionId === "projects.records") {
    const gallery = parse("gallery");
    const films = parse("films");
    if (Array.isArray(gallery)) for (const image of gallery) if (image && typeof image === "object" && typeof image.src === "string" && image.src) paths.push([image.src, "image"]);
    if (Array.isArray(films)) for (const film of films) if (film && typeof film === "object") {
      if (typeof film.src === "string" && film.src) paths.push([film.src, "video"]);
      if (typeof film.poster === "string" && film.poster) paths.push([film.poster, "image"]);
    }
  }
  if (collectionId === "journal.articles") {
    const sections = parse("sections");
    if (Array.isArray(sections)) for (const section of sections) if (section && typeof section === "object" && typeof section.image === "string" && section.image) paths.push([section.image, "image"]);
  }
  if (collectionId === "signature.models") {
    const gallery = parse("gallery");
    if (Array.isArray(gallery)) for (const image of gallery) if (image && typeof image === "object" && typeof image.image === "string" && image.image) paths.push([image.image, "image"]);
  }
  return paths;
}

const projectSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function projectSlugs(item: ContentItem) {
  const slug = item.fields.slug?.trim() || item.id;
  let history: unknown;
  try { history = JSON.parse(item.fields.slugHistory || "[]"); } catch { history = null; }
  if (!projectSlugPattern.test(slug) || !Array.isArray(history) || history.some(value => typeof value !== "string" || !projectSlugPattern.test(value))) {
    throw new Error(`Projects / ${item.id}: use a valid page address and previous-address list.`);
  }
  const aliases = history as string[];
  if (aliases.includes(slug) || new Set(aliases).size !== aliases.length) throw new Error(`Projects / ${item.id}: page addresses must not repeat.`);
  return { slug, aliases };
}

function validateProjectRoutes(items: ContentItem[], previous: ContentItem[]) {
  const reserved = new Map<string, string>();
  const previousById = new Map(previous.map(item => [item.id, item]));
  for (const item of items) {
    const { slug, aliases } = projectSlugs(item);
    if (item.fields.status && item.fields.status !== "active" && item.fields.status !== "archived") throw new Error(`Projects / ${item.id}: choose a valid publication status.`);
    if (item.fields.showInProjects && item.fields.showInProjects !== "true" && item.fields.showInProjects !== "false") throw new Error(`Projects / ${item.id}: choose whether to show the project.`);
    for (const pathSlug of [slug, ...aliases]) {
      const owner = reserved.get(pathSlug);
      if (owner && owner !== item.id) throw new Error(`Projects: the page address ${pathSlug} is already used by ${owner}.`);
      reserved.set(pathSlug, item.id);
    }
    const old = previousById.get(item.id);
    if (old) {
      const oldRoutes = projectSlugs(old);
      for (const oldSlug of [oldRoutes.slug, ...oldRoutes.aliases]) {
        if (oldSlug !== slug && !aliases.includes(oldSlug)) throw new Error(`Projects / ${item.id}: keep previous address ${oldSlug} as a redirect.`);
      }
    }
  }
}

function journalArticleRoutes(item: ContentItem) {
  let history: unknown;
  try { history = JSON.parse(item.fields.slugHistory || "[]"); } catch { history = null; }
  const recordId = item.fields.recordId?.trim() || item.id;
  if (!projectSlugPattern.test(item.id) || !projectSlugPattern.test(recordId) || !Array.isArray(history) || history.some(value => typeof value !== "string" || !projectSlugPattern.test(value))) {
    throw new Error(`Journal articles / ${item.id}: use a valid page address and previous-address list.`);
  }
  const aliases = history as string[];
  if (aliases.includes(item.id) || new Set(aliases).size !== aliases.length) throw new Error(`Journal articles / ${item.id}: page addresses must not repeat.`);
  return { recordId, aliases };
}

function validateJournalArticleRoutes(items: ContentItem[], previous: ContentItem[]) {
  const reserved = new Map<string, string>();
  const recordIds = new Set<string>();
  const previousByRecordId = new Map(previous.map(item => [journalArticleRoutes(item).recordId, item]));
  for (const item of items) {
    const { recordId, aliases } = journalArticleRoutes(item);
    if (recordIds.has(recordId)) throw new Error(`Journal articles: article identity ${recordId} is used twice.`);
    recordIds.add(recordId);
    for (const address of [item.id, ...aliases]) {
      const owner = reserved.get(address);
      if (owner) throw new Error(`Journal articles: the page address ${address} is already used by ${owner}.`);
      reserved.set(address, item.id);
    }
    const old = previousByRecordId.get(recordId);
    if (old) {
      for (const address of [old.id, ...journalArticleRoutes(old).aliases]) {
        if (address !== item.id && !aliases.includes(address)) throw new Error(`Journal articles / ${item.id}: keep previous address ${address} as a redirect.`);
      }
    }
  }
}

function validatePublishCollections(collections: ContentCollections, previousCollections: ContentCollections) {
  if (Object.hasOwn(collections, "home.variants") && !collections["home.variants"].length) throw new Error("Add at least one homepage opening before publishing.");
  if (collections["projects.records"]) validateProjectRoutes(collections["projects.records"], previousCollections["projects.records"] ?? initialProjectItems);
  if (collections["journal.articles"]) validateJournalArticleRoutes(collections["journal.articles"], previousCollections["journal.articles"] ?? journalArticleFallbacks());
  const signatureModels = collections["signature.models"] ?? signatureModelDefaults;
  const signaturePlans = collections["signature.plans"] ?? signaturePlanDefaults();
  if (!signatureModels.length) throw new Error("Signature models: keep at least one model before publishing.");
  const signatureIds = new Set(signatureModels.map(item => item.id));
  if (collections["signature.plans"]) for (const plan of signaturePlans) if (!signatureIds.has(plan.fields.modelId)) throw new Error(`Signature plans / ${plan.id}: owning model is missing.`);
  const baseSignatureIds = new Set(signatureModelDefaults.map(item => item.id));
  for (const model of signatureModels) {
    if (!signaturePlans.some(plan => plan.fields.modelId === model.id)) throw new Error(`Signature models / ${model.id}: add at least one plan.`);
    if (baseSignatureIds.has(model.id)) continue;
    for (const key of ["orbitFilm", "detailFilm", "poster", "posterAlt", "exploreAction"]) if (!model.fields[key]?.trim()) throw new Error(`Signature models / ${model.id}: ${key} is required.`);
    const features = JSON.parse(model.fields.features || "[]") as unknown;
    if (!Array.isArray(features) || features.length !== 3 || features.some(item => !item || typeof item !== "object" || typeof item.title !== "string" || !item.title.trim() || typeof item.copy !== "string" || !item.copy.trim())) throw new Error(`Signature models / ${model.id}: complete all three story cards.`);
    const gallery = JSON.parse(model.fields.gallery || "[]") as unknown;
    if (!Array.isArray(gallery) || !gallery.length || gallery.some(item => !item || typeof item !== "object" || typeof item.id !== "string" || !item.id || typeof item.label !== "string" || !item.label.trim() || typeof item.image !== "string" || !item.image || typeof item.alt !== "string" || !item.alt.trim())) throw new Error(`Signature models / ${model.id}: add a described preview image.`);
  }
  for (const [id, items] of Object.entries(collections)) {
    const definition = collectionDefinitionsById.get(id);
    if (!definition) continue;
    if (id.startsWith("enquiry.options.")) {
      if (!items.length) throw new Error(`${definition.label}: keep at least one option before publishing.`);
      const values = items.map(item => item.fields.value?.trim()).filter(Boolean);
      if (new Set(values).size !== values.length) throw new Error(`${definition.label}: stored values must be unique.`);
    }
    for (const item of items) {
      if (id === "projects.records" && item.fields.status === "archived") continue;
      if ((id === "journal.press" || id === "journal.notes") && item.fields.visibility === "hidden") continue;
      for (const field of definition.fields) {
        if (field.required && !item.fields[field.key]?.trim()) throw new Error(`${definition.label} / ${item.id}: ${field.label} is required to publish.`);
      }
      if (id === "journal.press" && item.fields.image?.trim() && !item.fields.imageAlt?.trim()) {
        throw new Error(`Press and news / ${item.id}: describe the supplied photograph before publishing.`);
      }
      if (id === "journal.articles") {
        const sections = JSON.parse(item.fields.sections || "[]") as unknown;
        if (!Array.isArray(sections) || !sections.length) throw new Error(`Journal articles / ${item.id}: add at least one body section before publishing.`);
        for (const section of sections) {
          if (!section || typeof section !== "object" || typeof section.heading !== "string" || !section.heading.trim()) throw new Error(`Journal articles / ${item.id}: every body section needs a heading.`);
          if (!Array.isArray(section.paragraphs) || !section.paragraphs.some((paragraph: unknown) => typeof paragraph === "string" ? Boolean(paragraph.trim()) : paragraph && typeof paragraph === "object" && typeof (paragraph as { text?: unknown }).text === "string" && Boolean((paragraph as { text: string }).text.trim()))) throw new Error(`Journal articles / ${item.id}: every body section needs a paragraph.`);
          if (section.image && (!section.imageAlt || typeof section.imageAlt !== "string" || !section.imageAlt.trim())) throw new Error(`Journal articles / ${item.id}: describe each body photograph.`);
        }
      }
      if (id === "home.variants") {
        if (item.fields.template !== "v1" && item.fields.template !== "v2") throw new Error(`Hero openings / ${item.id}: choose an animation template.`);
        const needed = item.fields.template === "v1" ? ["scrollVideo", "endImage", "introLastFrame", "endAlt"] : ["loopVideo", "loopPoster"];
        for (const key of needed) if (!item.fields[key]?.trim()) throw new Error(`Hero openings / ${item.id}: ${key} is required for this template.`);
      }
      if (id === "projects.globePins") {
        const coordinateError = globePinCoordinatesError(item.fields.label, item.fields.latitude, item.fields.longitude);
        if (coordinateError) throw new Error(`Globe pins / ${item.id}: ${coordinateError}.`);
      }
      if (id === "projects.records") {
        const gallery = JSON.parse(item.fields.gallery || "[]") as unknown;
        const films = JSON.parse(item.fields.films || "[]") as unknown;
        if (!Array.isArray(gallery) || !Array.isArray(films)) throw new Error(`Projects / ${item.id}: gallery and films must be lists.`);
        if (gallery.some(image => !image || typeof image !== "object" || typeof image.src !== "string" || !image.src || typeof image.alt !== "string" || !image.alt.trim())) throw new Error(`Projects / ${item.id}: every photograph needs an image and description.`);
        if (films.some(film => !film || typeof film !== "object" || typeof film.src !== "string" || !film.src || typeof film.poster !== "string" || !film.poster || typeof film.title !== "string" || !film.title.trim())) throw new Error(`Projects / ${item.id}: every film needs a video, poster and title.`);
      }
      if (id === "hospitality.selectedWork" && !item.fields.projectId) {
        if (!item.id.startsWith("legacy-")) throw new Error(`Selected work / ${item.id}: choose a project.`);
        if (item.fields.galleryPhotoId) throw new Error(`Selected work / ${item.id}: choose a linked project before choosing a gallery photograph.`);
        if (!["nameOverride", "kindOverride", "descriptionOverride", "imageSrcOverride", "imageAltOverride"].every(key => item.fields[key]?.trim())) {
          throw new Error(`Selected work / ${item.id}: complete the legacy card name, type, description and photograph.`);
        }
      }
    }
  }
  const projects = collections["projects.records"] ?? initialProjectItems;
  const selected = collections["hospitality.selectedWork"] ?? initialHospitalitySelections;
  if (selected) {
    const projectById = new Map(projects.filter(item => item.fields.status !== "archived").map(item => [item.id, item]));
    for (const item of selected) {
      if (!item.fields.projectId) continue;
      const project = projectById.get(item.fields.projectId);
      if (!project) throw new Error(`Selected work / ${item.id}: referenced project is missing.`);
      if (!(item.fields.kindOverride?.trim() || project.fields.category?.trim()) || !(item.fields.descriptionOverride?.trim() || project.fields.description?.trim())) {
        throw new Error(`Selected work / ${item.id}: add a project type and description before publishing.`);
      }
      if (item.fields.imageSrcOverride && !item.fields.imageAltOverride?.trim()) {
        throw new Error(`Selected work / ${item.id}: describe the custom photograph before publishing.`);
      }
      if (item.fields.galleryPhotoId) {
        if (item.fields.imageSrcOverride) throw new Error(`Selected work / ${item.id}: choose either a project gallery photograph or a custom photograph.`);
        let gallery: unknown;
        try { gallery = JSON.parse(project.fields.gallery || "[]"); } catch { gallery = null; }
        if (!Array.isArray(gallery) || !gallery.some(photo => photo && typeof photo === "object" && photo.id === item.fields.galleryPhotoId)) {
          throw new Error(`Selected work / ${item.id}: the chosen gallery photograph is missing from the linked project.`);
        }
      }
    }
  }
}

export async function publishDraft(revision: number, draftRevision: number) {
  return updateContent(current => {
    if (current.revision !== revision) throw new Error("The published content changed. Reload before publishing.");
    if (current.draftRevision !== draftRevision) throw new Error("The draft content changed. Reload before publishing.");
    const publishedCollections = { ...current.publishedCollections, ...current.draftCollections };
    validatePublishCollections(publishedCollections, current.publishedCollections);
    validateProcessPublish({ ...current.published, ...current.draft });
    const featuredPressId = current.draft["journal.hero.featured-id"] ?? current.published["journal.hero.featured-id"] ?? pressEntries[0].id;
    const shownPress = (publishedCollections["journal.press"] ?? journalDefaultCollections()["journal.press"])
      .filter(item => item.fields.visibility !== "hidden");
    if (featuredPressId !== "none" && !shownPress.some(item => item.id === featuredPressId)) {
      throw new Error("Journal opening: choose a shown featured Press story or No featured story before publishing.");
    }
    const selectedHero = current.draft["home.publishing.hero"] ?? current.published["home.publishing.hero"] ?? "hero-v1";
    const openings = publishedCollections["home.variants"] ?? homeVariantDefaults;
    if (!openings.some(item => item.id === selectedHero)) throw new Error("The selected homepage opening is missing. Choose an available opening before publishing.");
    return {
      revision: current.revision + 1,
      draftRevision: current.draftRevision + 1,
      published: { ...current.published, ...current.draft },
      draft: {},
      publishedCollections,
      draftCollections: {},
      history: [...current.history, { revision: current.revision, published: current.published, publishedCollections: current.publishedCollections, publishedAt: new Date().toISOString() }].slice(-25),
    };
  });
}
