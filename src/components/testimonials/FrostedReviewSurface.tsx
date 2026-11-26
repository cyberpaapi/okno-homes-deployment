import type { ReactNode } from "react";

// Frost-only adaptation of educalvolpz / GlassCard, 21st.dev demo 28259.
// Retrieved source: docs/21st-source/28259.tsx.txt. Retains its bodyFilters,
// tinted body and BODY_EDGE/INNER_RING inset highlights, now scoped to the
// quote/attribution below the opaque photograph. Owner selected frost
// without the source's refractive SVG rim, chromatic split or pointer effects.
const bodyFilters = "blur(11px) saturate(160%) brightness(1.02)";

export function FrostedReviewSurface({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={className} data-testimonial-frost style={{
        position: "relative",
        borderRadius: "0 0 15px 15px",
        backdropFilter: bodyFilters,
        WebkitBackdropFilter: bodyFilters,
        backgroundColor: "rgb(14 39 28 / 64%)",
        boxShadow: "inset 0 1px 0 oklch(1 0 0 / 0.22), inset 0 0 0 1px oklch(1 0 0 / 0.15), inset 0 -1px 0 oklch(1 0 0 / 0.12)",
      }}>{children}</div>
  );
}
