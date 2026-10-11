import styles from "./ProcessBackdrop.module.css";

/**
 * Adapted from 21st.dev component 5294, Elegant Dark Pattern by jatin-yadav05.
 * The original layered radial field and masked diagonal bands are retained,
 * but the remote texture and bright blue streaks are removed for a static,
 * page-specific OKNO background with no idle animation loop.
 */
export default function ProcessBackdrop() {
  return (
    <div className={styles.backdrop} aria-hidden="true">
      <div className={styles.field} />
      <div className={styles.bands} />
      <div className={styles.grain} />
    </div>
  );
}
