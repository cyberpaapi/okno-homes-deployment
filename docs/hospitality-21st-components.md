# Hospitality — active implementation

Route: `/hospitality`

This is the 4 October 2026 revision. The rejected scroll-expansion video and zoom-parallax opening are no longer served. Their source remains recoverable in the historical demo checkout and the earlier component record is under `docs/archive/hospitality/`.

## Current composition

1. Shared immersive header.
2. Animated green Silk field and a photographic editorial introduction.
3. Restored 21st.dev Bento `6541` adaptation with two large and three smaller photographic proof cards.
4. Existing five-project gallery and accessible fullscreen viewer.
5. Seven-stage delivery timeline.
6. Hospitality enquiry close.
7. Shared Final Showcase footer from the root layout.

## Active owners

- `src/components/hospitality/HospitalityExperience.tsx`
- `src/components/hospitality/HospitalityIntro.tsx`
- `src/components/hospitality/21st/HospitalityBento.tsx`
- `src/components/hospitality/21st/HospitalityGallery.tsx`
- `src/components/hospitality/21st/HospitalityTimeline.tsx`
- `src/components/hospitality/21st/TextBlockAnimation.tsx`
- shared `src/components/projects/21st/SilkBackground.tsx`

The page does not mount a private footer or cursor. `src/app/layout.tsx` supplies `SiteFooter` and `ObsidianCursorTrail` to Hospitality exactly as it does to every other route.

The active bento is the preserved adaptation of [Bento](https://21st.dev/@kinfe123/components/bento), component `6541` by `kinfe123`. It retains the source's six-column, two-large/three-small geometry while using five OKNO Hospitality proof cards, local project photography, `next/image` and CSS Modules. The later lead-card replacement is rejected and must not be restored.

## Removed served mechanisms

- `ScrollExpansionHero`
- `ZoomParallax`
- page-local copied footer

The latest project showcase remains the existing gallery treatment; it was refined for smoother transforms, focus trapping, keyboard navigation and reduced-motion behavior.

## Opening and bento entrance — 5 October 2026

The opening photograph retains its editorial framing, but its large clip-path animation was replaced after visible stutter. A dark-green curtain now translates off the loaded image while the image crossfades and settles by a small scale change; the caption follows. The existing five-card Bento geometry and copy remain unchanged. Cards now enter once on view without waiting on network state, while each photo fades in independently when ready. Responsive `next/image` sizing replaces full-resolution, unoptimized transfers. These transitions use the existing Motion dependency, preserve reduced-motion and no-script paths, and keep late-loading media from flashing in or holding an entire card blank.

The opening headline now runs as one continuous line on desktop, with natural word wrapping on narrow screens. Its words enter in a short stagger using only translate and opacity; the previous whole-heading blur and uneven line indents remain removed. Wording and typeface are unchanged.

## Delivery timeline refinement — 5 October 2026

The existing pinned Product Timeline scroll, seven stages, typography and SplitText reveals remain intact. The fixed-length progress line reveals a sage-to-stone-to-teal gradient as the visitor scrolls. Each milestone title, number, dot and stem uses the color at that portion of the line; the mobile and reduced-motion vertical timeline follows the same progression. The earlier decorative color washes, image tint and dot rings were removed so color stays attached to the delivery path and its copy. No new animation dependency or page-local shell was added.

Seven small, optimized thumbnails from the existing OKNO project-photo library now sit on short connectors from the timeline line. The desktop scroll drives a bounded hinge/flip entrance alongside each milestone title; the mobile vertical path reveals the same compact thumbnails as each step enters view. The photos are illustrative project imagery, not claimed documentation of a specific delivery stage. The same three line-linked hues were lifted slightly for visibility and are shared by the photo edges, connectors, numbers and headings. Reduced-motion keeps the thumbnails visible without spatial flipping. This extends the existing 21st.dev Product Timeline `26930` adaptation; it is not a new 21st.dev component.

## Interactive heading repair — 7 October 2026

The two Hospitality headings retain the two-pass block wipe adapted from [21st.dev Text Block Animation](https://21st.dev/@daiwiikharihar/components/text-block-animation), component `9902` by `daiwiikharihar`. The wipe now animates the intact heading rather than using GSAP SplitText, because SplitText replaced the React nodes that own the circular inverse-colour lens. The decorative wipe does not receive pointer events.

`src/components/hospitality/HospitalityTextLens.tsx` is a route-local adaptation of the actual archived [21st.dev Morphing Cursor source](https://21st.dev/@jatin-yadav05/components/morphing-cursor), component `9643` by `jatin-yadav05` (`docs/21st-source/9643.tsx.txt`). It retains the counter-translated negative-colour circle and lerp, but measures the visible text fragments on wrapped lines and switches off outside them. This prevents a floating cream circle beside the closing heading while leaving the Projects page's shared lens source unchanged. Browser retest confirmed both headings reveal only over text; the shared cursor remains mounted once through the root layout. See the [public mouse interaction audit](public-mouse-interaction-audit-2026-10-07.md).

The closing Hospitality Enquiry link retains its magnetic hover and uses native navigation for an ordinary primary click. A client route transition from after the pinned timeline requested Enquiry but could stall without changing the page; browser retest confirmed native navigation reaches `/enquiry?intent=hospitality`. Modified clicks keep their standard browser behaviour.
