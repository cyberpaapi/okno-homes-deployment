# Font QA and corrections — 10 November 2026

The owner asked for a QA pass on font problems on https://okno-homes-aryan.vercel.app and for fixes. The supplied 5 November scale ([typography ledger](typography-2026-11-05.md)) is unchanged: same Kento/Govandi pairing, same sizes, same 13px minimum and the same full-sentence rule. These corrections make the live site follow that scale consistently.

## Method

Headless Chrome crawled 14 routes at 1440×900 and 390×844 (Home, About, Hospitality, Journal + an article, Models, Bespoke, Signature, Forza configurator, Process, Projects + a project, Sustainability, Enquiry). For every text element it recorded computed family/weight/size and, through the DevTools protocol, the platform font that actually painted each glyph run. Separate passes checked words wider than their containers, text past the viewport, a throttled (1.6 Mbps, 150 ms RTT) phone first paint, and the font files themselves (glyph coverage, weights, metrics).

## Findings and fixes

| # | Problem | Fix |
|---|---------|-----|
| 1 | Kento ships only Light/Regular/Bold, but module CSS still requests 430–650 from the earlier variable-font design. Browsers snapped ≤500 to Regular and ≥501 to Bold, so About, Bespoke and part of Hospitality/Process headings rendered Bold while the same roles on Home, Journal, Models and Sustainability were Regular. | `@font-face` ranges: Light 100–349, Regular 350–699, Bold 700–1000. Explicit 700+ (`<b>`, `<strong>`, Process stage titles) stays Bold. |
| 2 | No font preload and WOFF/TTF only: phones painted Arial (mixed case, much narrower) then swapped to caps-only Kento ~1 s later, reflowing text. | Lossless WOFF2 copies (Govandi 42.5 → 14.2 KB), `<link rel=preload>` for Kento Regular and Govandi in the root `<head>`, `font-display: block` for Kento, metric-matched “Govandi Fallback”. |
| 3 | ↗ → ← ↓ ⊞ Ⅱ ▷ ✓ ✕ − … ² are missing from Kento and/or Govandi, so each device drew them in its own system font. | `OKNO Symbols` (Geist-derived, 1.7 KB per weight, 300/400/700) added to both stacks via `unicode-range`; ascent/descent overrides stop it growing line boxes. |
| 4 | Process build-sequence rail: the current-phase line used `--okno-section` (60px desktop / 28px phone) inside a 180px column — desktop showed only “DAYS”; phones pushed the day labels into a clipped, overlapping row. | Caption size; phones show day numbers only (full label kept for desktop and screen readers) and hide the six stage names, which the summary line already names. |
| 5 | Full sentences in Kento, against the full-sentence rule: Hospitality phone timeline (desktop already Govandi), project descriptions, Enquiry helper, configurator interior note and finish line. | Switched to the body role (`--type-font-body`), so admin overrides still apply. |
| 6 | Below the 13px minimum: configurator back link / PDF action 9–10px on phones, finish line 11–12px, section counts and gesture hint 11px, swatch notes 12px. | 13px. |
| 7 | Govandi’s middle dot sat near the baseline (“Harshit Puram · Co-founder” read as a full stop); en/em dashes sat low. | In the WOFF2 serving copy only, those three glyphs move up to the hyphen centre; the original TTF is untouched. |
| 8 | ₹ came from a static Manrope SemiBold cut declared as 200–800, so it was always heavier than its text. | `OKNO Rupee` now uses variable Manrope (Latin Extended subset). |
| 9 | Kento width overflowed phone layouts: Enquiry “HOSPITALITY” tab, Bespoke “ARCHITECTURE…” heading column, Sustainability press list (two columns widened past the screen). | Content-sized tabs at ≤520px, full-width Bespoke copy at ≤760px, `minmax(0,1fr)` press columns with Govandi publication names. |
| 10 | Admin typeface options: `manrope.ttf` and `bodoni-moda.ttf` are single SemiBold cuts and Geist bold was its Medium file, so choosing those options rendered one weight and faked italics. | Real variable Manrope, Bodoni Moda (normal + italic) and Geist. |

## Files

