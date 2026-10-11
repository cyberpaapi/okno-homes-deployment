# Landing refinement — 27 September 2026

This revision supersedes the layout and motion descriptions in `archive/homepage/landing-rebuild-2026-09-27.md`. The user's latest request authorizes homepage changes, shared site navigation, proper missing-page handling and consolidated Final Showcase startup. Work remains local in `OKNO-homes-final-showcase-2026-09-23`; no deployment was performed.

## Implemented

- The final `/` opening is now the generated 20-second forest-to-interior film. Scroll controls the film rather than autoplay, and the final interior dissolves into the same deep-forest surface used by the rest of the landing page. The earlier layered image hero and its `Find your home` action are no longer mounted on the homepage.
- Homepage actions now use the retrieved Subtle Button 3373 surface: a quiet illuminated point, travelling sheen, restrained 18-pixel corner radius and no arrow or underline. The existing retrieved Magnetic Button 1507 supplies pointer attraction beneath this shared treatment. Its former gold accent is replaced by a desaturated eucalyptus tone shared by focus rings, timeline geometry and the footer light. Gallery arrows remain only where they identify previous/next media controls.
- Landing sections share one dark forest palette, soft borders and rounded media frames. The redundant second animated field between the video passage and 90-day timeline was removed, reducing page breaks and color changes.

- Removed homepage Reveal Text 2491, including per-letter masks, image hover fill and color sweep. Text Block Animation 9902 retains its explicit line sequencing with a clean rise-and-focus entrance; the colored covers are removed at every breakpoint. No typewriter.
- The opening remains the 20-second forest-to-interior scroll-scrub film. Three Reveal Text 2491 cues now arrive within the film at distinct scroll intervals: Signature, Bespoke and Sustainability. They introduce real destinations without progress counts or decorative numerics.
- The generic Bento 6541 preview grid has been removed. Signature now has a dedicated Hero Scroll Video 25482 scene that scrubs the real Forza orbit film; Bespoke uses the layered depth motion from Parallax Scrolling 4775; Sustainability uses its own moving forest scene with the same retrieved video reveal geometry. Journal and About close the story as a two-panel Hover Expand 28111 composition.
- Works Wheel 28371 provides the Projects preview: actual project photographs, ring-to-drum scroll motion and explicit project links. See `works-wheel-revision.md`.
- Morph Gallery 27258 is retained as the Hospitality preview with six resort photographs, the retrieved shader dissolve, dedicated previous/next buttons and a hospitality link. The former position counter is removed. Scroll exposes every scene in order. Manual or scroll input restarts a deterministic nine-second idle timer; the timer no longer depends on an interval phase. GPU texture copies are capped at 1280 pixels on phone and 1800 pixels elsewhere while source files remain untouched.
- Glyph Portal 26558 replaces the closing circular clip from Hero Scroll Video Pin Reveal 25482. Its measured SVG glyph camera enters the first O of OKNO; once expanded the clip is removed and content scrolls over the same full-screen video. Scrolling forward never shrinks the film back into a circle. The source's optional letter picker and tutorial annotations are disabled. Geist OKNO replaces its demo font. UTF-16 character indexing is expressed without render-time reassignment to satisfy the current React lint rules.
- Lakewood background is now 20.02 seconds, source seconds 8–28, encoded silent at 2560 pixels wide, H.264 with faststart. File: `public/assets/landing/lakewood-through-20s.mp4`, 25,002,737 bytes. It stops before the existing Projects background excerpt at 28–40 seconds. The optional full project film contains these seconds; this is not a claim of exclusive footage. Existing original-quality poster retained. Video mounts near the section and pauses offscreen/hidden; reduced motion shows the poster.
- Product Timeline 26930 now emphasizes **A home in 90 days**, with the existing approved About schedule: Days 01–10, 11–25, 26–60, 61–72 and 73–90. It uses the 3200-pixel real Kioo project photograph of the completed home and labels the frame **Day 90 · Ready for handover**. Generated factory imagery, cyan construction markers and blinking-light media are absent. Milestones now follow the retrieved Product Timeline behavior: stem, dot and copy reveal once and remain visible. Narrower 34vw desktop stages and 46svh phone beats keep the previous and current stage together. Includes a dedicated Process link. Actual `/process` also says **Built in 90 days** and names those ranges on its five scenes.
- Footer Section 2071 now uses the bookmarked inset panel, restrained top glow and staggered columns with real site destinations.
- Consolidated the newer reviewed Hospitality bulk-estate page and Process panel-build films from the separate demo into Final Showcase, with matching estate enquiry options. Original iterations remain unchanged.
- Shared Models/Projects header composition is used across editorial routes. Missing routes get the retrieved Not Found 2 component. See `site-integration-2026-09-27.md`.
- Published Tengo and Kray customer configurators and required assets are restored inside Final Showcase, with one website launcher. See `start-the-website.md` and `configurator-recovery-manifest.json`.

