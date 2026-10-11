import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { journalArticleFallbacks, journalArticlesFromItems, type PublishedJournalArticle } from "@/lib/journalCollections";
import type { JournalEntry } from "./journalData";
import { pressEntries } from "./journalData";
import JournalArchive from "./JournalArchive";
import JournalExperience from "./JournalExperience";
import JournalMarquee from "./JournalMarquee";
import PublicationMarquee from "./PublicationMarquee";

const journalState = vi.hoisted(() => ({ posts: [] as PublishedJournalArticle[], press: [] as JournalEntry[], notes: [] as JournalEntry[] }));

vi.mock("@/lib/useJournalContent", () => ({
  useJournalBlogPosts: () => journalState.posts,
  useJournalEntries: () => ({ press: journalState.press, notes: journalState.notes }),
}));
vi.mock("@/lib/useSiteContent", () => ({ useSiteContent: (_id: string, fallback: string) => fallback }));
vi.mock("./JournalHero", () => ({ default: () => <div data-journal-hero /> }));

beforeEach(() => {
  journalState.posts = journalArticlesFromItems(journalArticleFallbacks());
  journalState.press = pressEntries;
  journalState.notes = [];
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
});

describe("Journal collection cardinality", () => {
  it("omits empty article, Press and publication sections without placeholder cards", () => {
    journalState.posts = [];
    journalState.press = [];
    const { container: archive } = render(<JournalArchive />);
    expect(archive.firstChild).toBeNull();
    const { container: press } = render(<JournalMarquee caption="In the press" entries={[]} />);
    expect(press.firstChild).toBeNull();
    const { container: publishers } = render(<PublicationMarquee />);
    expect(publishers.firstChild).toBeNull();
    render(<JournalExperience />);
    expect(screen.queryByRole("heading", { name: "Published stories and project records." })).not.toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "In the press" })).not.toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "From the archive" })).not.toBeInTheDocument();
  });

  it("renders one article and one Press story without decorative duplicate loops", () => {
    journalState.posts = journalState.posts.slice(0, 1);
    journalState.press = journalState.press.slice(0, 1);
    const { container: archive } = render(<JournalArchive />);
    expect(archive.querySelectorAll("article")).toHaveLength(1);
    const { container: press } = render(<JournalMarquee caption="In the press" entries={journalState.press} />);
    expect(press.querySelector("[data-single]"))?.toHaveAttribute("data-single", "true");
    expect(press.querySelectorAll("article")).toHaveLength(1);
    const { container: publishers } = render(<PublicationMarquee />);
    expect(publishers.querySelector("[data-single]"))?.toHaveAttribute("data-single", "true");
    expect(publishers.querySelectorAll("[aria-hidden='true'][inert]")).toHaveLength(0);
  });

  it("renders added article cards and deduplicates publication names in a many-item loop", () => {
    const seventh = { ...journalState.posts[0], id: "seventh-story", title: "A seventh story" };
    journalState.posts = [...journalState.posts, seventh];
    journalState.press = [...pressEntries, { ...pressEntries[0], id: "another-ad-story", title: "Another report" }];
    const { container: archive } = render(<JournalArchive />);
    expect(archive.querySelectorAll("article")).toHaveLength(7);
    expect(screen.getByRole("link", { name: "Read article A seventh story" })).toHaveAttribute("href", "/journal/seventh-story");
    const { container: press } = render(<JournalMarquee caption="In the press" entries={journalState.press} />);
    expect(press.querySelectorAll("article:not([data-duplicate])")).toHaveLength(6);
    expect(press.querySelectorAll("article[data-duplicate] [data-journal-cursor-action][tabindex='-1']")).toHaveLength(6);
    const { container: publishers } = render(<PublicationMarquee />);
    expect(publishers.querySelectorAll("[data-journal-source-mark='Architectural Digest India']")).toHaveLength(2);
    expect(publishers.querySelectorAll("[aria-hidden='true'][inert]")).toHaveLength(1);
  });
});