New serving files are listed with hashes in `public/fonts/okno-font-provenance.json` (`derivedServingCopies`, `openSourceFallbacks`) and in `config/public-assets.json`. The client’s original Kento/Govandi files are unmodified and remain `@font-face` format fallbacks. Component-scoped legacy faces (`Bespoke Geist`, `Models Manrope`, etc.) are untouched; the site-wide inherit rule already overrides them on public pages.

## Verification (local production build)

- 14 routes × 2 viewports: zero glyphs painted by a system fallback (was 8 routes affected); only WOFF2 font requests, each once per page.
- Display headings (≥40px) render Kento Regular on every route; Bold remains only where 700+ is explicit.
- Phone layout pass: no remaining word-wider-than-container or past-viewport text apart from intentional bleeding background words and the horizontal Process timeline.
- Focused tests, TypeScript, scoped ESLint, `next build --webpack` and `release:check-bundles` (30 traces) pass.

## Phone pass (second release, same day)

The owner then asked for the phone layouts to be optimised. Automated checks at 390px (page overflow, visible text under 13px, tap targets) plus screenshot review of every route found no page-level horizontal overflow or sub-13px text after the first release; the remaining issues were touch and readability:

- Footer links were 18px-tall targets 15px apart and the social buttons 38px. On touch screens (`pointer: coarse`) the links gain a 32px hit area via padding with matching negative margin (no visual change) and the social buttons become 44px.
- Text links that were 18–24px tall — Journal back link, contents and closing links, “← All places”, Bespoke “Begin crafting”, configurator “Back to models” — gain 34–44px hit areas the same way.
- Sustainability press headlines are full sentences; in caps-only Kento they broke every 9–10 characters in the half-width phone columns and ran off the stage. They now use Govandi (16px, 14px at ≤520px), so all four fit.
- The homepage Hospitality eyebrow was mixed-case Govandi while Signature and Sustainability eyebrows are Kento capitals; it now shares their rule.
- Hospitality bento eyebrows (ESTATE SCALE, SITE…) sat on bright water and sky; the card gradient's middle stop and the eyebrow opacity are raised.
- Tablet (701–1100px) Process rail: BUILD SEQUENCE overflowed its 116px column and the stage names collided. The heading now sits above a full-width rail, as on phones, centred in the existing shell.
- `/fonts/*` is cached for a week (`stale-while-revalidate` a day) instead of revalidating on every visit, so Kento (`font-display: block`) is ready without a round trip on repeat visits. Font files are renamed when they change.

Remaining sub-44px targets were 40–41px (header menu pill, configurator dock buttons); the third release below addresses them.

## Touch-target pass (third release, same day)

The owner approved design changes so that every phone control reaches 44×44. On touch screens (`pointer: coarse`):

- Header: the collapsed menu pill is 46px tall around a 44px button (was 42/41px); the logo link has a 44px hit area.
- Footer and Journal: link rows are 44px, so footer links sit 26px apart (was 15px) and Journal contents links 28px apart (was 16px); the footer column heading keeps its spacing to the first link. The Journal back and closing links and configurator “Back to models” grow to 44px.
- Projects: previous/pause/next and the play button are at least 44px (were 34–38px), the project title link is 44px tall, and the film dialog's close and film choices are 44px tall. Gallery Photographs/Films tabs are 44px tall (were 31px) and collapsed thumbnails 44px wide (were 34px); the carousel centres the active thumbnail using the wider size.
- Configurator: camera views, turntable, lighting, finish toggle, application filters and the panel close button are 44×44 at every touch width, including the short landscape layouts where they were 28–32px. On phones the controls bar uses 8px outer margins and tighter group spacing, and the finish panel sits 4px higher. Fifteen controls cannot fit two 44px rows below 390px, so on 360–389px phones the five background thumbnails share the remaining width (38–43px wide, 44px tall).
- Signature (Forza) on phones held sideways and tablets (701px and wider): plan filters and model choices are 44px tall (were 32px and 28px) and the details button 50px, matching phones.

Two landscape layout defects that predate this pass were fixed while checking it:

