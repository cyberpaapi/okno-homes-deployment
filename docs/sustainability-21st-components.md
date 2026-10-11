# Sustainability: component provenance and current behavior

The 4 October implementation used a 21st.dev image reveal. The 7 October revision keeps the established forest, ivory and lichen visual system while replacing that reveal with simple fades for the Reflections photographs.

| Historical use | Retrieved 21st.dev source | Former adaptation |
| --- | --- | --- |
| House media reveal, retired 7 October | [Scroll Reveal Image by Unlumen](https://21st.dev/@unlumen/components/scroll-reveal-image), ID 24466 | The prior clipped-frame expansion and image scaling were removed at the user's request. |

Original retrieved source is preserved at `docs/21st-source/24466.tsx.txt`. The former `HouseReveal.tsx` adaptation is no longer mounted; `SustainabilityProof.tsx` now uses a stable figure and Motion opacity values for image fades.

The publication rail preserves factual source, date and headline hierarchy. The closing fact view uses only details already present in the supplied coverage: 300 square feet, prefabricated construction, an aluminium-composite envelope and the motorized deck bed. Decorative site annotations and the location/year image caption were removed; no new claims or external media were added.

## Closing details restoration — 6 October 2026

The compact white facts card beside the photograph was replaced with the earlier full-viewport ivory details sheet. It rises after the four press citations and presents a large heading, four fuller Reflections details and a closing line. The current press image/rail timing and the sequential text animation in `SustainabilityJourney` remain intact. The restored location detail is from the preserved earlier Sustainability implementation; the admin fact descriptions use the same defaults and retain their existing field IDs.

Verification: TypeScript, focused Sustainability ESLint and the production build passed. The settled sheet was reviewed at desktop and 390px phone width, with no horizontal overflow or browser console warnings/errors. The sheet stays opaque while rising over the final photograph.

## Image pacing and enquiry close — 6 October 2026

The Reflections proof track now spans 760svh on desktop and phone. Each of its four photographs has a longer reveal, hold and crossfade interval, with the publication citations spaced to match. The full-screen ivory details sheet still closes that sequence. The existing `SustainabilityEnding` section follows it again, using its mapped “Build with what the land gives” heading and “Begin a conversation” link to `/enquiry`. The shared layout footer remains the only footer.

Verification: TypeScript, zero-warning focused ESLint and the production build passed. In the live browser, separate photograph states were checked on desktop; the phone view was checked at 390px with `clientWidth=scrollWidth=382`. The restored CTA points to `/enquiry`, exactly one ending and one footer render, and the browser reported no warnings or errors.

## Reflections photograph quality and variety — 6 October 2026

The four 1000 × 650 press images have been replaced in the scroll sequence with five distinct 2000 × 1333 Reflections photographs. The fifth is used only for the closing frame, removing the former repeat of the first photograph. The publication and image timing, ivory details sheet and enquiry close are unchanged. Next Image serves the replacements at quality 90. The older press files remain in place for recovery.

The images are from the [ArchDaily Reflections Holiday Home gallery](https://www.archdaily.com/1017679/reflections-holiday-home-okno-modhomes), which credits the photography to Inclined Studio. That credit is shown in the image frame. Source images and their page use:

| Page state | Local file | Original gallery image |
| --- | --- | --- |
| Architectural Digest | `reflections-forest-exterior.jpg` | [Gallery image 1](https://images.adsttc.com/media/images/666b/0f9e/b38d/4753/c34e/9ea0/large_jpg/reflections-holiday-home-okno-modhomes_1.jpg?1718292410) |
| New Atlas | `reflections-deck-bed-detail.jpg` | [Gallery image 11](https://images.adsttc.com/media/images/666b/0f9e/03ec/3733/6fd5/bed8/large_jpg/reflections-holiday-home-okno-modhomes_11.jpg?1718292415) |
| HomeCrux | `reflections-bedroom.jpg` | [Gallery image 10](https://images.adsttc.com/media/images/666b/0f9e/b38d/472a/adc3/da6c/large_jpg/reflections-holiday-home-okno-modhomes_10.jpg?1718292403) |
| Architecture+Design | `reflections-mirrored-deck.jpg` | [Gallery image 13](https://images.adsttc.com/media/images/666b/0f9d/03ec/3732/c9d5/bef7/large_jpg/reflections-holiday-home-okno-modhomes_13.jpg?1718292397) |
| Closing frame | `reflections-forest-bath.jpg` | [Gallery image 2](https://images.adsttc.com/media/images/666b/0f9d/b38d/4753/c34e/9e9f/large_jpg/reflections-holiday-home-okno-modhomes_2.jpg?1718292399) |

The publication records remain coverage citations; their photographs are editorial views of the same OKNO project, not claimed to be article thumbnail assets. As noted in the Journal record, confirm website-reuse rights for Inclined Studio photography before publishing this new media externally.

Verification: all five local files decode at 2000 × 1333 and have distinct SHA-256 hashes. TypeScript, focused Sustainability ESLint and the production build passed. In the local production browser, each of the five scroll states showed its own photograph, the replacement deck-bed view loaded at the second state, the closing frame no longer repeated the first, and no browser warnings or errors were reported. The local `/sustainability` route returned HTTP 200.

## Opening copy and fade-only image sequence — 7 October 2026

The Reflections opening now reads “The land leads. The home follows.” in place of “A small home. A wider conversation.” The existing three mapped admin field IDs are retained with matching defaults. The image frame stays in its settled size; its former clip expansion, spring movement, scaling, background and shadow are removed. The proof layout fades in after the heading clears; the five photographs crossfade through opacity at their existing scroll intervals. The ivory details sheet, sequential journey text and enquiry close are unchanged.

Verification: TypeScript and focused component ESLint passed in the Final Showcase checkout. An isolated production build passed while the shared admin gateway kept the canonical 3134 process in use. Browser review on the isolated 3135 preview confirmed the new heading, a transparent frame with no transform, clipping or shadow, fade-only image states, no horizontal overflow at desktop and 390px phone width, and no console warnings/errors. The shared 3134 server still serves the preceding build until it can be restarted without interrupting the admin workflow.
