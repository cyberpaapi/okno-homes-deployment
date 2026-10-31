import styles from './ForestEntryOption.module.css';

/** Shared native progress UI from the existing OKNO hero. */
export default function FilmLoadingStatus({ ready, progress, retry }: { ready: boolean; progress: number | null; retry(): void }) {
  return <div className={styles.journeyLoading} data-journey-loading={ready ? 'ready' : progress === null ? 'unavailable' : 'loading'}>
    {progress !== null && <progress className={styles.loadingBar} max={1} value={ready ? 1 : progress < 0 ? undefined : progress} aria-label="Downloading complete scroll video" />}
    <span role="status">{ready ? 'Scroll to explore' : progress === null ? 'Video could not load' : progress === 1 ? 'Preparing playback' : progress < 0 ? 'Downloading video' : `Loading video · ${Math.floor(progress * 100)}%`}</span>
    {progress === null && <button className={styles.retryLoading} onClick={retry}>Retry loading</button>}
  </div>;
}
