# About page: 21st.dev provenance and design

Updated 5 October 2026 for the active Final Showcase checkout.

## Active retrieved components

| Use | 21st.dev URL, author and ID | Retrieved source and adaptation |
| --- | --- | --- |
| Opening title animation | [Text Reveal](https://21st.dev/@kuratlielia/components/text-reveal) by **kuratlielia**; registry ID **`text-reveal`** (the public component uses this slug rather than a numeric ID) | [Actual registry source](https://raw.githubusercontent.com/kuratlielia/arc-library/main/public/r/text-reveal.json) retrieved 5 October 2026; MIT licensed. `src/components/about/TextReveal.tsx` and `TextReveal.module.css` retain the word-by-word rise, feathered clip, opacity and focus tracks. Adapted to the site's font, no dependency on Arc Foundation tokens, plain readable content before hydration, accessible single heading name and static reduced-motion state. |
| Existing continuous surface | [Silk Shader](https://21st.dev/@sorianosantiagosam/components/silk-shader) by **sorianosantiagosam**, ID **24383** | Source previously retrieved and archived in `docs/21st-source/24383.tsx.txt`. The same fixed dark-green shader remains behind the About content, with one inset paper interlude above it. |

The previous 21st.dev About Section by UI Layouts (ID 6289), Reveal Text by isaiahBjork (ID 2491), Text Block Animation by daiwiikharihar (ID 9902), Scroll Reveal Image (ID 24466), and timeline animation are historical adaptations; their files remain in the checkout but are **not rendered** by the current About page. The shared footer and cursor are unchanged.

## Current About structure

The chapter order and published copy follow the [original OKNO Modhomes About page](https://www.oknomodhomes.com/about-us): opening architecture image and statement, Our vision, Fabricating the Future, Meet our founders, Why OKNO, and A perfect fit. Its bold sans-serif type, image/copy alternation, founders portrait pairing, and compact five-commitment row informed this rebuild. The color and Silk surface stay with the current Final Showcase website.

The existing admin-managed text, image, and alt-text field IDs are preserved. The opening, Future, founders, and Fit images retain their complete native aspect ratios with `object-fit: contain`; Vision adds the existing Forza interior photograph from this checkout. No image subject is cropped. Chapters follow content height with no scroll locking, mandatory viewport height, dividers, invented claims, or About-only CTA. The 21st title reveal and paper-sheet arrival are the authored motion moments; media settles subtly from an already-visible state and commitments have a restrained stagger. Reduced-motion users see static content.

## Journal-paper interlude — 5 October 2026

The adjacent Founders and Why OKNO chapters sit on one inset off-white paper sheet over the existing green Silk surface. The paper color (`#f1e9dd`), fibre SVG data URI, and soft sage light field are reused directly from `src/components/journal/Journal.module.css`; this is local styling reuse, **not** a new 21st.dev component. The sheet has a restrained one-time lift on entering view, while the existing media figures gain a small hover lift. A muted timber-copper accent appears on the dark manifesto and the paper commitments. Photo frames have 8px corners, retain their full native ratios and stay fully visible. Reduced motion disables spatial movement.
