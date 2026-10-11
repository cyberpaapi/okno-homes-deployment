# Models selector — 23 September 2026

Finished local selector at <http://127.0.0.1:3102/models>. Signature is presented as dark architectural luxury and Bespoke as light architectural luxury. Both routes now have a distinct image-led handoff that becomes the only full-screen transition before their destination.

## Retrieved 21st.dev sources

| Page role | Retrieved source | ID | OKNO adaptation |
| --- | --- | ---: | --- |
| Split selector | [Hover Expand — educalvolpz](https://21st.dev/@educalvolpz/components/hover-expand) | 28111 | Two linked full-height environments retain a restrained 56/44 hover response, keyboard arrow focus and a stacked phone state |
| Light/dark framing | [Compare 2 — designali-in](https://21st.dev/@designali-in/components/compare-2) | 8958 | The source comparison split becomes a dark Signature side and luminous Bespoke side without feature-list clutter |
| Selector title | [Reveal Text — isaiahBjork](https://21st.dev/@isaiahbjork/components/reveal-text) | 2491 | One clipped title reveal per destination replaces the previous per-letter spring workload |
| Route handoff | [Preloader — gaxocif204](https://21st.dev/@gaxocif204/components/preloader) | 13967 | The selected architectural image rises over the selector and continues into its destination |
| Transition state | [Morph Loading — jatin-yadav05](https://21st.dev/@jatin-yadav05/components/morph-loading) | 4588 | Four tiny morphing marks give each short route handoff a clear loading state |
| Models cursor | [Fluid Magnetic Cursor — jahed](https://21st.dev/@jahed/components/magnetic-cursor) | 9314 | A fast liquid blob follows the pointer, locks to the centre of marked navigation and selector controls, morphs to their bounded shape, then springs free on exit |
| Background atmosphere | [Beams Background — kokonutd](https://21st.dev/@kokonutd/components/beams-background) | 1637 | Its blue depth palette is reduced to one CSS light field so the selector no longer runs a canvas loop |
| Navigation | [Centered Nav Header — 7ovr](https://21st.dev/@7ovr/components/centered-nav-header), [Liquid Morph Floating Menu — aayush-duhan](https://21st.dev/@aayush-duhan/components/liquid-morph-floating-menu), [Magnetic Button — bundui](https://21st.dev/@bundui/components/magnetic-button) | 21220, 16369, 1507 | Existing desktop and compact navigation remain shared and accessible |

The retrieved `Compare 2`, `Morph Loading`, `Beams Background` and `Fluid Magnetic Cursor` source is archived in `docs/21st-source/8958.json`, `4588.json`, `1637.json` and `9314.json`.

## Transition behavior

- Bespoke uses the luminous limestone residence and hands directly into the matching Bespoke hero. The destination detects that handoff and skips its own entrance sheet, removing the previous double transition.
- Signature uses the dark woodland residence, then opens the Signature model experience. Its normal media readiness indicator remains inside the destination rather than creating a second full-screen route transition.
- Modifier-click behavior is preserved, reduced-motion users navigate without the animated sheet, and both destination attributes are cleared after navigation.

## Performance changes

- The selector renders zero canvases and one background animation.
- Pointer movement performs no continuous layout reads. A control is measured once when hover enters, then the cursor stays locked until exit; there is no canvas trail or permanent animation ticker.
- Panel hover uses a bounded CSS basis transition and one image transform instead of continuous Motion layout springs.
- Both selector images remain priority-loaded before the initial entrance leaves.

## Validation

- Selector and transition tests cover links, keyboard movement, navigation semantics and the Bespoke destination-specific handoff.
- Browser inspection confirms the dark/light composition, separate Bespoke and Signature transitions, no second Bespoke entrance, and zero selector canvases.
- Desktop and 390 × 844 layouts have no horizontal overflow.
- All 60 tests across 18 files, TypeScript, scoped ESLint and `next build --webpack` pass; `/models`, `/models/signature` and `/models/bespoke` are statically prerendered.
- Every protected Projects file still matches its recorded SHA-256 hash.

Physical-device performance, Safari/Firefox behavior and deployment remain release checks.
