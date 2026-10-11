"use client";
import Image from "next/image";
import { useState } from "react";
import { MATERIAL_FINISHES, type MaterialApplicationId } from "@/data/configurator";
import { labels, surfaceOrder } from "@/data/configurator/studio/catalogue";
import { finishImage } from "@/data/configurator/studio/finishes";
import MaterialDetail from "./MaterialDetail";
import { useCustomerCopy } from "./useCustomerCopy";
import styles from "./Studio.module.css";

/** The company-approved register is public independently of model publication. */
export default function ApprovedMaterials() {
  const copy = useCustomerCopy();
  const [surface, setSurface] = useState<MaterialApplicationId | "all">("all");
  const [detail, setDetail] = useState<(typeof MATERIAL_FINISHES)[number] | null>(null);
  const finishes = MATERIAL_FINISHES.filter((finish) => surface === "all" || finish.approvedApplications.includes(surface));

  return (
    <section className={styles.approvedLibrary} aria-label={copy("configurator.library.accessible")}>
      <p className={styles.eyebrow}>{copy("configurator.library.eyebrow")}</p>
      <h2>{copy("configurator.library.heading")}</h2>
      <p className={styles.muted}>{copy("configurator.library.intro", { count: MATERIAL_FINISHES.length })}</p>
      <div className={styles.materialFilters} role="group" aria-label={copy("configurator.library.filter-accessible")}>
        <button aria-pressed={surface === "all"} onClick={() => setSurface("all")}>{copy("configurator.library.all")} <span>{MATERIAL_FINISHES.length}</span></button>
        {surfaceOrder.map((id) => <button key={id} aria-pressed={surface === id} onClick={() => setSurface(id)}>{labels[id]}</button>)}
      </div>
      <p className={styles.materialCount} role="status">{finishes.length} {finishes.length === 1 ? copy("configurator.library.count-one") : copy("configurator.library.count-many")}{surface !== "all" ? ` · ${labels[surface]}` : ""}</p>
      <div className={styles.finishGrid} role="group" aria-label={copy("configurator.library.samples-accessible")}>
        {finishes.map((finish) => (
          <button key={finish.id} aria-label={copy("configurator.library.sample-accessible", { finish: finish.name })} onClick={() => setDetail(finish)}>
            <div><Image src={finishImage(finish.id)} width={240} height={180} alt="" /></div>
            <strong>{finish.name}</strong>
            <small>{finish.family.replaceAll("-", " ")}</small>
          </button>
        ))}
      </div>
      {detail && <MaterialDetail finish={detail} selected={false} surface={detail.approvedApplications.map((id) => labels[id]).join(" · ")} onClose={() => setDetail(null)} />}
    </section>
  );
}
