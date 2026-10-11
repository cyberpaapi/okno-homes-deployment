import { adminTokenConfigured, demoAccessExpiresAt, isAdminAuthorized, publishDraft, readContent, saveCollectionDraft, saveDraft, saveFieldsDraft } from "@/lib/siteContentStore";

export const runtime = "nodejs";

function refuse(request: Request) {
  if (!adminTokenConfigured()) return Response.json({ error: "Set OKNO_CMS_ADMIN_TOKEN (at least 24 characters) on the server." }, { status: 503 });
  if (!isAdminAuthorized(request)) return Response.json({ error: "Admin token is incorrect." }, { status: 401 });
  return null;
}

function contentError(error: unknown) {
  const message = error instanceof Error ? error.message : "Content update failed.";
  const status = /Reload before (?:saving|publishing)/.test(message) ? 409 : 422;
  return Response.json({ error: message }, { status });
}

export async function GET(request: Request) {
  const denied = refuse(request);
  if (denied) return denied;
  const demoExpiresAt = demoAccessExpiresAt(request);
  return Response.json({ ...await readContent(), ...(demoExpiresAt ? { demoExpiresAt } : {}) }, { headers: { "Cache-Control": "no-store" } });
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
    return Response.json(await publishDraft(body.revision, body.draftRevision));
  } catch (error) {
    return contentError(error);
  }
}
