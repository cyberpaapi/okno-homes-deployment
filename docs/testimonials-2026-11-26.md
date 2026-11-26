# Testimonials — 26 November 2026

Owner chose option 3, GetLayers Client Reviews Carousel, as a complete separate text-only page at `/testimonials`. Earlier Puzzle Wall exploration is superseded. This is an ordinary extension of the existing OKNO design world, for local review only; no push or deployment is authorized for this task.

Bound checkout: `/home/CodeAcc2007/Work Drive/Work Projects/OKNO Homes/mobile-review-2-2026-11-24`, branch `codex/review-5-2026-11-24`, origin `https://github.com/cyberpaapi/okno-homes-deployment.git`. The external finishing harness records owner issue `OKNO-062`. Other accepted work and the configurator remain outside this page's scope.

## Source and adaptation

Reference: [Client Reviews Carousel](https://www.getlayers.ai/layer/client-reviews-carousel), GetLayers / Textura; [public preview image](https://storage.getlayers.ai/sections/client-reviews-carousel-c7ac797aed.webp). The chosen structure is a broad horizontal rail of tall rounded quote cards, large plain quotation text, an attribution/context foot, a heading above and circular previous/next controls. The implementation retains that composition with OKNO colours and type, without images, avatars or corporate logos. It closes with a short home enquiry section and the existing shared footer.

Provenance is **visual-preview adaptation**. The public preview was visually inspected. The signed-in account exposed Copy prompt; two attempts moved the displayed quota from 10 to 9 in total, but the virtual clipboard returned empty. No prompt text or component source was captured. Full-source download was plan-gated; there was no purchase or upgrade. Do not describe this as imported GetLayers code, a copied prompt, or a retrieved 21st.dev component.

Implementation owners:

- Route and preview metadata: `src/app/testimonials/page.tsx`.
- Page composition, controls and scoped styles: `src/components/testimonials/TestimonialsExperience.tsx` and `TestimonialsExperience.module.css`.
- Six central sample records: `src/data/testimonials.ts`.
- Default footer destination: `src/data/footerContent.ts`.

## Established-world comparison

This scoped comparison uses `src/app/globals.css`, `src/app/typography-scale.css`, the existing shared Header/Footer and `src/components/SiteFrame.tsx`. It describes the new surface; it does not establish a new site-wide design system. No root `PRODUCT.md`, `DESIGN.md` or design sidecar is introduced, and no existing design-system file, global font rule or font asset is changed.

### Colours

| Surface role | Testimonials value | Relationship to the incumbent shell |
| --- | --- | --- |
| Page ground | Deep forest `#0b140f` | Continues the forest family of the default footer (`#1d2b23`) and existing Journal/Sustainability dark surfaces. |
| Cards and primary light text | Pale sage `#e4ebdf` | Sits beside the footer's existing pale text (`#e6e9de`); cards reverse the dark page's text relationship. |
| Card ink | Dark green `#14281c` | Keeps the quote contrast in the same green family rather than introducing a new accent. |
| Secondary page copy, outlines and selection | Sage `#b9cdb7` | Related to the footer's muted sage text (`#bfc5b8`) and focus colour (`#c4d3c5`). |
| Secondary card copy | Muted dark green `#4b614e` | Used for the sample label and illustrative context on pale cards. |

These are local page values, not replacements for the global paper/ink/gold tokens. `<Header tone="dark" />` retains its existing pale navigation colour, border and menu treatments. SiteFrame supplies the existing forest footer tone for this route. The page uses flat colour separation, fine outlines and spacious cards rather than adding shadows, gradients or ornamental statistics.

### Typography

The page title and closing heading use `var(--okno-font-kento)` at weight 400. The existing public Header marker resolves that alias to the already supplied **Kento OKNO 108** face; the page adds no glyph scaling or font files. Main title sizing is `clamp(46px, 6.2vw, 88px)`, with the phone rule `clamp(28px, 9vw, 56px)` at widths up to 700px. Headings use line-height 1.08 and letter-spacing −0.025em.

Quotes, descriptions, sample labels, context and controls use the existing **Manrope OKNO**, with Arial/sans-serif fallbacks, through local selectors. This is the owner's page-specific reading choice: the incumbent public semantic body default is Govandi, while Manrope is already loaded by `globals.css`. The shared Header and Footer keep their existing semantic Kento/Govandi roles and CMS typography behaviour. Quote text is regular weight, line-height 1.5, and sized responsively from 19–26px; small disclosure/context text remains 13px. This local font choice must not become a global body-font rewrite.

### Layout and shapes

The page inherits `--site-gutter` (`clamp(20px, 5vw, 72px)`, 20px on small screens), clears the existing absolute Header, and introduces the rail directly below its heading and sample disclosure. It avoids a separate empty hero. The closing section uses a two-column grid, collapsing to one column at 700px.

Cards have 16px corners and a 24px gap, reduced to 16px on phones. The rail shows roughly three cards and a continuation on wide screens, roughly two below 1100px, and a nearly full-width card with a next-card cue on phones. Content determines final card height; the CSS sets minimum heights rather than truncating quotes. Arrow buttons are circular, 50px on desktop and 44px on phones. The closing enquiry link has a 48px minimum height and a restrained 7px corner radius. No arbitrary counters, ratings or numbered section labels are added.

## Carousel behaviour and accessibility

The rail uses native `overflow-x: auto` with CSS horizontal snap. It does not autoplay, convert vertical wheel input into slide movement, or take over page scrolling. Previous/next buttons move to card offsets, clamp to the rail bounds and disable at the relevant end. Scroll, resize and ResizeObserver measurements keep button state in step with the native position.

The focusable rail is a labelled region associated with screen-reader keyboard instructions. Left/Right move between card positions; Home/End move to the beginning/end. Labelled buttons reference the rail with `aria-controls`; decorative arrows are hidden from assistive technology. Reviews use list, figure, blockquote and figcaption semantics. Buttons, the rail and closing links have visible focus outlines. There is no moving slide announcement or focus transfer as cards scroll.

With `prefers-reduced-motion: reduce`, programmatic rail scrolling is instant and local control/link transitions are removed. Shared shell motion remains the responsibility of its existing components. These are source-level implementation facts; keyboard, native scroll and reduced-motion runtime acceptance must be evidenced separately.

## Content replacement and publication boundary

The owner authorized relevant fictional placeholders for later replacement. All six records in `src/data/testimonials.ts` have `id`, `quote`, `brief`, `context` and `status: "sample"`. They cover homeowner, site-planning, hospitality and bespoke-home perspectives without inventing customer names, credentials, locations or affiliations. The rendered page carries a prominent global fictional-content disclosure and a “Sample testimonial” label plus illustrative context on every card. The `status` field does not automatically switch those disclosures off.

Replace that central array with approved actual quotations and consented attribution when available. Extend the sample-only type and rendering deliberately if real attributions require it; keep stable IDs, review quote length on narrow screens, and check every replacement for approval and accurate context. Update the global/per-card disclosures and preview description only when their content warrants it. `page.tsx` currently sets robots to `index: false, follow: false`; retain this safeguard while examples remain. No Review/AggregateRating structured data is added. Removing noindex is a separate publication decision, not an automatic effect of editing data.

There is no Testimonials CMS collection, editor, persistence layer or admin write in this scope. Sample records are source content. This page does not establish an admin draft/publish/storage round trip.

## Navigation and shared shell

The route mounts the existing Header once; root layout/SiteFrame owns the single shared Footer and cursor. The Testimonials destination is added to the default OKNO footer group. `SiteFooter` continues to use a published `footer.links.okno` collection when present, falling back to generated defaults only when absent; it does not force-append Testimonials over an explicit CMS collection. The earlier local endpoint observation of empty published collections is a snapshot, not a guarantee about later CMS state. No CMS records are altered to expose the link.

The existing Header navigation and configurator remain untouched by this surface. Closing links go to `/enquiry` and `/models`.

## Verification and handoff

Evidence is kept outside the deployable checkout at `/home/CodeAcc2007/Work Drive/Work Projects/OKNO Homes/testimonials-2026-11-26/`. This document update performs source/documentation inspection only and starts no build, server, browser, install or deployment.

- **Implementation checks:** `implementation-checks.json` records 4 component tests, component lint with zero warnings, and 23 shared Footer/CMS Footer/SiteFrame tests passing. These are developer checks, not browser acceptance.
- **Independent source checks:** the first independent reviewer records hash/source inspection, an HTTP read and 27 scoped tests passing. These overlap the component/shared test set; do not add them into a larger distinct-test total.
- **First browser round:** the orchestrator supplied responsive captures and measurements; the independent reviewer reviewed them without an available browser of their own. Tablet/desktop captures at 768/1280/1440/1920 were acceptable for the scoped composition. At 360×800 and 390×844 the title exceeded the viewport, so the independent round-one verdict was **fix**, not acceptance.
- **Correction awaiting final confirmation:** the phone title rule is now `clamp(28px, 9vw, 56px)`, replacing the earlier 42px minimum / 11.8vw sizing. The final build log contains the generated `/testimonials` route. Final runtime identity, corrected phone captures, interaction checks and the fresh review outcome must be recorded before calling the integrated candidate verified. No final pass is asserted here.
- **Style detector:** the implementation record reports the installed Impeccable launcher blocked by permission denial (exit 126). No automated style-detector pass is claimed; source comparison and screenshot review are separate evidence.

Physical-phone testing and owner acceptance remain pending. Responsive desktop-browser sizing does not certify physical devices. There is no hosted Testimonials verification or deployment in this local task. The orchestrator should replace the pending final-confirmation paragraph with the final candidate/evidence references once the fresh reviewer has returned, retaining any blocked checks explicitly.

## Final local review result

The integrated final production build is `v5ZQyht909ryGgizL5m8y` from `.next-testimonials-2026-11-26-final`, serving http://127.0.0.1:3134/testimonials on the bound Work Drive checkout. Candidate source fingerprint: `5d3eafb746922ca45ee097c8d8b850acbe1b6bee4d7913b6c79a35212adf4346`; base commit remains `91e6e15c5840aa8d0d2925fb0fe5eb68690eb457`, with preserved pre-existing dirty work. No commit, push or deployment.

Independent verifier disposition: **ship for owner local review**. It independently ran 27 scoped tests and reviewed the final source/HTTP identity, root-produced screenshots at320/360/390/768/1280/1440/1920CSS pixels, and raw interaction observations. The first-round mobile heading overflow was corrected by sizing the one-word Kento title to fit rather than clipping it. Final document widths match every tested viewport. Root browser checks covered360/390 forward/reverse arrows and horizontal/vertical handoff, keyboard Arrow/Home/End and focus, desktop endpoints, mobile menu/Escape, enquiry and footer route navigation; console log showed no warnings/errors in that session. All17 prior dirty-file hashes and all7 candidate source hashes remained unchanged after verification.

The verifier could not acquire its own browser surface; its source/tests/HTTP checks were independent and its screenshot/interaction review used root captures. Physical-device/Safari acceptance and owner design approval remain pending. The optional style detector returned permission denied; no detector success is claimed. Build output is locally excluded via Git info/exclude; evidence, screenshots and review reports stay outside the deployable checkout in `../testimonials-2026-11-26/`.
