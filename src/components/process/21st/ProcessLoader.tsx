import styles from "./ProcessLoader.module.css";

/** Adapted from bookmarked 21st.dev component 4588, Morph Loading. */
export default function ProcessLoader({ label }: { label: string }) {
  return (
    <div className={styles.loader} role="status" aria-label={label}>
      {[0, 1, 2, 3].map((item) => (
        <span key={item} style={{ animationDelay: `${item * 120}ms` }} />
      ))}
      <span className={styles.srOnly}>{label}</span>
    </div>
  );
}
