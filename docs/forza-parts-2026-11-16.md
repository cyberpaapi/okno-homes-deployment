# Forza: client materials per part — 16 November 2026

The client sent 11 complete Forza GLBs (`Forza_01`–`Forza_11`, 36–38 MB each). All share the house geometry; they differ only in the roof, wall and deck materials. The owner chose part-by-part finishes over 11 fixed looks.

- **Base model:** unchanged geometry and textures (`forza-d02b0cab22bb.glb`, 1.71 MB). The timber bands' roof portion is split into separate primitives tagged `oknoRoofBand` (fitted to the two asymmetric roof slopes; no geometry moved). `Forza_01` was not used as the base: it matches the live model, is 36 MB and has a black object in front of the inside camera.
- **Roof bands:** hidden when the customer picks a shingle or thatch roof, shown for metal roofs (`coversRoofBands`, `scene.roofBands`).
- **Finish textures:** Ebony Timber, Golden Oak and Barcelona Blaze render with the client's tileable textures at their real size; see `public/configurator/finish-textures/v1/README.md`. Swatches the customer picks from are unchanged.
- **Thatch:** Rustic Canopy keeps the client's original register sample (owner request).
- **Not used:** plain metal colours (the register samples are richer), the white wall texture (no register match), polished concrete (the configurator has no deck surface), and the 4096/8192 px interior textures.
