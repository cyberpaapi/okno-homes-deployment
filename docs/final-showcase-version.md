# Final Showcase version record

The active working line is `final-showcase-2026-10-05`. The canonical version declaration is [`../WORKING-VERSION.md`](../WORKING-VERSION.md); this file preserves the checkpoint history.

## Current footer revision — 6 October 2026

The shared footer follows the user's Vize layout reference with OKNO's deep green palette, wordmark, compact link categories, and verified official social links. It appears after the Enquiry page and other ordinary public pages. `SiteFrame` excludes it from Signature Models and all descendant configurator routes. See [`footer-21st-components.md`](footer-21st-components.md) for current details; the 5 October record below is historical.

## Current checkpoint — 5 October 2026

- The oversized Motion Footer was replaced by the earlier V1 Footer Section 2071.
- The minimal shared footer now renders on every route, including Signature Models and configurators.
- Hero V1, Hero V2 and all shared page implementations remain unchanged.
- Focused tests, TypeScript, zero-warning ESLint, production build, the 15-route launcher and representative browser checks passed.

## Previous checkpoint — 4 October 2026

- Hero V1 is available at `/` and `/hero-v1`.
- Hero V2 is available at `/hero-v2` and uses the shared V1 lower-page implementation.
- All principal site pages remain in the Final Showcase.
- The latest Hospitality page is consolidated here.
- `SiteFooter` and `ObsidianCursorTrail` are mounted once by the root layout for every route.
- The duplicate `/landing-options/forest-entry` public route is removed.

### Validation

- Vitest: 38 files, 136 tests passed with one worker.
- TypeScript: passed.
- ESLint: passed with zero warnings.
- Next.js production build: passed and generated 23 pages.
- Final Showcase launcher: all 15 entry routes returned HTTP 200.
- Browser verification: Hospitality, Hero V1 and Hero V2 rendered without framework overlays or console warnings/errors; each rendered one shared footer and one Obsidian cursor root.

## Original snapshot — 23 September 2026

- Version: `final-showcase-2026-09-23`
- Git base recorded by the original snapshot: `160924d94c2e4a901403105213bba548b900f7ec`
- Snapshot contents were recorded by `FILE_MANIFEST.sha256`.

The current folder does not contain `.git`; version declarations here are local checkpoint markers, not Git tags.
