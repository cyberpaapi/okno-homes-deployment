# OKNO Homes — Post-Demo Optimization Roadmap

**Date:** 26 August 2026  
**Status:** Planning baseline after the first client demo  
**Primary rule:** Mobile readiness and production reliability come before further visual expansion.

## 1. Purpose

This document converts the first demo review into a prioritized execution plan. It records what is visibly wrong, what is already working, what can be improved now, and what must wait for verified client content.

This is a roadmap, not approval to generate new media or redesign every page immediately. New client feedback can be appended without losing the decisions already captured here.

## 2. Executive decision

The next release will be approached in this order:

1. **Make the deployed site correct and mobile-safe.** Fix missing runtime assets, horizontal overflow, touch behavior, viewport problems, media loading, and route-level errors.
2. **Repair the first impression.** Replace the Home journey media and make its mobile presentation coherent.
3. **Rebuild Projects as the strongest proof page.** Restore the working globe first, then create the large rotating globe-to-projects experience once real project content is supplied.
4. **Simplify high-traffic selection and editorial surfaces.** Improve the Models entry page and Journal without changing the approved Signature or Bespoke experiences.
5. **Refine pages that already have a useful base.** Complete Process, enrich About, and evolve Enquiry's material language.
6. **Hold content-dependent redesigns.** Do not rebuild Hospitality or the main Sustainability story until the client supplies the promised content and detailed direction.

## 3. Priority system

- **P0 — Release blocker:** broken production behavior, unusable mobile layout, missing assets, inaccessible interaction, or severe performance failure.
- **P1 — First-impression/product blocker:** a page works, but materially weakens trust or the product story.
- **P2 — Quality and completeness:** the direction is usable but visually thin, inconsistent, or incomplete.
- **P3 — Content-blocked/backlog:** direction depends on client assets, facts, or approval.

## 4. Consolidated issue register

| ID | Route/system | Observation | Priority | Decision |
|---|---|---|---|---|
| G-01 | All routes | The deployed experience is not yet proven mobile-first. | P0 | Establish one responsive foundation and a route-by-route mobile release gate before page redesigns. |
| G-02 | All routes | Heavy video, sticky scenes, canvas work, and scroll listeners can compete on phones. | P0 | Audit loading and runtime cost; mount or play only what is visible and provide mobile fallbacks. |
| G-03 | Visual system | The shared Sustainability/Geist type direction works, but the site feels monotonous. | P1 | Keep the type system; introduce a restrained, page-specific accent-token system. |
| G-04 | Visual system | Counters, coordinates, progress rails, scroll labels, and trackers appear without enough meaning. | P1 | Remove decorative instrumentation. Keep an indicator only when it helps orientation or interaction. |
| HOM-01 | Home `/` | The aerial/bird-view journey contains random pop-ins and visibly unstable AI motion. | P1 | Replace the media; do not attempt to hide architecture mutation with UI overlays. |
| PRJ-01 | Projects `/projects` | The deployed globe shows no land map. | P0 | Restore the missing GeoJSON asset and add a visible failure fallback. |
| PRJ-02 | Projects `/projects` | Location pins are not visible in production. | P0 | Verify after PRJ-01, then diagnose canvas scaling, visibility, and production behavior separately. |
| PRJ-03 | Projects `/projects` | The page is underdeveloped: inline styling, repeated placeholder images, non-functional filters, and `#` links. | P1 | Rebuild the page around a working hero globe and a real project archive/content model. |
| MOD-01 | Models entry `/models` | The Signature/Bespoke selector has unnecessary counters/metadata and inconsistent utility typography. | P1 | Simplify only the entry page. Preserve `/models/signature` and `/models/bespoke`. |
| HOS-01 | Hospitality `/hospitality` | The sideways/curved scrolling story mechanic was rejected by the client. | P3 | Hold redesign until client content arrives; do not polish the rejected interaction. |
| HOS-02 | Hospitality | News/publication screenshots feel like raw evidence rather than designed content. | P3 | Convert verified material into editorial proof cards, not enlarged screenshots. |
| PRO-01 | Process `/process` | Core direction is good, but background media, darkness, and final page completeness need work. | P2 | Preserve the scroll logic; replace/grade the media and complete only verified stages/content. |
| SUS-01 | Sustainability `/sustainability` | Hero media is strong; the later scroll-controlled video is not. | P3 | Preserve the hero and wait for detailed client direction before replacing the story media. |
| SUS-02 | Sustainability | A white interstitial with a black/green growing line feels random. | P1 | Remove or redesign the paper-curtain ending transition; it is not earning its scroll length. |
| JOU-01 | Journal `/journal` | Hero video has disappearing trees and unnatural motion. | P1 | Replace with unique, stable Journal media; do not reuse About media. |
| JOU-02 | Journal | Scrolling stories/publications work; the blog/archive section is weak. | P2 | Preserve the rounded marquees and redesign the archive hierarchy/cards. |
| ABO-01 | About `/about` | Hero repeats Journal media and the atmospheric background reads as generic AI/cloud imagery. | P2 | Create a distinct About media brief and use brand-grounded texture/material. |
| ABO-02 | About | Scroll reveals work, but the page feels empty. | P2 | Add verified people, process, recognition, and studio context—not decorative filler. |
| ENQ-01 | Enquiry `/enquiry` | The flow works, but the material treatment feels too close to Apple liquid glass. | P2 | Move toward tactile tonal material and elevation without copying Google Pixel UI. |

