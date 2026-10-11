# First performance and interaction pass — 11 October 2026

## Scope and implementation plan

Preserve accepted copy, composition, typography and interaction intent. Optimize About, Journal/article pages, Hospitality and the other non-deferred surfaces; repair Enquiry's clipped action. Projects and Hero V1 are excluded. Home and Process video work and Sustainability's fade sequence are reserved for the user's next page-by-page pass. Audit their shared links without revising those page implementations.

| Task | Work | Status |
| --- | --- | --- |
| P1 | Measure live delivery, media and rendering; reproduce Enquiry clipping | Complete |
| P2 | Remove avoidable image processing/loading work on priority pages | Complete; production static image URLs and lazy stage photos verified |
| P3 | Bound Journal decorative GPU work; preserve animation identity | Complete; approximately 520k backing pixels verified in browser |
| P4 | Correct Enquiry panel padding and all three tab layouts | Complete; each production action has 10px bottom clearance |
| P5 | Public route/control ledger: navigation, buttons, hovers, galleries, forms, models/configurators | Desktop pass complete; physical-device/mobile acceptance remains open |
| P6 | Live owner-authenticated admin controls and text/image draft/publish/restore cycle | Complete for the documented controls and round trips; inventory is not every possible field publication |
| P7 | Source checks, isolated build, production release and before/after verification | Complete; final runtime and production regression verified |

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

## Implemented changes and decisions

1. `scripts/prepare-page-images.mjs` generates responsive WebP variants and `config/page-images.json` from accepted photographs. `src/lib/pageImageLoader.ts` selects a prepared width on About, Journal and Hospitality. This removes request-time conversion for known photos; original source files remain intact. CMS replacements retain the Next image fallback. Generate again after changing those source photographs, commit variants/manifests and run the release checks. If changing encoder settings, version the processing recipe in the URLs before producing different bytes under an immutable name.
2. Hospitality's below-opening cover is now responsive and its seven delivery-stage photographs are lazy. Browser opening-page inspection confirms the stage URLs have not loaded initially; scrolling brings the relevant images into view. Gallery compositions and text-lens behavior are preserved.
3. Journal's decorative shader draws at a maximum 24 fps with about 520,000 backing pixels rather than two million. Time remains seconds-based, preserving drift speed. Hidden/offscreen/reduced-motion states cancel pending frames/timers. The rounded backing dimensions observed were 958 × 543 (520,194 pixels); this is a work budget, not a measured frame-rate claim.
4. Journal article metadata and page content share a React per-request cached read of published articles. This avoids duplicate Blob reads within a request without caching stale publications across requests.
5. Enquiry's overflow-hidden sliding panel gains 6px side/top and 10px bottom breathing room, preserving its horizontal alignment. The full button border and native hover fill are visible; all three actions have 10px clearance in production. [Screenshot](optimization-evidence/enquiry-button-fixed.png).
6. The control audit found that configurator return URLs contained model/plan parameters which Signature ignored. `SignatureExperience.tsx` now resolves them inside a client Suspense boundary while keeping the static page shell. Unsupported-layout fallback pages also retain the requested stable variant in their return link. Production checks confirm Kray 1 BHK and Tengo 3 BHK reopen their correct detail dialog and selected plan. Unknown/removed model links safely fall back.
7. No Projects, Hero V1, Home, Process or Sustainability fade implementation was revised. Existing Signature-only configurator geometry is not represented as available 2/3-bedroom geometry: unsupported variants still show the honest fallback and supported-layout link.

## Current production acceptance

