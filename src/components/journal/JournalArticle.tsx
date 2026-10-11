"use client";

// Editorial two-column reading layout adapted from 21st.dev Article With
// Author Sidebar, demo 29471. The source is archived in docs/21st-source/.
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useJournalBlogPosts } from "@/lib/useJournalContent";
import { journalSectionAnchorId, type JournalContentItem } from "@/lib/journalCollections";
import { useSiteContent } from "@/lib/useSiteContent";
import styles from "./JournalArticle.module.css";

export default function JournalArticle({ slug, initialItems }: { slug: string; initialItems?: JournalContentItem[] }) {
  const posts = useJournalBlogPosts(initialItems);
  const backLabel = useSiteContent("journal.article.back", "Journal");
  const breadcrumb = useSiteContent("journal.article.breadcrumb", "OKNO / Journal");
  const readingSuffix = useSiteContent("journal.article.reading-suffix", "min read");
  const contentsHeading = useSiteContent("journal.article.contents", "In this article");
  const navigationLabel = useSiteContent("journal.article.navigation-label", "Article navigation");
  const onPageLabel = useSiteContent("journal.article.on-page-label", "On this page");
  const relatedHeading = useSiteContent("journal.article.related", "Read next");
  const closingHeading = useSiteContent("journal.article.closing-heading", "Continue exploring");
  const closingAction = useSiteContent("journal.article.closing-action", "All Journal stories");
  const index = posts.findIndex((item) => item.id === slug);
  const post = posts[index];
  if (!post) return null;
  const related = [...posts.slice(index + 1), ...posts.slice(0, index)].slice(0, 2);
  const wordCount = [post.title, post.excerpt, ...post.sections.flatMap((section) => [section.heading, ...section.paragraphs.map(paragraph => paragraph.text)])].join(" ").trim().split(/\s+/).length;
  const readMinutes = Math.max(2, Math.ceil(wordCount / 220));

  return (
    <div className={styles.page}>
      <div className={styles.topline}>
        <Link href="/journal" className={styles.back}><ArrowLeft size={16} strokeWidth={1.6} aria-hidden="true" /> {backLabel}</Link>
        <span>{breadcrumb}</span>
      </div>

      <header className={styles.intro}>
        <div className={styles.introMeta}><span>{post.category}</span><span>{readMinutes} {readingSuffix}</span></div>
        <h1>{post.title}</h1>
        <p>{post.excerpt}</p>
      </header>

      <figure className={styles.heroFigure}>
        <div className={styles.heroImage}>{post.image ? <Image src={post.image} alt={post.imageAlt} fill priority sizes="100vw" /> : <span className={styles.missingImage}>Add a photograph before publishing</span>}</div>
        {post.heroCaption && <figcaption>{post.heroCaption}</figcaption>}
      </figure>

      <div className={styles.readingLayout}>
        <article className={styles.article} aria-label={post.title}>
          {post.sections.map((section) => (
            <div key={section.id}>
              <section className={styles.section} id={journalSectionAnchorId(section)}>
                <h2>{section.heading}</h2>
                {section.paragraphs.map((paragraph) => <p key={paragraph.id}>{paragraph.text}</p>)}
              </section>
              {section.image && (
                <figure className={styles.inlineFigure}>
                  <div className={styles.inlineImage}><Image src={section.image} alt={section.imageAlt ?? ""} fill sizes="(max-width: 780px) 100vw, 760px" /></div>
                  {section.imageCaption && <figcaption>{section.imageCaption}</figcaption>}
                </figure>
              )}
            </div>
          ))}
          <div className={styles.articleEnd} aria-hidden="true"><span /> <span /> <span /></div>
        </article>

        <aside className={styles.sidebar} aria-label={navigationLabel}>
          <div className={styles.sideBlock}>
            <p className={styles.sideTitle}>{contentsHeading}</p>
            <nav aria-label={onPageLabel}>
              {post.sections.map((section) => (
                <a key={section.id} href={`#${journalSectionAnchorId(section)}`}>{section.heading}</a>
              ))}
            </nav>
          </div>
          {related.length > 0 && <div className={styles.sideBlock}>
            <p className={styles.sideTitle}>{relatedHeading}</p>
            {related.map((item) => <Link className={styles.relatedLink} key={item.id} href={`/journal/${item.id}`}><span>{item.category}</span><strong>{item.title}</strong><ArrowRight size={16} strokeWidth={1.5} aria-hidden="true" /></Link>)}
          </div>}
        </aside>
      </div>

      <footer className={styles.closing}>
        <span>{closingHeading}</span>
        <Link href="/journal"><ArrowLeft size={19} strokeWidth={1.5} aria-hidden="true" /> {closingAction}</Link>
      </footer>
    </div>
  );
}
