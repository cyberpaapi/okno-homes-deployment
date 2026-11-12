"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { catalogueFinishes, finishImage, isCustomFinishId } from "@/data/configurator/studio/finishes";
import { restoreChoices, selectionLink, sharedChoices } from "./selection";
import { labels, type Catalogue } from "@/data/configurator/studio/catalogue";
import StudioViewer from "./StudioViewer";
import MaterialDetail from "./MaterialDetail";
import surfaceMappings from "@/data/configurator/studio/surfaceMappings.json";
import OknoLogo from "@/components/Brand/OknoLogo";
import { useSiteContentMap } from "@/lib/useSiteContent";
import { useCustomerCopy } from "./useCustomerCopy";
import styles from "./Studio.module.css";
export default function CustomerStudio({
  catalogue,
  preview = false,
  onClose,
}: {
  catalogue: Catalogue;
  preview?: boolean;
  onClose?: () => void;
}) {
  const copy = useCustomerCopy();
  const brandName = useSiteContentMap()["brand.logo.alt"] || "OKNO Modhomes";
  const copyRef = useRef(copy);
  useEffect(() => { copyRef.current = copy; }, [copy]);
  const library = useMemo(() => catalogueFinishes(catalogue), [catalogue]);
  const panel = useRef<HTMLElement>(null);
  const [restored, setRestored] = useState(false);
  const [detail, setDetail] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [saved, setSaved] = useState(false);
  const [viewOverride, setViewOverride] = useState<"exterior" | "interior" | null>(null);
  const groups = useMemo(
    () => catalogue.groups.filter((g) => g.enabled),
    [catalogue.groups],
  );
  const [active, setActive] = useState(groups[0]?.id);
  const selectSurface = (id: typeof active) => { setActive(id); setViewOverride(null); };
  const view = viewOverride || (active === "flooring" || active?.startsWith("internal-") ? "interior" : "exterior");
  const [choices, setChoices] = useState<Record<string, string>>(() => restoreChoices(catalogue, null));
  const [original, setOriginal] = useState(false),
    [summary, setSummary] = useState(false),
    [message, setMessage] = useState("");
  const group = groups.find((g) => g.id === active) || groups[0],
    finish = library.find((f) => f.id === choices[group?.id]);
  const storageKey = `okno-selection:${catalogue.slug}:${catalogue.variant}`;
  useEffect(() => {
    const restore = () => {
      if (!preview) {
        const shared = sharedChoices(catalogue, window.location.hash);
        if (shared) {
          setChoices(shared);
          setMessage(copyRef.current("configurator.selection.shared-status"));
          try { localStorage.setItem(storageKey, JSON.stringify({ revision: catalogue.revision, sourceHash: catalogue.sourceHash, choices: shared })); setSaved(true); } catch { /* Storage is optional. */ }
        } else {
        try { const stored = JSON.parse(localStorage.getItem(storageKey) || "null"); setChoices(restoreChoices(catalogue, stored)); setSaved(stored?.revision === catalogue.revision && stored?.sourceHash === catalogue.sourceHash); }
        catch { /* Private browsing and invalid saved data fall back to curated defaults. */ }
        if (window.location.hash.includes("revision=")) setMessage(copyRef.current("configurator.selection.expired-status"));
        }
      }
      setRestored(true);
    };
    const frame = requestAnimationFrame(restore);
    window.addEventListener("hashchange", restore);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("hashchange", restore); };
  }, [catalogue, preview, storageKey]);
  const rememberChoices = (next: Record<string, string>) => {
    setChoices(next);
    setMessage("");
    setShareUrl("");
    if (preview) return;
    if (window.location.hash) window.history.replaceState(null, "", window.location.pathname + window.location.search);
    // Persist in the selection event so an immediate refresh cannot race a later effect.
    try { localStorage.setItem(storageKey, JSON.stringify({ revision: catalogue.revision, sourceHash: catalogue.sourceHash, choices: next })); setSaved(true); }
    catch { setSaved(false); }
  };
  const showPanel = () => {
    requestAnimationFrame(() => {
      panel.current?.scrollIntoView({ block: "start", behavior: "instant" });
      panel.current?.querySelector<HTMLHeadingElement>("h2")?.focus({ preventScroll: true });
    });
  };
  const review = (value: boolean) => { setSummary(value); showPanel(); };
  const share = async () => {
    const url = selectionLink(catalogue, choices, window.location.origin);
    setShareUrl(url);
    try { await navigator.clipboard.writeText(url); setMessage(copy("configurator.selection.copied-status")); }
    catch { setMessage(copy("configurator.selection.copy-status")); }
  };
  const nextGroup = groups[groups.findIndex((g) => g.id === active) + 1];
  const state = useMemo(
    () => ({ groups, choices, finishes: library, selected: [], isolate: false, original, view, activeSurface: active, roofAssembly: surfaceMappings[catalogue.slug].roofAssembly }),
    [groups, choices, original, library, view, active, catalogue.slug],
  );
  const selections = groups.map((g) => ({
    surface: labels[g.id],
    finish: library.find((f) => f.id === choices[g.id])?.name || "",
  }));
  const download = () => {
    const text = `OKNO | ${catalogue.slug.toUpperCase()}\n${copy("configurator.selection.export-variant-label")}: ${catalogue.variant || copy("configurator.selection.export-variant")}\n${copy("configurator.selection.export-revision-label")}: ${catalogue.revision}\n\n${selections.map((s) => `${s.surface}: ${s.finish}`).join("\n")}\n\n${copy("configurator.selection.export-note")}\n`;
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain" })),
      a = document.createElement("a");
    a.href = url;
    a.download = `okno-${catalogue.slug}-material-selection.txt`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage(copy("configurator.selection.downloaded-status"));
  };
  return (
    <main className={`${styles.app} ${styles.customer}`}>
      <header className={styles.header}>
        <Link
          href="/"
          className={styles.brand}
          aria-label={`${brandName} home`}
        >
          <OknoLogo priority /><span>{copy("configurator.brand.subtitle")}</span>
        </Link>
        <nav className={styles.journeyNav} aria-label={copy("configurator.nav.accessible")}>
          <button aria-current={!summary ? "step" : undefined} onClick={() => review(false)}>01 <span>{copy("configurator.nav.finishes")}</span></button>
          <span aria-hidden="true">/</span>
          <button aria-current={summary ? "step" : undefined} disabled={!restored} onClick={() => review(true)}>02 <span>{copy("configurator.nav.selection")}</span></button>
        </nav>
        <div className={styles.headerActions}>
          {preview ? (
            onClose ? <button onClick={onClose}>← {copy("configurator.preview.studio")}</button> : <Link href="/admin/configurator">← {copy("configurator.preview.editor")}</Link>
          ) : (
            <Link
              href={`/models/signature?model=${catalogue.slug}&details=1&variant=${catalogue.variant}`}
            >
              ← {copy("configurator.action.back")}
            </Link>
          )}
          <button
            className={styles.goldButton}
            disabled={!restored}
            onClick={() => review(!summary)}
          >
            {summary ? copy("configurator.action.continue") : copy("configurator.action.review")} ↗
          </button>
        </div>
      </header>
      {preview && (
        <div className={styles.notice}>
          {copy("configurator.preview.notice", { revision: catalogue.revision })}
        </div>
      )}
      <div className={styles.customerLayout}>
        <section className={styles.customerStage} aria-label={copy("configurator.stage.accessible")}>
          <div className={styles.modelTitle}>
            <p className={styles.eyebrow}>{copy("configurator.stage.eyebrow")}</p>
            <h1>
              {catalogue.slug}
              <span>
                {catalogue.variant.replaceAll("-", " ").toUpperCase()}
              </span>
            </h1>
          </div>
          <StudioViewer slug={catalogue.slug} state={state} onPick={(id) => { const surface = groups.find(g => g.parts.includes(id)); if (surface) { selectSurface(surface.id); setSummary(false); } }} />
          <div className={styles.stageFooter}>
            <span>{original ? copy("configurator.stage.original") : `${labels[group.id]} · ${finish?.name}`}</span>
            <div className={styles.viewSwitch} role="group" aria-label={copy("configurator.stage.view-accessible")}>
              <button aria-pressed={view === "exterior"} onClick={() => setViewOverride("exterior")}>{copy("configurator.stage.exterior")}</button>
              <button aria-pressed={view === "interior"} onClick={() => setViewOverride("interior")}>{copy("configurator.stage.interior")}</button>
            </div>
            <button
              aria-pressed={original}
              onClick={() => setOriginal((v) => !v)}
            >
              {original ? copy("configurator.stage.show-finishes") : copy("configurator.stage.view-original")}
            </button>
          </div>
        </section>
        <aside ref={panel} className={styles.customerPanel} aria-label={copy("configurator.panel.accessible")} aria-busy={!restored}>
          {message && <p role="status" className={styles.selectionMessage}>{message}</p>}
          {summary ? (
            <>
              <p className={styles.eyebrow}>{copy("configurator.selection.eyebrow")}</p>
              <h2 tabIndex={-1}>{copy("configurator.selection.heading")}</h2>
              <p className={styles.muted}>
                {catalogue.slug.toUpperCase()} ·{" "}
                {catalogue.variant.replaceAll("-", " ").toUpperCase()} · {copy("configurator.selection.surfaces", { count: groups.length })}
              </p>
              <div className={styles.summaryList}>
                {groups.map((g) => {
                  const f = library.find(
                    (f) => f.id === choices[g.id],
                  );
                  return (
                    <button
                      key={g.id}
                      onClick={() => {
                        selectSurface(g.id);
                        setSummary(false);
                        showPanel();
                      }}
                    >
                      <Image
                        src={finishImage(choices[g.id])}
                        unoptimized={isCustomFinishId(choices[g.id])}
                        width={58}
                        height={58}
                        alt=""
                      />
                      <span>
                        <small>{labels[g.id]}</small>
                        <strong>{f?.name}</strong>
                      </span>
                      <span className={styles.editSelection}>{copy("configurator.selection.edit")} ↗</span>
                    </button>
                  );
                })}
              </div>
              <div className={styles.reviewActions}>
              <button className={styles.goldButton} onClick={download}>
                {copy("configurator.selection.download")} ↓
              </button>
              {!preview && <button onClick={share}>{copy("configurator.selection.copy")} ↗</button>}
              </div>
              {shareUrl && <label className={styles.shareField}>{copy("configurator.selection.link-label")}<input readOnly value={shareUrl} onFocus={(event) => event.currentTarget.select()} /></label>}
              <p className={styles.smallNote}>
                {copy("configurator.selection.note")}
              </p>
              <button
                onClick={() => {
                  rememberChoices(
                    Object.fromEntries(
                      groups.map((g) => [g.id, g.defaultFinish]),
                    ),
                  );
                  setSummary(false);
                  setOriginal(false);
                  showPanel();
                }}
              >
                {copy("configurator.selection.reset")}
              </button>
            </>
          ) : (
            <>
              <p className={styles.eyebrow}>{copy("configurator.finish.eyebrow")}</p>
              <h2 tabIndex={-1}>{copy("configurator.finish.heading")}</h2>
              <p className={styles.muted}>
                {copy("configurator.finish.intro")}
              </p>
              <nav
                className={styles.customerSurfaces}
                aria-label={copy("configurator.finish.surface-accessible")}
              >
                {groups.map((g) => (
                  <button
                    key={g.id}
                    aria-label={labels[g.id]}
                    aria-pressed={g.id === active}
                    onClick={() => selectSurface(g.id)}
                  >
                    <Image className={styles.surfaceThumb} src={finishImage(choices[g.id])} unoptimized={isCustomFinishId(choices[g.id])} width={40} height={40} alt="" />
                    <span className={styles.surfaceLabel}>{labels[g.id]}<small>{library.find((f) => f.id === choices[g.id])?.name}</small></span>
                    <span>{g.id === active ? "−" : "+"}</span>
                  </button>
                ))}
              </nav>
              {group && (
                <>
                  <div className={styles.finishHeading}>
                    <h3>{labels[group.id]}</h3>
                    <span>{copy("configurator.finish.curated")}</span>
                  </div>
                  <button className={styles.selectedFinish} onClick={() => setDetail(true)} disabled={!restored} aria-label={copy("configurator.finish.inspect-accessible", { finish: finish?.name || "" })}>
                    <Image src={finishImage(choices[group.id])} unoptimized={isCustomFinishId(choices[group.id])} width={48} height={48} alt="" />
                    <span><small>{copy("configurator.finish.selected")}</small><strong>{finish?.name}</strong></span>
                    <span className={styles.inspectLabel}>{copy("configurator.finish.inspect")} ↗</span>
                  </button>
                  <div
                    className={styles.finishGrid}
                    role="group"
                    aria-label={copy("configurator.finish.group-accessible", { surface: labels[group.id] })}
                  >
                    {group.finishes.map((id) => {
                      const f = library.find((f) => f.id === id)!;
                      return (
                        <button
                          key={id}
                          aria-label={f.name}
                          disabled={!restored}
                          aria-pressed={choices[group.id] === id}
                          onClick={() => {
                            rememberChoices({ ...choices, [group.id]: id });
                            setOriginal(false);
                          }}
                        >
                          <div>
                            <Image
                              src={finishImage(id)}
                              unoptimized={isCustomFinishId(id)}
                              width={180}
                              height={140}
                              alt=""
                            />
                            {choices[group.id] === id && <span>✓</span>}
                          </div>
                          <strong>{f.name}</strong>
                          <small>{f.family === "custom" ? copy("configurator.finish.custom-family") : f.family.replaceAll("-", " ")}</small>
                        </button>
                      );
                    })}
                  </div>
                  <div className={styles.customerNext}>
                    <small>{copy("configurator.finish.progress", { index: groups.findIndex((g) => g.id === active) + 1, count: groups.length })}</small>
                    <button disabled={!restored} className={styles.goldButton} onClick={() => { if (nextGroup) { selectSurface(nextGroup.id); showPanel(); } else review(true); }}>{nextGroup ? copy("configurator.finish.next", { surface: labels[nextGroup.id] }) : copy("configurator.action.review")} →</button>
                  </div>
                </>
              )}
              <p className={styles.smallNote}>
                {copy("configurator.finish.note")}
              </p>
            </>
          )}
          {!preview && saved && <p className={styles.savedNote}>✓ {copy("configurator.finish.saved")}</p>}
        </aside>
      </div>
      {detail && finish && <MaterialDetail finish={finish} surface={labels[group.id]} onClose={() => setDetail(false)} />}
    </main>
  );
}