- Private GitHub repository: [CodeAcc2007-dev/okno-homes-deployment](https://github.com/CodeAcc2007-dev/okno-homes-deployment), private status reverified through the owner's GitHub API.
- Website: https://okno-homes-deployment.vercel.app. Editor: https://okno-homes-deployment.vercel.app/admin. Public navigation still contains no admin link.
- Final application source: `3fa5be36fd38315934381c30e67fba4790e7aade`; deployment `dpl_BzKXYyMjC94pQC3TtcmZd2ao9GwP`, READY, production alias attached, functions in `bom1`. Git build logs confirm commit `3fa5be3`, Next compile/TypeScript success and all 30 cloud trace guards (largest 177.4 MiB).
- Full suite before the discovered return fix: 78 files / 301 passing tests. After that fix, all 15 Signature tests (including two new regression cases) and all three customer-copy tests pass. Final whole-repository lint, isolated build/TypeScript and 30 local trace guards pass (largest 179.7 MiB).
- [Public control evidence](optimization-evidence/public-controls.json) distinguishes observed actions from inventory. All seven primary navigation links and nine internal footer links were pointer-clicked to their expected destinations; rolling header hover states were verified. All six article cards, 18 contents anchors, related-story links and both return controls work. Journal marquee dragging and fixed-arrow hover work.
- All five Hospitality photography dialogs open; previous/next wrapping, Close and Escape work. Text lenses activate on rendered text and stop over whitespace. Hospitality's enquiry CTA selects its matching form tab.
- Signature's four plan filters, six model selectors, all plan/gallery tabs, Close and Escape were checked. Controls were verified after opening transforms settled; some initial automated clicks landed on moving targets and were rechecked with settled geometry.
- Both Models path panels and all four Bespoke next-step controls work. Supported Tengo/Kray 3D previews load. Tengo's finish controls across all five surfaces, material sample detail, interior/exterior, lighting, original comparison, review, copy link, selection download and resets were exercised. Kray's live selection, orbit/zoom, lighting, interior/original comparison and review/reset were checked. Test palettes returned to their initial curated values. Configurator fallbacks and all six library filters were also exercised.
- All three Enquiry tab transitions, input/select controls and action clicks work as currently implemented. The user explicitly deferred delivery; no provider, success flow or message delivery is claimed.
- [Live admin cycle](optimization-evidence/live-admin-cycle.json): actual browser photo upload and draft/publish passed; the heading and uploaded photograph rendered publicly. A second title publication reached an already-open public About tab without a reload, and restoration also propagated without a reload. Use original restored the editor's default title. All original published fields/collections were restored exactly, revisions advanced to published **17** / draft **65**, and there are **zero** draft fields/collections. Owner Disconnect cleared the token. Unauthenticated content access remains 401; public content exposes no drafts.
- Conditional restoration initially stopped safely because the QA helper read the ETag from the wrong SDK response property. Correcting it to `result.blob.etag` allowed the guarded restoration; production CMS writes already used that property correctly. No weak or unconditional overwrite was used.
- [HTTP/performance evidence](optimization-evidence/performance.json): all 22 tested public/admin/API/article endpoints returned 200. Prepared photographs return `public, max-age=31536000, immutable`. Response HTML became smaller: About 47,116 → 44,711 bytes; Journal 106,500 → 94,108; Hospitality 101,100 → 81,604. Opening image bytes changed modestly (About 128,036 → 125,564; Hospitality 215,464 → 210,846); the main improvements are preparation, deferred loading and bounded render work. Single-request timings varied; they do not establish a Core Web Vitals improvement.

## Remaining acceptance boundaries / next phase

- The browser's requested phone viewport stayed at actual desktop dimensions. Mobile/physical-device visual and performance acceptance remains unconfirmed; no Lighthouse, throttled-network LCP/INP or measured FPS claim is made.
- Third-party press/social destinations retain their declared URL, new-tab behavior and safe relationship attributes. Provider uptime, login walls and every external page interaction were not audited as OKNO controls. [Link inventory](optimization-evidence/journal-and-shared-links.json).
- Admin section/control inventory and focused real mutations are separate from publishing every editable field or testing every arbitrary media file. This pass tested a real image replacement; the earlier deployment's video-preparation evidence remains historical, not a new exhaustive large-film check.
- Next authorized page revisions remain Home/Process intensive video work and Sustainability fades. Projects and Hero V1 await the user's requested changes. Enquiry delivery remains explicitly deferred.
