# Customer material rendering assets

The six base materials are from ambientCG, licensed CC0-1.0. Each directory includes the original asset URL and download reference in source.json, plus dimensions and SHA-256 checksums in manifest.json. Source JPG maps are preserved in private/configurator/pbr-sources; prepare-pbr-textures.mjs transcodes them to WebP at their original 2K dimensions without enlarging thumbnails.

Sources: https://ambientcg.com/a/Wood095, https://ambientcg.com/a/WoodFloor051, https://ambientcg.com/a/WoodFloor034, https://ambientcg.com/a/Plaster001, https://ambientcg.com/a/Tiles139, https://ambientcg.com/a/Bricks024. License: https://docs.ambientcg.com/license/

The renderer uses independent colour, OpenGL normal and roughness maps. Palette tinting is performed at render time to approximate the supplied register samples. Cladding seams and timber joints use analytic shading relief. These are visual approximations, not measured manufacturer PBR scans or construction specifications. The register thumbnails remain unchanged. Specific shingle/thatch sample patterns and company-uploaded custom materials retain their own imagery with bump shading and anisotropic filtering.

RoofingTiles013A and WoodSiding008 were reviewed and not used because their pattern/condition did not match the register. No downloaded model or house geometry is used.
