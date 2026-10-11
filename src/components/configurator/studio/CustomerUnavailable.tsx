"use client";

import Image from "next/image";
import Link from "next/link";
import { posters, type StudioModel } from "@/data/configurator/studio/catalogue";
import styles from "./Studio.module.css";
import ApprovedMaterials from "./ApprovedMaterials";
import { useCustomerCopy } from "./useCustomerCopy";
import OknoLogo from "@/components/Brand/OknoLogo";
import { useSiteContentMap } from "@/lib/useSiteContent";

export default function CustomerUnavailable({ slug, availableVariant, requestedVariant }: { slug: StudioModel; availableVariant?: string; requestedVariant?: string }) {
  const copy = useCustomerCopy();
  const brandName = useSiteContentMap()["brand.logo.alt"] || "OKNO Modhomes";
  const variantName = availableVariant?.replaceAll("-", " ").toUpperCase() || "";
  return (
    <main className={`${styles.app} ${styles.customer} ${styles.customerUnavailable}`}>
      <header className={styles.header}>
        <Link href="/models/signature" className={styles.brand} aria-label={`${brandName} ${copy("configurator.brand.subtitle")}`}><OknoLogo priority /><span>{copy("configurator.brand.subtitle")}</span></Link>
        <div className={styles.headerActions}><Link href={`/models/signature?model=${slug}&details=1${requestedVariant ? `&variant=${encodeURIComponent(requestedVariant)}` : ""}`}>← {copy("configurator.action.back")}</Link></div>
      </header>
      <div className={styles.unavailableLayout}>
        <section className={styles.unavailableStage} aria-label={copy("configurator.unavailable.exterior", { model: slug })}>
          <Image src={posters[slug]} fill priority sizes="(max-width: 760px) 100vw, 65vw" alt={copy("configurator.unavailable.exterior", { model: slug })} className={styles.poster} />
          <div className={styles.modelTitle}><p className={styles.eyebrow}>{copy("configurator.unavailable.eyebrow")}</p><h1>{slug}</h1></div>
          <span className={styles.unavailableCaption}>{copy("configurator.unavailable.caption")}</span>
        </section>
        <section className={`${styles.unavailableCopy} ${styles.collectionPanel}`}>
          {availableVariant && <div className={styles.variantPrompt}><p className={styles.muted}>{copy("configurator.unavailable.variant", { variant: variantName })}</p><Link className={styles.goldButton} href={`/models/signature/${slug}/configure?variant=${availableVariant}`}>{copy("configurator.unavailable.configure", { variant: variantName })} ↗</Link></div>}
          <ApprovedMaterials />
          <p className={styles.smallNote}>{copy("configurator.unavailable.note")}</p>
        </section>
      </div>
    </main>
  );
}
