# Shared navigation and not-found integration

## Navigation

11 October correction: remove the Models-only capsule introduced by the 7 October M-01 contrast fix. The shared header geometry is authoritative; the selector may adjust foreground contrast over its split background only. See [the header/storage review](header-storage-review-2026-10-11.md) for the correction and verification.

All current marketing pages now use `components/Header/Header.tsx`, the approved Models/Projects navigation composition. The desktop structure retains the left OKNO wordmark, centered navigation and magnetic enquiry control. The same Liquid Morph menu handles mobile navigation throughout the site. Typography is Geist OKNO; the palette is warm paper, charcoal and muted gold. Light and dark page backgrounds change contrast only, not layout or interaction.

Actual retrieved 21st sources retained:

| Component | Demo | Author | Source | Retained and adapted |
| --- | --- | --- | --- | --- |
| Centered Nav Header | 21220 | 7ovr | https://21st.dev/@7ovr/components/centered-nav-header | Centered navigation with left brand and right actions; real OKNO routes and logo. Original source: `docs/21st-source/21220.tsx.txt`. |
| Liquid Morph Floating Menu | 16369 | aayush-duhan | https://21st.dev/@aayush-duhan/components/liquid-morph-floating-menu | Morphing shell, expanding circle, staggered link entrance, rolling hover labels. Added scroll lock, focus containment, Escape/outside close, focus restoration and desktop resize cleanup. Original source: `docs/21st-source/16369.tsx.txt`. |
| Magnetic Button | 1507 | bundui | https://21st.dev/@bundui/components/magnetic-button | Existing retrieved spring/distance interaction on logo and enquiry control. Links retain native navigation. Original source: `docs/21st-source/1507.tsx.txt`. |

`ModelsHeader`, `ProjectsHeader` and `ProcessNavigation` are thin wrappers over the shared component. They preserve model/project enquiry parameters and active route highlighting. Sustainability uses it within the existing pinned story; its media and story sequence are unchanged. Models and Sustainability had duplicate mobile headers; those extra instances are removed. About, Enquiry and Bespoke request the light-background contrast treatment.

The mobile menu includes Home, all seven primary destinations and Enquire. Closed menu links are inert. The active parent route remains highlighted on detail pages. Both desktop and mobile enquiry actions preserve the same supplied query string.

## Not found

Bookmarked source: **not found 2**, efferd, demo **9999** — https://21st.dev/@efferd/components/not-found-2.

Source and demo were retrieved on 2026-09-27 and archived as `docs/21st-source/revision-9999.tsx.txt` and `revision-9999-demo.tsx.txt`. The implementation preserves its oversized fading 404 numeral, centered Empty composition, and paired source Button controls. The `Empty` primitive is from the retrieved dependency bundle; Button uses the existing matching shadcn source primitive. Colors and font match OKNO; placeholder destinations are replaced with working Home and Models links. The 404 title is a semantic `h1` with an accessible label. This is a static gradient on the numeral, not an animated masked text reveal.

`app/not-found.tsx` supplies the fallback for all unmatched routes and explicit `notFound()` calls. Valid pages remain valid. This follows the installed Next 16.3.1 root not-found convention, without enabling the experimental global-not-found feature.

## Focused validation

- Header and not-found suite: 9 tests pass.
- Tests cover query preservation, focus wrapping in both directions, Escape/focus/scroll restoration, resize cleanup, route-choice close, wrapper integration and real recovery links.
- Scoped ESLint passes for all changed files.
- The integration pass corrected canvas mock overload typing in `MorphGallery.test.tsx` and `AtlasGlobe.test.tsx`; full TypeScript and production build then passed.
- Final production HTTP status checks and device screenshots are part of the parent task's integration verification.

## Process schedule consistency and current film consolidation

The `/process` sequence opens with **Built in 90 days.** Its 21st-derived Product Timeline rail includes the same approved schedule used on About: Days 01—10 brief/site, 11—25 design/approvals, 26—60 factory manufacturing, 61—72 packing/transport and 73—90 assembly/handover.

Following the user's request to consolidate the latest work, the reviewed Sep27 Demo implementation is imported: same-site base preparation, wall-panel construction, roof closure and completion, delivered as 1080p films with 720p tablet/mobile sources. This supersedes the older factory/transport stills. The shared Header remains intact. Conceptual panel-build subshots are not assigned invented separate durations. See `process-21st-components.md` for media/source provenance and backup location. The focused ProcessJourney suite covers the new scene headings, 90-day schedule and shared navigation.
