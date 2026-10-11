import { readFile, writeFile } from "node:fs/promises";
import { randomUUID, createHash } from "node:crypto";
import { put } from "@vercel/blob/client";

const base = process.argv[2];
if (!base || !/^https:\/\/[a-z0-9.-]+\.vercel\.app$/.test(base)) throw new Error("Provide the verified HTTPS production URL.");
process.loadEnvFile(".okno-secrets/vercel-production.env");
const key = (await readFile(".okno-secrets/admin-key.env", "utf8")).trim().split("=", 2)[1];
const headers = { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
const report = { base, at: new Date().toISOString(), checks: [] };
function assert(value, label) { if (!value) throw new Error(label); report.checks.push(label); console.log(`PASS ${label}`); }
async function api(route, method = "GET", body, auth = true) {
  const response = await fetch(base + route, { method, ...(auth ? { headers } : {}), ...(body ? { body: JSON.stringify(body) } : {}), cache: "no-store" });
  let data; try { data = await response.json(); } catch { data = null; }
  return { status: response.status, data };
}
const unauthorized = await api("/api/admin/content", "GET", undefined, false);
assert(unauthorized.status === 401, "Admin rejects unauthenticated access");
const incorrect = await fetch(base + "/api/admin/content", { headers: { Authorization: "Bearer invalid-owner-key" }, cache: "no-store" });
assert(incorrect.status === 401, "Admin rejects an incorrect key");
const initial = await api("/api/admin/content"); assert(initial.status === 200, "Owner key connects the deployed editor API");
const original = initial.data;
if (Object.keys(original.draft).length || Object.keys(original.draftCollections).length) throw new Error("Existing drafts present; refuse to disturb them.");
await writeFile(".okno-secrets/pre-verification-content.json", JSON.stringify(original), { mode: 0o600, flag: "wx" });
const id = Object.keys(original.published).find(id => /\.(title|heading|copy)$/.test(id) && !id.startsWith("footer."));
if (!id) throw new Error("No existing published text field for a reversible check.");
const oldValue = original.published[id];
let latest = original;
let changed = false;
try {
  const draft = await api("/api/admin/content", "PATCH", { id, value: "Release verification", revision: original.revision, draftRevision: original.draftRevision });
  assert(draft.status === 200, "Draft save persists in cloud storage"); latest = draft.data; changed = true;
  const publicDraft = await api("/api/site-content", "GET", undefined, false);
  assert(publicDraft.data.published[id] === oldValue, "Saved draft is isolated from public content");
  const conflict = await api("/api/admin/content", "PATCH", { id, value: "Stale write", revision: original.revision, draftRevision: original.draftRevision });
  assert(conflict.status === 409, "Stale draft revision is rejected");
  const published = await api("/api/admin/content", "PUT", { revision: latest.revision, draftRevision: latest.draftRevision });
  assert(published.status === 200, "Publish succeeds on the deployed CMS"); latest = published.data;
  const live = await api("/api/site-content", "GET", undefined, false);
  assert(live.data.published[id] === "Release verification", "Published cloud content is visible through the public API");
} finally {
  if (changed) {
    const current = await api("/api/admin/content");
    const restore = await api("/api/admin/content", "PATCH", { id, value: oldValue, revision: current.data.revision, draftRevision: current.data.draftRevision });
    if (restore.status !== 200) throw new Error("Restore draft failed; recover from private pre-verification snapshot.");
    const published = await api("/api/admin/content", "PUT", { revision: restore.data.revision, draftRevision: restore.data.draftRevision });
    if (published.status !== 200) throw new Error("Restore publication failed; recover from private snapshot.");
    assert(JSON.stringify(published.data.published) === JSON.stringify(original.published) && JSON.stringify(published.data.publishedCollections) === JSON.stringify(original.publishedCollections), "Original published fields and collections restored exactly");
  }
}
const bytes = await readFile("/tmp/okno-deployment-media-check.mp4");
const pathname = `uploads/${randomUUID()}.mp4`;
const uploadEvent = { type: "blob.generate-client-token", payload: { pathname, multipart: true } };
const refusedUpload = await api("/api/admin/upload/blob", "POST", uploadEvent, false);
assert(refusedUpload.status === 401, "Direct upload authorization rejects unauthenticated requests");
const grant = await api("/api/admin/upload/blob", "POST", uploadEvent);
assert(grant.status === 200 && grant.data?.clientToken?.startsWith("vercel_blob_client_"), "Owner key obtains a scoped direct-upload token");
await put(pathname, bytes, { access: "private", contentType: "video/mp4", token: grant.data.clientToken, multipart: true });
assert(true, "Scoped client token uploads the original directly to private Blob");
const prepared = await api("/api/admin/upload", "POST", { pathname, profile: "signature-orbit" });
assert(prepared.status === 200 && prepared.data?.prepared && prepared.data.posterUrl && prepared.data.detailUrl, "Cloud FFmpeg preparation returns scroll film, detail film and poster");
const range = await fetch(base + prepared.data.url, { headers: { Range: "bytes=0-1023" } });
assert(range.status === 206 && range.headers.get("content-range"), "Prepared cloud film serves byte ranges"); await range.arrayBuffer();
const poster = await fetch(base + prepared.data.posterUrl); assert(poster.status === 200 && poster.headers.get("content-type")?.includes("image/jpeg"), "Cloud poster is available"); await poster.arrayBuffer();
const source = await fetch(base + prepared.data.originalUrl);const originalBytes = Buffer.from(await source.arrayBuffer());
assert(source.status === 200 && createHash("sha256").update(bytes).digest("hex") === createHash("sha256").update(originalBytes).digest("hex"), "Original upload remains byte-for-byte recoverable");
const final = await api("/api/admin/content");assert(JSON.stringify(final.data.published) === JSON.stringify(original.published) && !Object.keys(final.data.draft).length, "Media QA never stages or publishes a replacement");
await writeFile("docs/deployment/live-api-verification.json", JSON.stringify(report, null, 2) + "\n");
console.log("All cloud API checks passed; original content is restored and QA media remains unpublished.");
