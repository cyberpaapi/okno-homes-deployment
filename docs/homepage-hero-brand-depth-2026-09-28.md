# Homepage hero brand-depth correction

## Locked direction

- Keep the generated intro and scroll films. Do not generate another video without the user's confirmation.
- After the intro ends, reveal the brand composition slowly and as part of the final film frame.
- Keep one untouched forest/house visual. Do not duplicate, cut out, translate, fade, or parallax the trees, house, mountain, or background for the brand treatment.
- Put the large `OKNO` plane behind the real foreground canopy traced in the user's red-line reference. The falling left valley exposes O/K; the rising forest on the right progressively occludes N/O. Give the mark a slightly taller proportion than the supplied vector.
- Use a cursor-following circular reveal on the background `OKNO` plane.
- Put `MODHOMES` closer to the viewer, clean and readable in front of the forest. Do not add an invented sawtooth or generic leaf mask.
- On the first scroll interval, fade only the lettering. Start the FPV film after that fade is complete.
- Keep numerics, counters, invented CTA buttons, and extra hero copy out of this composition.

## Source components and adaptation

| Role | Retrieved 21st.dev source | Preserved mechanism | OKNO adaptation |
| --- | --- | --- | --- |
| Text entrance | Reveal Text by isaiahbjork, component 2491 | staged opacity/transform reveal | one slow, non-spring rise with blur resolving after the intro film |
| Idle wordmark motion | Layered Text by xubohuah, component 5397 | translated, clipped text planes | two independently timed, low-amplitude wordmark drifts continue after the entrance settles |
| Cursor reveal | Morphing Cursor by jatin-yadav05, component 9643 | lerped circular lens with a counter-translated duplicate | lens reveals the brighter supplied `OKNO` vector while both layers remain behind the ridge mask |
| Scroll film | Hero Scroll Video, component 25482 | smoothed scroll-to-video progression | begins only after the brand text has faded |
| Scroll copy | Reveal Text by isaiahBjork, component 2491 | staged opacity/translation | separate Signature, Bespoke and Sustainability cues crossfade through the FPV scroll film |

The archived source files are `docs/21st-source/rebuild-2491.tsx.txt` and
`docs/21st-source/rebuild-9643.tsx.txt`.

## Brand assets

- `public/assets/landing-options/okno-wordmark-only.svg`
- `public/assets/landing-options/modhomes-wordmark-only.svg`

Both assets are cropped views of the supplied OKNO brand vector. No replacement font or redrawn logo is used.

## Verification

- The hero test asserts the 21st.dev cursor treatment, both supplied brand marks, both approved videos, no hero button, no numeric counter, and exactly one instance of the starting forest image.
- The scroll handoff was inspected in the live browser: at the text-fade interval the brand opacity changes while the journey-video opacity remains `0`; after that interval the journey film starts. The three narrative cues remain separated across the track.
- The final wordmark top position is `13.5svh` on desktop and `14.5svh` on phone so its lower strokes meet the traced canopy instead of floating above it. Browser measurements confirm both 5397 wordmark transforms continue changing after the entrance completes.
- Full Vitest suite: 138 tests passed.
- TypeScript: passed.
- Focused ESLint: passed.
- Production build: passed, including `/` and `/landing-options/forest-entry`.
