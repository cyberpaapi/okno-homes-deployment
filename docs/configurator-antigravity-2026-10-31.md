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

## Public Signature entry — 31 October 2026

The owner requested a visible public entry rather than relying on Explore details. The Signature view now has a persistent **Configure yours** link for the currently selected model and stable plan context. Explore details uses the same label and treatment. The existing shared `SubtleLink` is reused (Subtle Button by `jatin-yadav05`, demo/component 3373, https://21st.dev/@jatin-yadav05/components/subtle-button; source archived in `docs/21st-source/revision-3373.tsx.txt`, composed with existing Magnetic Button 1507). This is reuse of the deployed control, not a new catalogue selection or a fresh popularity claim. Its glass field, border, sheen and illuminated point remain; scoped CSS adds a gentle 5.6-second glow and disables it for reduced motion. The link stays visible independently of the dimming model dock and has separate space above the phone controls. Public text remains editable through the existing Configure label field.

Pricing audit: `OKNO Website Copy Deck v1.pdf`, pages 1 and 6–8, says to retain each model's own amount and prefix it with Indicative. The specified Forza ₹18.50 lakh, Tengo ₹71.30 lakh and Octapod ₹18 lakh already match the public defaults; `Website_Changes_new.pdf` asks for the Indicative prefix without replacement amounts. Gaze remains on request, as the copy deck explicitly awaits confirmed figures. No replacement rates were invented or written to CMS.

Local validation: 16 Signature tests pass, including public entry for the initial model, an admin-added model and selected-plan links; TypeScript and scoped ESLint pass. Desktop and 390 × 844 phone checks show the button unobstructed; selecting Kray changes its destination to the Kray configurator with studio context.

Live acceptance: source `91c9391ac0d633a36b7de40e5e43fb748560f946`, READY production `dpl_4fGgpLmkxVXWyLC12hQmEL7Ve1Tm`, canonical alias `https://okno-homes-aryan.vercel.app`. The live public button shows Configure yours, uses Manrope, 14 px backdrop blur and an infinite 5.6-second animation. Clicking it reaches Forza's configurator and its loaded state is true. Signature and the configure route return 200; published content remains revision 1. All 30 production function traces pass (largest 177.4 MiB); the scoped error/fatal runtime-log scan is empty. Screenshot: workspace `outputs/okno-configure-yours-live.png`.

## Only offer configuration for an available editable house

The owner clarified that models without their own editable 3D house must not offer configuration. Both public Signature entries now use the same published-settings resolver as the supplied viewer. Forza, Tengo and Kray qualify through their supplied assets; Gaze, Trib and Octapod do not qualify without an uploaded GLB. An admin-added or existing model gains the action when a valid editable GLB is published and loses it when that custom asset is removed (unless it has a supplied asset). Legacy/reference mode does not advertise configuration. Direct historical routes remain intact. No media or prices changed.

31 focused tests pass, covering all three unavailable houses in the presentation and Explore dialog, an added model with a GLB, and publication-driven appearance/removal. TypeScript and scoped lint pass.

Live availability release: source `b85998625de16465224c1d88913c2519eea05551`, READY production `dpl_EVGeAPBqP3Ps9YVkQeqqAzGGVX5f`, canonical alias `https://okno-homes-aryan.vercel.app`. Live Forza retains Configure yours. Selecting Gaze removes it from the public presentation and Explore dialog (zero Configure links); its specifications and gallery remain. Browser console and scoped error/fatal runtime scans are clean. Screenshot: workspace `outputs/okno-gaze-no-configurator.png`.

## Supplied scene update — 31 October 2026

The owner requested the updated models from the same source. Both GitHub branches were checked: main remains at 075b2dd (18 October) and the release branch has no new external model commit. In the supplied `Downloads/antigravity3D` folder, all three GLB SHA-256 values still match the deployed assets. `walkthrough.html` changed to SHA-256 `36c5c365d06cc0ebcc498f471ba5f7dbf25c225917985ae4cd7b87a178a2aab9`; its material/scene changes were integrated rather than duplicating identical binaries.

Forza, Tengo and Kray now begin with their original architectural roof. Extended thatch slabs and outward straws are hidden until Rustic Canopy / a thatch material is selected; changing roof finish or resetting hides those additions again. Straw strands retain their original material. The updated source's model-specific original-roof labels are used. Existing admin defaults still apply after initial load; previously published custom finishes remain intentional. Website loading, accessibility, responsive camera, CMS mapping and material-specification adaptations are preserved.

Validation: JavaScript syntax and diff checks pass. The actual scene helpers pass original/thatch/metal/reset behavior checks while leaving the architectural roof visible. Local Forza visually shows the original roof, selected thatch, and successful Reset Configuration.

## Demo-priority colour update

During the roof release build, the owner requested newly supplied colour adjustments on localhost first for an immediate demo. Production build `dpl_97D4suzquPzDnXAMLzckLiD28Gcs` was canceled before assignment. The updated source SHA-256 is `87e9f823cabdb7e80912f14c8b4b898cca0956750aaef4dd544d2ddea35e55c3`. All 13 changed source blocks were synced exactly: exposure 1.03, balanced fog/sky/environment and olive-meadow palettes, softer sun with adjusted hemisphere/fill lighting, and environment reflection intensity 1.0.

Local syntax checks and HTTP verification pass. `http://127.0.0.1:3134/models/signature/forza/configure` loads successfully with the new palette; it was opened visibly for the user's demo and left running. Screenshot: workspace `outputs/okno-local-colour-demo.png`. Original GLB checksums still match, and original-roof/thatch-selection behavior remains.

Hosted completion: source `89c04c337905f58d8c33227f4eab3b93692c1322`, READY production `dpl_6aRie1xkvXHzvdsVXWAx7AfrG6s9`, canonical alias `https://okno-homes-aryan.vercel.app`. The served 108,612-byte viewer exactly matches the committed source and matches the verified local demo after Windows newline normalization. Signature and all three configure routes return 200; the scoped runtime error/fatal scan is empty. The local demo process/tab were left running and untouched during cloud verification. The asset inventory entry is corrected to the committed LF byte count (Windows working-file CRLF length differs); the viewer itself is unchanged by that metadata correction.
