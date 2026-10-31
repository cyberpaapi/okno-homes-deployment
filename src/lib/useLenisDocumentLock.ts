'use client';

import { useEffect } from 'react';
import { useLenis } from 'lenis/react';

/** Modal overflow locks must also stop programmatic smooth scrolling/inertia. */
export function useLenisDocumentLock() {
  const lenis = useLenis();
  useEffect(() => {
    if (!lenis) return;
    const sync = () => {
      if (document.hidden || document.body.style.overflow === 'hidden' || document.documentElement.dataset.heroLoading === 'true') lenis.stop();
      else lenis.start();
    };
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { attributes: true, attributeFilter: ['style'] });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-hero-loading'] });
    document.addEventListener('visibilitychange', sync);
    sync();
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', sync);
    };
  }, [lenis]);
}
