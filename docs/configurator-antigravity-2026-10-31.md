# Supplied Antigravity configurator integration

The owner supplied `C:\Users\Aryan\Downloads\antigravity3D` and requested its walkthrough, per-model integration and administration of additional houses. Its README is reference material; source files, asset metadata and browser checks determine actual behavior. The actual material catalog differs from the README's illustrative catalog descriptions. The shipped catalog follows `cladding_data.js`.

## Implementation

- Forza, Tengo and Kray select their respective supplied GLBs, preserved byte-for-byte under content-hashed URLs. The source folder, existing viewer and original model assets remain untouched. Provenance and SHA-256 checksums are in `src/data/configurator/antigravity/provenance.json`.
- The owner-supplied HTML, WebGL scene, camera controls, surface picking, cladding catalog and walking controls are adapted in `public/configurator/antigravity`. Bundled Three.js/OrbitControls/GLTFLoader license comments remain in `engine.js`. No new external UI source is substituted. Existing admin field/accordion controls are reused.
- The redundant 9 MB embedded fallback house is removed; textures are extracted to hashed local files rather than embedded in the catalog JavaScript. All required browser assets are self-hosted. Only the chosen GLB loads. Immutable headers cover fingerprinted assets; mutable application files retain revalidation.
- A same-origin iframe owns the standalone scene and releases its resources on navigation/retry. The React parent uses an origin-and-window-checked initialization handshake, model-specific settings, error recovery and publication subscription. The legacy Three.js viewer is imported only when used.
- Published model collections now resolve additional configurator routes. Existing legacy direct links remain available. Per-model settings include custom GLB, scale, five starting finishes and optional exact mesh-name lists. Tagged GLB metadata is preferred; descriptive names are supported without recoloring unmapped furniture or glazing.
- Desktop rendering uses the area beside the material drawer; phone rendering uses the area above it. Exterior/aerial views fit actual geometry, and the far clipping plane includes the sky from those wider viewpoints. The drawer, touch controls and camera toolbar retain the supplied responsive structure. Hidden tabs skip rendering. WebGL context loss exposes Retry.
- Manrope is loaded from the site's bundled font. Supplied prototype USD prices, invented surface areas and the local-only Blender GPU action are not offered as production features. The PDF exporter produces a model-named material specification with the current viewport and selections, without a price quote. The original local Blender scripts are preserved in the supplied folder; no GPU backend is deployed.

## Editing

Open Admin → Models → Signature models → the model → **3D configurator and walkthrough**. Upload a self-contained GLB with embedded textures, choose scale and starting finishes, then **Save Signature models and plans** and **Publish changes**. The same controls are available after **Add model**. New roster records still require their existing public presentation fields and at least one plan. A GLB supplies geometry; the editor does not manufacture a model from photographs.

Mesh metadata keys are `ext_roof`, `ext_wall`, `flooring`, `int_ceiling`, `int_wall`. Exact mesh-name overrides are optional, one name per line. GLB uploads reject external resource URLs and required decoders that are not bundled. The production uploader uses the existing private Blob store and same-origin content-hash media URLs; drafts do not alter the published model.

## Verification

- 73 targeted tests across settings, binary validation, content storage, admin upload flow, media delivery, admin structure/password-free access and Signature presentation pass.
- Local GLB upload, draft isolation, publication of an additional QA model and its route pass. The rendered added model uses the uploaded Tengo geometry and saved Titanium Veil roof finish. Original local content restored after the check. Uploaded media supports byte ranges (206, correct GLB MIME and length).
- Forza: real material selection and interior Foyer camera verified visually. Tengo: actual 390 × 844 viewport, visible house above the drawer, matching model, no sky clipping. Kray: matching house loaded; its Foyer view and held-key walking input were exercised. Production acceptance is recorded below when complete.
- PDF generation reports completion without a JavaScript error; the in-app browser did not expose a download event, so saved-PDF delivery is not claimed as verified.

Physical-device GPU performance, collision-aware navigation and automatic segmentation of arbitrary untagged GLBs are not claimed. Walkthrough follows the supplied free-navigation model.

## Production acceptance — 31 October 2026

Source `0ae3f575e030d29401608bce1c809ec603c5a87c` is deployed as READY production `dpl_D7NFRZj9eZdBWuoAi85wWhQjCuQR` at `https://okno-homes-aryan.vercel.app`. Compilation, TypeScript and all 30 function traces pass (largest 177.4 MiB).

Forza, Tengo, Kray, legacy Gaze and legacy Tish configure routes return 200; an unknown model returns 404. Admin, public content and all six viewer application files return 200. All three GLBs have their exact expected byte counts, `model/gltf-binary` MIME and one-year immutable cache headers. The full live Forza response also matches its source SHA-256. Published content remains revision 1; no production content was edited. The admin upload endpoint reports existing Blob mode.

The first live browser download failed with a network error and the viewer exposed Retry; Retry completed, the loading overlay disappeared, Titanium Veil selected successfully, and the Foyer camera rendered the interior. No further browser errors appeared after recovery. The post-deploy error/fatal runtime-log scan returned no entries. This verifies recovery, not uninterrupted downloads on every connection. Screenshot: workspace `outputs/okno-antigravity-live.png`.

Local QA content is restored to revision 0. The temporary password-free QA process was stopped and the normal localhost website restarted without that process-only override; `/` returns 200 and the unconfigured local admin API returns 503. No credentials were generated or changed.
