# Process detail timeline: survey path implementation plan

## Scope and visual contract

- Replace only the detailed five-phase timeline below the Process film. Preserve the film, its compact build-sequence rail, Header, Footer, shared cursor, copy, day ranges, image meanings, fonts and existing Process section background.
- Use the survey-path direction approved on 7 October 2026: a single restrained route winds from one phase to the next, like a mark across a site plan. The reference is [Sperotto history scroll on Awwwards](https://www.awwwards.com/inspiration/history-scroll-animation-sperotto-s-p-a), interpreted for OKNO rather than copied.
- Use the five existing local phase images for this pass. Record the chosen crops and let the client decide later which to keep or regenerate. Do not present conceptual renderings as documentary site photography.

## Work split

1. **Motion review subtask (read only):** inspect the current component and reference, recommend path geometry, reveal timing, reduced-motion behavior, and smoothness safeguards.
2. **Asset audit subtask (read only):** inspect the five current images and the existing Process/Journal green treatments; identify usable crops and any image-specific issues.
3. **Primary implementation:** save the old TSX/CSS in `docs/archive/process-detail-timeline-before-survey-path-2026-10-07/`, implement the path and alternating editorial phase layout, and document the final decisions in `docs/process-21st-components.md`.
4. **Primary verification:** typecheck, focused lint/test and two visual passes at desktop, tablet and mobile sizes. Inspect path alignment, scroll reversal, text visibility, image clipping, reduced motion, and the page's existing navigation and enquiry links. Resolve defects found in the first pass, then confirm in a second pass.

## Motion contract

- Native vertical scrolling controls one SVG route. Its geometry follows the rendered phase positions so responsive layout and edited copy do not break alignment. Motion runs through the existing `motion/react` dependency; no extra scroll runtime or dependency.
- The route draws continuously with scroll. Images and text remain visible in document flow, including while a lazy image loads; the path is the authored motion. No timeline controls or decorative hover states are added.
- Keep the existing dark forest gradient and green silk context. Use light green linework as a thin accent rather than adding a new field or competing background animation.
- On narrow screens, the route compresses into a readable edge path beside stacked imagery and copy. Reduced motion shows the complete path and images without spatial reveals.

## Rollback and acceptance

- The archived TSX/CSS are byte-identical copies of the pre-change files (SHA-256 recorded by `sha256sum`); restoring those two files reverses this timeline change.
- Accept only after the five phase titles, day ranges, copy and images are present; the path connects their markers at every tested width; there is no unintended horizontal overflow, clipped heading, hidden image, scroll jitter, or console error; and the route links still work.

## Asset review for the first implementation

The five existing landscape images are retained at a 16:9 crop. The factory manufacturing image is visually the weakest: it shows a nearly complete home in a brighter interior, while the other phases share a dark coastal setting. It remains in place for the client's image selection pass. The unused transport rendering shows a whole home on trucks and is not substituted for the approved panel sequence.

## Verification completed

- TypeScript, focused ESLint, two Process Journey tests, and the full production build passed.
- Two browser passes covered desktop (1440 × 900), tablet (1024 × 768), and mobile (390 × 844). The phase images, copy, markers, and route remained visible and aligned, with no horizontal overflow or browser console errors. The scroll route advanced and reversed with native scrolling; no visible jump or text/image overlap was found.
- Existing mobile navigation opened and closed, and its Enquire link reached `/enquiry` and returned correctly. The new timeline has no buttons or hover-only controls.
- Reduced-motion behavior is implemented in the component and covered by the test environment, but no browser-level reduced-motion emulation was available for a visual pass.
- The production build is serving on port 3134. `/process` and the existing admin gateway at `/admin` on port 3140 both returned HTTP 200 after restart. A final production-browser pass confirmed the new timeline and loaded image.
