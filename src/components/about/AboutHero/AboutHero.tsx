import styles from './AboutHero.module.css';

export default function AboutHero() {
  return (
    <section className={styles.hero}>
      <video className={styles.heroVideo} autoPlay muted loop playsInline preload="metadata">
        <source src="/videos/hero-clean.mp4" type="video/mp4" />
      </video>
      <div className={styles.heroContent}>
        <div className={styles.eyebrow}>OKNO MODHOMES · OUR JOURNEY</div>
        <h1>Precision-built homes.<br />Made to live.</h1>
        <p>From a studio in Hyderabad to a growing portfolio of sustainable, precision-manufactured homes.</p>
      </div>
    </section>
  );
}
