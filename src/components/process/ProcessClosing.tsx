'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { processClosing } from '@/data/processClosing';
import { useSiteContentMap } from '@/lib/useSiteContent';
import styles from './ProcessClosing.module.css';

export default function ProcessClosing() {
  const values = useSiteContentMap();
  const content = (id: string, fallback: string) => values[`process.closing.${id}`] ?? fallback;
  return (
    <section className={styles.closing} aria-labelledby="process-closing-title" data-process-closing>
      <div className={styles.preparation}>
        <div className={styles.introduction}>
          <h2 id="process-closing-title">{content('heading', processClosing.heading)}</h2>
          <p>{content('summary', processClosing.summary)}</p>
        </div>
        <dl className={styles.questions}>
          {(['land', 'brief', 'timing'] as const).map(key => (
            <div key={key}>
              <dt>{content(`${key}.title`, processClosing[key].title)}</dt>
              <dd>{content(`${key}.copy`, processClosing[key].copy)}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className={styles.invitation}>
        <h3>{content('invitation', processClosing.invitation)}</h3>
        <div className={styles.links}>
          <Link className={styles.primary} href="/enquiry" prefetch={false}>
            {content('enquiry', processClosing.enquiry)}<ArrowUpRight size={22} aria-hidden="true" />
          </Link>
          <Link className={styles.secondary} href="/models" prefetch={false}>
            {content('models', processClosing.models)}<ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
