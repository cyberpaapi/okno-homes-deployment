# Projects gallery and atlas revision

Status: local preview, not deployed. The seven real collections and eleven supplied full films remain intact. Approved project display names and exact project-to-location assignments are still client-pending. All ten globe pins remain; no invented assignment was added.

## Current implementation

Individual project pages now render the retrieved 21st Masonry Lightbox (26223), replacing the prior hero slideshow and bespoke story sequence. Intrinsic-ratio photographs appear once each; tiles reveal on scroll and expand into a shared-layout spring viewer. Fullscreen uses the staged full-resolution image directly (Forrest verified at 3200×2133), without a second Next Image compression pass. Image navigation, expanding thumbnail controls, Escape, scroll locking, focus containment/restoration and reduced-motion behavior are included. Photo/film tabs have no visible totals. Supplied films remain project-specific, controlled by native video controls and the retrieved expanding thumbnail selector.

Atlas revision retains the globe and dark silk background. Retrieved 21st additions include the serif heading, full desktop navigation, mobile/tablet morph menu, first-entry curved-sheet loader, spring SVG pointer and introductory image trail. A scroll-linked circle transition contracts the globe and opens the film stage from the same origin. Divider lines and redundant counters are removed. Source records and adaptations are listed in `projects-21st-components.md`; original retrieved code is in `21st-source/`.

Preview loops now use the original footage: Forrest FPV at 1920×1080 (34–46 seconds, chosen to avoid baked-in captions), Kray Sangareddy at 1920×1080, Lakewood at 2560×1440. Only the selected ambient clip plays, pausing offscreen, in hidden tabs, or while a film dialog is open. Reduced motion uses supplied photographs. No paid/generated media was created.

## Validation

- 47 automated tests pass, including project-local navigation, media selection, fullscreen keyboard/focus behavior, global cursor fallbacks and scroller lifecycle on Projects/detail/other routes.
- Scoped ESLint and production build, including TypeScript and all seven statically generated detail routes, pass.
- Production browser review at 1440×900, 390×844 and 320×740: masonry layout, responsive navigation, photo/film selection, fullscreen source resolution, next image, Escape and focus return. No horizontal document overflow at phone widths.
- Desktop header shows site links with the morph toggle hidden. Phone navigation opens and closes; the atlas return link works after its closing animation.
- The global site font selector initially overrode the new typography; scoped CSS fixes that. Final computed font is OKNO Bodoni for project headings and OKNO Manrope for page text.
- The globe-to-film transition is observed at intermediate circle clipping and full reveal. Forrest playback decodes at 1920×1080. Ten preview pins remain; automatic rotation continues.
- Browser console has no errors or warnings in the final reviewed session.

The full films retain their supplied/staged quality; lower-resolution source footage is not represented as upscaled detail. Smoothness was reviewed in the desktop browser and responsive viewport simulation, not benchmarked on physical mobile hardware.

## Follow-up refinement

User-approved Forrest sequence is now Party Lawn → Mystical Pathway → central FPV rotation: a fixed 16-second excerpt from source seconds 22–38, replacing the previous preview. The project label moves to the top during playback to avoid the source captions. Previews advance on completion, photo-only projects after seven seconds; a persistent pause control covers both. No page-scroll automation is used. Landscape gallery films select/play muted automatically, including Kray's landscape film ahead of its reels; portrait-only Octapod retains manual playback.

Project-name typography is Manrope and the Text Reveal mask has extra descender room. The atlas headline and approved gallery layout remain intact. 21st's Fluid Cursor Trail (18358) adds a bounded, short-lived particle wake outside the existing introductory image trail. Globe velocity is measured from the drag and decays to zero, preserving the final orientation.

Validation so far: 53 tests pass; scoped lint, TypeScript and production build pass. Browser drag reported a release speed of 221.522 degrees/second and settled to 0; particles emitted then expired to zero. Preview playback starts at Party Lawn and advances through subsequent projects. Final responsive/playback checks recorded below.

Final production checks: Forrest gallery landscape video is autoplaying, muted, and advancing in time; Kray defaults to `kray-02.mp4` at 1920×1080, also muted and playing. Octapod remains paused with no autoplay attribute. Kray Sangareddy's complete title and descenders are visible at 320px width with no horizontal overflow. The preview file probes as 1920×1080 and exactly 16 seconds. CSS scroll anchoring is disabled within the changing showcase to avoid browser-driven jumps when titles change position. The full final build and scoped lint pass.

## Playback/progress and bookmarked cursor follow-up — 20 September

The existing showcase now has a 21st Scroll Progress bar at its bottom, driven by actual video time or the seven-second photo clock. Clickable thumbnails switch projects; pause/resume preserves photo elapsed time. Hovering the controls no longer pauses video. Hidden shader/globe rendering and the idle particle blend surface are suspended; outgoing videos stop decoding and cannot update the next project's progress. Full gallery films remain unchanged, with the shader suspended in film mode.

All preview streams now decode at 1080p with controlled H.264 bitrates. Forrest retains the approved seconds 22–38 sequence at an even 25 fps; Kray/Lakewood retain their native ~30 fps. Files are 53–76% smaller. In this loaded desktop browser, Forrest's initial 50 fps optimized sample dropped 178/495 frames; the final 25 fps sample dropped 29/355. This is a useful local improvement, not a zero-stutter or physical-device performance guarantee. Camera movement/source blur remains in the supplied footage.

The bottom bar was visually checked at desktop and 390×844, stays inside the viewport, and tracks pause and automatic changes. Direct thumbnail selection and subsequent automatic advance work. Browser console review returned no warnings/errors. All 54 tests, scoped lint and the production build pass.

The user's OKNO bookmark list was inspected. Morphing Cursor (9643) is now applied to the existing atlas headline. Browser hover confirms the circular inverted text stays aligned and the global pointer yields over the lens. No extra copy or gallery redesign was introduced. The original retrieved source and adaptations are recorded in projects-21st-components.md.

Photo-trail removal and Typewriter check: the Projects photo trail is unmounted. The saved 21st Typewriter reveals the unchanged headline once after the entrance sheet exits. Browser DOM observed 0 → 19 typed characters with identical heading height (201.58px); morphing lens activates with no photo cards emitted. Phone viewport 390×844 has no horizontal overflow and retains the two-line headline. Scoped lint and production build pass.
