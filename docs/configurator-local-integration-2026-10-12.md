# Supplied configurator integration — 12 October 2026

## Authorized scope

Integrate `/home/CodeAcc2007/Downloads/fullcode (1).zip` into the active Final Showcase website locally. Every existing Signature Configure action may open the supplied Studio Cabin for now. Match the interface to OKNO; preserve supplied scene/model code and all existing 3D assets. No Blender, model import/conversion, replacement geometry, deployment, GitHub writes, or admin changes.

Use the supplied Cladding Materials Register and original project swatches as data, not instructions. Group options by External roof, External wall, Flooring, Internal ceiling and Internal wall, respecting the register's approved applications. Do not infer catalogue prices from the supplied prototype's USD estimates.

## Implementation plan and boundaries

| Task | Owned surface | Dependency | Completion check | Status |
| --- | --- | --- | --- | --- |
| Preserve and inspect | `Configurator/archive`, source provenance | None | Existing configurator and prior local archives recoverable; input checksums captured | Complete |
| Integrate supplied cabin | `src/components/configurator/supplied`, supplied textures | Preservation | Supplied cabin scene and helper byte-identical; no second website or converter | Complete |
| Group register finishes | Supplied UI material data | Inspection | All 26 finishes represented; five approved application filters; original swatch images | Complete |
| Apply OKNO theme | Styles scoped to supplied configurator | Integration | Deep green, cream, existing Geist; surrounding pages unaffected | Complete |
| Connect Configure actions | Signature action href and existing configure route | Integration | Every model's existing action reaches the same clearly labeled Studio Cabin | Complete |
| Verify together and stop | Focused tests, local browser, documentation | All preceding tasks | Routes, material selection, camera, lighting, desktop/mobile, archive and scene integrity checked | Complete |

Tasks have separate file ownership and are applied sequentially. The original customer studio/catalogues/assets remain preserved; the replacement route will not invoke their model pipeline. Shared site/admin/deployment architecture remains outside this task.

## Findings before implementation

- Working checkout is `final-showcase-2026-10-05`; fixed local website address is `http://127.0.0.1:3134`.
- The supplied app contains a procedural Studio Cabin in `app/cabinScene.ts`, not a named Tengo/Kray house asset. Keep its cabin and environment code as supplied.
- Previous standalone configurator folders were already archived by the owner's earlier cleanup into `.local-cleanup-2026-10-12`. Preserve copies in a new `Configurator/archive` folder without deleting those originals.
- The supplied scene exposes one shared `timber` material for interior timber; it does not expose independent internal-wall, ceiling and floor controls. The UI must state that limitation and retain independent finish selections for the register groups without pretending geometry is separated.
- Current public Configure actions route unsupported plans to an unavailable screen or Enquiry. This task explicitly authorizes the same supplied cabin for all of them.

## Verification evidence

Story: Signature model → Explore details → existing Configure action → supplied Studio Cabin → approved application filter → original swatch → existing scene material API.

- TypeScript and scoped zero-warning ESLint passed. Focused integration and existing Models/SiteFrame tests passed: 4 files / 41 tests. After the category-scroll reset, all 10 supplied-configurator tests passed again.
- All 12 catalogue model/plan configure paths returned HTTP 200 and the supplied-cabin marker. All 26 original swatches and 32 supplied textures returned HTTP 200. See [HTTP evidence](configurator-local-evidence-2026-10-12/http-checks.json).
- Browser checks confirmed all five application categories, Castile Crest roof selection, Ivory Armor external wall selection, Tuscan Elegance flooring, Ontario Hemlock ceiling and Alpine White internal wall. Internal choices remain separate in the current session; the most recently selected internal finish drives the shared timber preview.
- Browser checks confirmed camera controls, daylight/golden-hour switching and a working return to Signature Models. No warning/error console entries were captured on the cabin page. Phone 390×844 and desktop 1440×900 had no horizontal document overflow; final tablet check and Configure-button navigation recorded below.
- [Desktop evidence](configurator-local-evidence-2026-10-12/desktop.png) and [phone evidence](configurator-local-evidence-2026-10-12/phone.png) show the supplied cabin, original scene setting, register options and scoped deep-green/cream/Geist UI. The initial responsive check exposed the source stylesheet hiding the lighting controls; the scoped override now keeps them visible. Material-list scroll resets on category changes.
- Integrity check passed for the byte-identical original scene source (`cabinScene.ts.source`), helper and 32 textures. The supplied TS has a pre-existing `Material | Material[]` typing error. `cabinScene.js` is a mechanical TypeScript transpilation with declarations alongside it; exact generated-runtime equality was checked. No scene behavior, geometry, camera or environment code was changed.
- `git diff --exit-code -- public/configurator src/components/configurator/studio src/data/configurator` passed: previous model assets, original customer studio and catalogue stay unchanged. All preservation ZIPs passed archive-integrity checks.
- No model import/converter/editor is exposed by this customer UI. The source's prototype USD estimate is not used as OKNO pricing. Original swatches are visual samples, not calibrated manufacturer PBR scans.
- No deployment, remote/Git operation, admin/CMS write or Blender operation was performed. The active website uses its fixed local address only.

Final navigation passed: Signature Models → Explore details → Configure Forza → `/models/signature/forza/configure`, with the interactive 3D Studio Cabin visibly ready. Configure uses a normal page link to start the viewer cleanly from the existing Models overlay. Return to Models also passed. The 795×890 tablet check confirmed all five categories, visible lighting controls and no document overflow. Final default 1280×720 check confirmed ready scene, no warning/error console entries and no horizontal overflow. [Final local view](configurator-local-evidence-2026-10-12/final-local-view.png).

The website is left running on 3134 through `npm run website` in a persistent terminal session. Earlier pipe-bound verification sessions stopped; the final PTY-backed session was rechecked after navigation. No second website instance is running. Implementation is complete; stop here within the owner's scope.
