# OKNO models: artist handoff and admin guide

The customer configurator loads a house automatically. Customers choose approved materials, move around the house and download a PDF of their selections. GLB upload, surface setup and starting finishes belong in the admin panel.

The supplied houses are **Forza, Kray and Tengo**. These are the spellings in the existing website and delivered model files. Their reviewed, prepared GLBs are already included in the website. Keep the large original source files separately; use the prepared web models for the site.

## Prepare a model for the admin panel

- Export **glTF 2.0 Binary (.glb)** with its geometry, buffers and textures embedded in one file. The upload limit is **100 MB**; aim for under 20 MB where practical. The raw Downloads masters exceed the upload limit and must be optimized first.
- Use metres, glTF's Y-up orientation, and a level house. Apply transforms before export. Place the floor around Y = 0. The viewer centres the bounding box, grounds the house and fits its camera automatically; it preserves the building's proportions. It does not guess units or correct a rotated building. Use the admin unit field if the exported coordinates are in centimetres (0.01) or millimetres (0.001); correctly exported metre GLBs use 1.
- Remove stray geometry, distant construction guides, unused hidden objects and duplicate shells. Bounds include all exported house geometry; a faraway object will make the house look small.
- Export ordinary triangle meshes with correct outward normals. Keep internal wall, ceiling and floor skins visible from inside. Test both exterior and interior views. Transparent glass must have its own material and mesh.
- Make each independently editable surface a separate mesh. Do not join the roof, floor, walls and furniture into one mesh. Split multiple material slots into separate mesh objects before export.
- Give meshes unique, stable names. Keep those names stable in later revisions, especially if an admin has mapped them by name. Use names such as `ext_wall__north`, `int_wall__bedroom`, `flooring__living`.
- Use standard glTF PBR materials with embedded JPEG, PNG or WebP textures. Use sensible UVs for original materials. Material choices use the supplied visual samples with model-space projection; the previews are not calibrated physical samples.
- Prefer 1K–2K textures, reuse textures, and reduce excessive triangulation. A reasonable mobile target is below 300,000 triangles; this is guidance, not an enforced polygon limit. Check on a real phone before release.
- Export without Draco, Meshopt or KTX2/Basis compression for admin uploads. The upload validator rejects required unsupported decoders. Existing reviewed bundled derivatives are a separate prepared pipeline. Do not include external file paths or remote URLs for images or buffers.

## Mark the five editable surfaces

