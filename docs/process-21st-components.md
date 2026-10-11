# Process page — 21st.dev source record

Retrieved from the authenticated `silversabre9` 21st.dev account on 23 September 2026. The OKNO bookmark list was inspected first, then catalogue search was used for a compact navigation pattern. Source and demo code—not search metadata alone—were retrieved with `21st get <id> --json` before implementation.

| Role | 21st.dev source | ID | Adaptation in `/process` |
| --- | --- | ---: | --- |
| Opening media expansion | [Scroll media expansion hero — arunachalam](https://21st.dev/@arunachalam/components/scroll-expansion-hero) | 1932 | Retains a framed-to-full-viewport media transition. Replaced wheel/touch interception with native page scroll and Motion transforms. |
| Sticky story structure | [Sticky Scroll — uilayout.contact](https://21st.dev/@uilayout.contact/components/sticky-scroll) | 2837 | Retains the full-viewport sticky composition. Removed Lenis, gallery columns and template footer. |
| Typography reveal | [Reveal Text — isaiahbjork](https://21st.dev/@isaiahbjork/components/reveal-text) | 2491 | Retains token sequencing. Replaced hover imagery and colour sweep with a masked rise and a static reduced-motion state. |
| Media loading state | [Morph Loading — jatin-yadav05](https://21st.dev/@jatin-yadav05/components/morph-loading) | 4588 | Reduced to a quiet four-point architectural loader and disabled looping motion under reduced motion. |
| Page-specific background | [Elegant Dark Pattern — jatin-yadav05](https://21st.dev/@jatin-yadav05/components/elegant-dark-pattern) | 5294 | Retains the layered radial field and masked diagonal bands. Removed the remote texture and converted the treatment to a static OKNO-specific field with no shader or idle loop. |
| Shared navigation | Centered Nav Header + Liquid Morph Menu + Magnetic Button | 21220 / 16369 / 1507 | Uses the single Models/Projects-derived Header shared across Final Showcase; see `site-integration-2026-09-27.md`. |
| Delivery handoff | [Product Timeline — hyperiux](https://21st.dev/@hyperiux/components/timeline) | 26930 | Retains the horizontal line draw, alternating milestone stems/dots and scroll-linked reveals. Adapted into a compact overlay driven by the existing Process scroll, with factual project-relative milestones and no invented dates or second smooth-scrolling runtime. |

## Content and assets

- Process copy is limited to the supplied brief/site, design, delivery handoff, base preparation, panel assembly, completion and handover sequence. Delivery is represented as a restrained milestone rail rather than an invented truck scene, moving directly from the resolved design into the on-site panel-build progression.
- On 27 September the user explicitly requested the 90-day build schedule already present on About. The opening now says **Built in 90 days.** The Product Timeline rail gives Days 01—10 brief/site, 11—25 design/approvals, 26—60 manufacturing, 61—72 packing/transport and 73—90 assembly/handover. The conceptual panel-build subshots are not assigned invented separate durations.
- The opening land, drawing and design-lock sequence remains the supplied process film. On 27 September 2026, the user authorised a new same-site continuation: prepared base, wall-panel erection, roof/glazing closure and completion. These are explicitly treated as conceptual transformation frames—not documentary factory/site photography—and retain the earlier films' elevated camera, shoreline environment, blue-green dusk grade and restrained cyan registration language.
- Production WebP derivatives live in `public/process/generated/`; full-resolution PNG sources, the contact sheet and motion constraints live in `artifacts/process-video-frames/veo3-panel-continuation-v1/`. No truck, carrier, crane or factory cutaway is used in the active sequence.
- The base-to-walls, walls-to-roof and roof-to-handover stills are now replaced by reviewed 1080p Higgsfield films with 720p tablet/mobile fallbacks. Job IDs, rejected candidates, local corrections and the credit record are preserved in `artifacts/process-video-renders/higgsfield-v1/README.md`.
- The old-to-new media boundary now holds the Design-Lock film on its true final frame, reveals the prepared base and stacked structural panels from left to right, and then dissolves into the matching first frame of the wall-build film. The 21st-derived delivery rail maps design lock, dispatch, site arrival and assembly across that handoff. Stage copy follows raw scroll position while media opacity keeps its eased Motion timing; video seeking is frame-batched from raw scroll so stale spring updates cannot queue behind the user's position.
- The Gemini sparkle was previously removed from the Drawing and Design-Lock responsive films and their poster frames. The remaining visible `Veo` mark was removed from the Land HQ film, scrub film and poster on 27 September 2026, then verified across the full eight-second bottom-right region. Originals are preserved under `tmp/process-source-backup-2026-09-23/` and `tmp/process-source-backup-2026-09-27/`.

## Typography and licensing

- Interface copy uses the existing local Geist files.
- Display copy uses the existing local Bodoni Moda file. Its bundled `public/fonts/bodonimoda-OFL.txt` confirms the SIL Open Font License 1.1. No remote font request was added.

## Client content still needed

- Authentic landscape panel-assembly and interior-completion footage, if the conceptual sequence is later replaced with documentary media.

Until authentic footage arrives, the last three stages use clearly conceptual, generated continuation frames plus restrained factual text. They must not be presented as records of an actual OKNO installation.

## Final Showcase consolidation — 27 September 2026

Imported the reviewed latest Process implementation and 19 referenced public media derivatives from `OKNO-homes-demo` into Final Showcase. The updated panel-build films are 1080p desktop / 720p tablet and mobile, with raw-scroll frame-batched seeking and the reviewed design-lock-to-base registration transition. The existing shared Header and the user-requested 90-day schedule are retained. No generation was performed during consolidation; raw/private generation sources were not copied. Prior Final Showcase files and SHA256 import manifest are preserved under `../output/landing-refinement-2026-09-27/before/process/`.

The imported production derivatives remain conceptual process illustrations, not documentary evidence of an actual OKNO installation. Historical raw-artifact paths above refer to the Demo provenance workspace and are not public Final Showcase assets.

## Process redevelopment - 30 September 2026

- Rebuilt the page from its opening hierarchy through the footer. The page now has one H1, stage-level H2 headings inside the main scroll narrative, one detailed-timeline H2 with phase-level H3 headings, and a closing H2.
- Reused the retrieved 21st.dev Silk Shader `24383` from Projects as a low-budget, non-interactive forest backdrop. The Process instance is capped at 260,000 pixels and 12 fps, pauses through the shader's existing visibility handling and becomes static for reduced motion.
- The land film now autoplays inside the opening frame. Native scroll expands that same surface to the viewport before the stage copy and bottom Product Timeline appear. There is no synthetic rolling day counter; approved day ranges live only in the bottom sequence.
- Reworked the Product Timeline `26930` into a bottom rail at every breakpoint. It retains the source's scroll-linked line draw and milestone progression while adding a poster thumbnail and approved day range for each stage.
- All six available Process film pairs are attached in sequence: land scan, drawing scan, design lock, wall assembly, roof and glazing, and completed home. The active and next films are loaded by media readiness rather than `networkState`, because source-backed videos can be idle without being metadata-ready. The final handover remains the real `panel-complete` video through its completed-home final frame; no still image is overlaid.
- Added a second, detailed five-phase timeline below the film using the approved Days 01–10, 11–25, 26–60, 61–72 and 73–90 schedule. Its images come from the existing Process media set; transport is described as sequencing for site and is not represented by invented transport footage.
- Footer Section `2071` was restored as the root-mounted minimal footer on 5 October 2026. Process inherits it from the shared layout and does not render a duplicate footer.

## Historical survey path detail timeline — superseded 7 October 2026

The detailed five-phase section below the film previously used a custom Process-specific survey route. It measured the rendered phase markers on layout and resize, then drew one thin, rounded angular SVG path as the visitor scrolled normally. The phase plates alternated along the route, while their photographs, titles, copy and approved day ranges remained in document flow. Mobile used the same component with the markers aligned into a compact left edge path. Reduced motion displayed the complete route. The Process section background gradient, page-level Silk, existing fonts, film and compact six-stage rail were unchanged.

This is original geometry and layout informed by [Sperotto's history scroll example on Awwwards](https://www.awwwards.com/inspiration/history-scroll-animation-sperotto-s-p-a) and the previously researched [SVG follow scroll by reuno-ui on 21st.dev](https://21st.dev/@reuno-ui/components/svg-follow-scroll). No 21st.dev component source was imported or adapted for this change. About already has a flowing zigzag with a moving dot and coordinates; Process uses a restrained angular route without those features. The implementation plan and original-file rollback copy are in `docs/process-survey-path-plan-2026-10-07.md` and `docs/archive/process-detail-timeline-before-survey-path-2026-10-07/`.

All five earlier local phase images are retained for client review. `factory-manufacturing-hd.png` was the least coherent image because it was brighter and showed an almost finished home. That image set was subsequently replaced by the [photoreal concept series](process-photo-series-2026-10-07.md). The transport rendering is not used.

## Active award-history detail scroll — 7 October 2026

The client clarified that the desired reference was the [Sperotto History Scroll Timeline on Awwwards](https://www.awwwards.com/inspiration/history-scroll-animation-sperotto-s-p-a), not the previously implemented zigzag route. The [live Sperotto history page](https://www.sperottospa.com/en/company/history) was inspected: a full-screen chronology advances imagery horizontally as the visitor scrolls vertically; the large date remains a primary focal point, with accompanying story copy beside the image. [Studio375's project description](https://375.studio/en/projects/sperotto-spa) also describes images and dates emerging progressively on scroll.

The active `ProcessDetailTimeline.tsx` now implements that interaction as one five-slide, sticky horizontal sequence. Native vertical scroll drives a single Motion transform on the image/story track. Each slide presents a prominent **Days 01–10**, **11–25**, **26–60**, **61–72**, or **73–90** range beneath its image, with the existing phase title and copy alongside. No second scroll runtime, route SVG, dot markers, extra font, new button, or hover control is included. The Process background gradient, page-level Silk, film, compact build-sequence rail, CMS keys, and five recently generated photographs are retained. Reduced-motion CSS converts the same five articles into a static vertical list.

The 7 October follow-up adds one continuous line below the pinned stages, five fine ticks, and a scroll-linked fill using the existing `scrollYProgress` value. Each later photograph gets a single restrained scale-and-opacity entrance as it comes into view; the day range and copy remain still and readable. Short mobile viewports switch the same content to a vertical line and natural document scroll so the bottom rail cannot cover copy. Reduced-motion mode also keeps a static vertical line beside the stacked stages and suppresses the card entrance.

Follow-up checks: focused Process tests (2/2), TypeScript and focused lint passed. The final production build generated a new `BUILD_ID` and the website launcher verified all 15 routes and 21 stylesheets; its original command session was interrupted before the exit code could be captured. The production `/process` HTML contains one line, one fill and five ticks; `/process` and `/admin` both returned HTTP 200 on their fixed ports. Rendered visual and scroll inspection is still unavailable under the browser tool's localhost security block, so motion feel and breakpoint spacing need user review in the live preview.

This is functional OKNO code adapted from the observed behavior. The Awwwards entry and live site do not provide a reusable component source, and no Sperotto source code was copied. The immediately preceding survey-route TSX/CSS is preserved byte-for-byte outside runtime code under `docs/archive/process-detail-survey-before-award-history-2026-10-07/` (SHA-256 TSX `f9031ed218d5be73c62f40931a523c501501b4bb9562e7aad5a6610b3adb4630`, CSS `cf57f5eaf22a7dc13c1fa2278144c964dc045220c6f1f67354e98e1dcc2d6a10`). Reverting means restoring those two files into their original `src/components/process/` paths; there is only one active timeline implementation.

Verification: the focused Process tests (2/2), TypeScript check, focused lint, and production build passed. The served `/process` and `/admin` routes returned HTTP 200 on ports 3134 and 3140. Browser-based visual and interaction inspection could not be completed because the browser tool's security review blocked the localhost inspection; smoothness, image crop, and breakpoint layout therefore remain unverified in a rendered browser.

### Admin continuation — 7 October

The page-first Content Studio now exposes the active five-slide chronology's day range, heading, copy, current photograph and alt description for each fixed phase, following the public visual order after the six film chapters. The compact rail's own text and accessible label are editable as well. Public and admin defaults for the five phase photographs share `src/data/processDetailPhases.ts`, so no obsolete Process image set appears in an untouched editor. The public scroll geometry, animation and chapter cue points are unchanged. Admin controls reuse documented 21st.dev adaptations already in `docs/admin-system.md`; this continuation adds no new component source. The earlier visual-verification limit above is historical; current admin/public browser testing is tracked in the new admin checklist.

## Native-speed chapters — 11 October 2026

The user now authorizes six scroll-triggered chapter stops and full-width detail-timeline geometry. Existing 21st.dev adaptations retain their source provenance; no new third-party component is used. Process Silk runs at 30 fps / 320,000 pixels and pauses when covered by the opaque full-screen film. The six-stage rail gives the days and phase labels greater weight and removes the large backdrop blur. The accepted original masters stay byte-identical; native 1× playback replaces repeated currentTime seeking. A separate completed-home cover transitions through the existing expanding frame, then fades into decoded playback. The five-phase track uses a damped horizontal transform with full viewport width and inner copy spacing. See [the current implementation and verification ledger](process-optimization-2026-10-11.md).

## Continuous-scroll correction — later 11 October 2026

The user supersedes the preceding chapter-lock experiment: restore smooth bidirectional scroll, remove its new playback buttons/transition overlays, and move through the film faster. Existing Scroll Media Expansion Hero, Silk, rail and detail timeline adaptations retain their original provenance. The accepted cover expands continuously, then blends into the original-packet film renderer; captions follow presented frames without moving overlapping layers. No new 21st.dev component is used. The detailed timeline width/typography remain. Current decisions and acceptance are in [the scroll revision ledger](process-scroll-revision-2026-10-11.md).
