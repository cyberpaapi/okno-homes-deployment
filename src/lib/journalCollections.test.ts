import { describe, expect, it } from "vitest";
import { featuredJournalEntry, journalArticleFallbacks, journalArticlesFromItems, journalEntriesFromItems, journalEntryFallbacks, journalSectionAnchorId, uniqueJournalPublishers } from "./journalCollections";
import { pressEntries } from "@/components/journal/journalData";

describe("Journal collection migration and rendering", () => {
  it("features the selected Press record independently of collection order, with a safe removal fallback", () => {
    const entries = journalEntriesFromItems(journalEntryFallbacks(pressEntries));
    expect(featuredJournalEntry(entries, "press-new-atlas")?.id).toBe("press-new-atlas");
    expect(featuredJournalEntry([...entries].reverse(), "press-new-atlas")?.id).toBe("press-new-atlas");
    expect(featuredJournalEntry(entries.filter(entry => entry.id !== "press-new-atlas"), "press-new-atlas")?.id).toBe(entries[0].id);
    expect(featuredJournalEntry(entries, "none")).toBeUndefined();
    expect(featuredJournalEntry([], "press-new-atlas")).toBeUndefined();
  });

  it("keeps hidden news editable in the collection while removing it from public entries", () => {
    const items = journalEntryFallbacks(pressEntries);
    const hidden = items.map((item, index) => index === 0 ? { ...item, fields: { ...item.fields, visibility: "hidden" } } : item);
    expect(hidden).toHaveLength(items.length);
    const publicEntries = journalEntriesFromItems(hidden);
    expect(publicEntries).toHaveLength(items.length - 1);
    expect(publicEntries.some(entry => entry.id === items[0].id)).toBe(false);
    expect(featuredJournalEntry(publicEntries, items[0].id)?.id).toBe(items[1].id);
    expect(journalEntriesFromItems(hidden.map(item => ({ ...item, fields: { ...item.fields, visibility: "hidden" } })))).toEqual([]);
  });

  it("consolidates repeated publication sources and keeps the first source position", () => {
    const entries = journalEntriesFromItems(journalEntryFallbacks(pressEntries));
    const repeated = { ...entries[1], id: "same-publication", source: ` ${entries[0].source.toUpperCase()} `, logo: "/another-logo.webp" };
    const publishers = uniqueJournalPublishers([entries[0], { ...entries[1], source: "" }, repeated, entries[1]]);
    expect(publishers.map(entry => entry.source)).toEqual([entries[0].source, entries[1].source]);
    expect(publishers[0].logo).toBe(entries[0].logo || repeated.logo);
  });

  it("derives contents anchors from section identity, not display position or heading", () => {
    const sections = journalArticlesFromItems(journalArticleFallbacks())[0].sections;
    expect(sections.length).toBeGreaterThan(1);
    const anchor = journalSectionAnchorId(sections[1]);
    expect(anchor).toContain(sections[1].id);
    expect(journalSectionAnchorId([sections[1], ...sections.filter(section => section.id !== sections[1].id)][0])).toBe(anchor);
    expect(journalSectionAnchorId({ ...sections[1], heading: "Renamed heading" })).toBe(anchor);
  });

  it("preserves six article covers and their first inline photograph", () => {
    const posts = journalArticlesFromItems(journalArticleFallbacks());
    expect(posts).toHaveLength(6);
    posts.forEach(post => {
      expect(post.image).toMatch(/^\//);
      expect(post.imageAlt).toBeTruthy();
      expect(post.sections[0].image).toMatch(/^\//);
      expect(post.sections[0].imageAlt).toBeTruthy();
      expect(post.sections[0].paragraphs.length).toBeGreaterThan(0);
    });
  });

  it("supports news with a required photo and no publication icon", () => {
    const [item] = journalEntryFallbacks(pressEntries);
    const withoutIcon = { ...item, fields: { ...item.fields, logo: "" } };
    const [entry] = journalEntriesFromItems([withoutIcon]);
    expect(entry.image).toBeTruthy();
    expect(entry.logo).toBe("");
    expect(entry.source).toBe("Architectural Digest India");
  });

  it("preserves the order and paragraphs of added article sections", () => {
    const [item] = journalArticleFallbacks();
    const sections = [{ id: "new-section", heading: "A new place", paragraphs: [{ id: "new-paragraph", text: "The new body." }], image: "/new.webp", imageAlt: "New view" }];
    const [post] = journalArticlesFromItems([{ ...item, id: "new-story", fields: { ...item.fields, sections: JSON.stringify(sections) } }]);
    expect(post.id).toBe("new-story");
    expect(post.sections).toEqual([{ ...sections[0], imageCaption: "" }]);
  });
});