## 5. Confirmed deployment defect: Projects globe

The globe component fetches:

```text
/assets/geo/world.geojson
```

The unified source contains `public/assets/geo/world.geojson` (approximately 247 KB), but the deployment repository does not. This directly explains the missing land shape.

The markers are drawn separately on the same canvas, so their absence must not be assumed to have the same cause. After restoring the map asset, test marker projection, canvas scaling, color contrast, device-pixel-ratio handling, and animation state on the deployed build.

Required hardening:

- check `response.ok` before parsing the GeoJSON;
- expose a graceful static fallback instead of silently drawing an empty sphere;
- pause rotation when the globe is off-screen;
- respect reduced motion;
- support drag on touch without trapping vertical page scroll;
- provide a keyboard/list alternative for every project pin;
- verify the exact production asset path in a clean build.

## 6. Phase 1 — Mobile-first foundation (P0)

No full page redesign is considered complete until this phase passes.

### 6.1 Shared layout system

- Use one spacing scale, page gutter, content width, header height, and vertical rhythm across light-site routes.
- Replace route-critical inline styles with responsive modules/tokens.
- Ensure no page has unintended horizontal scrolling at 320–430 px widths.
- Use modern viewport units with safe-area padding where full-screen sections are required.
- Avoid fixed `100vh` assumptions that break under mobile browser chrome.
- Collapse pinned/sideways experiences into natural vertical reading when the interaction does not translate to touch.

### 6.2 Touch and navigation

- Minimum practical touch target: 44 × 44 CSS px.
- Do not require hover to reveal essential text or actions.
- Shared mobile navigation must open, close, return focus, and identify the active route.
- Sticky sections must never trap scroll or fight native momentum.
- Canvas gestures must distinguish horizontal globe rotation from vertical page scrolling.

### 6.3 Mobile media policy

- Do not preload every page video.
- Use posters immediately and load below-the-fold motion near the viewport.
- Keep only one heavy scroll-scrub video active at a time.
- Supply a lighter mobile derivative when the desktop source is unnecessarily large.
- Use muted, inline playback only where autoplay is intentional.
- Provide a static composition for reduced-motion users and a usable fallback for failed media.
- Do not use a desktop crop as the only mobile art direction; define the subject-safe portrait crop/poster.

