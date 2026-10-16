'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import OknoLogo from '@/components/Brand/OknoLogo';
import { footerGroups, footerSocialLinks, validFooterSocialHref } from '@/data/footerContent';
import { localDestination } from '@/lib/localDestination';
import { useSiteCollectionsMap, useSiteContentMap } from '@/lib/useSiteContent';
import { footerLinkDefaults } from '@/lib/footerLinkCollections';
import styles from './SiteFooter.module.css';

function FooterColumn({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, transform: 'translate3d(0, 10px, 0)' }}
      whileInView={{ opacity: 1, transform: 'translate3d(0, 0, 0)' }}
      viewport={{ once: true, amount: .25 }}
      transition={{ delay: reducedMotion ? 0 : delay, duration: reducedMotion ? 0 : .55, ease: [.23, 1, .32, 1] }}
    >
      {children}
    </motion.div>
  );
}

export type FooterTone = 'forest' | 'home' | 'enquiry' | 'bespoke' | 'sustainability' | 'journal' | 'projects';

export default function SiteFooter({ tone = 'forest' }: { tone?: FooterTone }) {
  const values = useSiteContentMap();
  const collections = useSiteCollectionsMap();
  const content = (id: string, fallback: string) => values[id] ?? fallback;
  const brandName = content('brand.logo.alt', 'OKNO Modhomes') || 'OKNO Modhomes';
  const copyright = content('footer.bottom.copyright', '© {year} OKNO Modhomes').replaceAll('{year}', String(new Date().getFullYear()));
  return (
    <footer className={styles.footer} data-component="site-footer" data-tone={tone}>
      <div className={styles.footerMain}>
        <FooterColumn>
          <div className={styles.brandColumn} data-type-section="footer.footer-brand">
            <Link href="/" aria-label={`${brandName} home`} className={styles.footerLogo}>
              {tone === 'enquiry' ? <>
                <span className={styles.enquiryLogoDesktop}><OknoLogo tone="light" /></span>
                <span className={styles.enquiryLogoMobile}><OknoLogo tone="dark" /></span>
              </> : <OknoLogo tone={tone === 'bespoke' ? 'dark' : 'light'} />}
            </Link>
            <p className={styles.brandLine} data-type-field={"footer.brand.line"}>{content('footer.brand.line', 'Live better, live modular.')}</p>
            <nav className={styles.socialLinks} aria-label={content('footer.social.navigation-label', 'Social media')}>
              {footerSocialLinks.map(({ id, name, href, icon }) => (
                <a
                  key={id}
                  href={validFooterSocialHref(content(`footer.social.${id}.href`, href)) ? content(`footer.social.${id}.href`, href) : href}
                  aria-label={`${brandName} on ${content(`footer.social.${id}.name`, name)} (opens in a new tab)`}
                  title={content(`footer.social.${id}.name`, name)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image src={content(`footer.social.${id}.icon`, icon)} alt="" width={18} height={18} aria-hidden="true" data-custom={content(`footer.social.${id}.icon`, icon) !== icon ? 'true' : undefined} />
                </a>
              ))}
            </nav>
          </div>
        </FooterColumn>

        {footerGroups.map(({ id, heading, links }, index) => <FooterColumn key={id} delay={(index + 1) * .04}>
          <nav className={styles.linkGroup} data-type-section={`footer.footer-${id}`} aria-label={content(`footer.${id}.heading`, heading)}>
            <h2 data-type-field={`footer.${id}.heading`}>{content(`footer.${id}.heading`, heading)}</h2>
            {(collections[`footer.links.${id}`] ?? footerLinkDefaults(values)[`footer.links.${id}`]).map(link => <Link key={link.id} href={localDestination(link.fields.href, links.find(defaultLink => defaultLink.id === link.id)?.href ?? '/enquiry')}>{link.fields.label}</Link>)}
          </nav>
        </FooterColumn>)}
      </div>

      <div className={styles.footerBottom} data-type-section="footer.footer-bottom">
        <div className={styles.footerBottomInner}>
          <span>{copyright}</span>
          <span data-type-field={"footer.bottom.closing"}>{content('footer.bottom.closing', 'Designed with intent.')}</span>
        </div>
      </div>
    </footer>
  );
}
