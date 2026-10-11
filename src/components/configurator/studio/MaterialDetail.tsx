"use client";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { finishDetailImage, isCustomFinishId, type StudioFinish } from "@/data/configurator/studio/finishes";
import { useCustomerCopy } from "./useCustomerCopy";
import styles from "./Studio.module.css";

export default function MaterialDetail({ finish, surface, selected = true, onClose }: { finish: StudioFinish; surface: string; selected?: boolean; onClose: () => void }) {
  const copy = useCustomerCopy();
  const dialog = useRef<HTMLDialogElement>(null);
  const sample = finishDetailImage(finish.id);
  useEffect(() => {
    const element = dialog.current;
    const returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    element?.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { element?.close(); document.body.style.overflow = overflow; returnFocus?.focus({ preventScroll: true }); };
  }, []);
  return (
    <dialog ref={dialog} className={styles.materialDialog} aria-labelledby="material-detail-title" onCancel={onClose} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className={styles.materialDetail}>
        <button className={styles.detailClose} onClick={onClose} aria-label={copy("configurator.detail.close-accessible")}>✕</button>
        <div className={styles.detailSample}>
          <div className={styles.detailSampleImage}>
            <Image src={sample.src} unoptimized={isCustomFinishId(finish.id)} width={sample.width} height={sample.height} sizes="(max-width: 760px) 90vw, 480px" loading="eager" alt={copy("configurator.detail.sample-accessible", { finish: finish.name })} />
          </div>
          <a className={styles.detailSampleLink} href={sample.src} target="_blank" rel="noreferrer" aria-label={copy("configurator.detail.view-accessible", { finish: finish.name })}>{copy("configurator.detail.view")} ↗</a>
        </div>
        <div className={styles.detailCopy}>
          <p className={styles.eyebrow}>{selected ? `${surface} · ${copy("configurator.detail.selected")}` : copy("configurator.detail.collection")}</p>
          <h2 id="material-detail-title">{finish.name}</h2>
          <p className={styles.muted}>{finish.family === "custom" ? copy("configurator.finish.custom-family") : finish.family.replaceAll("-", " ")}</p>
          {!selected && <p className={styles.materialApplications}>{surface}</p>}
          <p className={styles.smallNote}>{copy("configurator.detail.note")}</p>
          <button className={styles.goldButton} onClick={onClose}>{selected ? copy("configurator.detail.back-palette") : copy("configurator.detail.back-collection")} →</button>
        </div>
      </div>
    </dialog>
  );
}
