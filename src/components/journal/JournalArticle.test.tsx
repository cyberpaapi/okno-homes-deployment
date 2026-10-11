import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { journalArticleFallbacks, journalArticlesFromItems } from "@/lib/journalCollections";
import JournalArticle from "./JournalArticle";

const articleState = vi.hoisted(() => ({ posts: [] as ReturnType<typeof journalArticlesFromItems>, labels: {} as Record<string, string> }));

vi.mock("@/lib/useJournalContent", () => ({ useJournalBlogPosts: () => articleState.posts }));
vi.mock("@/lib/useSiteContent", () => ({ useSiteContent: (id: string, fallback: string) => articleState.labels[id] ?? fallback }));

beforeEach(() => {
  articleState.posts = journalArticlesFromItems(journalArticleFallbacks());
  articleState.labels = {};
});

describe("Journal article reading controls", () => {
  it("hides the related-story block when the collection contains only one article", () => {
    articleState.posts = articleState.posts.slice(0, 1);
    render(<JournalArticle slug={articleState.posts[0].id} />);
    expect(screen.queryByText("Read next")).not.toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "On this page" })).toBeInTheDocument();
  });

  it("uses editable navigation labels and stable section IDs through a reorder", () => {
    const post = articleState.posts[0];
    articleState.labels = { "journal.article.navigation-label": "Reading guide", "journal.article.on-page-label": "Contents links" };
    const { rerender } = render(<JournalArticle slug={post.id} />);
    const first = post.sections[0];
    const originalLink = within(screen.getByRole("navigation", { name: "Contents links" })).getByRole("link", { name: first.heading });
    const originalHref = originalLink.getAttribute("href");
    expect(originalHref).toBe(`#journal-section-${first.id}`);
    expect(screen.getByRole("complementary", { name: "Reading guide" })).toBeInTheDocument();

    articleState.posts = [{ ...post, sections: [...post.sections].reverse() }, ...articleState.posts.slice(1)];
    rerender(<JournalArticle slug={post.id} />);
    const movedLink = within(screen.getByRole("navigation", { name: "Contents links" })).getByRole("link", { name: first.heading });
    expect(movedLink).toHaveAttribute("href", originalHref);
    expect(document.getElementById(originalHref!.slice(1))).not.toBeNull();
  });
});
