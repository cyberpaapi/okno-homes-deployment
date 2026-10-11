import { journalBlogPosts, type JournalBlogPost } from "@/components/journal/journalBlogData";
import { pressEntries, projectNotes, publicationLogos, type JournalEntry } from "@/components/journal/journalData";

export type JournalContentItem = { id: string; fields: Record<string, string> };
export type JournalSection = {
  id: string;
  heading: string;
  paragraphs: { id: string; text: string }[];
  image?: string;
  imageAlt?: string;
  imageCaption?: string;
};
export type PublishedJournalArticle = Omit<JournalBlogPost, "detailImage" | "detailImageAlt" | "sections"> & {
  sections: JournalSection[];
  heroCaption: string;
};

function field(values: Record<string, string>, id: string, fallback: string) {
  return values[id] ?? fallback;
}

export function journalEntryFallbacks(entries: JournalEntry[], values: Record<string, string> = {}): JournalContentItem[] {
  return entries.map((entry) => {
    const prefix = `journal.entry-${entry.id}`;
    return { id: entry.id, fields: {
      visibility: "shown",
      kind: entry.kind,
      source: field(values, `${prefix}.source`, entry.source),
      byline: field(values, `${prefix}.byline`, entry.byline ?? ""),
      date: field(values, `${prefix}.date`, entry.date),
      title: field(values, `${prefix}.title`, entry.title),
      summary: field(values, `${prefix}.summary`, entry.summary),
      image: field(values, `${prefix}.image`, entry.image),
      imageAlt: field(values, `${prefix}.alt`, entry.imageAlt),
      credit: field(values, `${prefix}.credit`, entry.credit),
      href: field(values, `${prefix}.href`, entry.href),
      external: entry.external ? "true" : "false",
      logo: field(values, `${prefix}.logo`, entry.logo ?? publicationLogos[entry.source] ?? ""),
    } };
  });
}

export function journalArticleFallbacks(values: Record<string, string> = {}): JournalContentItem[] {
  return journalBlogPosts.map((post) => {
    const prefix = `journal.post-${post.id}`;
    const sections: JournalSection[] = post.sections.map((section, index) => ({
      id: `${post.id}-section-${index + 1}`,
      heading: section.heading,
      paragraphs: section.paragraphs.map((text, paragraphIndex) => ({ id: `${post.id}-paragraph-${index + 1}-${paragraphIndex + 1}`, text })),
      ...(index === 0 ? {
        image: post.detailImage,
        imageAlt: post.detailImageAlt,
        imageCaption: `From the OKNO project archive · ${post.detailImageAlt}`,
      } : {}),
    }));
    return { id: post.id, fields: {
      recordId: post.id,
      slugHistory: "[]",
      category: field(values, `${prefix}.category`, post.category),
      title: field(values, `${prefix}.title`, post.title),
      excerpt: field(values, `${prefix}.excerpt`, post.excerpt),
      image: field(values, `${prefix}.image`, post.image),
      imageAlt: field(values, `${prefix}.alt`, post.imageAlt),
      heroCaption: field(values, `${prefix}.caption`, `OKNO project photography · ${post.imageAlt}`),
      sections: field(values, `${prefix}.sections`, JSON.stringify(sections)),
    } };
  });
}

export function parseJournalSections(value: string): JournalSection[] {
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((section, index) => {
      if (!section || typeof section !== "object") return [];
      const raw = section as Record<string, unknown>;
      return [{
        id: typeof raw.id === "string" && raw.id.trim() ? raw.id : `section-${index + 1}`,
        heading: typeof raw.heading === "string" ? raw.heading : "",
        paragraphs: Array.isArray(raw.paragraphs) ? raw.paragraphs.flatMap((paragraph, paragraphIndex) => {
          if (typeof paragraph === "string") return [{ id: `paragraph-${index + 1}-${paragraphIndex + 1}`, text: paragraph }];
          if (!paragraph || typeof paragraph !== "object") return [];
          const block = paragraph as Record<string, unknown>;
          return typeof block.text === "string" ? [{ id: typeof block.id === "string" ? block.id : `paragraph-${index + 1}-${paragraphIndex + 1}`, text: block.text }] : [];
        }) : [],
        image: typeof raw.image === "string" ? raw.image : "",
        imageAlt: typeof raw.imageAlt === "string" ? raw.imageAlt : "",
        imageCaption: typeof raw.imageCaption === "string" ? raw.imageCaption : "",
      }];
    });
  } catch {
    return [];
  }
}

export function journalSectionAnchorId(section: JournalSection): string {
  return `journal-section-${section.id.replace(/[^a-z0-9_-]/gi, "-")}`;
}

export function journalArticleAliases(item: JournalContentItem): string[] {
  try {
    const parsed: unknown = JSON.parse(item.fields.slugHistory || "[]");
    return Array.isArray(parsed) ? parsed.filter((alias): alias is string => typeof alias === "string") : [];
  } catch {
    return [];
  }
}

export function findJournalArticleByPath(items: JournalContentItem[], slug: string): { item: JournalContentItem; redirect: boolean } | null {
  const exact = items.find(item => item.id === slug);
  if (exact) return { item: exact, redirect: false };
  const alias = items.find(item => journalArticleAliases(item).includes(slug));
  return alias ? { item: alias, redirect: true } : null;
}

export function journalEntriesFromItems(items: JournalContentItem[]): JournalEntry[] {
  return items.filter(item => item.fields.visibility !== "hidden").map(({ id, fields }) => ({
    id,
    kind: fields.kind === "Project note" || fields.kind === "Project record" ? fields.kind : "Press",
    source: fields.source ?? "",
    byline: fields.byline || undefined,
    date: fields.date ?? "",
    title: fields.title ?? "",
    summary: fields.summary ?? "",
    image: fields.image ?? "",
    imageAlt: fields.imageAlt ?? "",
    credit: fields.credit ?? "",
    href: fields.href ?? "",
    external: fields.external === "true",
    logo: fields.logo ?? "",
  }));
}

export function featuredJournalEntry(entries: JournalEntry[], selectedId: string): JournalEntry | undefined {
  if (selectedId === "none") return undefined;
  return entries.find(entry => entry.id === selectedId) ?? entries[0];
}

export function uniqueJournalPublishers(entries: JournalEntry[]): JournalEntry[] {
  const publishers: JournalEntry[] = [];
  const indexBySource = new Map<string, number>();
  for (const entry of entries) {
    const source = entry.source.trim();
    if (!source) continue;
    const key = source.toLowerCase();
    const existingIndex = indexBySource.get(key);
    if (existingIndex === undefined) {
      indexBySource.set(key, publishers.length);
      publishers.push({ ...entry, source });
    } else if (!publishers[existingIndex].logo && entry.logo) {
      publishers[existingIndex] = { ...publishers[existingIndex], logo: entry.logo };
    }
  }
  return publishers;
}

export function journalArticlesFromItems(items: JournalContentItem[]): PublishedJournalArticle[] {
  return items.map(({ id, fields }) => ({
    id,
    category: fields.category ?? "",
    title: fields.title ?? "",
    excerpt: fields.excerpt ?? "",
    image: fields.image ?? "",
    imageAlt: fields.imageAlt ?? "",
    heroCaption: fields.heroCaption ?? "",
    sections: parseJournalSections(fields.sections ?? "[]"),
  }));
}

export function journalDefaultCollections(values: Record<string, string> = {}) {
  return {
    "journal.press": journalEntryFallbacks(pressEntries, values),
    "journal.notes": journalEntryFallbacks(projectNotes, values),
    "journal.articles": journalArticleFallbacks(values),
  };
}
