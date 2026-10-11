import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

vi.mock("server-only", () => ({}));

let testRoot = "";
function project(id: string, slug = id, extra: Record<string, string> = {}) {
  return { id, fields: {
    status: "active", slug, slugHistory: "[]", showInProjects: "true", title: id,
    coverSrc: "/photo.webp", coverAlt: "A home", gallery: "[]", films: "[]", ...extra,
  } };
}

beforeEach(async () => {
  testRoot = await mkdtemp(path.join(tmpdir(), "okno-collection-store-"));
  vi.spyOn(process, "cwd").mockReturnValue(testRoot);
  vi.resetModules();
  await mkdir(path.join(testRoot, "public"), { recursive: true });
  await writeFile(path.join(testRoot, "public", "photo.webp"), "photo");
});

afterEach(async () => {
  vi.restoreAllMocks();
  await rm(testRoot, { recursive: true, force: true });
});

describe("collection content store", () => {
  it("publishes addable Signature models and plans with nested media, and variable Footer links", async () => {
    const store = await import("./siteContentStore");
    const { signatureModelDefaults, signaturePlanDefaults } = await import("./signatureCollections");
    await writeFile(path.join(testRoot,"public","orbit.mp4"),"video");
    const custom = { id:"aurora", fields: {name:"Aurora",orbitFilm:"/orbit.mp4",detailFilm:"/orbit.mp4",poster:"/photo.webp",posterAlt:"Aurora outside",exploreAction:"Explore Aurora",features:JSON.stringify([{title:"One",copy:"First"},{title:"Two",copy:"Second"},{title:"Three",copy:"Third"}]),gallery:JSON.stringify([{id:"aurora-view",label:"Exterior",image:"/photo.webp",alt:"Aurora exterior"}])} };
    const modelDraft = await store.saveCollectionDraft("signature.models",[...signatureModelDefaults,custom],0,0);
    const planDraft = await store.saveCollectionDraft("signature.plans",[...signaturePlanDefaults(),{id:"aurora-plan-1",fields:{modelId:"aurora",name:"Studio",area:"410 sq ft",price:"₹23 lakh",spaces:"1 bed"}}],0,modelDraft.draftRevision);
    const footerDraft = await store.saveCollectionDraft("footer.links.homes",[{id:"new-retreat",fields:{label:"New retreat",href:"/models/signature"}}],0,planDraft.draftRevision);
    const published = await store.publishDraft(0,footerDraft.draftRevision);
    expect(published.publishedCollections["signature.models"].at(-1)?.fields.name).toBe("Aurora");
    expect(published.publishedCollections["signature.plans"].at(-1)?.fields.area).toBe("410 sq ft");
    expect(published.publishedCollections["footer.links.homes"]).toHaveLength(1);
    await expect(store.saveCollectionDraft("footer.links.homes",[{id:"bad",fields:{label:"Bad",href:"https://example.com"}}],published.revision,published.draftRevision)).rejects.toThrow(/same-site/);
    await expect(store.saveCollectionDraft("signature.models",[{...custom,fields:{...custom.fields,gallery:JSON.stringify([{id:"x",label:"X",image:"/missing.webp",alt:"Missing"}])}}],published.revision,published.draftRevision)).rejects.toThrow(/nested image/);
  });
  it("accepts local action destinations and rejects external or script destinations", async () => {
    const store = await import("./siteContentStore");
    expect(store.validateContentValue("home.timeline.action-href", "#process")).toBeNull();
    expect(store.validateContentValue("hospitality.opening.action-href", "/enquiry?intent=hospitality")).toBeNull();
    expect(store.validateContentValue("home.timeline.action-href", "https://example.com")).toMatch(/same-site path/);
    expect(store.validateContentValue("home.timeline.action-href", "javascript:alert(1)")).toMatch(/same-site path/);
  });
  it("validates editable Footer links and accepts its existing SVG social marks", async () => {
    const store = await import("./siteContentStore");
    expect(store.validateContentValue("footer.homes.signature.href", "/models/signature?view=all")).toBeNull();
    expect(store.validateContentValue("footer.homes.signature.href", "https://example.com")).toMatch(/same-site/);
    expect(store.validateContentValue("footer.homes.signature.label", " ")).toMatch(/visible/);
    expect(store.validateContentValue("footer.social.instagram.href", "https://www.instagram.com/oknomodhomes/")).toBeNull();
    expect(store.validateContentValue("footer.social.instagram.href", "javascript:alert(1)")).toMatch(/HTTPS/);
    expect(store.validateContentValue("footer.social.instagram.icon", "/assets/footer/instagram.svg")).toBeNull();
    expect(store.validateContentValue("footer.social.instagram.icon", "/untrusted.svg")).toMatch(/image file/);
  });
  it("accepts client-managed Signature area and price wording without an approval gate", async () => {
    const store = await import("./siteContentStore");
    expect(store.validateContentValue("models.signature.gaze.variant-1.area", "438 sq ft")).toBeNull();
    expect(store.validateContentValue("models.signature.gaze.variant-1.price", "Price on request")).toBeNull();
    expect(store.validateContentValue("models.signature.forza.variant-1.price", "₹24.5 lakh")).toBeNull();
    expect(store.validateContentValue("models.signature.forza.variant-1.price", " ")).toMatch(/single-line/);
    expect(store.validateContentValue("models.signature.forza.variant-1.area", "300\nsq ft")).toMatch(/single-line/);
    await store.saveFieldsDraft({
      "models.signature.gaze.variant-1.area": "438 sq ft",
      "models.signature.gaze.variant-1.price": "₹24.5 lakh",
    }, 0, 0);
    expect((await store.readContent()).published["models.signature.gaze.variant-1.price"]).toBeUndefined();
    const published = await store.publishDraft(0, 1);
    expect(published.published["models.signature.gaze.variant-1.area"]).toBe("438 sq ft");
    expect(published.published["models.signature.gaze.variant-1.price"]).toBe("₹24.5 lakh");
  });

  it("keeps Process timeline drafts private and checks readable phase content at publish", async () => {
    const store = await import("./siteContentStore");
    const { adminPages } = await import("@/data/adminContent");
    const processFields = adminPages.find(page => page.id === "process")?.sections.flatMap(section => section.fields) ?? [];
    expect(processFields).toHaveLength(71);
    for (const field of processFields) expect(store.validateContentValue(field.id, field.defaultValue), field.id).toBeNull();
    expect(store.validateContentValue("process.details.phase-1.title", "A".repeat(45))).toMatch(/44 characters/);
    expect(store.validateContentValue("process.details.phase-1.title", "A concise title")).toBeNull();
    expect(store.validateContentValue("process.details.phase-1.days", "Weeks 01–03")).toBeNull();
    expect(store.validateContentValue("process.stage-land.days", "01-10")).toBeNull();
    expect(store.validateContentValue("process.details.phase-1.days", "Days 01–1022321222")).toMatch(/day range/i);
    expect(store.validateContentValue("process.stage-land.days", "Days 01–1022321222")).toMatch(/day range/i);
    await expect(store.saveDraft("process.stage-land.days", "Days 01–1022321222", 0, 0)).rejects.toThrow(/day range/i);
    await store.saveFieldsDraft({
      "process.details.phase-1.title": "An edited first phase",
      "process.details.phase-1.alt": "",
    }, 0, 0);
    expect((await store.readContent()).published["process.details.phase-1.title"]).toBeUndefined();
    await expect(store.publishDraft(0, 1)).rejects.toThrow("describe its photograph");
    await store.saveDraft("process.details.phase-1.alt", "A reviewed site photograph", 0, 1);
    const published = await store.publishDraft(0, 2);
    expect(published.published["process.details.phase-1.title"]).toBe("An edited first phase");
    expect(published.published["process.details.phase-1.alt"]).toBe("A reviewed site photograph");
    expect(published.published["projects.intro.title"]).toBeUndefined();
  });

  it("publishes a Footer draft without changing unrelated page content", async () => {
    const store = await import("./siteContentStore");
    await store.saveDraft("footer.brand.line", "A considered way to live.", 0, 0);
    expect((await store.readContent()).published["footer.brand.line"]).toBeUndefined();
    const published = await store.publishDraft(0, 1);
    expect(published.published["footer.brand.line"]).toBe("A considered way to live.");
    expect(published.published["about.opening.title"]).toBeUndefined();
  });
  it("saves related scalar fields atomically and rejects a bad field without a partial draft", async () => {
    const store = await import("./siteContentStore");
    const fields = {
      "models.signature.forza.orbit-film": "/orbit.mp4",
      "models.signature.forza.detail-film": "/detail.mp4",
    };
    await writeFile(path.join(testRoot, "public", "orbit.mp4"), "video");
    await expect(store.saveFieldsDraft(fields, 0, 0)).rejects.toThrow("does not exist");
    expect((await store.readContent()).draft).toEqual({});
    await writeFile(path.join(testRoot, "public", "detail.mp4"), "video");
    await expect(store.saveFieldsDraft(fields, 0, 0)).resolves.toMatchObject({ draft: fields, draftRevision: 1 });
    await expect(store.saveFieldsDraft({ "models.signature.forza.orbit-film": "/orbit.mp4" }, 1, 1)).rejects.toThrow("Reload before saving");
    expect((await store.readContent()).draft).toEqual(fields);
  });
  it("migrates scalar-only content and publishes a collection without losing the old fields", async () => {
    await mkdir(path.join(testRoot, ".okno-content"), { recursive: true });
    await writeFile(path.join(testRoot, ".okno-content", "content.json"), JSON.stringify({
      revision: 3, published: { "about.opening.title": "A saved title" }, draft: {}, history: [],
    }));
    const store = await import("./siteContentStore");
    const legacy = await store.readContent();
    expect(legacy.publishedCollections).toEqual({});
    expect(legacy.draftRevision).toBe(0);
    const draft = await store.saveCollectionDraft("signature.gallery.forza", [
      { id: "forza-new", fields: { label: "Long interior name", image: "/photo.webp", alt: "Living room" } },
    ], legacy.revision, legacy.draftRevision);
    expect(draft.draftCollections["signature.gallery.forza"]).toHaveLength(1);
    expect(draft.published["about.opening.title"]).toBe("A saved title");
    const published = await store.publishDraft(draft.revision, draft.draftRevision);
    expect(published.revision).toBe(4);
    expect(published.publishedCollections["signature.gallery.forza"][0].fields.label).toBe("Long interior name");
    expect(published.draftCollections).toEqual({});
    expect(published.history[0].published["about.opening.title"]).toBe("A saved title");
    expect(JSON.parse(await readFile(path.join(testRoot, ".okno-content", "content.json"), "utf8")).publishedCollections["signature.gallery.forza"]).toHaveLength(1);
  });

  it("saves incomplete drafts but requires an alt description for supplied press photography", async () => {
    const store = await import("./siteContentStore");
    const draft = await store.saveCollectionDraft("journal.press", [
      { id: "story-one", fields: { source: "Publication", title: "News", href: "https://example.com/story", image: "/photo.webp" } },
    ], 0, 0);
    expect(draft.draftCollections["journal.press"]).toHaveLength(1);
    await expect(store.publishDraft(0, 1)).rejects.toThrow("describe the supplied photograph");
    expect((await store.readContent()).revision).toBe(0);
  });

  it("publishes text-only news without a source, date, icon or photograph", async () => {
    const store = await import("./siteContentStore");
    const textOnly = { id: "text-only", fields: { title: "A news update", href: "https://example.com/news", external: "true" } };
    await store.saveCollectionDraft("journal.press", [textOnly], 0, 0);
    await store.saveDraft("journal.hero.featured-id", "text-only", 0, 1);
    const published = await store.publishDraft(0, 2);
    expect(published.publishedCollections["journal.press"]).toEqual([textOnly]);
  });

  it("requires a replacement featured record or an intentional hero without a feature", async () => {
    const store = await import("./siteContentStore");
    await store.saveCollectionDraft("journal.press", [{ id: "hidden", fields: { visibility: "hidden" } }], 0, 0);
    await expect(store.publishDraft(0, 1)).rejects.toThrow("choose a shown featured Press story");
    await store.saveDraft("journal.hero.featured-id", "none", 0, 1);
    const published = await store.publishDraft(0, 2);
    expect(published.published["journal.hero.featured-id"]).toBe("none");
  });

  it("still requires the destination and headline for text-only news", async () => {
    const store = await import("./siteContentStore");
    await store.saveCollectionDraft("journal.press", [{ id: "no-link", fields: { title: "A news update" } }], 0, 0);
    await expect(store.publishDraft(0, 1)).rejects.toThrow("Destination is required");
  });

  it("rejects nonexistent media and duplicate item IDs at draft time", async () => {
    const store = await import("./siteContentStore");
    await expect(store.saveCollectionDraft("signature.gallery.forza", [
      { id: "first", fields: { label: "Outside", image: "/missing.webp", alt: "Outside" } },
    ], 0, 0)).rejects.toThrow("does not exist");
    await expect(store.saveCollectionDraft("signature.gallery.forza", [
      { id: "same", fields: {} }, { id: "same", fields: {} },
    ], 0, 0)).rejects.toThrow("unique stable ID");
  });

  it("keeps the supplied publication SVG while rejecting an arbitrary SVG logo", async () => {
    const logoDirectory = path.join(testRoot, "public", "assets", "journal", "source-logos");
    await mkdir(logoDirectory, { recursive: true });
    await writeFile(path.join(logoDirectory, "archdaily.svg"), "<svg></svg>");
    const store = await import("./siteContentStore");
    const item = { id: "press-one", fields: { source: "ArchDaily", title: "A story", href: "https://example.com", image: "/photo.webp", imageAlt: "A home", logo: "/assets/journal/source-logos/archdaily.svg" } };
    await expect(store.saveCollectionDraft("journal.press", [item], 0, 0)).resolves.toMatchObject({ draftCollections: { "journal.press": [item] } });
    await expect(store.saveCollectionDraft("journal.press", [{ ...item, fields: { ...item.fields, logo: "/arbitrary.svg" } }], 0, 1)).rejects.toThrow("Choose a local image path");
  });

  it("protects Hospitality selections when a linked project is removed", async () => {
    const store = await import("./siteContentStore");
    await store.saveCollectionDraft("projects.records", [], 0, 0);
    await expect(store.publishDraft(0, 1)).rejects.toThrow("referenced project is missing");
  });

  it("blocks archiving a project still selected in Hospitality", async () => {
    const store = await import("./siteContentStore");
    await store.saveCollectionDraft("projects.records", [{ id: "forrest", fields: {
      status: "archived", title: "Forrest", coverSrc: "/photo.webp", coverAlt: "A home", gallery: "[]", films: "[]",
    } }], 0, 0);
    await expect(store.publishDraft(0, 1)).rejects.toThrow("referenced project is missing");
  });

  it("allows an incomplete new project to stay archived without appearing as publishable work", async () => {
    const store = await import("./siteContentStore");
    await store.saveCollectionDraft("projects.records", [{ id: "unready", fields: { status: "archived" } }, { id: "forrest", fields: {
      status: "active", title: "Forrest", coverSrc: "/photo.webp", coverAlt: "A home", gallery: "[]", films: "[]",
    } }], 0, 0);
    await expect(store.publishDraft(0, 1)).resolves.toMatchObject({ revision: 1 });
  });

  it("requires unique project addresses across current slugs and redirect aliases", async () => {
    const store = await import("./siteContentStore");
    await store.saveCollectionDraft("projects.records", [project("forrest"), project("new-home", "new-home", { slugHistory: '["forrest"]' })], 0, 0);
    await expect(store.publishDraft(0, 1)).rejects.toThrow("page address forrest is already used");
  });

  it("publishes standalone globe pins without requiring a project or photograph", async () => {
    const store = await import("./siteContentStore");
    await store.saveCollectionDraft("projects.globePins", [{ id: "qa-place", fields: { label: "Hyderabad", latitude: "", longitude: "" } }], 0, 0);
    await expect(store.publishDraft(0, 1)).rejects.toThrow("Latitude is required");
    await store.saveCollectionDraft("projects.globePins", [{ id: "qa-place", fields: { label: "Hyderabad", latitude: "95", longitude: "78.487" } }], 0, 1);
    await expect(store.publishDraft(0, 2)).rejects.toThrow("valid coordinates");
    await store.saveCollectionDraft("projects.globePins", [{ id: "qa-place", fields: { label: "Hyderabad", latitude: "17.385", longitude: "78.487" } }], 0, 2);
    const published = await store.publishDraft(0, 3);
    expect(published.publishedCollections["projects.globePins"][0].fields).toMatchObject({ latitude: "17.385", longitude: "78.487" });
    expect(published.publishedCollections["projects.records"]).toBeUndefined();
  });

  it("preserves the old project URL when changing a published slug", async () => {
    const store = await import("./siteContentStore");
    await store.saveCollectionDraft("projects.records", [project("forrest")], 0, 0);
    await store.publishDraft(0, 1);
    await store.saveCollectionDraft("projects.records", [project("forrest", "forrest-new")], 1, 2);
    await expect(store.publishDraft(1, 3)).rejects.toThrow("keep previous address forrest as a redirect");
    await store.saveCollectionDraft("projects.records", [project("forrest", "forrest-new", { slugHistory: '["forrest"]' })], 1, 3);
    await expect(store.publishDraft(1, 4)).resolves.toMatchObject({ revision: 2 });
  });

  it("requires type and description for a Project selected in Hospitality", async () => {
    const store = await import("./siteContentStore");
    await store.saveCollectionDraft("projects.records", [project("forrest"), project("new-home")], 0, 0);
    await store.saveCollectionDraft("hospitality.selectedWork", [{ id: "new-home", fields: { projectId: "new-home" } }], 0, 1);
    await expect(store.publishDraft(0, 2)).rejects.toThrow("add a project type and description");
  });

  it("rejects concurrent stale draft saves and stale publish without losing the winning edit", async () => {
    const store = await import("./siteContentStore");
    const first = [{ id: "first", fields: { label: "First", image: "/photo.webp", alt: "First view" } }];
    const second = [{ id: "second", fields: { label: "Second", image: "/photo.webp", alt: "Second view" } }];
    const attempts = await Promise.allSettled([
      store.saveCollectionDraft("signature.gallery.forza", first, 0, 0),
      store.saveCollectionDraft("signature.gallery.forza", second, 0, 0),
    ]);
    expect(attempts.filter(result => result.status === "fulfilled")).toHaveLength(1);
    expect(attempts.filter(result => result.status === "rejected")).toHaveLength(1);
    const winningItems = attempts[0].status === "fulfilled" ? first : second;
    expect((await store.readContent()).draftCollections["signature.gallery.forza"]).toEqual(winningItems);
    expect((await store.readContent()).draftRevision).toBe(1);
    await expect(store.publishDraft(0, 0)).rejects.toThrow("draft content changed");
    await expect(store.publishDraft(0, 1)).resolves.toMatchObject({ revision: 1, draftRevision: 2 });
  });

  it("requires a linked Hospitality gallery photo to survive publication", async () => {
    const store = await import("./siteContentStore");
    const linkedProject = project("new-home", "new-home", { category: "Retreat", description: "A guest retreat.", gallery: JSON.stringify([{ id: "photo-one", src: "/photo.webp", alt: "A home" }]) });
    await store.saveCollectionDraft("projects.records", [project("forrest"), linkedProject], 0, 0);
    await store.saveCollectionDraft("hospitality.selectedWork", [{ id: "new-home", fields: { projectId: "new-home", galleryPhotoId: "missing-photo" } }], 0, 1);
    await expect(store.publishDraft(0, 2)).rejects.toThrow("chosen gallery photograph is missing");
    await store.saveCollectionDraft("hospitality.selectedWork", [{ id: "new-home", fields: { projectId: "new-home", galleryPhotoId: "photo-one" } }], 0, 2);
    await expect(store.publishDraft(0, 3)).resolves.toMatchObject({ revision: 1 });
    await store.saveCollectionDraft("projects.records", [project("forrest"), { ...linkedProject, fields: { ...linkedProject.fields, gallery: "[]" } }], 1, 4);
    await expect(store.publishDraft(1, 5)).rejects.toThrow("chosen gallery photograph is missing");
  });

  it("requires a description when Hospitality uses a custom photograph", async () => {
    const store = await import("./siteContentStore");
    const linkedProject = project("new-home", "new-home", { category: "Retreat", description: "A guest retreat." });
    await store.saveCollectionDraft("projects.records", [project("forrest"), linkedProject], 0, 0);
    await store.saveCollectionDraft("hospitality.selectedWork", [{ id: "new-home", fields: { projectId: "new-home", imageSrcOverride: "/photo.webp" } }], 0, 1);
    await expect(store.publishDraft(0, 2)).rejects.toThrow("describe the custom photograph");
    await store.saveCollectionDraft("hospitality.selectedWork", [{ id: "new-home", fields: { projectId: "new-home", imageSrcOverride: "/photo.webp", imageAltOverride: "Front elevation" } }], 0, 2);
    await expect(store.publishDraft(0, 3)).resolves.toMatchObject({ revision: 1 });
  });
});
