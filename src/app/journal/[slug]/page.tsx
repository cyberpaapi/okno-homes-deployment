import type { Metadata } from "next";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import ModelsHeader from "@/components/models/ModelsHeader";
import JournalArticle from "@/components/journal/JournalArticle";
import { findJournalArticleByPath, journalArticleFallbacks, journalArticlesFromItems } from "@/lib/journalCollections";
import { readPublicContent } from "@/lib/publicContent";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

const publishedArticles = cache(async () => {
  const snapshot = await readPublicContent();
  const items = snapshot.publishedCollections["journal.articles"] ?? journalArticleFallbacks(snapshot.published);
  return { items, posts: journalArticlesFromItems(items) };
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { items, posts } = await publishedArticles();
  const match = findJournalArticleByPath(items, slug);
  const post = posts.find((item) => item.id === match?.item.id);
  if (!post) return { title: "Journal | OKNO Modhomes" };
  return {
    title: `${post.title} | OKNO Journal`,
    description: post.excerpt,
  };
}

export default async function JournalArticlePage({ params }: Props) {
  const { slug } = await params;
  const { items, posts } = await publishedArticles();
  const match = findJournalArticleByPath(items, slug);
  if (!match || !posts.some((post) => post.id === match.item.id)) notFound();
  if (match.redirect) redirect(`/journal/${match.item.id}`);
  return (
    <main data-route="journal-article">
      <ModelsHeader tone="light" currentHref="/journal" />
      <JournalArticle slug={slug} initialItems={items} />
    </main>
  );
}
