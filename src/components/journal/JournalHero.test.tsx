import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { pressEntries } from "./journalData";
import JournalHero from "./JournalHero";

const journalState = vi.hoisted(() => ({ selectedId: "press-ad-india", press: [] as typeof pressEntries }));

vi.mock("@/lib/useJournalContent", () => ({ useJournalEntries: () => ({ press: journalState.press }) }));
vi.mock("@/lib/useSiteContent", () => ({ useSiteContent: (id: string, fallback: string) => id === "journal.hero.featured-id" ? journalState.selectedId : fallback }));
vi.mock("./JournalShaderBackground", () => ({ ShaderBackground: () => null }));
vi.mock("./JournalTextReveal", () => ({ JournalTextReveal: ({ text }: { text: string }) => <>{text}</> }));

beforeEach(() => {
  journalState.selectedId = "press-ad-india";
  journalState.press = pressEntries;
});

describe("Journal featured story", () => {
  it("renders the selected published record even when it is not first", () => {
    journalState.selectedId = "press-new-atlas";
    render(<JournalHero />);
    expect(screen.getByRole("heading", { name: pressEntries[1].title })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: new RegExp(`Read ${pressEntries[1].title}`) })).toHaveAttribute("href", pressEntries[1].href);
  });

  it("uses the first remaining record after the selection is removed and supports text-only news", () => {
    journalState.selectedId = "press-new-atlas";
    journalState.press = [{ ...pressEntries[0], id: "text-only", title: "A text-only update", image: "", imageAlt: "", source: "", logo: "" }];
    render(<JournalHero />);
    expect(screen.getByRole("heading", { name: "A text-only update" })).toBeInTheDocument();
    expect(screen.getByRole("article")).toHaveAttribute("data-photo", "false");
    expect(screen.getByRole("link", { name: "Read A text-only update" })).toBeInTheDocument();
  });

  it("leaves the feature empty when all Press records are removed", () => {
    journalState.press = [];
    render(<JournalHero />);
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
  });
});
