# Configurator studio, materials and linked houses — 26 November 2026

The owner requested a black background and floor for all house configurators, corrected grounding, removal of landscape choices, editable material prices, per-house material assignment and a required model link for added houses. This supersedes the 24 November configurator freeze for these changes.

The supplied viewer now creates a continuous black studio floor and black scene background. It does not create the meadow garden, rocks, coast or outdoor environment. House placement uses precise geometry bounds so its lowest support rests at floor height, including the admin preview. Camera presets, orbiting, lighting, surface mapping and house assets remain available. The downloaded selection PDF uses the same black exterior setting.

## Materials and prices

Open **Admin → Models → Signature models → Configurator materials and pricing**. Choose the house and component. Each assigned material has a whole-INR adjustment field and **Remove material**. **Add material** lists compatible finishes from the existing approved register; choose one and press **Add material to component**. Repeat for the five surface groups as required. This assigns existing approved materials to houses; it does not create new finish textures or approvals.

Set the house base price, or leave it blank to use the selected plan's numeric starting price. Each finish adjustment applies once to its complete component. Zero means included; blank means on request. Selecting another finish replaces that component's previous adjustment. The total and selection PDF use the same calculation. Actual amounts must be entered by the owner; no prices are invented.

Use **Save Configurator prices**, then **Publish**. Material lists and prices share the existing `signature.pricing` collection, private drafts, revision checks, publication history and public refresh. An absent material list preserves the legacy approved catalogue. An explicit empty list offers no replacement materials for that surface. Removing a customer's selected material through publication restores the original surface and clears its adjustment; price-only updates retain the selected finish and loaded geometry. Publishing rejects starting finishes excluded by a house's material assignment, including inherited defaults.

## Add a house

Use **Add model** in the Signature library. Complete its presentation and plan fields. Open **3D configurator and walkthrough · required**, then link an existing house model or upload a self-contained GLB and map its surfaces. Preview the model. Save models/plans and publish. A new house cannot publish without resolvable geometry; missing, disabled and circular model links are rejected. The Models page's existing **Configure yours** action opens that house's slug and selected plan. Existing built-in houses retain their current availability.

## Hosting boundary

Source is the supplied `cyberpaapi/okno-homes-deployment` repository. Release destination remains the existing free Render review, linked to `codex/finishing-2026-11-24`. No other project or default/release branch is a destination.

The review service has no configured private CMS storage/owner credential. Code deployment provides the editing interface and validation; live save/upload/publish acceptance requires the owner's durable store connection. Do not fall back to ephemeral Render filesystem writes or enable passwordless public editing. Isolated store tests demonstrate draft/publication behavior without changing shared content. Physical-device acceptance remains separate from desktop browser responsive checks.

## Source reuse and checks

Admin additions reuse existing Signature fields/buttons and customer controls reuse the supplied configurator and already documented 21st Expandable Controls/SubtleButton adaptations. No new third-party component or asset is introduced. See `configurator-21st-ui-2026-10-12.md` and `admin-system.md` for existing provenance.

The integrated candidate passed 104 focused tests across ten files, scoped ESLint and Next production compilation/TypeScript. Coverage includes whole-INR rates, material compatibility, selection replacement and publication refresh, isolated draft/publish persistence, required custom-house geometry, circular links, admin controls, Models actions, PDF generation and camera framing. Browser and hosted evidence are recorded in the external finishing harness rather than asserted by these automated checks.