- 701–1000px: the centred model selector ran under “Explore details”, hiding Octapod. It now starts at the left edge and scrolls within the remaining space; all six models show from 740px.
- Phones held sideways at 360px tall: “Configure yours” covered the detail card's copy; it now sits to the card's left.

Checked on a local production build with touch emulation across the 14 routes at 320×568, 360×780, 390×844, 430×932, 740×360, 844×390, 932×430 and 768×1024 (112 page checks): no page overflow, no visible text under 13px, and no control under 44×44 apart from the 360–389px background thumbnails above and the configurator below 360px, which keeps its compact 26–40px controls because its rows cannot hold 44px buttons at that width. Screenshots were reviewed for the header, menu, footer, gallery, Journal, configurator (phone, landscape, 768px tablet) and Signature (phone, landscape, tablet).


## Owner feedback pass (fourth release, same day)

- Models (phones): the page's `overflow: hidden visible` computed to an inner vertical scroller whose drifting background overflowed by up to 11px, so phones drew the site's 8px beige scrollbar down the right edge. The page now clips, and the custom scrollbar applies to mouse pointers only.
- Menu button: frosted glass pill (dark glass on dark pages, white glass with dark ink on light pages) with a three-line icon that still folds into the close cross; the open menu keeps its solid panel. Page-level `button { font: inherit }` (Sustainability) no longer enlarges the label into the icon.
- Journal (phones): feature 540 → ~405px, press cards 72vw with 16px titles, and articles two-up (excerpt hidden below 520px). The page is 38% shorter at 390px.
- Configurator: no site header up to 1120px wide (“Back to models” is the exit), so the stage, model panel and finishes use the full height; phone text is smaller (20px title, one-line back link, “PDF”, 14px section heads, Govandi finish names, no family labels or mouse/keyboard hint on touch); the load error is a Govandi sentence.
- Alignment and spacing: Bespoke headings no longer stagger or break mid-word (“AUTHORE/D”), the manifesto and closing lose their empty full-screen bands, decision panels share one edge for heading, image and caption, the hero title sizes to its frame, and the clipped background words are gone. Hospitality selected work is a lead image plus an even two-column grid (was a 76%/65% zig-zag), and its closing heading is a section heading instead of 13px. The home background word sits on the copy edge instead of off-screen; the Journal/About cards share the 6vw edge. About's purpose statement is set as a statement.

Checked on a local production build: 14 routes at 390×844 with touch emulation have no overflow, no text under 13px and no control under 44px; desktop 1600×820 scroll captures reviewed for Bespoke, Hospitality, Home and About.

## Client feedback pass (fifth release, same day)

- Projects (phones): the globe was centred at 66% of a sticky frame as short as 690px and rose behind “Enter the collection”. It now sizes to the space below the intro (min(340px, 84vw, frame − 400px)) with a 28px bottom margin; the film still opens from its centre.
- Forrest film: the landscape preview has burned-in lower-left captions (“Party Lawns”, “Mystical Pathway”, “Forrest, Mahabalipuram”) that a portrait crop cut in half. Portrait screens (aspect ≤ 4/5) now play `forrest-stream-v4-portrait.mp4`, a 608×1080 crop from x=998, right of the captions (derived from `forrest-stream-v4.mp4`; ffmpeg `crop=608:1080:998:0`, libx264 CRF 21, 25 fps, no audio). Landscape screens keep the full frame with complete captions.
- Bespoke: the faint BESPOKE layers sat half behind the opening frame and are removed; the frame's “Bespoke by OKNO” label carries the name. The result section's pop-up photograph shows on phones again, above the heading.
- Hospitality: new result section with the same pop-up image as Bespoke (full-bleed photograph opening on entry, framed photograph rising over it), after the delivery timeline. Text and both photographs are editable under Hospitality → Result pop-up image in `/admin`.

## Open menu (sixth release, same day)

The open menu is frosted glass as well (dark glass, darker on light pages for contrast), and each destination fits on one line: link size is min(menu size, 8.2% of the panel width), so “Sustainability” no longer wraps its Y (28px at 390px, 25px at 360px). The panel can grow to 640px tall, so all nine destinations show without scrolling on a 390×844 phone.

Release identity and live checks are recorded in the deployment ledger.
