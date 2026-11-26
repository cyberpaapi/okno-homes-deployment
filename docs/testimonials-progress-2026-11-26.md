# Testimonials progress and rendering - 26 November 2026

Owner issue OKNO-065 accepts the page appearance and the Process ending. It replaces the visible playback labels/icons with a thin countdown line and addresses desktop/phone scroll lag. Work remains local; no deployment or push.

## Cause and correction

The previous component permanently set its stopped state after touch, wheel or arrow navigation. It also maintained an independent interval without showing its time to the visitor. The replacement uses one CSS transform animation: completion advances the carousel and creates the next countdown. Manual native input resets the countdown and resumes after interaction settles. Only deliberate activation of the line control stops the automatic cycle. Keyboard focus, reduced motion, document visibility and offscreen guards remain accessible without visible playback text or icons.

The line's button retains a 44px hit area, accessible name and pressed state. The fill itself is decorative. It does not update React every animation frame. Wrapping uses an immediate return to the first stop rather than an expensive animated rewind through the complete rail.

## Rendering work

The prior 11px frost layer covered the entire card, including the opaque photograph. At 390px, the six layers covered about 1.18 million logical CSS square pixels, with about 415,000 behind photos; at 1440px, about 1.51 million with 598,000 behind photos. This is DOM-derived potential filter area, not a GPU-time or FPS measurement.

Frost now covers only the quote/attribution panels, retaining the actual retrieved Glass Card 28259 blur/tint/inset recipe. The accepted photo and outer card geometry remain. Native scroll bounds use cached layout geometry refreshed on resize. Scroll handling avoids repeated size/card-offset reads.

The reused Silk Shader 24383 instance uses a 180,000 backing-pixel budget on phones and 260,000 on desktop, at 12fps. It keeps its last frame during actual document/rail scrolling and resumes after a short quiet period. No shared shader code or source assets were changed. The rendering budgets and filter-area comparison describe reduced work; they are not physical-device frame-rate certification.

## Verification

Before evidence is outside Git in `../testimonials-progress-2026-11-26/before/`. The implementation worker ran 13 focused tests and scoped ESLint without warnings. Production build `-L_pWmf2u-0dYCs9rIFtS` passed and serves locally at `http://127.0.0.1:3134/testimonials` (HTTP 200/build identity checked). Root browser records show six-second automatic advancement, manual-navigation recovery, last-stop wrap, explicit indicator stop/restart, and document/rail scrolling with background suspension and recovery. Layout samples at 360/390/768/1280/1440 had no document overflow. These are responsive browser checks, not physical-phone certification.

Matched 390px samples reduced canvas backing pixels from 358,902 to 179,376 (50.0%) and potential frost area by 36.1%. At 1440px, canvas pixels fell from 359,516 to 259,248 (27.9%) and potential frost area by 40.4%. Blur overlap with photos is zero within subpixel rounding. These measurements are rendering budgets, not measured FPS improvements. Baseline offscreen lazy images were not all decoded; final candidate preview showed all six decoded.

Raw before/after observations, responsive records, screenshots, comparison and independent review are outside Git in `../testimonials-progress-2026-11-26/`. The accepted Process, Header and other prior work remain frozen by hash. The fresh verifier independently passed the 13 focused tests plus three supplemental tests; final browser-evidence review passed across all five widths, including mobile/desktop wraps. The independent report retains only physical-phone performance as blocked. Physical-device smoothness and owner acceptance remain pending. No push or deployment.
