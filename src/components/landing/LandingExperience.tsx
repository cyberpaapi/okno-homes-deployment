'use client';

import Header from '@/components/Header/Header';
import ProductTimeline from './ProductTimeline';
import LandingPathways from './LandingPathways';
import styles from './LandingExperience.module.css';

export default function LandingExperience() {
  return <div className={styles.page} data-route="landing">
    <Header variant="immersive" trapFocus enquiryHref="/enquiry?intent=home" />
    <main>
      <div className={styles.timelineField}><ProductTimeline /></div>
      <LandingPathways />
    </main>
  </div>;
}
