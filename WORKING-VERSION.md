# Current working version

- **Version:** `final-showcase-2026-10-05`
- **Canonical folder:** `/home/CodeAcc2007/Coding/Alphacode AI/OKNO Homes Website/OKNO-homes-final-showcase-2026-09-23`
- **Runtime identity:** `okno-final-showcase@2026-10-05`
- **Canonical local preview:** `http://127.0.0.1:3134`
- **Canonical local admin:** `http://127.0.0.1:3140/admin`
- **Status:** active and locally verified working version

## Admin work in progress — 7 October 2026

The page-ordered content studio is being rebuilt **in this Final Showcase folder**, not in the renamed historical `OKNO-homes-older-version`. The user approved the [6 October page-wise completion plan, revision 3](docs/admin-completion-plan-2026-10-06.md) and requested a live [build and testing checklist](docs/admin-build-checklist-2026-10-06.md). Addable Projects, linked Hospitality selections, Home variants, Models/Signature/Bespoke/configurator copy, Sustainability, Journal, current About, Enquiry, Header and Global Brand are in implementation and verification. The user released the Projects-globe deferral on 7 October and then separated globe pins from Project library records: a place can appear on the globe without any project, photo or detail page. The user also released the Footer content exclusion for its completed shared layout; Footer text, links and social icons have a page-ordered admin editor while the approved layout remains unchanged. Process timeline content editing is now released for the accepted five-slide scroll composition; its geometry and film cue timing remain fixed. This is still a local-only CMS, not a production deployment or a new version tag. Read [`docs/admin-system.md`](docs/admin-system.md) for provenance, decisions, limits and verification history.

The client now owns Signature plan area and starting-price display strings directly in the admin, including Gaze; no external catalogue confirmation is required for those public values. This does not change internal geometry or create a price calculator. See the current decision and QA entries in `docs/admin-system.md` and the testing checklist.

On 11 October 2026 this canonical source received its own Git repository for the private `CodeAcc2007-dev/okno-homes-deployment` release. The working marker remains the accepted Final Showcase version, not a newly inferred Git tag. Read `docs/deployment/release-ledger.md` for exact release commits and cloud verification; do not infer history from the older checkout.

Always start and open this checkout on port **3134**. Use a different port only when a second website must run simultaneously, and explicitly state both the working port and the URL being opened.

Admin requests have their own fixed port **3140**. Run `npm run admin` and open only `http://127.0.0.1:3140/admin` when asked to start/show the admin. The admin port is a local gateway to the same Final Showcase Next process on 3134, not a duplicate website server. It rejects public page routes. The port reservation lives in `config/local-ports.json`; do not pick a new admin port ad hoc.

## Deployment work — 11 October 2026

The user authorized private GitHub source and same-domain website plus `/admin` on an isolated Vercel project. Admin has no public navigation link. Current production decisions and acceptance are in [`docs/deployment/README.md`](docs/deployment/README.md); earlier local-only statements do not describe this release. Local services and current visual design remain the baseline.

## Non-negotiable shared shell

- Footer owner: `src/components/Footer/SiteFooter.tsx`
- Cursor owner: `src/components/CustomCursor/CustomCursor.tsx`
- Active cursor implementation: `src/components/CustomCursor/ObsidianCursorTrail.tsx`
- Global mount: `src/app/layout.tsx`

The layout owns the shared footer and cursor. Route components must not import or mount their own copies.

The shared footer uses the user-approved Vize layout reference in OKNO's deep green palette: the supplied wordmark, three compact navigation categories, the four social profiles linked from OKNO's official site, and a quiet copyright strip. SiteFrame omits it from the immersive Signature Models route and its configurator descendants.

Route-specific footer surfaces match the page ending: landing charcoal on `/` and both hero previews, the dark/pale split of Enquiry on desktop and its pale form surface on mobile, pale blue with dark controls on Bespoke, near-black on Sustainability, and the Journal hero palette as a gradient on Journal. Projects and About retain their silk backdrop. Process, Projects, and About use tighter final-section spacing; see [`docs/footer-21st-components.md`](docs/footer-21st-components.md).

The Enquiry screen now participates in document flow so the shared footer follows the form and is reachable by scrolling. Its visual entrance, two-column composition, and fluid background remain within the Enquiry section.

### Previous footer verification — 5 October 2026

- Focused footer and cursor tests: 2 files, 8 tests passed.
- TypeScript and zero-warning ESLint passed.
- Production build passed and generated 23 pages.
- All 15 launcher routes returned HTTP 200.
- Browser checks on Hero V1, Hero V2, Hospitality, Signature Models and the Tengo configurator each found exactly one Footer Section 2071, no former ribbon and no framework overlay or console warning/error.

## Homepage versions

- Published homepage: `/` reads the saved V1/V2 choice in `src/components/landing/HomeVariant.tsx`; V1 is the fallback. This new selection still requires end-to-end admin verification.
- Hero V1 preview: `/hero-v1`; owner `src/components/landing-options/ForestEntryOption.tsx`
- Hero V2: `/hero-v2`; owner `src/components/hero-v2/HeroV2.tsx`
- Hero V2 reuses the canonical V1 lower page from `src/components/landing/LandingExperience.tsx`; it has no copied V1 component tree.

The obsolete duplicate `/landing-options/forest-entry` route was removed. Its implementation remains the active Hero V1 component and is not duplicated.

## Latest page consolidation

The Final Showcase retains all main pages. The 4 October Hospitality revision replaces the rejected video-expansion and zoom-parallax opening with the green Silk background, photographic editorial opener, updated bento, existing project gallery, timeline and enquiry close. The page inherits the global footer and Obsidian cursor.

### Hospitality bento restoration — 5 October 2026

The rejected lead-and-text-card replacement was removed. Hospitality again uses the earlier approved adaptation of 21st.dev Bento `6541` by `kinfe123`: two large photographic cards followed by three smaller photographic cards in the source component's six-column geometry. The original OKNO copy, local project imagery and dedicated mobile composition were restored from the preserved 30 September checkpoint.

- Focused Hospitality tests: 5 passed.
- TypeScript and zero-warning ESLint passed.
- Production build passed and generated 23 pages.
- All 15 launcher routes returned HTTP 200.
- Browser verification at 1403×890 confirmed five cards in the restored six-column geometry, no horizontal overflow and no console warnings/errors.

## Verification — 4 October 2026

- Vitest: 38 files, 136 tests passed with one worker.
- TypeScript: `npx tsc --noEmit` passed.
- ESLint: passed with zero warnings.
- Next.js production build: passed; 23 pages generated.
- Launcher: all 15 configured entry routes returned HTTP 200 on the production build.
- Browser: Hospitality, `/`, `/hero-v1` and `/hero-v2` rendered without an error overlay or console warnings/errors; each had exactly one footer and one Obsidian cursor root.

See [`docs/README.md`](docs/README.md) for the active documentation map.