### 6.4 Mobile verification matrix

Every public route must be checked at minimum at:

- 320 × 568 — narrow/legacy baseline;
- 360 × 800 — common Android baseline;
- 375 × 667 — compact iPhone baseline;
- 390 × 844 — current iPhone baseline;
- 430 × 932 — large phone baseline;
- 768 × 1024 — tablet handoff;
- one real iOS Safari device and one real Android Chromium device before release.

For each viewport, record navigation, text wrapping, overflow, touch controls, video fallback, sticky behavior, form keyboard behavior, modal escape/close, and console/network errors.

## 7. Phase 2 — Performance and deployment reliability (P0)

### Required work

- Create an explicit runtime-asset manifest so fetched JSON/media cannot be omitted again.
- Validate every absolute asset URL against a clean deployment copy.
- Add a post-build route/asset smoke test for all eleven routes.
- Audit how many videos, canvases, requestAnimationFrame loops, and scroll listeners are active per route.
- Pause work when a page is outside the viewport or the document is hidden.
- Prefer transform and opacity motion; avoid live blur/filter work on mobile.
- Serve correctly sized responsive images and eliminate duplicate placeholder downloads.
- Record production performance before and after changes rather than optimizing from intuition.

### Release targets

- zero missing runtime assets or route 404s;
- zero uncaught console errors;
- no visible layout shift from fonts or media posters;
- responsive interaction within one tap/gesture;
- no scroll jank from simultaneous canvas/video loops;
- reduced-motion path available for every major animated page.

## 8. Phase 3 — First-impression pages

### 8.1 Home `/` — replace the journey media (P1)

What remains:

- the core scroll-to-travel idea;
- architectural product focus;
- live HTML labels/hotspots where they communicate real features.

What changes:

- replace the current aerial/bird-view source;
- remove random pop-ins, morphing geometry, appearing/disappearing vegetation, and unstable bird/camera movement;
- simplify hotspot/transition UI if it competes with the home;
- create a coherent mobile framing rather than shrinking the desktop scene.

Media approval gate:

1. Confirm the real/company base render or geometry.
2. Approve the start, middle, and end stills.
3. Approve a short motion proof at low cost/resolution.
4. Check architecture, vegetation, shadows, and camera path frame by frame.
5. Only then create the final desktop and mobile derivatives.

Do not spend generation credits or integrate a new master without explicit approval.

### 8.2 Projects `/projects` — rebuild as proof, not a placeholder archive (P1)

Proposed information architecture:

1. **Living map hero:** a large, slowly rotating globe with clearly visible land and accessible project markers.
2. **Active project preview:** selecting a pin reveals a restrained title, location, type, date/status, and verified image.
3. **Scroll handoff:** the globe yields naturally into the archive; it may reduce/stick briefly but must not trap mobile scroll.
4. **Project chapters/cards:** large exterior-led cards with rounded geometry, location, category, status, and a real detail action.
5. **Filter/archive layer:** only keep filters once they work against real structured data.
6. **Enquiry handoff:** contextual CTA after the proof sequence.

Mobile behavior:

- globe is large enough to understand, but does not consume several empty screens;
- one-finger horizontal drag rotates; vertical intent scrolls the page;
- pins are paired with an accessible project list/carousel;
- project cards are single-column and image-led;
- filters become a compact horizontal control or simple select only if needed.

Content gate:

- real project list and status;
- approved names, locations, categories, dates, and facts;
- verified project images and usage rights;
- clarity on which projects may have individual detail pages.

### 8.3 Models entry `/models` — simplify the choice (P1)

Scope is limited to the two-path selection page.

- Remove `01`/`02`, redundant overlines, decorative seam/progress language, and unnecessary metadata.
- Use the approved site type system instead of route-local mono/serif drift.
- Keep one strong exterior image, title, one-sentence distinction, and one action per path.
- Ensure both paths are immediately legible on mobile without requiring hover.
- Keep the transition restrained and fast; navigation must remain immediate under reduced motion.

