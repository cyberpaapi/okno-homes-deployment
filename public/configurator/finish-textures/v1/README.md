# Client finish textures for the 3D view

Tileable textures taken from the client's Forza GLBs (received 16 November 2026, `Forza_01`–`Forza_11.glb`). They render a finish on the house in 3D at its real size. The customer still picks from the original register samples in `../../material-details/v1/`, which are unchanged.

| Finish | Source file | Source material | Source tile |
| --- | --- | --- | --- |
| Ebony Timber (09) | Forza_05.glb | Lunawood Luna Pro Coated Pure 20P142 Hidden Nailing Brushed Black | 1.829 m × 3.049 m |
| Golden Oak (10) | Forza_04.glb | Oak Stack (VCM2U4) | 1.11 m × 2.5 m |
| Barcelona Blaze (05) | Forza_02.glb | Roofing Shingles Asphalt | 0.914 m square |

The source pixels are only resampled and repeated into a square tile, because the viewer projects one square tile per `metersPerTile`. Shingle rows are compressed by cos 40.9° so courses keep their true height on the roof slope. Sizes, hashes and tile sizes are in `src/data/configurator/finishRenderTextures.json`.

The finish matches are visual: Lunawood is a black thermowood, Oak Stack a natural oak board, and the asphalt shingle the darkest of the four register shingles. Rustic Canopy keeps the client's original register sample (owner request, 16 November 2026).
