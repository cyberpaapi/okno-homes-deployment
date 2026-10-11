import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { journalArticleFallbacks, parseJournalSections } from "@/lib/journalCollections";
import JournalArticleCollectionEditor from "./JournalArticleCollectionEditor";

describe("Journal article editor", () => {
  it("keeps the previous page address on rename and starts duplicates without aliases", () => {
    let items = journalArticleFallbacks().slice(0, 1);
    const originalId = items[0].id;
    const onChange = vi.fn(next => { items = next; });
    const { rerender } = render(<JournalArticleCollectionEditor items={items} onChange={onChange} disabled={false} onUpload={vi.fn()} />);
    const address = screen.getByLabelText(/Page address/);
    fireEvent.change(address, { target: { value: "renamed-story" } });
    fireEvent.blur(address);
    expect(items[0].id).toBe("renamed-story");
    expect(items[0].fields.recordId).toBe(originalId);
    expect(JSON.parse(items[0].fields.slugHistory)).toEqual([originalId]);

    rerender(<JournalArticleCollectionEditor items={items} onChange={onChange} disabled={false} onUpload={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Duplicate" }));
    expect(items[1].fields.recordId).toBe(items[1].id);
    expect(items[1].fields.slugHistory).toBe("[]");
  });

  it("adds an article and updates its nested reading section without a JSON input", () => {
    const original = journalArticleFallbacks().slice(0, 1);
    let items = original;
    const onChange = vi.fn(next => { items = next; });
    const { rerender } = render(<JournalArticleCollectionEditor items={items} onChange={onChange} disabled={false} onUpload={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Add article" }));
    expect(items).toHaveLength(2);
    rerender(<JournalArticleCollectionEditor items={items} onChange={onChange} disabled={false} onUpload={vi.fn()} />);
    const address = screen.getByLabelText(/Page address/);
    fireEvent.change(address, { target: { value: "new-journal-story" } });
    expect(items[1].id).toMatch(/^new-article-/);
    fireEvent.blur(address);
    expect(items[1].id).toBe("new-journal-story");
    rerender(<JournalArticleCollectionEditor items={items} onChange={onChange} disabled={false} onUpload={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Add section" }));
    expect(parseJournalSections(items[1].fields.sections)).toHaveLength(1);
    rerender(<JournalArticleCollectionEditor items={items} onChange={onChange} disabled={false} onUpload={vi.fn()} />);
    fireEvent.click(screen.getByText("01. Untitled section"));
    fireEvent.change(screen.getByLabelText(/Section heading/), { target: { value: "An added chapter" } });
    expect(parseJournalSections(items[1].fields.sections)[0].heading).toBe("An added chapter");
    rerender(<JournalArticleCollectionEditor items={items} onChange={onChange} disabled={false} onUpload={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Duplicate section" }));
    const copiedSections = parseJournalSections(items[1].fields.sections);
    expect(copiedSections).toHaveLength(2);
    expect(copiedSections[1].heading).toBe("An added chapter");
    expect(copiedSections[1].id).not.toBe(copiedSections[0].id);
    expect(copiedSections[1].paragraphs[0].id).not.toBe(copiedSections[0].paragraphs[0].id);
    expect(screen.queryByLabelText("Article sections JSON")).not.toBeInTheDocument();
  });
});
