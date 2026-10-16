# Signature asset audit and integration — 15 October 2026

Mapping acceptance below was superseded after owner review. See the [16 October surface repair and visibility checks](configurator-mapping-2026-10-16.md); selector clicks alone did not prove correct visible coverage.

## Scope and implementation plan

Owner authorized inspection and cleanup of all supplied house assets, correct Signature model mapping, consistent physical scale and runtime optimization. Preserve existing configurator UI, environment, shader code and master files. Work locally; no deployment.

1. Inventory source hashes, dimensions, scene structure, materials, geometry and texture costs. Independently review route/catalogue mapping with one read-only agent.
2. Inspect all five houses from multiple angles before enabling them. Remove only demonstrated artifacts; preserve uncertain architectural details and record limits.
3. Generate versioned runtime copies sequentially, with bounded memory, texture sizes and draw calls. Validate each output by loading it again.
4. Connect verified assets to their correct model routes using one physical unit convention, stable ground alignment and model-aware cameras. Preserve UI structure and rendering/shaders.
5. Check finishes, camera presets, backgrounds, lighting, failure/unmount handling, desktop/phone layouts, idle rendering and interaction performance. Run focused tests, type checking and lint sequentially.

## Resource budget

Initial machine snapshot: 15,681 MiB total RAM, 5,791 MiB available, 1,356 MiB swap occupied. Background sampler records available memory every five seconds in a private temporary log. One conversion or browser workload at a time. Conversion process heap capped at 2 GiB, native image concurrency at one; delay new heavy work below 2 GiB available. No full production build alongside conversion/browser checks. Masters remain outside the canonical checkout.

## Initial findings

The previous route intentionally sent every Signature Configure action to the same procedural Studio Cabin. Its imported-model framing independently normalizes each model to eight units; this must not be used for a common physical scale. Existing Tengo/Kray surface mappings and provenance are available but require rechecking. Newly supplied Forza exists (the older memory saying no Forza GLB is superseded).

## Asset decisions and output

| Supplied asset | Source MB | Runtime MB | Runtime meshes | Triangles | Decision |
| --- | ---: | ---: | ---: | ---: | --- |
| Forza 01 | 126.50 | 2.85 | 46 | 137,603 | Forza family preview; removed 320 remote construction/component nodes |
| TENGO 26-08-21 | 198.02 | 8.09 | 55 | 267,837 | Tengo family preview; geometry retained |
| Kray qn | 139.66 | 15.08 | 23 | 1,467,932 | Kray family preview; removed 20 detached person-marker nodes; conservative simplification |
| TISH 2BHK | 1.73 | 0.36 | 15 | 17,391 | Tish 2 BHK; geometry retained; direct route available without changing Signature cards |
| Suite exterior | 248.17 | 68.65 candidate | 143 | 2,191,261 | Review only outside public checkout; removed surrounding site, remote ground and floating study objects |

MB here means decimal megabytes. The four customer assets total 26.38 MB versus 465.91 MB of masters (94.3% reduction). SHA-256, exact removed node IDs, bounds, texture dimensions and load-back checks are in the per-model JSON files under `docs/evidence/configurator-assets-2026-10-15/`. Blender was unavailable on this host; asset processing used the glTF pipeline rather than a Blender process. Each output was decoded after writing and visually inspected in browser from front/side, rear and plan.

Suite has no current Signature catalogue match, lacks reviewed finish groups and remains much heavier than the customer assets. Its candidate is retained at the private `3D Asset Review/2026-10-15` folder alongside the pre-change runtime checkpoint. It is not presented as a production-ready model. Gaze, Trib and Octapod have no supplied matching GLB; their routes explicitly label the Studio Cabin reference instead of showing a different named house. Unknown catalogue slugs return 404.

Existing catalogue cards pass bedroom/Studio query variants, but the Forza/Tengo/Kray source files establish product families rather than a distinct geometry file for every plan. These viewers state that individual plan layouts are not separately represented. Tish explicitly identifies the supplied 2 BHK. No catalogue card, area, price or model identity was invented or changed.

## Physical scale and materials

All connected files retain glTF metre units, supported by their door/storey dimensions. Their dimensions including platform/stairs remain different: Forza 6.63 × 4.99 × 9.31 m; Tengo 16.35 × 4.57 × 12.23 m; Kray 9.24 × 5.20 × 9.06 m; Tish 12.05 × 4.85 × 9.30 m (X/Y/Z). These are asset bounds, not certified construction specifications. The viewer translates their centre and lowest point to a common ground plane; it never normalizes each house to an arbitrary width. Camera fit, fog range, shadow coverage, mobile framing and stone clearance adapt to the retained physical envelope.

