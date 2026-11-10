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

Remaining sub-44px targets are 40–41px (header menu pill, configurator dock buttons) and are left as designed.

Release identity and live checks are recorded in the deployment ledger.
