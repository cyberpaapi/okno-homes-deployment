import { beforeEach, describe, expect, it, vi } from "vitest";

const store = vi.hoisted(() => ({
  saveFieldsDraft: vi.fn(),
  publishDraft: vi.fn(),
  readContent: vi.fn(),
  cloud: vi.fn(),
  revalidate: vi.fn(),
}));
vi.mock("@/lib/siteContentStore", () => ({
  adminTokenConfigured: () => true,
  isAdminAuthorized: () => true,
  readContent: store.readContent,
  demoAccessExpiresAt: () => undefined,
  saveCollectionDraft: vi.fn(),
  saveDraft: vi.fn(),
  saveFieldsDraft: store.saveFieldsDraft,
  publishDraft: store.publishDraft,
}));
vi.mock('@/lib/cloudStorage', () => ({ cloudStorageEnabled: store.cloud }));
vi.mock('next/cache', () => ({ revalidateTag: store.revalidate, unstable_cache: (fn: () => unknown) => fn }));

import { GET, PATCH, PUT } from "./route";

const request = (method: "PATCH" | "PUT", body: object) => new Request("http://127.0.0.1:3134/api/admin/content", {
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

beforeEach(() => vi.resetAllMocks());

describe("admin content HTTP errors", () => {
  it("distinguishes invalid fields from a concurrent draft conflict", async () => {
    store.saveFieldsDraft.mockRejectedValueOnce(new Error("Invalid destination field."));
    const invalid = await PATCH(request("PATCH", { values: { "home.timeline.action-href": "https://other.example" }, revision: 0, draftRevision: 0 }));
    expect(invalid.status).toBe(422);

    store.saveFieldsDraft.mockRejectedValueOnce(new Error("The draft content changed. Reload before saving."));
    const stale = await PATCH(request("PATCH", { values: { "home.timeline.action-href": "/process" }, revision: 0, draftRevision: 0 }));
    expect(stale.status).toBe(409);
  });

  it("keeps publish validation separate from stale publish conflicts", async () => {
    store.publishDraft.mockRejectedValueOnce(new Error("A project needs a cover photograph."));
    expect((await PUT(request("PUT", { revision: 0, draftRevision: 0 }))).status).toBe(422);
    store.publishDraft.mockRejectedValueOnce(new Error("The published content changed. Reload before publishing."));
    expect((await PUT(request("PUT", { revision: 0, draftRevision: 0 }))).status).toBe(409);
  });

  it('expires the shared visitor publication immediately after a successful cloud publish', async () => {
    store.cloud.mockReturnValue(true);
    store.publishDraft.mockResolvedValue({ revision: 18 });
    const response = await PUT(request('PUT', { revision: 17, draftRevision: 65 }));
    expect(response.status).toBe(200);
    expect(store.revalidate).toHaveBeenCalledWith('okno-published-content', { expire: 0 });
  });

  it('fails closed when the owner store is suspended and never substitutes the public seed', async () => {
    store.readContent.mockRejectedValue(new Error('Vercel Blob: Failed to fetch blob: 403 Forbidden'));
    const response = await GET(new Request('http://127.0.0.1:3134/api/admin/content'));
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: expect.stringContaining('Your content has not been changed') });
    expect(store.revalidate).not.toHaveBeenCalled();
  });
});
