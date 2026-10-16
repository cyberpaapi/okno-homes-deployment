# House derivative tooling

`prepare-house-assets.mjs` creates a new GLB and a source/output integrity report. It never writes the supplied masters. Use one process at a time and review results before updating the customer manifest.

The production website needs no additional dependencies: Three.js supplies its Meshopt decoder. Conversion uses a separate tool installation outside the checkout with `@gltf-transform/core@4.2.1`, `@gltf-transform/functions@4.2.1`, `@gltf-transform/extensions@4.2.1`, `meshoptimizer@0.24.0` and `sharp@0.35.5`.

Install these packages in an isolated tooling directory, copy `prepare-house-assets.mjs` into that directory so its imports resolve, then run:

```sh
node --max-old-space-size=2048 /path/to/tooling/prepare-house-assets.mjs forza /path/to/master.glb /path/to/new-output.glb /path/to/asset-surfaces-v2.json /path/to/report.json
```

The script checks available memory before starting, processes textures serially with one native image thread, and validates output by decoding it again. Outputs retain source units (metres), authored material parameters and architectural geometry; only documented detached objects are removed. Only the explicit 83 untextured Kray base profiles use topology simplification, bounded to 0.5 mm absolute error; their normals are regenerated. Architectural finish groups are excluded. Batching and texture compression apply to the rest without a global simplification pass.

Mappings use source node indices **before** flattening or batching. Materials retain semantic surface extras so merge operations cannot lose independent finish groups. Kray's closed roof geometry is split by face orientation during preparation: downward faces belong to the ceiling, with independent roof materials. Source materials shared by instances are cloned before tagging. Tish and Tengo mixed meshes use explicit face-plane predicates; glazing is excluded from finish groups.

After multi-angle review, name the runtime file using its SHA-256 prefix, update `src/data/configurator/signatureAssetManifest.json`, and run:

```sh
node scripts/configurator/verify-house-assets.mjs
```

See `docs/configurator-assets-2026-10-15.md` for mapping, review, benchmark and acceptance limits. Suite is deliberately kept outside the public asset registry pending a product mapping and a lighter runtime candidate.

For geometric regression checks, copy `verify-surface-visibility.mjs` to the isolated tooling directory and run it from the checkout with a 1 GiB heap. It reads `surface-visibility-probes.json` and the current manifest, then verifies first-hit surface ownership at fixed source-coordinate points:

```sh
node --max-old-space-size=1024 /path/to/tooling/verify-surface-visibility.mjs /path/to/visibility-report.json
```

Current repair evidence: `docs/configurator-mapping-2026-10-16.md`.
