# Testimonials refinement - 26 November 2026

Owner issue OKNO-063 supersedes the initial text-only design. The page now has green silk, frosted cards, six-second automatic advancement, images above quotes, and fictional names with two location lines below. The owner approved one preview disclosure instead of repeated sample labels. The mobile menu button's existing gradient and appearance remain unchanged. Work is local only.

## Source provenance

- **Silk Shader 24383**, by sorianosantiagosam: https://21st.dev/@sorianosantiagosam/components/silk-shader. Reused the existing retrieved source/adaptation in `src/components/projects/21st/SilkBackground.tsx` without edits. This instance uses a 360,000-pixel budget, 16fps and no pointer interaction, retaining visibility and reduced-motion handling.
- **Glass Card 28259 / component 5426**, by educalvolpz: https://21st.dev/@educalvolpz/components/glass-card. Actual component and demo were retrieved through 21st MCP and archived in `docs/21st-source/28259.tsx.txt`. `FrostedReviewSurface.tsx` adapts the source's blur/saturation/brightness filters, tinted body and inset highlights. SVG refraction, chromatic rims and pointer effects are omitted because the owner chose frost over liquid glass.
- Frosted Card 8112 was inspected but is not rendered.
- The underlying rail remains the GetLayers Client Reviews Carousel visual-reference adaptation described in `testimonials-2026-11-26.md`; no GetLayers source import is claimed.
- The closing action reuses the existing sourced SubtleLink (3373 by jatin-yadav05), retaining its sheen/dot with magnetic displacement disabled for this link.

## Content, typography and behaviour

Existing client-supplied Forrest, Kioo, Kray Sangareddy, Lakewood, Octapod Layana and Rasa Vikarabad photographs illustrate the preview. The fictional names, quotes and locations are not evidence about those projects. One visible disclosure explains that distinction. Records are centralised in `src/data/testimonials.ts`; the route remains noindex and has no Review structured data. Replace the preview with approved customer content before removing these safeguards. Images reserve a 3:2 frame and use responsive optimisation; the first three load eagerly.

Main headings retain the public Kento face; reading text stays in local Manrope. Forest-tinted frost, sage text and copper #d4aa80 accents extend the incumbent palette. Native horizontal scrolling, snap, arrows and keyboard controls remain. Automatic advancement wraps every six seconds. Manual interaction pauses until Resume; hover, focus, hidden/offscreen state and reduced motion suppress playback. Timers and listeners are cleaned up. Vertical scrolling is not intercepted.

## Navigation

The initial page was only in the footer. The shared Header now adds Testimonials on public routes, with an active state in desktop and mobile navigation. The customer configurator retains its original seven destinations. Eight wide Kento labels require an earlier public menu breakpoint of 1360px; the configurator remains at 1120px. Mobile menu gradient declarations are byte-identical to the prior source. No stored CMS navigation was changed.

## Local verification

Production build: `JibDWZREj2MV1WU3bEJfg`, directory `.next-testimonials-frost-process-2026-11-26`, preview http://127.0.0.1:3134/testimonials. The eleven-file source manifest is in `../testimonials-refinement-2026-11-26/candidate-source.json`.

Root checks covered actual CSS widths 320, 360, 390, 768, 1280, 1360, 1361, 1440 and 1920 with no document overflow. All six images decoded and every attribution has two location lines. Main 390/1440 captures include the revealed footer; settled visible 1360/1361/1920 captures confirm silk rendering. Some earlier full-page captures are layout-only because capture resizing paused the canvas or had not revealed footer entrance motion; rejected viewport attempts are excluded. Autoplay was observed advancing and wrapping; a paused 390px rail remained at the same position for 32 seconds. Hover/focus/reduced-motion/visibility guards have focused source/test coverage; isolated physical-hover behaviour is not claimed.

The integrated build and 36 focused tests passed. A fresh verifier independently ran 27 scoped tests, checked source/build identity and reviewed root-operated screenshots/observations, returning **ship for local review**. Verifier sessions had no browser surface of their own. Browser version, DPR and zoom were not exposed; viewport sizes were verified from the DOM. Physical-phone and owner approval remain pending. All seventeen older dirty files remain byte-identical. No push, deployment, CMS mutation or billing change occurred.

Before/after PDF: `../testimonials-refinement-2026-11-26/output/pdf/OKNO-Testimonials-and-Process-Before-After.pdf`.
