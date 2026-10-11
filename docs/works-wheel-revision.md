# Homepage Works Wheel revision

Source: **Works Wheel**, component **28371**, author **crafterui**, [21st.dev component](https://21st.dev/@crafterui/components/works-wheel).

Retrieved source and demo are retained in `docs/21st-source/revision-28371.tsx.txt` and `revision-28371-demo.tsx.txt`. The implemented component is `src/components/landing/WorksWheel.tsx`, with its scoped CSS alongside it. Import the default component and render `<WorksWheel />` in the homepage's projects teaser position.

## Retained source behavior

The ring transitions into the original perspective drum, with the same card proportions, 40-degree step, drum radius, perspective lens, ring radius, bowed axis, `place` transform chain, front-plane setback, ring scale interpolation and distance-based culling. The component writes card transforms directly in one animation frame pass, without rendering React for every frame.

## Adaptations for OKNO

- Six actual projects from `realProjectMedia.json`: Lakewood Villa, Forrest, Kioo, Kray Sangareddy, Octapod Layana and Rasa Vikarabad. Original project routes and actual 3200px project photographs replace source placeholder artwork.
- Geist OKNO typography and the established paper, charcoal and restrained gold palette replace the source's framework theme tokens.
- A bounded 260svh sticky section connects the same `turn` parameter to ordinary page scroll. No wheel event cancellation or drag capture occurs. Scrolling past either end remains native; there is no page-scroll trap.
- Images are inert. The active project has one visible, dedicated lower-right action link; previous and next controls sit alongside. All use the existing bundui **Magnetic Button**, 21st.dev component **1507**, through `projects/21st/Magnetic.tsx`.
- On small screens, short viewports and reduced-motion settings, a compact photo selector replaces the perspective movement. Horizontal swipes, arrow keys, Home/End and explicit buttons work; vertical swipes remain native page scroll.
- RAF only runs until its target settles, and suspends offscreen or in a hidden document. Resize/intersection observers, events and RAF are cleaned up on unmount.

## Verification

Four focused tests cover active project route accuracy and inert photography; keyboard boundaries and reduced-motion scheduling; native wheel release, settling and unmount cleanup; horizontal touch selection without intercepting vertical swipes. Component and test scoped ESLint pass. Whole-page responsive composition and visual scroll inspection belong to the parent homepage integration check.
