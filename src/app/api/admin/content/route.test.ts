import { beforeEach, describe, expect, it, vi } from "vitest";

const store = vi.hoisted(() => ({
  saveFieldsDraft: vi.fn(),
  publishDraft: vi.fn(),
}));
vi.mock("@/lib/siteContentStore", () => ({
  adminTokenConfigured: () => true,
  isAdminAuthorized: () => true,
  readContent: vi.fn(),
  saveCollectionDraft: vi.fn(),
  saveDraft: vi.fn(),
  saveFieldsDraft: store.saveFieldsDraft,
  publishDraft: store.publishDraft,
}));

import { PATCH, PUT } from "./route";

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
});
