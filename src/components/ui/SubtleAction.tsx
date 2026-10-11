'use client';

// Adapted from 21st.dev Subtle Button by jatin-yadav05 (demo 3373).
// The source's soft border, travelling sheen and illuminated dot are preserved.
// Native links/buttons and the retrieved Magnetic Button interaction keep their
// original keyboard and pointer semantics.
import type { ComponentProps, ReactNode } from 'react';
import { MagneticButton, MagneticLink } from '@/components/projects/21st/Magnetic';
import styles from './SubtleAction.module.css';

type Tone = 'glass' | 'paper';
type SubtleLinkProps = Omit<ComponentProps<typeof MagneticLink>, 'children'> & { children: ReactNode; tone?: Tone };
type SubtleButtonProps = Omit<ComponentProps<typeof MagneticButton>, 'children'> & { children: ReactNode; tone?: Tone };

function classes(className?: string) {
  return `${styles.action}${className ? ` ${className}` : ''}`;
}

export function SubtleLink({
  children,
  className,
  tone = 'glass',
  ...props
}: SubtleLinkProps) {
  return (
    <MagneticLink
      {...props}
      className={classes(className)}
      data-tone={tone}
      data-landing-magnetic
    >
      <span className={styles.label}>{children}</span>
      <span className={styles.dot} aria-hidden="true" />
    </MagneticLink>
  );
}

export function SubtleButton({
  children,
  className,
  tone = 'glass',
  ...props
}: SubtleButtonProps) {
  return (
    <MagneticButton
      {...props}
      className={classes(className)}
      data-tone={tone}
      data-landing-magnetic
    >
      <span className={styles.label}>{children}</span>
      <span className={styles.dot} aria-hidden="true" />
    </MagneticButton>
  );
}
