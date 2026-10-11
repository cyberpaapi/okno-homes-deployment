'use client';

// danielpetho / Typewriter, 21st.dev 1482. Single-string, non-looping mode.
// Every glyph is laid out once; CSS performs the stagger without React rendering
// the entire Projects scene again for each character.
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { useReducedMotion } from 'motion/react';
import styles from './Typewriter.module.css';

type CharacterStyle = CSSProperties & {
  '--character-index': number;
  '--character-delay': string;
};

export function Typewriter({ text, start = true, speed = 65, children }: {
  text: string;
  start?: boolean;
  speed?: number;
  children: (content: ReactNode) => ReactNode;
}) {
  const reduced = useReducedMotion();
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    if (!start || reduced || complete) return;
    const revealDuration = Math.max(220, speed * 4);
    const timer = window.setTimeout(
      () => setComplete(true),
      Math.max(0, text.length - 1) * speed + revealDuration,
    );
    return () => window.clearTimeout(timer);
  }, [complete, reduced, speed, start, text]);

  const started = start || Boolean(reduced);
  return <span
    aria-label={text.replace(/\s+/g, ' ')}
    className={styles.root}
    data-started={started}
    data-complete={complete || Boolean(reduced)}
    data-typed={complete || reduced ? text.length : 0}
  >
    {children(<span aria-hidden="true" className={styles.text}>
      {[...text].map((character, index) => character === '\n'
        ? <br key={index} />
        : <span
            className={styles.character}
            key={index}
            style={{ '--character-index': index, '--character-delay': `${speed}ms` } as CharacterStyle}
          >{character}</span>)}
    </span>)}
  </span>;
}
