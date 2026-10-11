# OKNO landing page — architectural journey

> REJECTED AND REMOVED: The user rejected this implementation on 27 September 2026. Its homepage components and tests have been deleted; the homepage now renders no content. The historical plan and validation below do not describe the current homepage and must not be used as an approved design direction.

## Approved direction
User selected Wingly's Dribbble BrightHome concept (https://dribbble.com/shots/26898225-Luxury-Real-Estate-Landing-Page-Design) and Capsules by Moyra (https://capsules.moyra.co/) as inspiration, with explicit permission to plan and implement. Borrow image dominance, layered depth, warm restraint and continuous scroll rhythm; do not reproduce their composition, brand, copy or assets.

## Scope and recovery
Work only in Final Showcase, homepage and page-owned components. Other route consistency is a later phase. Source baseline and former homepage are preserved outside the app at ../output/homepage-rebuild-2026-09-27/baseline. Replace the old CinematicJourney mount and remove its now-unused source after verifying no other imports. Keep shared assets and navigation intact.

## Sequence
1. Retrieve actual bookmarked 21st.dev sources; map their motion to OKNO assets and routes.
2. Build the opening: landscape architecture, large masked headline, model/enquiry actions, understated chapter navigation, scroll-driven image depth.
3. Introduce Signature and Bespoke through tactile image cards and direct links.
4. Develop a 3D unfurling project gallery, a hospitality image chapter, and an expanding process image reveal.
5. Connect sustainability, About and Journal through a concise editorial grid; finish with an enquiry invitation and full navigation.
6. Choreograph every interaction with shared timing, hover/focus/touch feedback. Add a subtle animated mineral-light background to non-media sections. Provide a pause-motion control and reduced-motion layouts without pinned dead space.
7. Validate TypeScript, scoped lint, existing tests, production build, route/media integrity, desktop/tablet/phone layout, keyboard and reduced-motion behavior. Review screenshots and fix issues before presenting.

## Visual and motion system
Existing OKNO paper #f4f0e9, ink #17130f, gold #a88a5b and restrained warm neutrals. Geist remains the site typeface. One main scroll stream; no scroll-jacking or nested scrolling. Local client photography and existing media only. Masked text entrances, transform-based parallax, subtle perspective/hover tilt, image expansion, animated arrows and thin rules. Mobile keeps strong cropping and direct tap targets. Effects become static when paused or reduced motion is requested.

## Source provenance
- 19257 — Text Reveal (Mask), soralabs: https://21st.dev/@soralabs/components/text-reveal-mask. Retain masked-unit translation and stagger, simplify to authored lines/words with accessible unsplit text and visible server fallback.
- 20039 — 3D Parallax Unfurling Gallery, piyushxdev: https://21st.dev/@piyushxdev/components/3d-parallax-unfurling-gallery. Retain perspective matrix and opposing column offsets; replace stock images with real OKNO project links, remove nested scroll container and 600vh duration.
- 25482 — saved Hero Scroll Video Pin Reveal, ajith66310: https://21st.dev/@ajith66310/components/hero-scroll-video-pin-reveal. Adapt scroll-linked clip expansion to an architectural rectangular aperture and existing Motion dependency; remove GSAP/Lenis duplication and unrelated demo content.
- 18472 — saved Animated Gradient, componentry: https://21st.dev/@componentry/components/animated-gradient. Adapt shader to mineral neutral palette, with bounded resolution, visibility pause and fallback.
Full retrieved TSX source archived in docs/21st-source/home-{id}.tsx.txt before implementation. Catalogue performance claims are not acceptance evidence.

## Media and content boundary
No invented price, delivery promise, project location, client testimonial or sustainability statistic. Actual route data is the content authority. Higgsfield generation is available, but user explicitly requests shot/prompt disclosure before any generation. No generation is needed to establish this first implementation using existing assets; no job has been submitted.

## Work division
Main agent: layout, motion primitives, route integration, visual verification. Asset agent: read-only content/asset/route audit. Ambient agent: isolated background shader adaptation. Review after integration: navigation, motion lifecycle, accessibility and source boundaries.

## Implementation and validation — 27 September 2026
Completed in `src/components/home/` and mounted by `src/app/page.tsx`. The former CinematicJourney source was removed; its verified recovery copy remains outside the app. A SHA256 comparison against the baseline found no changes to pre-existing source outside the homepage entry and removed CinematicJourney files. Other routes remain a separate design phase.

- Actual 21st.dev sources retrieved and archived before adaptation; masked word reveal, perspective project gallery, expanding process image and bounded WebGL atmosphere integrated with existing OKNO photography.
- Full Vitest suite: **82 tests passed across 22 files**. Five homepage regression tests cover masked reveal, pause layout stability, reduced motion, readable static content and mobile menu focus/escape behavior.
- TypeScript and scoped ESLint passed. Optimized Next.js production build passed with all 21 static pages generated.
- Browser review at 1280×720, 820×1180 and 390×844: no horizontal page overflow or broken loaded images observed. Checked hero, model cards, project gallery, process chapter and desktop editorial/footer composition.
- Keyboard menu wrap, Escape focus restoration and body-scroll restoration verified. Pausing inside the process chapter preserved its height and viewport position.
- Clean production preview verified homepage → Signature → browser Back, and contained no captured console warnings/errors during that check.
- Fixed issues found during review: clipped keyboard outlines, child reveal observers missing masked text, pause-induced process layout jumps, mobile menu focus escape, production CSS selector scoping, and footer clearance for the motion control.

Review preview: http://127.0.0.1:3104/ (local process must remain running).

Limits: responsive browser simulation, not physical-device testing. Safari/Firefox, low-end hardware, throttled performance and Lighthouse scores have not been verified. No Higgsfield generation or deployment was performed. Existing enquiry delivery behavior was not changed.
