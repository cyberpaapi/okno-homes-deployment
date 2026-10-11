# Hospitality - 21st.dev component record

Audited against the current `/hospitality` imports and the archived 21st.dev payloads on 25 September 2026. This records the code that is active, not an earlier design intention.

## Active retrieved components

| Page role | Component | ID | Author | Active adaptation |
|---|---|---:|---|---|
| Hero | [Scroll Media Expansion Hero](https://21st.dev/@arunachalam/components/scroll-expansion-hero) | 1932 | `arunachalam` | Retains the defining centred media frame, outward-moving split title, background photograph fade and expansion to full-viewport video. The adaptation uses section-bound `motion/react` progress instead of the source's global wheel/touch interception, preserving native scrolling and keyboard access. The frame is square at rest. Its 1920×1080 Lakewood dusk footage is a separate `103–113s` segment of the client-supplied film; Projects uses `28–40s`. |
| Visual transition | [Zoom Parallax](https://21st.dev/@efferd/components/zoom-parallax) | 5967 | `efferd` | Retains the source's `300vh` pinned gallery and seven absolute image layers. Local 3200px-wide Hospitality project photographs replace the demo media. The lead image is laid out at full viewport resolution and begins at `0.25x`, which is visually equivalent to the source's `1x→4x` motion without upscaling a thumbnail-sized compositor texture; reduced-motion receives a static image grid. |
| Heading reveal | [Text Block Animation](https://21st.dev/@daiwiikharihar/components/text-block-animation) | 9902 | `daiwiikharihar` | Retains GSAP `SplitText`, the two-pass colour block wipe and optional `ScrollTrigger`. Adds route-safe cleanup and a reduced-motion early return. Used on the major section headings after the cinematic introduction. |
| Heading lens | [Morphing Cursor](https://21st.dev/@jatin-yadav05/components/morphing-cursor) | 9643 | `jatin-yadav05` | Reused through the Projects page's `MorphingText`. Retains the circular counter-translated duplicate-text lens and lerp; limits it to fine mouse pointers, suspends it when inactive/hidden and supplies reduced-motion cleanup. |
| Interactive cursor | [Fluid Magnetic Cursor](https://21st.dev/@jahed/components/fluid-magnetic-cursor) | 9314 | `jahed` | Replaces the old arrow/trail cursor. It keeps the source's magnetic centre lock and liquid size morph for links and controls, yields to heading lenses, and is disabled for touch and reduced motion. Position and dimensions share one spring, and the cursor briefly tracks the live transformed bounds of an attached control so the six-pixel outer gutter remains even while the control moves. Gallery photographs and Bento surfaces opt out; the dedicated lower-right gallery arrow remains the only magnetic target on each project card. |
| Magnetic controls | [Magnetic Button](https://21st.dev/@bundui/components/magnetic-button) | 1507 | `bundui` | Retains the retrieved cursor-distance spring interaction and applies it to the two enquiry links without sacrificing native link or keyboard semantics. Hospitality supplies the silk/deep-green pill treatment and circular arrow. |
| Animated atmosphere | [Silk](https://21st.dev/@sorianosantiagosam/components/silk) | 24383 | `sorianosantiagosam` | Uses the retrieved shader motion as one continuous backdrop from Selected Work through the delivery timeline and closing enquiry. It is non-interactive, resolution-capped and frame-throttled for the long page, with a static reduced-motion state. |
| Commercial proof | [Bento](https://21st.dev/@kinfe123/components/bento) | 6541 | `kinfe123` | Retains the source's six-column, two-large/three-small geometry. Replaces placeholder SaaS copy and remote graphics with five Hospitality proof cards, local project photography, `next/image` and CSS Modules. The large raster hover-scale layer is intentionally omitted so pointer movement stays compositor-light over the image-dense grid. |
| Project entrance | [Animated Gallery](https://21st.dev/@youcefbnm/components/animated-gallery) | 2073 | `youcefbnm` | Retains the asymmetric masonry rhythm and independently offset centre column, but removes the source's perspective tilt so the supplied high-resolution photographs remain crisp. Uses the original local media and adds reduced-motion handling. |
| Project viewer | [Masonry Lightbox](https://21st.dev/@ayushmxxn/components/masonry-lightbox) | 26223 | `ayushmxxn` | Retains a shared-layout fullscreen image transition, portal, backdrop, scroll lock, Escape close and spring motion. Hospitality adds previous/next keyboard navigation, explicit focus restoration and project naming. |
| Delivery path | [Product Timeline](https://21st.dev/@hyperiux/components/timeline) | 26930 | `hyperiux` | Retains the pinned horizontal slider, alternating top/bottom milestones, line/stem drawing, GSAP `ScrollTrigger` and `SplitText` reveals. Chronological sample data is replaced with the seven numbered delivery steps `01` through `07`; the positions array remains intentionally bounded to seven items. The desktop slider is vertically centred inside its pinned viewport. |
| Route loader | [Luma Spin](https://21st.dev/@theritikk/components/luma-spin) | 3800 | `theritikk` | Reduces the retrieved loader to two semantic-free spans and its eight-state `clip-path` loop, recoloured to the Hospitality accent. Adds a static reduced-motion state and route-level loading label. |

## Archived source

The active sources are preserved at:

- Live source retrieved by component ID `1932` - Scroll Media Expansion Hero
- Live source retrieved by component ID `5967` - Zoom Parallax
- `docs/21st-source/25595.json` - Fluid Field Background; full source and demo
- `docs/21st-source/5397.json` - layered text; full source and demo
- `docs/21st-source/9902.json` - Text Block Animation; full source and demo
- `docs/21st-source/9643.tsx.txt` - Morphing Cursor source
- `docs/21st-source/9314.json` - Fluid Magnetic Cursor; full source and demo
- `docs/21st-source/1507.tsx.txt` - Magnetic Button source
- `docs/21st-source/6541.json` - Bento; full source and demo
- `docs/21st-source/2073.tsx.txt` - Animated Gallery source
- `docs/21st-source/26223.tsx.txt` - Masonry Lightbox source
- `docs/21st-source/26930.json` - Product Timeline; full source and demo
- `docs/21st-source/3800.json` - Luma Spin; full source and demo

The JSON payloads store the retrieved implementation at `component.componentCode` and the demo at `component.demoCode`. Retrieved payloads mark these components public but do not provide an explicit license/SPDX field, so component and author attribution is retained.

## Retrieved but not active

- [Fluid Field Background](https://21st.dev/@mengto/components/fluid-field), ID 25595, by `mengto`, remains archived at `docs/21st-source/25595.json` but is no longer imported by Hospitality.
- [layered text](https://21st.dev/@xubohuah/components/layered-text), ID 5397, by `xubohuah`, remains archived at `docs/21st-source/5397.json` but is no longer imported by Hospitality.
- [Beams Background](https://21st.dev/@kokonutd/components/beams-background), ID 1637, by `kokonutd`, remains archived at `docs/21st-source/1637.json` but is not imported by Hospitality.
- The rejected Aurora background and earlier glass-card composition are not active.

## Runtime and source-fidelity findings

- The active animation runtimes are `motion/react`, `gsap`, `@gsap/react`, GSAP `ScrollTrigger` and GSAP `SplitText`. The earlier statement that no GSAP runtime was added was incorrect.
- The current hero and parallax use transform/clip-path animation only. The Silk shader is isolated to the lower atmosphere rather than the media-heavy opening, so it does not compete with the hero video or parallax. Hero and gallery stills load their original 3200px sources instead of low-width responsive derivatives.
- Product Timeline keeps the retrieved pinned horizontal track on desktop, with a shorter stage to remove its dead tail. Phone and reduced-motion contexts receive a compact vertical `01`–`07` fallback, so no oversized horizontal canvas is exposed there.
- Bento, Gallery, Timeline, layered text, Text Block Animation, Morphing Cursor, Fluid Magnetic Cursor and Luma Spin are adaptations rather than verbatim installs. Their defining layout or motion mechanisms are retained, while copy, media, styling, accessibility and cleanup are local.
- Geist is the single Hospitality type family, using the same local font files and weight language as the Bespoke page.
- The page has no embedded enquiry form or Hospitality-only footer. Both visible CTAs route only to `/enquiry?intent=hospitality`, which selects the `Hospitality & estates` enquiry state.

## Content boundary

The client brief defines the five-residence threshold, project names and seven delivery stages. Exact project locations, residence counts, delivery metrics, warranty terms and lead-submission backend remain client inputs and are not represented here as verified facts.

## Final Showcase consolidation — 27 September 2026

The user's current request to consolidate the latest completed website supersedes the earlier instruction to keep this Sep25 page only in the demo checkout. The active Hospitality implementation, focused tests, route loader, original component provenance and the distinct Lakewood dusk clip were copied into Final Showcase. The previous Final Showcase Hospitality source was preserved at `../output/landing-refinement-2026-09-27/before/hospitality/`. Demo source and media remain untouched.

The imported page uses the current shared Models/Projects navigation through `Header enquiryHref="/enquiry?intent=hospitality"`; its former route-local Header styling options were not restored. Existing shared Magnetic, MorphingText and Silk implementations were byte-identical and were retained. Only actively imported Hospitality components were recovered; archived inactive backgrounds/layered-text components remain historical sources. GSAP 3.15 and @gsap/react 2.1.2 are recorded dependencies for the original heading/timeline mechanisms.

The recovered page's four focused tests pass, including bulk-estate content, enquiry routing and photograph viewer behavior. Final compiled/browser validation is part of the combined site integration pass.

Supporting enquiry consolidation retains Final Showcase's newer hydration-safe URL intent hook and visitor-selected tab precedence. It brings forward the completed `Hospitality & estates` category, five-residence minimum choice ranges, hidden hospitality intent and Geist styling. A focused test checks that submitted form data retains the hospitality category; this does not introduce a submission backend.

The older demo's shared cursor file was not copied wholesale: Final Showcase has newer native-media exclusions and target-only support that must remain. The homepage's current cursor already follows live target bounds with equal padding. The historical Hospitality cursor geometry changes remain documented above, but that old shared implementation is not asserted to be the active Final Showcase cursor.
