# First performance and interaction pass — 11 October 2026

## Scope and implementation plan

Preserve accepted copy, composition, typography and interaction intent. Optimize About, Journal/article pages, Hospitality and the other non-deferred surfaces; repair Enquiry's clipped action. Projects and Hero V1 are excluded. Home and Process video work and Sustainability's fade sequence are reserved for the user's next page-by-page pass. Audit their shared links without revising those page implementations.

| Task | Work | Status |
| --- | --- | --- |
| P1 | Measure live delivery, media and rendering; reproduce Enquiry clipping | Complete |
| P2 | Remove avoidable image processing/loading work on priority pages | Implemented; release verification pending |
| P3 | Bound Journal decorative GPU work; preserve animation identity | Implemented; release verification pending |
| P4 | Correct Enquiry panel padding and all three tab layouts | Implemented; release verification pending |
| P5 | Public route/control ledger: navigation, buttons, hovers, galleries, forms, models/configurators | Pending |
| P6 | Live owner-authenticated admin controls and text/image draft/publish/restore cycle | Pending |
| P7 | Source checks, isolated build, production release and before/after verification | Pending |

## Baseline and decisions

- Live single-request HTML timings from this machine: About TTFB 63 ms, Journal 34 ms, Hospitality 102 ms, Enquiry 36 ms. These warm CDN measurements are not mobile Core Web Vitals.
- About/Journal/Hospitality initial JavaScript: 791,103 / 820,924 / 747,585 raw bytes; gzip estimates 253,895 / 265,457 / 237,049. Includes the legacy polyfill script (modern browsers do not execute it).
- About's opening optimizer response: 128,036 bytes; Hospitality's: 215,464 bytes. Built-in photographs still require on-demand image conversion on a cold CDN cache.
- Journal shader permits two million backing pixels and draws every animation frame. About/Hospitality already have smaller budgets; do not alter shared Silk or the excluded pages.
- Hospitality timeline eagerly loads seven stage photographs in both desktop/mobile markup, although the timeline is well below the opening.
- Enquiry button bottom coincides exactly with the overflow-hidden panel edge; the rounded lower border is visibly clipped. Add panel breathing room while retaining sideways tab clipping.
- Admin writes must preserve new owner edits, use optimistic revision checks, back up before mutation and restore original published fields/collections and drafts. Test fixtures are clearly temporary; never expose keys or drafts.

## Verification ledger

Current results will be recorded here with exact coverage and limits. Historical mouse checks in the 7 October ledger do not count as current production acceptance. Enquiry currently prevents submission and has no delivery integration; test the actual behavior and report it rather than claiming delivery works.

- 78 test files / 301 tests pass; TypeScript and zero-warning ESLint pass. Final isolated production build passes, including 30 function trace guards (largest 179.7 MiB). Secrets/local data remain excluded; conversion binaries and customer model files remain included.
- 196 responsive WebP derivatives from 36 accepted photographs decode successfully with expected dimensions/aspect ratios. Sources remain preserved. Hashed static URLs carry one-year immutable browser caching; unknown sources, including CMS uploads, use the existing Next image endpoint.
- Browser owner authentication, About title Save draft, actual private Blob photograph upload and image Save draft pass. Public content remains identical to the backup until Publish.
- Live admin disclosure/field inventory covers About, Journal, Hospitality, Enquiry, Footer, shared settings, Models overview, Signature, Bespoke, Configurators and Sustainability. Signature's six models, nine plans and galleries were expanded. The [control inventory](optimization-evidence/admin-controls.json) records controls, not an assertion that every possible content combination was published.
- Journal's actual Add, Move up/down, Remove, Undo and Duplicate controls were exercised in unsaved browser state. All temporary records were removed and the collection returned to its saved state; no Journal QA collection was saved or published.
