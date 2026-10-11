import { adminTokenConfigured, demoAccessExpiresAt, isAdminAuthorized, publishDraft, readContent, saveCollectionDraft, saveDraft, saveFieldsDraft } from "@/lib/siteContentStore";
import { revalidateTag } from 'next/cache';
import { cloudStorageEnabled } from '@/lib/cloudStorage';
import { PUBLIC_CONTENT_TAG } from '@/lib/publicContent';

export const runtime = "nodejs";

function refuse(request: Request) {
  if (!adminTokenConfigured()) return Response.json({ error: "Set OKNO_CMS_ADMIN_TOKEN (at least 24 characters) on the server." }, { status: 503 });
  if (!isAdminAuthorized(request)) return Response.json({ error: "Admin token is incorrect." }, { status: 401 });
  return null;
}

function contentError(error: unknown) {
  const message = error instanceof Error ? error.message : "Content update failed.";
  if (/Vercel Blob|Connect the private OKNO Blob store|Content version is unavailable/.test(message)) {
    return Response.json({ error: "Content storage is unavailable. Check the existing OKNO Vercel Blob store's status and usage limits before editing. Your content has not been changed." }, { status: 503 });
  }
  const status = /Reload before (?:saving|publishing)/.test(message) ? 409 : 422;
  return Response.json({ error: message }, { status });
}

export async function GET(request: Request) {
  const denied = refuse(request);
  if (denied) return denied;
  try {
    const demoExpiresAt = demoAccessExpiresAt(request);
    const snapshot = await readContent();
    // Reconnecting after a store outage also refreshes the visitor snapshot.
    if (cloudStorageEnabled()) revalidateTag(PUBLIC_CONTENT_TAG, { expire: 0 });
    return Response.json({ ...snapshot, ...(demoExpiresAt ? { demoExpiresAt } : {}) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return contentError(error); }
}

export async function PATCH(request: Request) {
  const denied = refuse(request);
  if (denied) return denied;
  try {
    const body = await request.json();
    if (typeof body?.collectionId === "string") {
      if (!Number.isSafeInteger(body?.revision) || !Number.isSafeInteger(body?.draftRevision)) return Response.json({ error: "Invalid revision." }, { status: 400 });
      return Response.json(await saveCollectionDraft(body.collectionId, body.items, body.revision, body.draftRevision));
    }
    if (body?.values !== undefined) {
      if (!Number.isSafeInteger(body?.revision) || !Number.isSafeInteger(body?.draftRevision)) return Response.json({ error: "Invalid revision." }, { status: 400 });
      return Response.json(await saveFieldsDraft(body.values, body.revision, body.draftRevision));
    }
    if (typeof body?.id !== "string" || typeof body?.value !== "string" || !Number.isSafeInteger(body?.revision) || !Number.isSafeInteger(body?.draftRevision)) {
      return Response.json({ error: "Invalid content update." }, { status: 400 });
    }
    return Response.json(await saveDraft(body.id, body.value, body.revision, body.draftRevision));
  } catch (error) {
    return contentError(error);
  }
}

export async function PUT(request: Request) {
  const denied = refuse(request);
  if (denied) return denied;
  try {
    const body = await request.json();
    if (!Number.isSafeInteger(body?.revision) || !Number.isSafeInteger(body?.draftRevision)) return Response.json({ error: "Invalid revision." }, { status: 400 });
    const snapshot = await publishDraft(body.revision, body.draftRevision);
    if (cloudStorageEnabled()) revalidateTag(PUBLIC_CONTENT_TAG, { expire: 0 });
    return Response.json(snapshot);
  } catch (error) {
    return contentError(error);
  }
}
