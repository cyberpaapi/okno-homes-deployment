# Hospitality button follow-up — 27 November 2026

Owner feedback supersedes the Subtle Button treatment for the two Hospitality consultation actions. Restore the earlier rounded arrow pills, using the retained actual 21st.dev [Magnetic Button](https://21st.dev/r/bundui/magnetic-button) by bundui (demo 1507) from `src/components/projects/21st/Magnetic.tsx`, as used by these actions at `e9fb9ad`. The retrieved source is archived in `docs/21st-source/finishing-2026-11-24-1507.json`. The circle rotates on hover/focus, contracts on press, and the pointer spring remains available. Reduced motion removes movement.

Keep the concise editable Consultation labels, 14px Manrope, existing hospitality enquiry destinations and forest/pearl contrast. The opening action has a 50px minimum height; the closing action 56px. This is a scoped return to the requested older arrow style, preserving the later typography and palette decisions.

The opening photograph caption previously forced both items into a left-aligned column below 760px. It now uses a grid: copy left/action right on larger surfaces; copy above and action right on narrow surfaces. Equal photo insets and a consistent gap preserve legibility without squeezing the caption into a narrow column.

External evidence and independent fixed-matrix checks: `/home/CodeAcc2007/Work Drive/Work Projects/OKNO Homes/hospitality-button-followup-2026-11-27/`. No CMS/schema, shared button, configurator, storage or authentication changes are included. Actual-device acceptance remains separate from browser resizing.
