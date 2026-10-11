import Image from "next/image";
import { useId } from "react";
import { publicationLogos } from "./journalData";
import styles from "./Journal.module.css";

export function JournalSourceMark({ source, logo, monochrome = false }: { source: string; logo?: string; monochrome?: boolean }) {
  const filterId = useId().replaceAll(":", "");
  const src = logo === undefined ? publicationLogos[source] : logo;
  if (!src) return null;
  const custom = Boolean(logo && logo !== publicationLogos[source]);
  const lightOnColor = source === "Homecrux" && src === publicationLogos.Homecrux;
  const transparent = source === "ArchDaily" && src === publicationLogos.ArchDaily;
  const dark = transparent;

  return (
    <span
      className={[
        styles.sourceMark,
        monochrome && !custom ? styles.sourceMarkMonochrome : custom ? styles.sourceMarkCustom : dark ? styles.sourceMarkDark : "",
      ].filter(Boolean).join(" ")}
      data-journal-source-mark={source}
      aria-hidden="true"
    >
      {monochrome && !custom ? (
        <svg viewBox="0 0 100 100" focusable="false" aria-hidden="true">
          {!transparent && (
            <defs>
              <filter id={filterId} colorInterpolationFilters="sRGB">
                <feColorMatrix type="luminanceToAlpha" result="luminance" />
                <feComponentTransfer in="luminance" result="silhouette">
                  <feFuncA type="linear" slope={lightOnColor ? 5 : -5} intercept={lightOnColor ? -4 : 4} />
                </feComponentTransfer>
                <feFlood floodColor="#e8eee4" result="white" />
                <feComposite in="white" in2="silhouette" operator="in" />
              </filter>
            </defs>
          )}
          <image href={src} width="100" height="100" preserveAspectRatio="xMidYMid meet" filter={transparent ? undefined : `url(#${filterId})`} />
        </svg>
      ) : (
        <Image src={src} alt="" width={28} height={28} unoptimized />
      )}
    </span>
  );
}
