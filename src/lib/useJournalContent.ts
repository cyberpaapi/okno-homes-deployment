"use client";

import { useMemo } from "react";
import { pressEntries, projectNotes } from "@/components/journal/journalData";
import {
  journalArticleFallbacks,
  journalArticlesFromItems,
  journalEntriesFromItems,
  journalEntryFallbacks,
  type JournalContentItem,
} from "@/lib/journalCollections";
import { useSiteCollection, useSiteContentMap } from "@/lib/useSiteContent";

export function useJournalEntries() {
  const values = useSiteContentMap();
  const pressFallback = useMemo(() => journalEntryFallbacks(pressEntries, values), [values]);
  const notesFallback = useMemo(() => journalEntryFallbacks(projectNotes, values), [values]);
  const press = useSiteCollection("journal.press", pressFallback);
  const notes = useSiteCollection("journal.notes", notesFallback);
  return useMemo(() => ({
    press: journalEntriesFromItems(press),
    notes: journalEntriesFromItems(notes),
  }), [press, notes]);
}

export function useJournalBlogPosts(initialItems?: JournalContentItem[]) {
  const values = useSiteContentMap();
  const fallback = useMemo(() => journalArticleFallbacks(values), [values]);
  const items = useSiteCollection("journal.articles", initialItems ?? fallback);
  return useMemo(() => journalArticlesFromItems(items), [items]);
}
