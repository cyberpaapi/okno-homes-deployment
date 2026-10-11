# OKNO landing rebuild — 27 September 2026

> Historical first rebuild. The current implementation is described in `landing-refinement-2026-09-27.md`; the old reveal, short video, header description and section mapping below are superseded.

This implementation replaces the rejected homepage. Scope: Final Showcase only. The older `homepage-plan-2026-09-27.md` describes the rejected version and is not this build's specification.

## Direction and structure

An architectural opening with OKNO lettering embedded in the Kioo landscape, followed by a visible fluid light field, the bookmarked Bento, a full-width shader Morph Gallery, the circular pinned media reveal, the bookmarked Product Timeline and the bookmarked Footer Section. Geist OKNO throughout; charcoal, warm paper and restrained gold. Navigation, project names and process content come from existing OKNO data/pages. No invented awards, figures or delivery claims.

References reviewed: [BrightHome architectural composition](https://dribbble.com/shots/26898225-Luxury-Real-Estate-Landing-Page-Design) and [Capsules by Moyra](https://capsules.moyra.co/). These inform scale, landscape framing and transitions; their branding and layouts are not copied.

## Component provenance

Actual source and demo retrieved before implementation, archived as `docs/21st-source/rebuild-ID.tsx.txt` and `rebuild-ID-demo.tsx.txt`.

| Component | ID / author / source | Retained | Adapted and placement |
| --- | --- | --- | --- |
| Parallax Scrolling | 4775 · osmosupply · https://21st.dev/@osmosupply/components/parallax-scrolling | Four overlapping scene planes; 70/55/40/10 scroll rates | Kioo photo, SVG scene masks, OKNO title; Motion replaces GSAP and the extra Lenis instance. Supplied source lacked its referenced CSS; local responsive CSS authored explicitly. Opening hero. |
| Morph Gallery | 27258 · kedhareswer · https://21st.dev/@kedhareswer/components/morph-gallery | Original vertex/fragment shader, five-octave noise, luminance-biased dissolve, opposed UV drift | Supplied high-resolution project images; lazy renderer; render only during transition; lower-right controls; inert images. Projects section. |
| Hero Scroll Video Pin Reveal | 25482 · ajith66310 · https://21st.dev/@ajith66310/components/hero-scroll-video-pin-reveal | Sticky viewport and circle-to-full-screen clip reveal | OKNO type, quiet composition, playback lifecycle and reduced-motion fallback. Temporary Lakewood aerial selected from seconds 8–16; original-quality poster and 2560px delivery video. Future Higgsfield replacement remains separate. |
| Bento | 6541 · kinfe123 · https://21st.dev/@kinfe123/components/bento | Six-column layout with two wide cards above three narrow cards | OKNO destinations and project imagery; dedicated arrow links; tablet spacing and mobile stack. No image/card magnetism. |
| Product Timeline | 26930 · hyperiux · https://21st.dev/@hyperiux/components/product-timeline | Horizontal storyline, alternating stems, line draw and masked text reveals | Motion replaces GSAP; measured travel avoids blank tail; stages 01–05 from existing Process content; vertically centered desktop, compact vertical tablet/phone. |
| Footer Section | 2071 · efferd · https://21st.dev/@efferd/components/footer-section | Staggered blur, translation and opacity entrance; brand and navigation columns | Compact existing site links and enquiry action, OKNO palette. Final section. |
| Fluid Field Background | 25595 · mengto · https://21st.dev/@mengto/components/fluid-field-background | Original simplex/domain-warp field and travelling beam math | Local Three renderer replaces iframe/CDN; gold/paper/charcoal; capped 30 fps and DPR 1.25; maximum dimension 1600; offscreen/hidden pause; reduced-motion static field. Intro and timeline only. |
| Reveal Text | 2491 · isaiahbjork · https://21st.dev/@isaiahbjork/components/reveal-text | Spring letter entrance, image-filled hover, delayed color sweep | Word masks protect line breaks and descenders; OKNO font and imagery; reduced-motion text. Large page headings. |
| Fluid Magnetic Cursor | 9314 · jahed · https://21st.dev/@jahed/components/fluid-magnetic-cursor | Velocity stretch and control attachment | Equal 8px surround, live transformed target bounds, convergence stops RAF; only explicit controls; touch, reduced motion, forms and media disabled. Homepage only. |
| Morphing Cursor | 9643 · jatin-yadav05 · https://21st.dev/@jatin-yadav05/components/morphing-cursor | Circular cloned-heading lens and inverse translation | Combined with one pointer listener in the homepage cursor; heading-only selection. |
| Magnetic Button | 1507 · bundui · https://21st.dev/@bundui/components/magnetic-button | Spring magnetic link behavior | Existing approved `projects/21st/Magnetic` primitive reused for controls without changing it. Retrieved source again for verification. This is the previously approved button, not a newly saved item in the 39-bookmark snapshot. |

## File ownership and shared integration

Page implementation: `src/components/landing/`; route: `src/app/page.tsx`.

Narrow shared changes:
- `CustomCursor`: homepage branch only; other route behavior preserved and tested.
- `Header`: opt-in focus trapping and configurable enquiry URL; default URL/structure unchanged. Both desktop and mobile intent paths tested.
- `EnquiryForm`: reads intent through an SSR-safe subscription; maps home, hospitality/property and press; preserves subsequent manual category selection. No form submission was sent during QA.

The source baseline manifest is retained in `../output/homepage-rebuild-2026-09-27/baseline/src-manifest.json`. Supplied assets and unrelated route files are preserved.

## Temporary film selection

The initially tested Forrest film was rejected because it contains burned-in labels. It is no longer mounted by this page.

User authorized a temporary Lakewood clip, to be replaced after later Higgsfield customization. The chosen clean aerial uses source seconds 8–16. The existing Projects preview uses seconds 28–40 (`docs/projects-preview-clips.json`), so these background excerpts do not overlap. The full optional project film still contains all these seconds; this distinction was reported to the user, not presented as wholly unused footage.

A silent 2560×1440 H.264 delivery encode is at `public/assets/landing/lakewood-aerial.mp4`, with a matching original-resolution poster. The 3840×2160 source-copy review asset remains at `../output/landing-rebuild-2026-09-27/lakewood-pin-candidate-4k.mp4`. Originals are untouched. No media was generated or purchased. Any later Higgsfield generation still requires showing the exact prompt first.

## Validation

See `landing-validation-2026-09-27.md` for completed checks and remaining limits. This is a local review build, not a deployed or approved final homepage.
