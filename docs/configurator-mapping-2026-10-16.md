# Signature surface mapping repair — 16 October 2026

## Scope

Owner requested mapping and model-glitch fixes only. Keep the existing UI, environment, background and shader code. No deployment, CMS changes or Signature catalogue additions. Tish's existing direct configurator was repaired without adding it to the Signature page. Missing house/plan assets remain outside this repair.

Plan: inspect actual visible source faces; correct surface ownership and proven artifacts; export one bounded derivative at a time; verify nearest visible faces from inside and outside; build and check the same local configurator.

The 15 October click-based checks did not establish correct geometric coverage and are superseded by this repair's visibility evidence.

## Corrections

| House | Corrected behavior |
| --- | --- |
| Forza | Exterior roof includes the visible metal strips on both slopes. Exterior wall includes outer corrugation rather than hidden backing. Interior walls include the visible finish skins; ceiling uses source 845 and 848. Detached bicycle nodes 357–835 are removed from the derivative. Bathroom fixtures and windows are retained. |
| Tengo | Adds exterior left-wall faces previously omitted from source 129, including its short returns. Foundation, lintels, partitions and accepted glazing retain their authored treatment. |
| Kray | Splits closed roof geometry into downward ceiling faces and separate roof faces. Replaces the ineffective BackSide clone approach, which the original roof underside occluded. |
| Tish | Removes glazing 41 from interior-wall mapping. Splits source 38 by verified wall planes to distinguish exterior walls from interior partitions. Keeps frames and skylight curbs opaque; clears the actual side-window pane 56. |

Material tagging clones instanced source meshes/primitives before assignment, preventing semantic tags from leaking into unrelated instances. Window materials cannot enter a finish group. Roof, ceiling, wall and floor materials retain independent ownership after batching.

Inside camera points are located within actual rooms, with a level view and wider interior field of view so floors and ceilings can be inspected. Resizing updates projection and camera fitting, including while the turntable runs. Interior orbit limits permit nearby, level and upward camera targets; exterior limits previously kept these flights from ever settling. Four regression cases run real OrbitControls against the supplied camera points. All assets retain one source unit per metre; source base aligns 5 mm above the existing ground plane. No geometry is resized to fit the camera.

Forza, Kray and Tish glazing is clearer without adding transmission render passes. Original master files are untouched. Existing texture resolution limits, Meshopt decoding, demand rendering, disposal and pixel-ratio limits remain in use.

Kray's 83 untextured base profiles originally account for about 1.30 million triangles. A position-only weld and per-profile simplification use an absolute error cap of 0.5 mm, then restore flat normals. These IDs are disjoint from all five architectural finish groups. No global architectural simplification is applied. The complete derivative drops from 1,467,932 to 389,008 triangles and from 15.09 MB to 6.36 MB, with unchanged house bounds. Its existing rendering resolution cap is retained.

## Verification

- 36 fixed spatial probes check the first visible finish face, including both roof/ceiling sides and open window apertures. Every transparent pane is excluded from finish groups; no roof material also owns a ceiling. [Probe report](evidence/configurator-mapping-2026-10-16/visibility.json).
- GLB hashes, lengths, metre scale, compression extensions, all five surfaces and original shader strings pass. [Integrity report](evidence/configurator-mapping-2026-10-16/integrity.json).
- Existing UI, configurator component and environment CSS hashes are unchanged. [Preservation report](evidence/configurator-mapping-2026-10-16/presentation-preserved.json).
- Focused Vitest: 4 files / 22 tests passed. TypeScript and scoped ESLint passed. Production build passed with two workers. [Build log](evidence/configurator-mapping-2026-10-16/build.log).
- Actual scene-harness checks cover Forza; live configurator checks cover Tengo, Kray and Tish. Distinct exterior/interior finishes were inspected with glass/frame openings retained. Tish passed a 390×844 resize while its turntable ran, with no horizontal overflow.
- The in-app browser turntable sample for Kray improved from 33.45 to 42.89 rendered frames/s after reducing the small base profiles. This is a bounded local measurement, not a 60 fps guarantee. The final interior camera fix then settled to **zero idle frames** over a 17.5-second observation. Its preceding failing idle result is retained in the report. [Browser measurements](evidence/configurator-mapping-2026-10-16/browser-performance.json).

The single local website process on port 3134 serves `.next-release-mapping-idle-2026-10-16`. The four content-hashed asset URLs prevent stale GLBs from being reused. Old derivatives remain available for rollback. No remote publication was performed.

## Resource limits

Conversions use a 2 GiB heap limit, serial texture work and one native image thread. Kray's conversion peaked at about 1.39 GiB RSS. A production build can use `OKNO_LOW_MEMORY_BUILD=1` to limit static workers to two. Build and conversion jobs were sequential; temporary review tabs are closed after use. [Sampled memory and its collection gap](evidence/configurator-mapping-2026-10-16/memory.json).

Visual checks and frame measurements describe this laptop and local browser only; they do not certify all GPUs or mobile devices.
