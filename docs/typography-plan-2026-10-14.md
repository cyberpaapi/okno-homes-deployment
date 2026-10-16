# Shared typography implementation — 14 October 2026

> The shared size presets described here are superseded by [original responsive sizes and optional numbers](numeric-typography-2026-10-15.md). This document preserves the earlier implementation/inspection evidence; its size measurements are historical.

Owner request: use Sustainability's Geist OKNO as the public master font, preserve logos, consolidate text into five predefined responsive sizes, expose master/preset/section controls in admin, and verify their public reflection.

## Work division

- Foundation: five responsive role tokens (Display 48–96 px, Heading 36–64 px, Subheading 24–32 px, Body 16–18 px, Caption 12–14 px), allowlisted locally available font families, validated persisted settings.
- Public integration: replace public text-size declarations with roles; bind editable text sections explicitly; retain media, geometry, animations, copy and logo artwork. Signature/Bespoke join the master font.
- Admin integration: shared typography settings plus section body/heading/highlight family and role-to-preset choices, using existing field/disclosure controls and draft/publish/preview transport. No new third-party UI component.
- Verification: validate every generated control and public binding, meaningful store/component tests, full source checks/build, fixed 3140/3134 connected browser publication cycles and route/mobile inspection. Restore QA publications without losing owner changes.

## Scope and acceptance

Only the canonical Final Showcase checkout is edited. Prior dirty changes remain. No deployment, credential change, private media/master change, 3D change or new CMS store. Configurator editing remains hidden; its public typography receives the master tokens. Logo SVG/image artwork and glyph geometry stay fixed. Browser and persistence verification is local; cloud publishing is a separate gate.

Progress: implementation and local publication verification complete. Final source checks and build results are recorded below.

## Delivered controls

Shared site settings → Master font and text sizes owns the master and ten phone/desktop size endpoints for the five presets. Each editable text section has a Section typography disclosure: body, heading and highlight font choices, plus assignment of each role to a shared preset. Existing content and typography remain separate manifests, retaining the original field order and collection workflows. Shared lower-home controls apply to both openings. Projects' collection-only sections are included. Signature plan typography appears under each existing model, alongside its plan editor.

Available families are Geist OKNO, Manrope, Bodoni Moda, system sans and system serif. Local font files are reused with font-display swap. Inherit means the current master; logo images/SVG paths, icon glyph geometry and the cursor's non-text geometry remain independent. Typeface upload is not introduced.

Configurator typography receives the master and shared presets. Its separately deferred editing workflow remains hidden. Section controls are for the current registered sections; collection items inherit their owning section. No new 21st.dev component was introduced: existing sourced editor fields and disclosures are reused.

## Local acceptance

- All 811 typography settings saved through authenticated drafts in bounded API batches, with visitor isolation; publication reached the public snapshot.
- Every one of 100 registered public section bindings was inspected in the actual browser. Body/heading/highlight families and all five role assignments matched the published settings, with zero failures. Coverage includes six models, ten model plans, six Process film chapters, five Process detail phases, four Sustainability story scenes, Press/facts, project detail, a Journal article and all three Enquiry tabs.
- Browser UI exercised all five master font choices and all five section size choices; master and three section font/size controls saved/published through the editor. A saved master draft survived reload/reconnect. An already-open public tab received the new font without reload. Headings and highlights used independently chosen families.
- Defaults restored exactly at local publication 36 with no drafts. The original non-typography fields and collections match the private pre-test snapshot. QA credentials/backups and image captures stay outside versioned delivery. The master is Geist through its source default; QA overrides are removed.
- At actual 1440×900 and 390×844 viewports, all ten main page families used Geist for their HTML text and showed no document horizontal overflow. Display is 96/48 px at these endpoints, Heading 64/36, Subheading 32/24, Body 18/16 and Caption 14/12. Logo artwork is unchanged. Entry animations/media loading remain the existing page behavior; this is typography acceptance, not a new physical-device or media-performance certification.
- Full Vitest suite: 107 files / 419 tests passed. TypeScript and production build passed. Changed source lint is clean; full source/scripts lint is clean with the pre-existing supplied cabinScene.js excluded (its two existing unused-expression warnings are unrelated and the supplied 3D code was preserved).
- A concurrently authored V2 optional replacement-film field exposed an empty-default validation mismatch during the exhaustive registry test. The CMS now allows only an empty video whose declared default is empty; required media and path/existence checks remain. This is a narrow registry-compatibility correction, without film or geometry changes.

Evidence: [published reflection for every section](evidence/typography-2026-10-14/publication-reflection.json), [verified desktop/mobile dimensions and computed fonts](evidence/typography-2026-10-14/default-layouts.json). Local screenshots are retained privately at /home/CodeAcc2007/Documents/ChatGPT/OKNO Homes/typography-qa-2026-10-14.

The current publication test is local. No cloud publication or deployment was attempted. Arbitrary font/size/copy combinations remain owner choices; the tests verify every registered control's persisted and rendered connection, rather than claiming every possible combination has been visually approved.