Use either a mesh name beginning with the exact key followed by `__`, or a custom property named `housePartKey` on the mesh/object. Export custom properties into glTF `extras` (for example enable Custom Properties in Blender's glTF export). Tags on a parent group are inherited, so do not tag a group that also contains furniture or glass.

| Editable surface | Key | Example object name |
| --- | --- | --- |
| External roof | `ext_roof` | `ext_roof__main` |
| External wall | `ext_wall` | `ext_wall__north` |
| Flooring | `flooring` | `flooring__living` |
| Internal ceiling | `int_ceiling` | `int_ceiling__bedroom` |
| Internal wall | `int_wall` | `int_wall__bedroom` |

Example glTF node metadata:

```json
{
  "name": "Wall_North",
  "mesh": 0,
  "extras": { "housePartKey": "ext_wall" }
}
```

Furniture, frames, glazing, fixtures, foundations and landscaping should have no surface tag or editable name prefix. They retain their original materials. An external roof and internal ceiling need separate skins for independent finishes. The existing prepared OKNO assets also support their reviewed material-level `oknoSurfaces` metadata and independent ceiling backfaces.

Mapping priority: an admin's exact mesh-name override, then the nearest node/ancestor tag or recognized `key__name` prefix, then supported material metadata. The viewer does not infer a surface from its colour, shape or an arbitrary name such as “brown material”. Unmapped surfaces are unavailable to customers and identified in the admin preview. Duplicate mesh names receive the same override; avoid duplicates.

## Admin workflow

1. Open the website's `/admin` using its existing access configuration. Locally the website is at `http://localhost:3134`; the existing `npm run admin` gateway uses port 3140. This Windows checkout opens without a key, as requested on 9 November 2026. Its ignored `.env.local` enables `OKNO_ADMIN_PASSWORDLESS=true`; local services remain bound to loopback.
2. Open **Models → Signature models**. Choose **Add model** to create a new house, or open an existing house. Set a stable house ID, name, media, story, gallery and at least one plan using the existing editors. Those public-page requirements still apply before publishing.
3. Open **3D configurator and walkthrough**. Under **Link an existing 3D model**, choose Forza, Kray, Tengo or another house that has a valid 3D model. Otherwise leave “This house’s own model” selected and choose **Upload new 3D model**. A successful upload stores the GLB and replaces the link; it does not publish the house.
4. Set **Metres per model unit** to match the exported coordinates. Click **Preview model and materials**. The model is automatically centred and framed. Use Fit model, Front, Side, Plan and Inside to inspect it.
5. Check the five surface counts. If a surface says **Not mapped**, open **Inspect and assign mesh surfaces**, find the mesh and choose its surface. The exact-name text fields provide the same mapping for batch work. Select **Automatic** to remove an override and return to the GLB's tags. Assigning separate faces of a joined mesh requires editing the source model, not merely renaming the mesh.
6. Choose a starting finish for each surface. The draft preview updates immediately. The dropdowns only offer finishes approved for that surface in the supplied register. Blank means the original GLB finish; for a linked house blank inherits the source house's starting finish.
7. Click **Save Signature models and plans**, then **Publish changes** after reviewing the draft. “Open published configurator” shows the currently published version, not unsaved changes. The website's **Configure yours** action opens this house directly.
8. In the customer viewer, test all five surfaces, interior/exterior views and **Download selections PDF**. Verify the PDF's house name and finish choices. Untouched finishes are described as unspecified original model finishes; unavailable surfaces are explicitly identified.

Linked houses share the source geometry, units and surface mapping, while their starting finishes can be overridden independently. Updating a source model updates its linked houses when published. Uploading a new GLB on a linked house makes that house independent. Renaming a source house in the editor updates its links. Circular/broken links are rejected when publishing; relink dependants before removing a custom source house.

## Material authority

Verified against **Cladding_Materials_Register.pdf, page 9**, on 9 November 2026: all 26 names and every application match. Allowed finish counts are roof 10, external wall 10, flooring 8, ceiling 17 and internal wall 12. A material approved for one surface is not automatically available for every surface. For example, Alpine White is only for internal ceilings/walls, and Silea Sandstone is for flooring/internal walls, not ceilings.

The finish library uses the supplied register's visual samples. Actual colour, sheen, grain scale, prices and model-specific construction compatibility still require physical samples and OKNO confirmation. The generated PDF is a material selection summary, not a price quote or construction specification.

## Maintainer map

- Customer route: `src/app/models/signature/[slug]/configure/page.tsx`.
- Customer controls: `src/components/configurator/supplied/SuppliedConfigurator.tsx`.
- Shared scene and surface contract: `cabinScene.js`, `surfaceMapping.ts` in the same folder. The preserved original scene is `cabinScene.ts.source`; runtime extensions are in `.js`.
- Admin-only setup: `src/components/admin/SignatureModelPanel.tsx` and `ModelSetupPreview.tsx`.
- Asset/link/default resolver: `src/lib/configuratorSettings.ts`. Reusable links are `configuratorSource` references within the Signature house library, not a second CMS.
- Prepared supplied asset manifest: `src/data/configurator/signatureAssetManifest.json`.
- Approved catalogue: `src/data/configurator/materials.ts`; admin IDs retain the register numbers in `src/data/configurator/antigravity/finishes.json`. A regression test compares both to the PDF's matrix.
- PDF: `src/components/configurator/supplied/selectionPdf.ts`; jsPDF loads on demand.
- Existing authenticated upload routes, private Blob production storage and local media store remain in use. No new public upload endpoint is added.

Start the website from the repository with Node 22 and `npm run website`. The restored standalone Studio Cabin editor on port 3000 remains a separate recovery copy. The website integration is on port 3134. This change does not deploy itself to Vercel.

## Local verification — 9 November 2026

79 focused tests pass across 12 files, including the PDF matrix, safe links, draft/publication isolation, circular-link rejection, admin upload/link/setup controls, model fitting and customer controls. TypeScript, scoped ESLint and whitespace checks pass. The Next.js production compilation and static generation pass.

Browser checks loaded Forza, Kray and Tengo with no warning/error console entries. Tengo's five surface choices were exercised independently; an actual PDF download was parsed and visually reviewed with Ivory Armor roof, Golden Oak external wall, Tuscan Elegance flooring, Ontario Hemlock ceiling and Alpine White internal wall. Kray was checked at 390 × 844 with no horizontal overflow. The live local admin preview displayed Forza with mapped counts for all five surfaces.

Local key-free upload/save/publish acceptance passed after the owner requested removing the key. A real GLB upload, an added linked house with an independent starting finish, private draft isolation, publication, browser rendering and GLB range delivery were verified. The fixed admin gateway also saved/published without a key. Original site content was restored exactly after QA; cross-site writes remain rejected. The separate Windows function-trace packaging check fails (largest observed upload trace about 2,071 MiB, including public assets); this is not a deployment-ready release. Next's installed trace exclusion matcher joins Windows paths without normalizing separators, so a Linux release build/trace check or a separate portable tracing fix is needed before deployment. Nothing has been pushed or deployed.