Do not alter the established `/models/signature` product experience or `/models/bespoke` journey as part of this task.

## 9. Phase 4 — Editorial and trust pages

### 9.1 Journal `/journal` (P1/P2)

Preserve:

- the rounded scrolling publication/story cards;
- the editorial motion direction;
- the separation between publications, awards, and stories.

Change:

- replace the hero video with a unique, physically coherent Journal source;
- remove disappearing trees and AI motion artifacts;
- redesign the archive/blog as an editorial reading system rather than a generic card grid;
- clarify story category, title, date, reading time, and action;
- use rounded but restrained image containers;
- stop marquees for reduced motion and allow manual mobile browsing.

### 9.2 About `/about` (P2)

- Use distinct media; About and Journal must not share the same hero.
- Replace generic cloud/AI ambience with tactile, brand-grounded material: subtle paper, stone, metal, timber, plan lines, or verified studio imagery.
- Keep the current reveal pacing, which is working.
- Add content density through verified substance: origin, people, design principles, manufacturing/studio process, recognition, and project evidence.
- Avoid filling emptiness with invented metrics, decorative counters, or unverified claims.
- Give About its own accent while retaining the shared typography.

### 9.3 Enquiry `/enquiry` (P2)

- Preserve the clear step selection and compact form flow.
- Move away from a direct liquid-glass impression.
- Use tactile tonal surfaces, restrained elevation, clearer pressed/selected states, and warm material depth.
- Treat Google Material/Pixel as an interaction-quality reference, not a UI to copy.
- Verify mobile keyboard, select menus, validation, focus visibility, error messages, and completion state.

## 10. Phase 5 — Process completion (P2)

Preserve the current scroll-driven process direction, but complete it deliberately.

- Replace or regenerate background media with stable geometry and intentional stage transitions.
- Re-grade darkness so architectural detail remains readable behind live copy.
- Ensure mobile uses a readable sequence rather than forcing desktop scrub behavior.
- Confirm the final stage structure and facts with the client before publishing timelines, factory claims, tolerances, delivery periods, warranties, or logistics details.
- Add the missing completion layer only when content is verified: stage conclusion, FAQ/decision support, and enquiry handoff.
- Remove any ornamental progress notation that does not help users understand their current stage.

## 11. Phase 6 — Content-blocked pages

### 11.1 Hospitality `/hospitality` (P3 — hold)

Do not refine the rejected sideways/curved story rail.

When client content arrives, rebuild around:

- a clear hospitality proposition;
- real projects/stays and approved images;
- concise case-study chapters;
- designed editorial proof rather than raw news screenshots;
- verified publication masthead, headline, excerpt, date, and link where permitted;
- operator/developer enquiry handoff.

Screenshots may be source evidence, but they should not become the final visual design by simply enlarging or tilting them.

### 11.2 Sustainability `/sustainability` (P3 — partial hold)

Preserve the praised hero video. Do not replace the main scroll story until the client supplies detailed direction.

The previously observed dark/black blank page is no longer present and is not an active task. Reopen it only if it can be reproduced in a named browser/viewport.

Work allowed before that input:

- remove or shorten the random paper-curtain/white-line interstitial;
- mobile/performance fixes;
- graceful media fallbacks;
- accessibility and reduced-motion fixes;
- verify that any achievements or material claims are factual.

## 12. Accent-color and material system

The site should not solve monotony by assigning random colors to pages.

Create one shared neutral foundation and one approved accent family per route group:

- Home/Models: architectural obsidian, forest, and antique gold;
- Projects: proof-led neutral base with a high-contrast map/pin accent;
- Process: technical construction accent;
- Sustainability: forest/lichen accent already established;
- Journal: editorial accent;
- About: warmer human/studio accent;
- Enquiry: tonal material states derived from the light-site palette.

