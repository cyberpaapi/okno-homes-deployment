# Projects — 21st.dev component integration

Retrieved through the connected 21st.dev MCP on 20 September 2026. Scoped to `/projects` and `/projects/[slug]`; the existing globe, ten preview pins, seven real collections and eleven supplied films remain intact.

| Component | Retrieved demo | Source | Integration |
|---|---|---|---|
| Magnetic Button | 1507 | [bundui](https://21st.dev/@bundui/components/magnetic-button) | Atlas pagination, Projects header links and menu, gallery arrows, media selectors, thumbnails, fullscreen, motion toggle, story photographs, return links |
| Paper Texture | 17693 | [paper-design](https://21st.dev/@paper-design/components/paper-texture) | Fixed decorative paper surface behind both Projects routes |

Original retrieved source is preserved in `21st-source/1507.tsx.txt` and `21st-source/17693.tsx.txt`. Adapted code lives in `src/components/projects/21st/`.

## Adaptations

- Magnetic Button retains the original cursor-distance calculation and spring constants. It uses the installed `motion/react` package, native button/Next link semantics, element-local pointer listeners instead of document listeners, restrained attraction strength and immediate reset on leave/cancel/blur. Touch and reduced-motion users do not receive magnetic displacement.
- Paper Texture retains the supplied shader and resource cleanup. Palette is warm ivory with subtle fibers and grain. Time scale is zero: the paper renders on layout/visibility changes rather than continuously. Its canvas is decorative, non-interactive and pixel-budget capped; plain ivory remains when WebGL is unavailable. Apache-2.0 license supplied alongside the original source.
- Existing layout and gallery transitions are retained. CSS harmonizes the retrieved primitives with the established sage/ivory/clay palette, circular controls, framed photograph preview and grouped media selectors.
- No new npm dependencies, external runtime requests, stock photos or generated media.

## Initial retrieval boundary (resolved)

The connected account reported the free tier with two component retrievals per day. Both above succeeded. Animated Tabs (demo 1962) returned `locked: true` and was **not** integrated or represented as retrieved source. No quota workaround or subscription purchase was attempted. More distinct 21st components require available retrieval quota.

Approved names and real-project-to-pin assignments remain pending from the client; see `projects-asset-reconciliation.md`.


## Paid connection and completed component pass

The live MCP now reports `tier: paid`, unlimited component retrieval, and hosted AI generation disabled. Additional component source was retrieved directly through the MCP; no hosted generation was used.

| Component | Retrieved demo | Source | Integration |
|---|---|---|---|
| Animated Tabs | 1962 | [preetsuthar17](https://21st.dev/@preetsuthar17/components/animated-tabs) | Measured clip-path photo/film selector; controlled selection; keyboard navigation; decorative duplicate hidden from accessibility |
| Framer Carousel Thumbnails | 19082 | [uilayout.contact](https://21st.dev/@uilayout.contact/components/framer-thumnbails) | Spring-driven photo track, velocity-aware drag, expanding thumbnails centered in their scroll container; existing keyboard/fullscreen controls remain |
| Text Reveal | 19727 | [cnippet-dev](https://21st.dev/@cnippet-dev/components/text-reveal) | Retrieved slide preset and stagger on atlas and project titles; one accessible text label |
| Liquid Morph Floating Menu | 16369 | [aayush-duhan](https://21st.dev/@aayush-duhan/components/liquid-morph-floating-menu) | Morphing mobile menu with expanding dark circle and stagger; rolling-letter links in desktop and mobile header |

All four original sources are archived under `21st-source/<demo-id>.tsx.txt`. Adaptations use existing Motion, Next Image and Next Link; no dependency was added. The supplied palette, assets and base page structure are retained. The menu uses real links, a native toggle, inert closed content, outside dismissal and Escape focus restoration. Paper fibers were made finer and lowered in opacity following browser review. Existing globe and story/lightbox transitions are retained rather than claimed as new 21st components.

Validation: lint, TypeScript/production build, and 43 tests. Browser checks cover desktop, 390px and 320px layouts; photo selection and drag; photo/film switching; fullscreen keyboard and return focus; mobile menu opening/Escape; preserved location note interaction; no console errors or warnings during these checks. Approved real-project coordinates and names remain pending.

## Dark silk direction — replaces the ivory theme

Following the client's feedback that the whitish treatment looked odd, the active Projects routes now use **Silk shader**, demo **24383**, by [sorianosantiagosam](https://21st.dev/@sorianosantiagosam/components/silk-shader), retrieved through 21st MCP. Original source is archived as `21st-source/24383.tsx.txt`; the adaptation is `src/components/projects/21st/SilkBackground.tsx`. Paper Texture remains in the source archive but is no longer rendered.

The shader's existing silk-fold function is retained, with a forest/charcoal palette, subtle grain and slow time progression. Rendering is capped at 900,000 pixels and 30 fps, suspends when hidden/offscreen, and becomes static with cursor response disabled when reduced motion is requested. The canvas is decorative, allows controls to receive pointer input, and falls back to a solid dark surface without WebGL. No generated imagery or new dependencies.

The globe keeps its projection, geographical detail, size, rotation and all ten preview locations. Ocean, land and geographic lines now use dark etched tones; pins and labels use warm mineral accents. The same palette covers the header, thumbnail selectors, controls, gallery backgrounds, fullscreen view and mobile menu. Photos retain their original colors.

Desktop and mobile gallery/menu/fullscreen reviews found no browser errors or warnings. Existing 43 tests and lint pass. Names and real-project-to-location assignments still await client approval.

## Visual-first rebuild — 20 September

The active index is now `ProjectsExperience.tsx`. It replaces the previous one-screen orbit layout. The user's later correction removes editorial slogans, photograph/film totals, project counters and redundant action captions. Only project names sit over imagery; play, next/previous and navigation controls retain accessible labels.

Every newly introduced visual pattern comes from retrieved 21st.dev source, archived under `21st-source/`:

| UI | Retrieved component | Local integration |
|---|---|---|
| Floating header | [Navbar 1](https://21st.dev/@preetsuthar17/components/navbar-1), 2046 | Rounded floating shell, entrance; supplied OKNO logo and forest palette |
| Expanding menu | Liquid Morph Floating Menu, 16369 | Same morph menu on desktop and mobile |
| Controls and links | Magnetic Button, 1507 | Pointer spring controls; native focus and link behavior |
| Ambient backdrop | Silk Shader, 24383 | Existing approved silk retained |
| Cinematic project stage | [PrismaHero](https://21st.dev/@rahil1202/components/prisma-hero), 12200 | Full-bleed client footage, shadow layer and low-set project title |
| Film player | [Hero Video Dialog](https://21st.dev/@dillionverma/components/hero-video-dialog), 1107 | Spring scale modal; local native videos, Escape, focus restoration |
| Project selection | Framer Carousel Thumbnails, 19082 | Seven actual collections, expanding image selectors |
| Scroll expansion | [Scroll Reveal Image](https://21st.dev/@unlumen/components/scroll-reveal-image), 24466 | Spring progress, clipped stage expansion, inner-image zoom; transform/clip replaces layout width animation |
| Photo composition | [Animated Gallery](https://21st.dev/@youcefbnm/components/animated-gallery), 2073 | Perspective reveal and vertically offset columns; simpler mobile flow |
| Photo overlays | [Gallery with image cards](https://21st.dev/@shadcnblockscom/components/gallery4), 692 | Multiply shadow, bottom title, hover zoom; description and Read more omitted |
| Scrolling | [Smooth Scroll](https://21st.dev/@uilayout.contact/components/smooth-scroll), 2836 | Lenis route-scoped lifecycle; native touch, anchors, modal locks, reduced-motion fallback |

Zoom Parallax (5967) was also retrieved and reviewed, but its long zoom tunnel is not rendered. No testimonial, team, or unrelated content sections were added. Existing globe geography, ten preview pins and project routing remain; project-to-pin assignments still await approved client locations.

Client logo: `Assests/Logo files/SVG/Asset 19.svg`, copied unchanged to `public/assets/projects/brand/okno-modhomes-white.svg`. Three silent landscape previews are reproducibly extracted by `scripts/prepare-project-previews.mjs`; timestamps are in `projects-preview-clips.json`. Other collections use supplied photographs. All eleven full films remain in their actual project collections. No generated footage.

Lenis integration checked against its [official documentation](https://github.com/darkroomengineering/lenis). It is destroyed on route unmount, disabled for reduced motion, stopped while films lock body scrolling, and does not interpolate touch scrolling. Native video controls and normal anchor/link semantics remain. Local dependency install replaces the prior node_modules symlink with a checkout-local installation; the shared models dependency directory is unchanged.

Automated validation: 48 tests, scoped ESLint, production build/TypeScript. Browser review recorded separately in `projects-rebuild-review.md`.

## Gallery, navigation, cursor and transition revision — 20 September

This revision supersedes the floating desktop header and the earlier slideshow/detail-gallery layout above. Original source for every item below is saved under `21st-source/<id>.tsx.txt`.

| Active visual | Retrieved 21st component | Adaptation |
|---|---|---|
| Individual project photo collection | [Masonry Lightbox — ayushmxxn](https://21st.dev/@ayushmxxn/components/masonry-lightbox), 26223 | Intrinsic-ratio columns, blur/stagger reveal, hover lift and shared-layout spring viewer. Two generous columns on desktop, one on mobile. No repeated cover, counters or other-project redirects. Added keyboard image navigation, modal focus containment/restoration and original-resolution fullscreen images. |
| Full desktop navigation | [Centered Nav Header — 7ovr](https://21st.dev/@7ovr/components/centered-nav-header), 21220 | Full-width logo / centered site links / enquiry. Existing retrieved morph menu only at tablet/mobile widths. |
| Atlas heading and gallery title | [Centered Serif Hero — felipemenezes098](https://21st.dev/@felipemenezes098/components/hero-01), 19066 | Serif typography, tight spacing and blur/y entrance. Left of the retained globe. Client content; no integration-logo section. |
| Globe-to-footage transition | [Inversion Circle Scroll Animation — ajith66310](https://21st.dev/@ajith66310/components/inversion-circle-scroll-animation), 25479 | Source sticky timeline and circle clipping. The retained globe contracts to a point; the clip expands from that same point into the existing Prisma film stage. Reversible with scroll. |
| First-entry reveal | [Preloader — gaxocif204](https://21st.dev/@gaxocif204/components/preloader), 13967 | Supplied logo scales/fades while the curved loading sheet lifts. Motion reproduces the source GSAP timeline using the dependency already installed. Waits for atlas readiness, with bounded timeout and reduced-motion fallback. |
| Global pointer | [Cursor — ibelick](https://21st.dev/@ibelick/components/cursor), 1196 + [Custom Cursor — lukacho](https://21st.dev/@lukacho/components/custom-cursor), 1527 | Motion-value spring tracking and the retrieved SVG pointer; link/press states. Native fallback for video controls, editable inputs, keyboard, touch and reduced motion. Replaces previous particle effect. |
| Atlas image trail | [Cursor Image Trail — unlumen](https://21st.dev/@unlumen/components/cursor-image-trail), 18471 | Distance-spawned, fading photo cards restricted to introductory whitespace. Three-card cap, no trail over controls/globe, no touch/reduced-motion trail. |

The detail media selector and expanding film/image thumbnails continue to use 1962 and 19082. The photographs now render through the new 26223 component, rather than the previous bespoke story sequence. Gallery Modal Accordion (24830) was retrieved and reviewed but is not rendered; its narrow strips would crop the architecture too heavily.

Fonts are self-hosted files from Google Fonts: [Bodoni Moda](https://fonts.google.com/specimen/Bodoni+Moda) and [Manrope](https://fonts.google.com/specimen/Manrope), implementing the retrieved serif/sans typography. They are not represented as fonts supplied by 21st. Media, logo, project content and the explicitly preserved D3 globe are client/existing assets; the visual components around them are the retrieved adaptations listed here.

Preview footage now comes directly from original sources, not from earlier compressed web exports: Forrest FPV at 1920×1080, Kray Sangareddy at 1920×1080 and Lakewood at 2560×1440. The extraction manifest records source paths and time windows. Full project films remain available in the gallery player; no new or generated footage was purchased.

## Approved refinements — preview sequencing and momentum

The user confirmed the Forrest opening as **Party Lawn → Mystical Pathway → central FPV rotation**. A continuous 16-second excerpt (22–38 seconds of `Forrest_FPV.MP4`) is exported to `forrest-sequence-v2.mp4`. This supersedes the earlier 34–46 second preview. It starts from zero after the globe reveal; original captions remain intact. The site's project name moves into a compact top position during playback, away from the film's lower-third captions.

The existing Prisma/Carousel components now advance after a preview's ended event; photo-only projects hold for seven seconds. Pausing, opening a film dialog, interacting with selection controls, leaving the stage or hiding the tab suspends progression. The sequence changes the selected project without moving the visitor's page scroll position. Landscape films in individual galleries autoplay muted on selection, prioritizing a landscape film where a collection also contains portrait reels. Portrait-only collections retain manual native playback.

The project-name font is now Manrope; the atlas heading remains Bodoni. The retrieved Text Reveal mask includes descender space to prevent clipping. Photo gallery structure is unchanged.

[Fluid Cursor Trail by pulkitxm](https://21st.dev/@pulkitxm/components/fluid-cursor-trail), demo **18358**, was retrieved through 21st MCP and archived. The original canvas particle lifecycle, velocity and gravity are retained with restrained ivory particles, a 64-particle cap, frame-time-based decay and no idle rendering. Touch, reduced motion, editable fields and native video controls keep their native behavior. The approved image trail remains in the atlas introduction. Existing Silk pointer response remains active behind the trail.

The Projects index now uses [Fluid Magnetic Cursor by jahed](https://21st.dev/@jahed/components/magnetic-cursor), demo **9314**, retrieved and archived as `docs/21st-source/9314.json`. Its element-centre lock and liquid size morph replace the arrow and particle trail on Projects. The adaptation uses existing Motion springs, measures only when the hovered control changes, and keeps native cursor behavior for video, form, touch and reduced-motion interaction.

The initial atlas scene has a bounded animation budget: Silk renders at 18 fps with a 360,000-pixel ceiling and no separate shader pointer listener, while the globe renders at 30 fps with a 520,000-pixel ceiling. Globe label widths are cached during resize rather than read during every frame. Both canvases still stop when the film scene takes over.

Globe drag behavior uses measured release velocity and exponential drag. It coasts then stops at the released orientation; initial ambient rotation remains until the visitor takes control. All location pins remain intact. The small momentum helper is interaction logic for the explicitly retained globe, not a newly invented visual component.

## Playback optimization and bottom progress — 20 September

Retrieved **Scroll Progress (2920)** by [skyleen77](https://21st.dev/@skyleen77/components/scroll-progress), archived under `21st-source/2920.tsx.txt`. Its left-origin spring-scaled bar is adapted in `PlaybackProgress.tsx` to actual video currentTime/duration and the photo-hold clock. There are no new captions or counters. Existing retrieved carousel thumbnails remain clickable; the bar pauses with playback, resets on selection, and indicates the next automatic change. Photo elapsed time now survives pause/resume rather than restarting the full hold.

Playback fixes: hovering thumbnails no longer pauses the video. Keyboard-focus and explicit pause behavior remain. Outgoing clips stop decoding and cannot write the current progress bar. Current previews prebuffer, and the full-screen circle mask is removed after its reveal completes. The hidden globe and silk shader stop rendering behind full-screen footage; the gallery shader rests while viewing films. The idle particle canvas is hidden to avoid a full-screen blend surface. The last silk frame is retained and animation resumes when returning to the atlas or photographs.

Preview encoding now uses H.264 High/CABAC with actual bitrate control, a two-second keyframe interval and encoder frame skipping disabled. Forrest uses an even 25 fps conversion from its 50 fps source and the approved 16-second Party Lawn → Mystical Pathway → central FPV rotation sequence; Kray retains 30 fps and Lakewood retains 29.97 fps. All are 1920×1080 for browser decoding. Outputs use new `*-stream-v3.mp4` URLs (Forrest `v4`) to avoid stale cached footage. Original media and full gallery films remain untouched.

Measured preview sizes: Forrest 34.2 → 16.0 MB; Kray 30.7 → 7.3 MB; Lakewood 26.0 → 8.5 MB. These are approximately 53%, 76% and 67% reductions. Encoding changes do not claim to remove camera motion or source blur.

## User bookmark: Morphing Cursor — 20 September

Reviewed the five items in the user's OKNO bookmark list. The pointer component is **Morphing Cursor (9643)** by [jatin-yadav05](https://21st.dev/@jatin-yadav05/components/morphing-cursor); its actual source is a text-following circular reveal, not a global replacement pointer. Original source is archived in `21st-source/9643.tsx.txt`. `MorphingText` adapts its lerp, expanding circle and counter-translated duplicate text to the existing atlas headline. The headline and layout stay unchanged. The smaller ivory lens reveals the same words in forest ink; duplicate text is hidden from assistive technology. Mouse-only activation, reduced-motion fallback, idle suspension and cleanup replace the source's perpetual RAF. The site pointer yields only over this lens. Other saved gallery/typewriter components were reviewed as metadata, not installed because the approved gallery is outside this change.

## Remove photo trail and try bookmarked Typewriter — 20 September

Removed the ProjectImageTrail mount from Projects; moving the pointer no longer spawns photo cards. Kept the approved Morphing Cursor. Retrieved the user's saved **Typewriter (1482)** by [danielpetho](https://21st.dev/@danielpetho/components/typewriter), archived in `21st-source/1482.tsx.txt`. Its single-string typing mode now reveals the existing “Homes, everywhere.” headline once at 65 ms per character after the entrance sheet exits. The original timer-driven character progression and Motion caret are adapted to reserved character space, shared state for both morphing text layers, reduced-motion static text and a stable accessible label. No cycling copy or persistent blinking caret was added.
