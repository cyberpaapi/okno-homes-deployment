import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { findJournalArticleByPath } from "./journalCollections";

vi.mock("server-only", () => ({}));

let testRoot = "";
const section = { id: "opening", heading: "A place", paragraphs: [{ id: "paragraph-one", text: "A meaningful article paragraph." }] };
function article(id: string, extra: Record<string, string> = {}) {
  return { id, fields: {
    recordId: id, slugHistory: "[]", category: "Places", title: "A new place", excerpt: "An introduction.",
    image: "/photo.webp", imageAlt: "A home among trees", sections: JSON.stringify([section]), ...extra,
  } };
}

beforeEach(async () => {
  testRoot = await mkdtemp(path.join(tmpdir(), "okno-journal-store-"));
  vi.spyOn(process, "cwd").mockReturnValue(testRoot);
  vi.resetModules();
  await mkdir(path.join(testRoot, "public"), { recursive: true });
  await writeFile(path.join(testRoot, "public", "photo.webp"), "photo");
});

afterEach(async () => {
  vi.restoreAllMocks();
  await rm(testRoot, { recursive: true, force: true });
});

describe("Journal article publication", () => {
  it("publishes hidden incomplete news and notes without exposing them as public entries", async () => {
    const store = await import("./siteContentStore");
    const press = { id: "hidden-news", fields: { visibility: "hidden", title: "", href: "" } };
    const note = { id: "hidden-note", fields: { visibility: "hidden", title: "", href: "" } };
    let draft = await store.saveCollectionDraft("journal.press", [press], 0, 0);
    draft = await store.saveCollectionDraft("journal.notes", [note], 0, draft.draftRevision);
    draft = await store.saveDraft("journal.hero.featured-id", "none", 0, draft.draftRevision);
    const published = await store.publishDraft(draft.revision, draft.draftRevision);
    expect(published.publishedCollections["journal.press"]).toEqual([press]);
    expect(published.publishedCollections["journal.notes"]).toEqual([note]);
    const { journalEntriesFromItems } = await import("./journalCollections");
    expect(journalEntriesFromItems(published.publishedCollections["journal.press"])).toEqual([]);
    expect(journalEntriesFromItems(published.publishedCollections["journal.notes"])).toEqual([]);
    draft = await store.saveCollectionDraft("journal.notes", [{ ...note, fields: { ...note.fields, visibility: "shown" } }], published.revision, published.draftRevision);
    await expect(store.publishDraft(draft.revision, draft.draftRevision)).rejects.toThrow("Publication or source is required");
  });

  it("keeps a prior article address as a redirect after changing the page slug", async () => {
    const store = await import("./siteContentStore");
    const firstDraft = await store.saveCollectionDraft("journal.articles", [article("old-story")], 0, 0);
    const first = await store.publishDraft(firstDraft.revision, firstDraft.draftRevision);
    const renamed = article("new-story", { recordId: "old-story", slugHistory: '["old-story"]' });
    const secondDraft = await store.saveCollectionDraft("journal.articles", [renamed], first.revision, first.draftRevision);
    const second = await store.publishDraft(secondDraft.revision, secondDraft.draftRevision);
    const items = second.publishedCollections["journal.articles"];
    expect(findJournalArticleByPath(items, "new-story")).toMatchObject({ item: renamed, redirect: false });
    expect(findJournalArticleByPath(items, "old-story")).toMatchObject({ item: renamed, redirect: true });
  });

  it("rejects dropped and colliding article addresses while allowing incomplete drafts", async () => {
    const store = await import("./siteContentStore");
    const firstDraft = await store.saveCollectionDraft("journal.articles", [article("old-story")], 0, 0);
    const first = await store.publishDraft(firstDraft.revision, firstDraft.draftRevision);
    const missingAlias = await store.saveCollectionDraft("journal.articles", [article("new-story", { recordId: "old-story" })], first.revision, first.draftRevision);
    await expect(store.publishDraft(missingAlias.revision, missingAlias.draftRevision)).rejects.toThrow("keep previous address old-story");
    const colliding = await store.saveCollectionDraft("journal.articles", [
      article("new-story", { recordId: "old-story", slugHistory: '["old-story"]' }),
      article("second-story", { slugHistory: '["old-story"]' }),
    ], first.revision, missingAlias.draftRevision);
    await expect(store.publishDraft(colliding.revision, colliding.draftRevision)).rejects.toThrow("page address old-story is already used");
  });

  it("requires article cover/body and project-note photography, but allows text-only Press", async () => {
    const store = await import("./siteContentStore");
    let draft = await store.saveCollectionDraft("journal.articles", [article("incomplete", { image: "", sections: "[]" })], 0, 0);
    await expect(store.publishDraft(draft.revision, draft.draftRevision)).rejects.toThrow("Cover photograph is required");
    draft = await store.saveCollectionDraft("journal.articles", [article("incomplete", { sections: "[]" })], 0, draft.draftRevision);
    await expect(store.publishDraft(draft.revision, draft.draftRevision)).rejects.toThrow("add at least one body section");
    draft = await store.saveCollectionDraft("journal.articles", [article("complete")], 0, draft.draftRevision);
    draft = await store.saveCollectionDraft("journal.notes", [{ id: "note", fields: { source: "OKNO", title: "A note", href: "/projects/forrest" } }], 0, draft.draftRevision);
    await expect(store.publishDraft(draft.revision, draft.draftRevision)).rejects.toThrow("Main photograph is required");
    draft = await store.saveCollectionDraft("journal.notes", [{ id: "note", fields: { source: "OKNO", title: "A note", href: "/projects/forrest", image: "/photo.webp", imageAlt: "Forest home" } }], 0, draft.draftRevision);
    draft = await store.saveCollectionDraft("journal.press", [{ id: "text-only", fields: { title: "A news update", href: "https://example.com/news" } }], 0, draft.draftRevision);
    draft = await store.saveDraft("journal.hero.featured-id", "text-only", 0, draft.draftRevision);
    await expect(store.publishDraft(draft.revision, draft.draftRevision)).resolves.toMatchObject({ revision: 1 });
  });
});
