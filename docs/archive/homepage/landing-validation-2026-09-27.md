# Landing rebuild validation — 27 September 2026

Scope: Final Showcase homepage and its narrow header, cursor and enquiry integration. Local review only; no push or deployment.

## Automated checks

- Complete Vitest suite: 24 test files, 97 tests passing.
- Focused coverage: Morph Gallery lazy WebGL/transition scheduling, controlled navigation, inert images, reduced-motion/swipe behavior and context-loss fallback; cursor full-bound equal margins, transformed target tracking, heading lens, media/form exclusion, touch/coarse/reduced contexts; shared cursor route switch; header defaults, intent propagation, focus wrapping, Escape and scroll restoration; enquiry intent mapping, manual selection and SSR hydration.
- Scoped ESLint: passed for all new landing files and changed route/shared files.
- TypeScript `--noEmit`: passed.
- Production webpack build: passed, 21 generated pages.
- `git diff --check` cannot operate as a repository check because this delivered Final Showcase directory has no `.git`. Equivalent `git diff --no-index --check /dev/null FILE` whitespace check ran on 19 new/changed source files with no reported whitespace errors. No Git repository was initialized.

## Browser checks

Desktop 1440×900, tablet 768×1024 and phone 390×844 were inspected through the in-app Chromium browser. Viewport widths were 1432/760/382 respectively inside the scrollbar; no document horizontal overflow.

- Hero: initial photo framing, text reveal, distinct layer transforms, down/up scroll and return to the initial composition.
- Intro/background: shader is visibly animated; text remains legible.
- Bento: two-wide/three-narrow desktop/tablet composition, intentional phone stack. Corrected tablet title/arrow crowding; controls at least 44px.
- Morph Gallery: real WebGL canvas present; image navigation changes the associated project link; all three controls align at the lower right; images remain inert.
- Pin reveal: selected Lakewood excerpt decodes at 2560×1440 and plays muted inline. Computed circle changed from 71.32% to 27.55% when scrolling upward. Phone playback confirmed. Video pauses/unmounts offscreen and uses a native poster image until near the viewport. Source seconds 8–16 do not overlap the existing 28–40 second background preview; the full optional project film still contains these seconds.
- Timeline: corrected stage opacity remapping; paragraphs reach opacity 1. Desktop pin remains centered, final stage fully enters before exit, no added empty tail; tablet/phone vertical stages are ordered 01–05.
- Footer: complete compact navigation and enquiry action visible at each breakpoint.
- Mobile navigation: keyboard focus wraps; Escape restores the trigger and previous body overflow.
- Enquiry: clicked homepage action; `/enquiry?intent=home` selected “A home of my own”. No form submitted.
- Final production preview reopened at http://127.0.0.1:3104/; hero rendered, no browser warnings/errors recorded.
- Checked loaded images for decode failures: none.

## Scope preservation

Baseline hash comparison found changes only to `app/page.tsx`, the removed rejected `CinematicJourney` files, `CustomCursor` plus its tests, `Header` plus its tests, and `EnquiryForm`. All other existing source files in the 166-file baseline match. New landing files, tests, source archives and documentation are additive. Original supplied media were not overwritten.

## Limits

Reduced-motion and touch/coarse-pointer behavior were exercised in component tests and reviewed in the implementation. Physical touch-device behavior, browser-level OS preference emulation, Safari/Firefox, throttled low-end-device performance and Lighthouse metrics were not verified. Responsive viewport checks are not physical-device certification.

The temporary Lakewood media is replaceable. A future Higgsfield customization is separate work and must have its precise prompt shown before generation. No paid generation has occurred.
