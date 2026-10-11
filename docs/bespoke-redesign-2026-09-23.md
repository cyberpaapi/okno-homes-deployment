# Bespoke redesign — 23 September 2026

Finished local redesign at <http://127.0.0.1:3102/models/bespoke>. The page keeps its white architectural direction with a clearer cobalt, mist-blue and graphite palette. Its canvas wallpaper now moves faster with more visible blue forms behind the translucent sections.

## Final sequence

1. A compact residence frame expands into the viewport.
2. The manifesto and courtyard establish the one-off commission.
3. The Glyph Portal now reads `OKNO`. The former `SUBLIME` label and “Enter the commission” overlay are removed, and the image remains fixed while the centered word opens.
4. The portal leads directly into Place, Brief, Form and Atmosphere. The separate Land / Brief / Architecture / Original image-and-ruler section is removed.
5. Each horizontal chapter has one dominant title, a top-left counter, a short explanation and a right-side Next step control.
6. Atmosphere now hands downward into the existing vertical parallax result. The result image rises from the bottom and expands vertically, keeping continuity without adding a fifth sideways chapter.
7. The existing enquiry close remains.

## Retrieved 21st.dev sources

| Page role | Retrieved source | ID | OKNO adaptation |
| --- | --- | ---: | --- |
| Expanding hero | [Scroll Media Expansion Hero — arunachalam](https://21st.dev/@arunachalam/components/scroll-expansion-hero) | 1932 | Responsive compact-to-full architectural frame with native page scroll |
| Typographic portal | [Glyph Portal — Legacy](https://21st.dev/@Legacy/components/glyph-portal) | 26558 | A centered `OKNO` mask reveals one fixed courtyard composition and hands directly into the process sequence |
| Manifesto typography | [Layered Text — xubohuah](https://21st.dev/@xubohuah/components/layered-text) | 5397 | Staggered three-line manifesto adapted to Geist |
| Process sequence | [Horizontal Scroll — uilayout.contact](https://21st.dev/@uilayout.contact/components/horizontal-scroll) | 18065 | Native vertical movement reveals the four decision chapters; Atmosphere exits downward into the result, while phones and reduced-motion users receive the chapters vertically |
| Final result | [Parallax Scrolling — osmosupply](https://21st.dev/@osmosupply/components/parallax-scrolling) | 4775 | Background, title and framed residence move at separate rates before enquiry |
| Animated wallpaper | [Aurora Background — pulkitxm](https://21st.dev/@pulkitxm/components/aurora-background) | 18263 | White canvas with visibly moving cobalt, blue and periwinkle radial forms; 30 fps, capped DPR, hidden-tab pause and static reduced-motion mode |
| Cursor and entrance | [Morphing Cursor — jatin-yadav05](https://21st.dev/@jatin-yadav05/components/morphing-cursor), [Preloader — gaxocif204](https://21st.dev/@gaxocif204/components/preloader) | 9643, 13967 | Immediate pointer dot with one fast ring; the page entrance is skipped when the Models selector already supplied the transition |

Retrieved source and demos remain archived under `docs/21st-source/`.

## Generated chapter imagery

Codex ImageGen produced two process-direction studies, each converted to a 1672 × 941 WebP:

- `bespoke-brief-v3.webp` — architectural briefing table with plan, tracing paper and restrained material samples
- `bespoke-form-v3.webp` — pale stone-and-oak massing model on a layered site base

Place now uses the supplied, provenance-recorded Forrest photograph `public/assets/projects/real-v1/forrest-01.webp`, showing a completed OKNO residence in its planted setting. Atmosphere continues with the generated luminous courtyard. Generated images are process-direction artwork and are not presented as completed OKNO projects.

## Interaction and accessibility

- Next step buttons map Place → Brief → Form → Atmosphere → The result and use smooth native scroll; reduced motion uses immediate navigation.
- The large repeated background word was removed, so Atmosphere appears once rather than as staggered duplicate text.
- The page uses no scroll interception. Phone content stacks vertically and has no horizontal overflow at 390 px.
- Touch and reduced-motion users keep native input behavior. Hidden canvas animation pauses with the document.

## Validation

- Browser review covers the hero, `OKNO` portal, every desktop horizontal chapter, Next step behavior, the parallax close and the full phone fallback.
- All 60 tests across 18 files, TypeScript, scoped ESLint and `next build --webpack` pass; `/models/bespoke` is statically prerendered.
- Every protected Projects file still matches its recorded SHA-256 hash.

Physical-device performance, Safari/Firefox behavior and deployment remain release checks.
