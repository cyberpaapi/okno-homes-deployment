# Testimonials handwriting —27 November2026

Owner brief: plan, divide and start implementing cursive handwriting appearance for Testimonials, optimize for phone and PC and preserve accepted behavior.

## Direction and work division

This is a refinement of the accepted green silk/photo/frost carousel. The focal moment is the quote inking from left to right, once when a new logical review first enters. Names, two location lines, page headings, controls, disclosure and the existing acceleration/deceleration remain. No typewriter caret, continuous retyping, fabricated annotations, new claims or unrelated page redesign.

- Ink component worker: bounded word-level clip reveal adapted from retrieved source; per-review lifecycle, equivalent-copy handling, reduced motion/failure path and focused tests.
- Typography worker: self-hosted licensed Allura400 for quote default, responsive readability and existing CMS body-font override precedence. No global font replacement.
- Orchestrator: integrate into the existing carousel, run production and browser checks, resolve caused failures and hand a neutral packet to a fresh verifier. The accepted rail/controller source stays unchanged.

Budget: finish the quote reveal within1.6seconds, retain the existing six-second reading interval, no frame-by-frame React state, font parsing, runtime CDN script or new animation package. Visible content retains its reserved layout. Hidden/offscreen/user-scroll/menu/reduced-motion paths show finished text and stop writing. Plain CMS review text is never interpreted as markup. Long content must stay readable and unsupported effects must fall back to complete text.

## Source provenance

[Handwritten Response](https://21st.dev/@crafterui/components/handwritten-response), author `crafterui`, demo31227/component17344; full component and usage code retrieved through21st.dev on27November2026. Original component: `docs/21st-source/31227.tsx.txt`. The recognizable behavior retained is its word-level left-to-right clip-path ink wipe, duration proportional to character count, maximum total writing budget and generous clip overhang. Annotation parsing, marker/ring/strike decoration, streamed-answer API and remote Caveat import are omitted for plain testimonial quotes. Actual visible implementation and performance verification remain necessary; source retrieval alone is not acceptance.

A catalogue search compared Handwriting Text25777, Hand Writing Text108, Handwritten Response31227 and related text reveals. The tools provide relevance metadata but no usable bookmark/download counts; no popularity rank is claimed.25777 was inspected but not implemented: converting each dynamic quote into many SVG contours and loading a font parser from a CDN would conflict with this mobile performance budget. No external author code is claimed in the independent local lifecycle handling.

## Verification and release

Integrated local candidate:52 focused tests across6files, scoped zero-warning lint, production build/typecheck and32function traces passed. Exact source/build, deterministic matrix, screenshots, independent verdict and release disposition are recorded outside Git under the Work Drive `testimonials-handwriting-2026-11-27` evidence folder. Read its `RELEASE.json` for the latest verified deployment status; this document does not imply owner acceptance. Responsive desktop-browser evidence is separate from physical-phone acceptance. No storage, admin save/publish or account settings change is part of this work.

Owner refined the font direction to elegant/luxury handwriting; the selected quote face is [Allura](https://fonts.google.com/specimen/Allura), preserving the existing site font roles. Automatic rail steps can reveal incoming quotes; genuine pointer/wheel/document scrolling completes active ink and shows incoming text fully, avoiding a readable-to-empty restart after movement. Menu activity also suspends the progress/rail so a review cannot advance behind an open menu.
