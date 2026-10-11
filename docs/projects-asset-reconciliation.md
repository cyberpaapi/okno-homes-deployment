# Projects: supplied media reconciliation

20 September 2026. Local Projects preview only. The user will supply approved project names and locations. Those are pending, so source-folder names identify the preview galleries. At the user’s explicit request, all ten existing map pins remain visible as preview locations. They are not silently assigned to the new galleries; selecting an unassigned pin identifies its pending project assignment. All seven collections remain accessible through the atlas controls. Routes are noindex until content is approved.

## Current source inventory and proposed gallery content

Source: `../Assests/Real Projects`. Reviewed all 255 photographs on contact sheets and three sampled frames per supplied video. Originals are unchanged.

| Source collection | Photos supplied | Photos selected | Videos supplied / integrated | Preview route |
| --- | ---: | ---: | ---: | --- |
| Forrest(C) | 71 | 12 | 2 | `/projects/forrest` |
| Kioo_Photos | 40 | 10 | 0 | `/projects/kioo` |
| Kray Sangareddy | 14 | 8 | 3 | `/projects/kray-sangareddy` |
| Lakewood(Villa) | 30 | 10 | 1 | `/projects/lakewood` |
| Octapod_Layana | 39 | 10 | 5 | `/projects/octapod-layana` |
| Rasa_Vikarabad | 58 | 10 | 0 | `/projects/rasa-vikarabad` |
| Trib_BirdsEye | 3 | 3 | 0 | `/projects/trib-birdseye` |
| Total | 255 | 63 | 11 | 7 collections |

Selections cover exterior, setting, interior, material details and evening views where available. We have not represented unit catalogue renders or Bespoke concept renders as completed real projects. Photos not selected are retained in the source folders, not deleted.

## Mismatch with the earlier demo

The previous atlas listed Courtyard House 01 (Hyderabad), Mehul Valley Retreats (Lonavala), The Mirror House (Coorg), Pine House N02 (Oslo), Atlantic Courtyard (Lisbon), Cedar Annex 04 (Vancouver), Hill Country House (Austin), Cloud Forest Cabin (San José), Fynbos Coastal Home (Cape Town), and Mallee Pavilion (Melbourne).

Those ten entries pointed to only four low-resolution study illustrations. They were not based on the seven real-project folders. None has an established one-to-one mapping to the supplied projects, so the active Projects data now uses the real collections. In particular, “Mirror House” in the Kioo filenames does not prove that it is the previous Coorg entry. The old city coordinates remain in the map layout at the user’s request, separately from the new project records. The location-to-project assignments await confirmation.

## Video assignments

- Forrest: `FORREST – A Luxury Resort Built in 120 Days _ Okno Modhomes.mp4` (2:33), and `Forrest_FPV.MP4` (1:46). Sampled frames match the Forrest photo collection. The delivery claim in the supplied film title is not repeated as new website copy.
- Lakewood Villa: `Lakewoods.mp4` (2:11). Sampled frames match the Villa roofline, pool and landscape. Singular/plural name remains to be confirmed.
- Kray Sangareddy: `01.mp4`, `02.mp4`, `03.mp4` (approximately 8, 10 and 8 seconds). Located in the same project folder; sampled frames match its timber-clad cabin.
- Octapod Layana: `Cabin and Rain.mov`, `Okno Reel 2.mov`, `Reel 3.mov`, `Reel 4.mov`, `Reel 5.mov` (18, 53, 37, 39 and 31 seconds). Sampled frames match the octagonal units and central pool.
- No supplied project videos found for Kioo, Rasa or Trib. No unrelated footage is substituted.

These are provenance/visual matches, not client approval of the final commercial labels, music rights or delivery claims embedded in the supplied films. Final videos remain the supplied full edits, with audio preserved and user-controlled playback.

## Questions to ask the client