Exact colors must be checked together as a brand system. Each route accent needs accessible text/focus states and should appear in meaningful controls, highlights, or transitions—not as arbitrary decoration.

## 13. Remove decorative instrumentation

Audit and remove the following unless each item communicates real state:

- `01 / 09`, `01 / 02`, and similar counters;
- coordinates and location strings used only as ornament;
- progress rails on short or obvious sections;
- scroll instructions after the interaction is already apparent;
- corner brackets, focus marks, tracking bars, and diagram lines with no function;
- mixed monospace metadata added only to make the page feel technical.

Meaningful model specifications, project locations, stage names, filters, and accessibility status remain.

## 14. Inputs required from the client

Request these as one structured content package:

### Projects

- approved project inventory;
- project status and location precision;
- approved exterior images/renders;
- project categories and detail-page permissions;
- which pins can be public.

### Hospitality

- final proposition and audience;
- real properties/case studies;
- testimonials approved for publication;
- publication links and usage rights;
- preferred CTA and enquiry audience.

### Process

- verified process stages;
- approved time, logistics, factory, quality, warranty, and site claims;
- usable factory/site/drawing media.

### Sustainability

- detailed story direction;
- verified metrics, certifications, material facts, and partners;
- approved replacement media references.

### Global media/brand

- preferred accent directions;
- original company renders/video/3D assets;
- examples of motion that the client considers natural;
- explicit approval of people, properties, press, and awards shown publicly.

## 15. Execution order and gates

### Immediate stabilization

1. Restore and verify `world.geojson` in the deployment repository.
2. Verify Projects pins in production.
3. Run the complete mobile route audit and record blockers.
4. Fix shared navigation, overflow, viewport, touch, and media-loading failures.
5. Establish a clean performance baseline.

### First design release

6. Replace Home journey media after still/motion approval.
7. Build the responsive Projects shell and working globe behavior.
8. Simplify the Models entry page.
9. Replace Journal hero media and redesign the archive/blog hierarchy.

### Second design release

10. Enrich About with approved content and distinct media/material.
11. Refine Enquiry's tonal material system.
12. Complete Process after facts and replacement media are approved.

### Client-content release

13. Rebuild Hospitality from the supplied content.
14. Rework Sustainability's main story after detailed direction.
15. Replace placeholders, perform final accessibility/performance QA, and promote the approved build to production.

## 16. Definition of done

A page is not done because it looks correct in one desktop browser. It is done when:

- content is verified and placeholders are clearly identified or removed;
- all links, filters, markers, forms, and controls work;
- mobile, tablet, desktop, keyboard, and reduced-motion paths pass;
- no required information depends on hover;
- media is stable, correctly framed, optimized, and has a fallback;
- the page has no missing assets, console errors, or unintended overflow;
- motion supports hierarchy instead of adding counters/trackers/noise;
- the production deployment is checked, not only the local build;
- the client has approved the content and visual direction for that route.

## 17. Current assessment status

This document is the complete planning deliverable from the first demo review. No page redesign, media generation, credit spend, deletion, Git push, or production deployment is authorized by this document alone.

The next implementation action should be the deployment-correctness and mobile audit package, beginning with the missing Projects map asset. New feedback received tomorrow or the following day should be appended to the relevant route section and reprioritized without discarding this baseline.

## 18. Client feedback intake template

Append new feedback using this structure:

```markdown
### YYYY-MM-DD — Route or global system

- Source: client / internal review / production QA
- Exact observation:
- Device, browser, and URL:
- Screenshot or recording:
- Expected outcome:
- Content or asset dependency:
- Proposed priority: P0 / P1 / P2 / P3
- Decision:
- Status: new / accepted / blocked / implemented / verified
```

Keep the client's observation separate from the team's proposed solution. A visual preference is not automatically a technical diagnosis, and a proposed redesign is not implementation approval.
