# Shared customer woodland, v1

The customer setting consists of real terrain, instanced fir trees, mossy rocks,
ferns, and grass. No projected photograph is displayed behind the house.
Sky scattering is procedural; a separate HDR supplies lighting/reflections only.
The deterministic site layout has no house IDs and is shared by Tengo and Kray.
House GLBs are loaded separately and positioned in a level central clearing.
Company geometry and source files are unchanged.

## CC0 sources

- Fir Tree 01, variant B: https://polyhaven.com/a/fir_tree_01
- Rock Moss Set 01: https://polyhaven.com/a/rock_moss_set_01
- Fern 02: https://polyhaven.com/a/fern_02
- Grass Medium 01: https://polyhaven.com/a/grass_medium_01

Original glTF files, API manifests and source dependencies are preserved under
`private/configurator/landscape-sources`. Downloaded dependencies were checked
against source MD5 values; the selected fir binary byte range is recorded by the
preparation script rather than claimed to match the complete binary's MD5.
Only these landscape objects were simplified. Source house GLBs were not processed.

## Reproduce

Run `scripts/configurator/prepare-landscape-assets.py` from the checkout, then
install the isolated dependencies listed in `prepare-landscape-assets.mjs` and run
that script. `manifest.json` records source and browser triangle counts.

Meshopt compresses the geometry; WebP preserves 1K texture resolution, with lossless
normal-map transcoding. Content-addressed texture files are shared by tree detail
levels. The viewer also shares their materials/textures and uses instanced meshes.
Foreground trees use more detail; distant trees use lighter meshes. Shadows are
cached and rendering is requested only when something changes. Production cache
headers cover this versioned directory. Future asset revisions MUST use v2 (and
update the renderer URL) instead of replacing v1 after deployment.

Legacy self-contained GLB preparation outputs remain in
`private/configurator/landscape-prototypes` for provenance; they are not served.