- [ ] Confirm the final publishable project list: seven separate projects, or a different grouping?
- [ ] Provide approved display name, location and map coordinates for every collection.
- [ ] Are Kioo and Trib BirdsEye two cabin types at the same property, or separate projects? Embedded photo GPS clusters are nearly coincident. Do not infer a commercial project relationship from this alone.
- [ ] Is the correct name Lakewood, Lakewoods, or another property name? Confirm that `Lakewoods.mp4` belongs to the Villa project.
- [ ] What do `(C)`, `Layana`, and `BirdsEye` denote in the source-folder naming?
- [ ] Confirm the Forrest cinematic/FPV films, three Kray clips and five Layana reels are intended for these galleries, including existing embedded text/audio.
- [ ] Which collection, if any, is the previously mentioned seventeen-unit resort?
- [ ] Supply approved image order/covers, project scope/model names, photographer credits and any publication exclusions.
- [ ] Confirm whether the old ten demo locations should be discarded entirely or correspond to additional real projects not yet supplied.

Recorded for client discussion; no message has been sent to the client. User replied that they will provide approved names and locations.

## Implementation

`src/data/projectAtlas.ts` owns the pending commercial metadata; `src/data/realProjectMedia.json` lists the curated files. `scripts/prepare-real-projects.mjs` creates EXIF-oriented WebP derivatives up to 3200 px without enlargement and on-demand H.264/AAC MP4 films with fast-start metadata. The derivative filenames are independent of eventual display-name changes. `docs/projects-media-manifest.json` records exact input/output mapping and original SHA-256 hashes. Original embedded metadata is not copied into web photographs.

Removed the six-second initial rotation delay and blanket hover pause. The globe rotates on entry; only interacting with a location link pauses it. Drag and explicit focus resume after a short pause. Reduced-motion, offscreen and hidden-tab controls remain.

Added a very low-contrast SVG cotton weave to Projects backgrounds. It is a small repeating vector pattern, with no generated raster texture, gradient or video overlay. Gallery photographs remain untextured. Galleries include a moving full-bleed cover, real photo navigation, an editorial photo sequence, fullscreen viewing and project-specific film selection. Video downloads do not start with page load.

## Animation reference update

The user requested 21st.dev MCP. No 21st.dev tool is callable in this session; the plugin directory search returned no matching plugin. Used the public component references instead:

- https://21st.dev/@jahed/components/shared-element-gallery — preserving image aspect ratio and shared-element expansion with a spring.
- https://21st.dev/@ishamsu/components/immersive-scroll-gallery — restrained scroll-linked image scale/depth.

Implemented original Motion code within the existing Projects components: directional masked photo transitions, shared-element expansion from the photographic sequence, and small scroll-linked shifts/scaling. No stock media, demo branding, prompt copy, extra dependency, generation or service upload was imported. Reduced motion disables these spatial effects.

## Final local verification

- 42 tests across 12 files pass, including immediate globe rotation over the map background, retention of all ten pins, project/media integrity, photo navigation, modal focus restoration and film selection.
- Lint, TypeScript (production build), and the optimized production build pass.
- Desktop route checks cover all seven galleries. Mobile checks at 390×844 and 320×740 confirm visible next/fullscreen controls and no horizontal overflow. Corrected the gallery grid's minimum width and requested larger responsive cover images for portrait viewports.
- Browser playback confirmed for the supplied Forrest film (1280×720) and an optimized Kray portrait clip (720×1280). All eleven outputs passed codec, duration and fast-start checks; sampled content from all eleven inputs was visually reviewed. No claim that every complete film was watched end to end.
- Fullscreen expansion, Escape, focus return, image navigation and globe-pin selection checked in the browser. Ten pins remain in the DOM, with front-side visibility controlled by the globe. No errors or warnings in the final checked browser journey.
- All 74 selected original-file SHA-256 hashes verified unchanged. The 63 WebP derivatives total 71.67 MB; eleven complete films total 190.96 MB. Responsive image loading and user-requested video playback prevent a page load from transferring the whole library.
- Physical-device frame-rate and network-performance testing remain unmeasured. Names, map assignments and final publication selection remain pending client input. No deployment, paid generation, Git commit or push.