Existing Tengo/Kray semantic source-node mappings were retained before batching. New Forza/Tish groups are explicitly recorded in `scripts/configurator/asset-surfaces-v2.json`. Material extras preserve independent exterior wall, roof, floor, ceiling and interior wall targets after merge operations. Kray's ceiling uses an independently textured back face of its roof. Original materials are shown until the user chooses a finish. Source glass/material parameters, environment appearance and both shader programs remain unchanged; `verify-house-assets.mjs` compares the shader strings against the preserved supplied source.

## Runtime and resource changes

Only the active house is fetched. GLBs use Meshopt geometry encoding and WebP textures capped at 1024 px; decoded texture work is bounded. Compatible meshes/materials are merged while preserving semantic surfaces. Runtime filenames include content hashes, with immutable caching for the new v2 directory. The preserved v1 API trace is narrowed to v1 files so new static derivatives are not duplicated into that server function.

Camera flights and turntable updates use elapsed time. Orbit inertia, movement, light/material/background changes and loading wake rendering; a settled static camera stops. The hidden page pauses the loop. Original shader code and UI/CSS are retained; software rasterizers use a lower canvas resolution. Projection geometry is cached per selected surface instead of recreated for every swatch. Fetch cancellation, late GLTF disposal, bitmap/texture/geometry disposal, PMREM target and shadow-map disposal are covered by implementation review and focused checks. Editor picking/history is disabled in the customer viewer.

## Validation

Story: existing Configure URL and selected-plan context → catalogue family registry → one immutable derivative → Meshopt/texture decode → metre placement → authored rendering → five independent finish applications and existing viewer controls.

- Production build passed in an isolated `.next-release-house-assets-2026-10-15` directory. The single server on canonical port 3134 now serves that build; no deployment was performed.
- Six focused test files / 49 tests passed, including family identity, invalid/absent mappings, physical scale, small-screen camera fit, material controls and failed asset loads. Production TypeScript and scoped zero-warning ESLint passed.
- Hash/length/GLB-header checks, required compression extensions, all five semantic surfaces and shader-source invariance passed. All four immutable asset requests returned 200 with the expected length and cache headers.
- Initial laptop GPU verification used Intel Mesa OpenGL ES 3.2 (not SwiftShader), desktop 1440×900 plus phone viewport 390×844. All four had zero idle WebGL frames after settling, no captured errors, no horizontal overflow, and roughly 56–57 frames/s during the measured phone-view turntable interval. Asset readiness in that warm local pass ranged from 0.75 to 1.62 s. This is local laptop evidence, not a mobile-device or network certification.
- The earlier SwiftShader pass was substantially slower and exposed frame-rate-dependent camera flights. That timing was corrected and the actual GPU pass is recorded separately. Do not treat software timing as GPU acceptance or hide its limitation.
- Final production interaction/recovery verification is recorded in `production-checks.json` and the production screenshots. It checks the higher device pixel ratio, every camera preset, all five material applications, environments, lighting, orbit/zoom/keyboard control, missing-model disclosure, failed fetch and graphics-context restoration.

Memory was sampled every five seconds across conversion, browser and build work. The first full Suite scene review was the heaviest source case; subsequent Suite work stayed outside the customer route. Lowest sampled available memory was about 1.46 GiB during early browser work; no task process was lost to OOM. Conversion peaks ranged up to about 2.07 GiB RSS for the full Suite review and 1.37 GiB for Kray. The final lightweight production preview replaces the heavier dev server. Final sampler summary is stored with the evidence; the last sample had 7508 MiB available.

Final production results: all four houses passed six camera presets, all five material applications, all five backgrounds, both lighting states, orbit, zoom and keyboard movement at desktop DPR 1.5 and phone viewport 390×844. Desktop median frame intervals were 17.5–17.9 ms (approximately 56–57 frames/s), with 18.5–18.8 ms 95th-percentile intervals. Phone-view median intervals were 17.3–17.8 ms; Tengo had occasional 34.4 ms frames at its 95th percentile, while the other three were 18.6–20.7 ms. Actual WebGL frame counts matched the sampled animation frames. Asset readiness was 0.49–1.08 seconds on the warm local production server. All four settled to zero idle frames. No captured errors or horizontal overflow. This verifies the tested laptop GPU and viewports, not all phones, networks or GPU drivers.

Context loss/restoration recovered successfully. A blocked asset request displayed an explicit failure and removed the failed viewer canvas. Missing Gaze geometry remained an explicit Studio Cabin reference, and an unknown catalogue route returned 404. HTTP assets and shader/GLB integrity checks passed.

Status: available matched assets integrated and locally verified. Suite and missing/plan-specific geometry remain explicitly outside customer-model acceptance. Production preview is left running on port 3134; GitHub/Vercel and admin data are unchanged by this task.
