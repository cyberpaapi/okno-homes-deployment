import { describe, expect, it } from "vitest";
import { adminPages, allContentFields } from "./adminContent";
import { siteNavigationItems } from "./siteNavigation";
import projectMedia from "./realProjectMedia.json";
import { pressEntries } from "@/components/journal/journalData";
import { gazePrototype, oknoModels } from "./models";
import { PROCESS_DAY_RANGES } from "@/lib/processChapters";
import { processDetailPhases } from "./processDetailPhases";

describe("admin page hierarchy", () => {
  it("follows the public navigation order with Home first and Enquiry after", () => {
    expect(adminPages.slice(1, 8).map(page => page.href)).toEqual(siteNavigationItems.map(item => item.href));
    expect(adminPages[0].id).toBe("home");
    expect(adminPages[8].id).toBe("enquiry");
    expect(adminPages.at(-1)?.id).toBe("shared");
  });

  it("uses unique stable field identifiers and local media defaults", () => {
    const fields = allContentFields();
    expect(fields.length).toBeGreaterThan(100);
    expect(new Set(fields.map(field => field.id)).size).toBe(fields.length);
    for (const field of fields) {
      expect(field.id).toMatch(/^[a-z0-9-]+(\.[a-z0-9-]+)+$/);
      if (field.kind === "image" || field.kind === "video") {
        if (field.id === "hero-v2.opening.scroll-video") expect(field.defaultValue).toBe("");
        else expect(field.defaultValue).toMatch(/^\/(?!\/)/);
      }
      if (field.kind === "choice") expect(field.options?.map(option => option.value)).toContain(field.defaultValue);
    }
  });

  it("maps the current Process timeline in visual order with the live photographs", () => {
    const process = adminPages.find(page => page.id === "process")!;
    expect(process.sections.map(section => section.id)).toEqual([
      "opening", "sequence", "stage-land", "stage-architecture", "stage-design-lock",
      "stage-assembly", "stage-enclosure", "stage-handover", "details",
      "detail-1", "detail-2", "detail-3", "detail-4", "detail-5",
    ]);
    const fields = new Map(process.sections.flatMap(section => section.fields.map(field => [field.id, field] as const)));
    expect(fields.get("process.sequence.rail-heading")?.defaultValue).toBe("Build sequence");
    expect(fields.get("process.opening.film-label")?.kind).toBe("text");
    expect(fields.get("process.opening.cover")?.kind).toBe("image");
    expect(fields.get("process.opening.cover")?.defaultValue).not.toBe(fields.get("process.opening.poster")?.defaultValue);
    for (const [id,days] of Object.entries(PROCESS_DAY_RANGES)) {
      expect(fields.get(`process.stage-${id}.days`)?.defaultValue).toBe(days);
    }
    processDetailPhases.forEach((phase, index) => {
      const prefix = `process.details.phase-${index + 1}`;
      expect(fields.get(`${prefix}.image`)?.defaultValue).toBe(phase.image);
      expect(fields.get(`${prefix}.alt`)?.defaultValue).toBe(phase.alt);
      expect(fields.get(`${prefix}.title`)?.defaultValue).toBe(phase.title);
    });
  });

  it("retains legacy project media IDs for migration while showing one ordered project library", () => {
    const projects = adminPages.find(page => page.id === "projects")!;
    expect(projects.sections.some(section => section.id === "project-library")).toBe(true);
    expect(projects.sections.some(section => section.id.startsWith("project-"))).toBe(true);
    const fields = allContentFields();
    for (const project of projectMedia) {
      expect(projects.sections.find(item => item.id === `project-${project.id}`)).toBeUndefined();
      const ids = fields.filter(field => field.id.startsWith(`projects.${project.id}.`)).map(field => field.id);
      expect(ids.filter(id => id.endsWith(".src"))).toHaveLength(project.gallery.length + project.films.length);
      expect(ids.filter(id => id.endsWith(".alt"))).toHaveLength(project.gallery.length);
      expect(ids.filter(id => id.endsWith(".poster"))).toHaveLength(project.films.length);
    }
  });

  it("shows the shared lower-page fields under both hero variants without duplicating stored IDs", () => {
    const home = adminPages[0];
    const [published, v1, v2] = home.children ?? [];
    expect(published.sections[0].fields[0].id).toBe("home.publishing.hero");
    const lowerIds = (page: typeof v1) => page.sections.filter(section => section.id !== "opening" && section.id !== "ending").flatMap(section => section.fields.map(field => field.id));
    expect(lowerIds(v1)).toEqual(lowerIds(v2));
    expect(lowerIds(v1)).toContain("home.timeline.heading-start");
    expect(lowerIds(v1)).toContain("home.signature.action");
  });

  it("places the featured Press selector in the Journal opening before its collection", () => {
    const journal = adminPages.find(page => page.id === "journal")!;
    expect(journal.sections[0].id).toBe("hero");
    expect(journal.sections[0].fields.find(field => field.id === "journal.hero.featured-id")).toMatchObject({ id: "journal.hero.featured-id", defaultValue: pressEntries[0].id });
    expect(journal.sections[1].id).toBe("press-intro");
    expect(journal.sections[2].id).toBe("publication-ticker");
    expect(journal.sections.find(section => section.id === "article-reader")?.fields.map(field => field.id)).toContain("journal.article.on-page-label");
  });

  it("exposes the current-page image descriptions, credit and approved About icon choices", () => {
    const fields = new Map(allContentFields().map(field => [field.id, field]));
    expect(fields.get("models.bespoke.portal.image-alt")?.kind).toBe("text");
    expect(fields.get("sustainability.proof.final-credit")?.defaultValue).toBe("Photography · Inclined Studio");
    expect(fields.get("projects.detail.return")?.defaultValue).toBe("All places");
    for (const id of ["sustainability", "move-in", "warranty", "energy", "resilience"]) {
      expect(fields.get(`about.assurances.${id}-icon`)?.options?.map(option => option.value))
        .toEqual(["badge", "calendar", "shield", "bulb", "home"]);
    }
  });

  it("keeps page actions next to their labels with editable same-site destinations", () => {
    const fields = new Map(allContentFields().map(field => [field.id, field]));
    for (const id of [
      "home.timeline.action", "home.signature.action", "home.bespoke.action",
      "home.sustainability.action", "hospitality.opening.action", "hospitality.closing.action",
      "sustainability.ending.action", "projects.intro.action",
    ]) {
      expect(fields.has(id)).toBe(true);
      expect(fields.get(`${id}-href`)?.kind).toBe("text");
      expect(fields.get(`${id}-href`)?.defaultValue).toMatch(/^(?:\/|#)/);
    }
    for (const card of ["journal", "about"]) {
      expect(fields.get(`home.editorial.${card}.href`)?.defaultValue).toBe(`/${card}`);
    }
    expect(fields.get("projects.detail.return-href")?.defaultValue).toBe("/projects?place={projectId}");
    for (let index = 1; index <= 5; index++) expect(fields.get(`hospitality.bento.${index}.alt`)?.kind).toBe("text");
    for (let index = 1; index <= 7; index++) expect(fields.get(`hospitality.timeline.stage-${index}.alt`)?.kind).toBe("text");
  });

  it("places every shared Footer field in its public visual order", () => {
    const footer = adminPages.find(page => page.id === "footer")!;
    expect(adminPages.at(-2)?.id).toBe("footer");
    expect(footer.sections.map(section => section.id)).toEqual(["footer-brand", "footer-social-instagram", "footer-social-youtube", "footer-social-linkedin", "footer-social-facebook", "footer-homes", "footer-explore", "footer-okno", "footer-bottom"]);
    const ids = footer.sections.flatMap(section => section.fields.map(field => field.id));
    expect(ids).toContain("footer.brand.line");
    expect(ids).toContain("footer.social.instagram.icon");
    expect(ids).toContain("footer.social.facebook.href");
    expect(ids).toContain("footer.homes.signature.label");
    expect(ids).toContain("footer.explore.projects.href");
    expect(ids).toContain("footer.okno.enquire.href");
    expect(ids).toContain("footer.bottom.copyright");
    expect(ids).toContain("footer.bottom.closing");
  });

  it("gives every Signature plan its own editable area and price, including Gaze", () => {
    const signature = adminPages.find(page => page.id === "models")?.children?.find(page => page.id === "signature");
    expect(signature).toBeDefined();
    for (const slug of ["forza", "kray", "gaze", "tengo", "trib", "octapod"]) {
      const model = oknoModels.find(item => item.slug === slug) ?? gazePrototype;
      for (const [index, variant] of model.variants.entries()) {
        const section = signature?.sections.find(item => item.id === `${slug}-plan-${index + 1}`);
        expect(section?.fields.find(field => field.id === `models.signature.${slug}.variant-${index + 1}.area`)?.defaultValue)
          .toBe(variant.areaDisplay ?? `${variant.areaSqFt.toLocaleString("en-IN")} sq ft`);
        expect(section?.fields.find(field => field.id === `models.signature.${slug}.variant-${index + 1}.price`)?.defaultValue)
          .toBe(variant.price.display);
      }
    }
  });
});
