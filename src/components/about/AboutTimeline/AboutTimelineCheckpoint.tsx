import Image from 'next/image';
import styles from './AboutTimeline.module.css';

interface TimelineCheckpointProps {
  id: string;
  progress: number;
  year: string;
  title: string;
  description: string;
  url: string;
  source: string;
  image: string;
  className: string;
}

export default function AboutTimelineCheckpoint({
  id,
  progress,
  year,
  title,
  description,
  source,
  image,
  className
}: TimelineCheckpointProps) {
  return (
    <article
      id={id}
      className={`${styles.story} ${styles[className]} story`} 
      data-progress={progress}
    >
      <div className={styles.storyInner}>
        <div className={styles.storyCopy}>
          <div className={styles.storyYear}>{year}</div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        <div className={`${styles.storyMedia} ${styles.siteVisual}`}>
          <Image src={image} alt={`${title} visual`} fill sizes="(max-width: 800px) 82vw, 47vw" />
          <div className={styles.siteSource}>{source}</div>
        </div>
      </div>
    </article>
  );
}
