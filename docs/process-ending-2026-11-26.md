# Process phone ending - 26 November 2026

Owner issue OKNO-064 reports excess empty scrolling after the final Days 73-90 panel before the footer. Evidence is outside Git in `../process-ending-2026-11-26/`. Scope is the phone ending at widths up to 700px. Earlier restored spacing, phase content/images, bottom day rail, hero/media and desktop composition remain preserved. No deployment or push.

## Cause and correction

The original 500svh timeline and 100svh sticky stage produce 400svh of pinned travel. Quantisation selects the final panel at 350svh, leaving another 50svh of unchanged pinned content. On the old 390x844 local build, a further 253px scroll left the panel unchanged and the footer still below the viewport. The separate 32px section-bottom padding was not the cause and remains unchanged.

The phone timeline is now 462svh. A measured MotionValue ratio maps the shorter travel back to the original virtual 500svh range before the existing quantisation. This preserves earlier phase boundaries at 50/150/250/350svh and leaves a 12svh final dwell in a fixed viewport. Measurements happen only on ResizeObserver/window resize, with cleanup and no per-scroll layout reads. The calculation uses documentElement.clientHeight to match Motion and accounts for differences between svh and current browser viewport height. Desktop, reduced-motion and short-viewport fallbacks retain their existing range/behaviour. Shared spring, guard, day rail, copy and images are unchanged.

## Local validation

Build `JibDWZREj2MV1WU3bEJfg` serves http://127.0.0.1:3134/process. At the same 390x844 scroll position (7334.67px), footer top moves from 969.20px to 648.47px, bringing it into view about 321px earlier. At the held-panel comparison position, the final panel geometry remains unchanged. Root forward/reverse checks passed at 360x800 and 390x844. The desktop 1440x900 timeline remains 4500px (500svh), with all five phases. Earlier boundary positions and static fallbacks have focused source/test coverage.

The integrated build and 36 focused tests passed. Fresh independent review ran 27 scoped tests and checked root-operated captures/raw observations, recommending **ship for local review**. The verifier had no own browser; physical-phone and owner acceptance remain pending. All seventeen older dirty files remain byte-identical. Private workflow/media and source assets remain outside this change.

Before/after evidence: `../process-ending-2026-11-26/before/`, `after/observations.json`, `after/footer-entry-390.jpg`, and `final-visual-review/REVIEW.md`. The combined PDF is in the sibling `testimonials-refinement-2026-11-26/output/pdf/` directory.