## Retrieved sources

New actual source/demo pairs are archived under `docs/21st-source/revision-ID.tsx.txt` and `revision-ID-demo.tsx.txt`:

| ID | Source | Status |
| --- | --- | --- |
| 28371 | https://21st.dev/@crafterui/components/works-wheel | Integrated |
| 9902 | https://21st.dev/@daiwiikharihar/components/text-block-animation | Adapted explicit lines and shared Motion runtime instead of GSAP SplitText |
| 26558 | https://21st.dev/@Legacy/components/glyph-portal | Integrated measured glyph-camera source, MIT notice retained |
| 9999 | https://21st.dev/@efferd/components/not-found-2 | Integrated global missing-page handling |
| 8573 | https://21st.dev/@minhxthanh/components/carousel-circular-image-gallery | Reviewed; Works Wheel fills this optional gallery role |
| 3362 | https://21st.dev/@sean0205/components/3d-testimonails | Retrieved, not mounted pending real customer quotes and attribution |
| 3373 | https://21st.dev/@jatin-yadav05/components/subtle-button | Adapted as the shared arrow-free landing/header CTA surface; combined with Magnetic Button 1507 motion |
| 25482 | https://21st.dev/@ajith66310/components/hero-scroll-video-pin-reveal | Reused for the dedicated Forza scroll-scrub and Sustainability media aperture |
| 4775 | https://21st.dev/@osmosupply/components/parallax-scrolling | Reintroduced for the standalone Bespoke depth composition |
| 28111 | https://21st.dev/@educalvolpz/components/hover-expand | Adapted to the restrained Journal/About closing pair |
| 5397 | https://21st.dev/@xubohuah/components/layered-text | Its translated stacked-line motion is adapted into the slow perpetual movement of the two hero wordmark planes |

Only Footer Section 2071 appeared in the current 39-bookmark list. No exact Shadeway bookmark was present. Optional components are not presented as integrated when unused.

## Content boundary

A clarification for approved customer testimonials remains pending. The old hospitality source contains placeholder quotes; those were not reused as customer evidence. No invented testimonials were added.

## Validation

138 tests across 37 files pass; ESLint, TypeScript and the 22-route production build pass. The homepage runs on port 3108 and every editorial/configurator route returns HTTP 200. Browser review confirms the 20.041667-second film is ready, the three scroll cues arrive separately, the Forza video time advances with scroll, the hero wordmark transforms continue changing at rest, and no `x / y` or `x out of y` counter remains in the landing DOM. Desktop at 991×916 and portrait phone at 390×844 have no document-level horizontal overflow. The 90-day media uses a sharp real Kioo completion photograph with a quiet idle drift; desktop stages use non-overlapping reveal windows and narrow layouts use one spacious in-view reveal per stage. Hospitality Morph Gallery remains a pinned scroll sequence with an idle morph after rest.

Previous landing/timeline sources are preserved at `../output/landing-refinement-2026-09-27/before/`. Earlier candidate assets and iteration notes remain separate from the served final implementation.
