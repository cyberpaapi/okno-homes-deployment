# Configurator UI refinement using 21st.dev — 12 October 2026

## Scope and plan

Owner authorized refining this page's whole UI with popular, highly downloaded 21st.dev components and existing OKNO styling. Remains local; same supplied cabin, unchanged scene/model/helper/textures, five register application groups and approved finishes. Preserve earlier UI in `../Configurator/archive/configurator-before-21st-ui-2026-10-12.zip`.

Work boundaries: source research and preservation → route-local control components → shared-header reuse and responsive composition → focused tests, browser verification and integrity checks. No shared-header source edits, admin work, new 3D assets, Blender, remote operations or deployment.

## Actual source and popularity evidence

Retrieved full Component and Demo code through `21st.get_component`, not search metadata. Original component source retained in `docs/21st-source/configurator-1428.tsx.txt`, `configurator-990.tsx.txt` and `configurator-1962.tsx.txt`.

| Source | Author | Demo / component ID | Observed category downloads / bookmarks | Adaptation |
| --- | --- | --- | --- | --- |
| [Expandable Tabs](https://21st.dev/@victorwelander/components/expandable-tabs) | Victor Welander (`victorwelander`) | 1428 / 272 | 2,355 / 3,246 | Controlled selection for application filters and camera views; retain icon-to-label expansion and motion variants; meaningful aria labels/pressed state, keyboard focus and reduced motion; existing Motion and CSS Modules replace utility classes/usehooks dependency |
| [Dock](https://21st.dev/@ibelick/components/dock) | Julien Thibeaut (`ibelick`, Motion Primitives) | 990 / 233 | 1,606 / 2,984 | Retain context, pointer-distance transform, spring width and hover/focus tooltip composition; wire native buttons to existing scene backgrounds; restrained magnification, fixed sizing on touch/reduced motion, OKNO palette |
| [Animated Tabs](https://21st.dev/@preetsuthar17/components/animated-tabs) | Preet Suthar | 1962 / 1786 | Not selected on popularity grounds | Source inspected and retained as a comparison only; not used in this page |

Counts captured from public category-page metadata on 12 October, not personal bookmarks. Dock led both metrics among 39 returned dock demos; Expandable Tabs led both among 199 returned tab demos. Scope is the returned category data, not an absolute all-catalogue rank. Individual component pages showed older cached download counts (Dock 1,545; Expandable Tabs 2,192); the category snapshot is the comparison basis. Exact inspected entries: [popularity evidence](configurator-21st-evidence-2026-10-12/catalogue-popularity.json).

Header reuses `src/components/Header/Header.tsx` unchanged, including its existing Centered Nav Header 21220 by 7ovr, Liquid Morph Floating Menu 16369 by aayush-duhan, and Magnetic Button 1507 by bundui. Source URLs and retained originals are in [shared-site integration](site-integration-2026-09-27.md). Typography, real wordmark, navigation geometry, menu behavior and warm gold/charcoal/cream treatments remain consistent with the main website.

The source's arbitrary default/sample links and decorative demo content are omitted; only existing site navigation, viewer settings and material choices are wired. No new price claims or numbered labels.

## Verification

Complete locally. The supplied page now uses the actual shared header, controlled Expandable Tabs adaptations for five application filters and six camera presets, and a Dock adaptation for the five existing scene backgrounds. Lighting and turntable controls remain wired to the original scene API. Material swatches use the original files in a two-column sample layout. Cabin dimensions and the shared-interior preview caveat remain available; hiding and reopening finishes preserves current selections.

- TypeScript, scoped zero-warning ESLint and `git diff --check` passed. Focused register, customer UI, shared Header and SiteFrame suites passed: 4 files / 35 tests.
- Browser verification at 1440×900, 390×844 and 795×890: one shared header, ready WebGL canvas, no horizontal document overflow, visible lighting controls, reachable scene and camera controls. No browser warning/error console entries captured. A scoped CSS precedence conflict was corrected so the canvas uses the available workspace rather than extending beneath the material panel.
- All five application categories were exercised. Selections verified: Castile Crest roof, Ivory Armor external wall, Tuscan Elegance flooring, Ontario Hemlock internal ceiling, Alpine White internal wall. The material panel retained the selected finish after hide/show. Existing internal selections remain separate in the UI and use the same shared-timber preview limitation as before.
- Scene Dock/background, daylight/golden hour, camera Hero and turntable behavior were verified. Keyboard Enter selected Forest and displayed its focus tooltip; Turntable toggled on and off with its pressed state. The shared phone menu opened with the site's real navigation and closed with Escape; normal browser sizing was restored afterward.
- [Desktop evidence](configurator-21st-evidence-2026-10-12/desktop.png) and [phone evidence](configurator-21st-evidence-2026-10-12/phone.png). These are viewport checks, not physical-device performance claims.
- Text contrast against the actual UI surfaces passed: muted text 5.58:1, primary text 11.52:1, inactive controls 6.41:1, selected controls 11.07:1. Source transitions respect reduced motion; scene autorotation remains disabled for reduced motion by the original wrapper.
- Original scene source/helper and 32 textures passed the preserved SHA-256 manifest. Generated runtime scene exactly matches its mechanical transpilation. No original 3D assets, model geometry, source scene behavior, catalogue data or shared Header implementation changed.
- Current local Configure URL returned HTTP 200. The existing 3134 website process is reused and left running. No dependency/package change, second website, admin write, deployment or remote operation was needed.

The earlier `supplied.css` stays preserved beside the input source; the active page uses scoped `Configurator.module.css`/21st control styles and the retained backdrop-only `environment.css`. No shared/global website design was rewritten.


## Loading recovery and short-screen controls — 16 October 2026

House fetches now abort after 45 seconds, dispose a failed scene and offer a local retry. The retry reuses the existing [Subtle Button](https://21st.dev/@jatin-yadav05/components/subtle-button), author `jatin-yadav05`, component/demo `3373`; actual archived source `docs/21st-source/revision-3373.tsx.txt` was read. The shared native-button adaptation and paper tone retain its border, sheen and dot; the action only restarts the selected house load. No replacement catalogue component or 3D/media asset was introduced. Small-phone and short-landscape layouts keep the bottom controls within the visible viewport and use a compact model heading/material list. Loading failure, retry and stalled-request cancellation have regression coverage.

## Touch target sizes — 10 November 2026

Owner-approved phone usability pass. The Expandable Tabs (1428) and Dock (990) adaptations keep their structure, motion, tooltips and labels; only sizes change on touch screens (`pointer: coarse`). View, application and lighting buttons, the turntable and finish toggles and the panel close button are 44×44 at every touch width (several were 30–40px). Phone control rows use 8px outer margins, no gap between view buttons and 2px scene-group spacing; dock items are 44px tall and, below 390px, share the remaining row width (38–43px). Tablets and phones held sideways (761–1120px) keep the single row with 12px margins and tighter view and dock groups. The compact rules below 360px are unchanged.
