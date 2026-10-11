// efferd / not found 2, 21st.dev demo 9999.
// Retains the oversized fading 404, Empty composition and paired source buttons.
import Link from 'next/link';
import { HomeIcon, ArrowUpRight } from 'lucide-react';
import Header from '@/components/Header/Header';
import { Button } from '@/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader } from '@/components/ui/empty';
import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <main className={styles.page} data-route="not-found">
      <Header tone="light" />
      <Empty className={styles.content}>
        <EmptyHeader>
          <h1 className={styles.code} aria-label="404 — Page not found">404</h1>
          <EmptyDescription className={styles.description}>
            This page has moved or does not exist.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className={styles.actions}>
            <Button asChild className={styles.home}>
              <Link href="/"><HomeIcon aria-hidden="true" />Go home</Link>
            </Button>
            <Button asChild variant="outline" className={styles.models}>
              <Link href="/models">Models<ArrowUpRight aria-hidden="true" /></Link>
            </Button>
          </div>
        </EmptyContent>
      </Empty>
    </main>
  );
}
