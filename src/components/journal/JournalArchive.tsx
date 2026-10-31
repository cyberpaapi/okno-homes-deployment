"use client";

// Conventional blog-grid adaptation of 21st.dev Blog Grid, demo 28557.
// Each image receives a restrained scroll-linked drift using motion/react.
import Image from "next/image";
import { thumbnailImageLoader } from "@/lib/thumbnailImageLoader";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { JournalTextReveal } from "./JournalTextReveal";
import { type PublishedJournalArticle } from "@/lib/journalCollections";
import { useJournalBlogPosts } from "@/lib/useJournalContent";
import { useSiteContent } from "@/lib/useSiteContent";
import styles from "./Journal.module.css";

function BlogCard({ post, index, actionLabel }: { post: PublishedJournalArticle; index: number; actionLabel: string }) {
  const card = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: card, offset: ["start end", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);
  return (
    <motion.article
      ref={card}
      className={styles.blogArticle}
      initial={reduced ? false : { opacity: 0, y: 44, clipPath: "inset(0 0 12% 0)" }}
      whileInView={{ opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)" }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: reduced ? 0 : 0.85, delay: reduced ? 0 : (index % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link className={styles.blogLink} href={`/journal/${post.id}`} aria-label={`${actionLabel} ${post.title}`}>
        <div className={styles.blogImage}>
          <motion.div className={styles.blogImageDrift} style={reduced ? undefined : { y: imageY }}>
            {post.image ? <Image loader={thumbnailImageLoader} src={post.image} alt={post.imageAlt} fill sizes="(max-width: 760px) 92vw, (max-width: 1100px) 46vw, 30vw" /> : <span className={styles.missingImage}>Add a photograph before publishing</span>}
          </motion.div>
        </div>
        <div className={styles.blogCopy}>
          <p>{post.category}</p>
          <h3>{post.title}</h3>
          <p>{post.excerpt}</p>
          <span className={styles.blogRead} data-type-field={"journal.archive.action"}>{actionLabel} <ArrowUpRight size={16} strokeWidth={1.6} aria-hidden="true" /></span>
        </div>
      </Link>
    </motion.article>
  );
}

export default function JournalArchive() {
  const posts = useJournalBlogPosts();
  const heading = useSiteContent("journal.archive.heading", "Latest from the Journal");
  const copy = useSiteContent("journal.archive.copy", "Ideas on sites, spaces, materials and making homes.");
  const actionLabel = useSiteContent("journal.archive.action", "Read article");
  if (posts.length === 0) return null;
  return (
    <section  data-type-section="journal.archive"className={styles.archive} aria-labelledby="journal-blog-title">
      <div className={styles.archiveHead}>
        <h2 id="journal-blog-title" data-type-field={"journal.archive.heading"}><JournalTextReveal text={heading} /></h2>
        <p data-type-field={"journal.archive.copy"}>{copy}</p>
      </div>
      <div className={styles.blogGrid}>
        {posts.map((post, index) => <BlogCard key={post.id} post={post} index={index} actionLabel={actionLabel} />)}
      </div>
    </section>
  );
}
