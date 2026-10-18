# Loading and reliability review — 18 October 2026

Scope: diagnose reported lag on fresh local and Vercel visits, preserve the accepted design and media, repair reproducible failures, and verify desktop/mobile public flows. No billing, credential, storage migration or unrelated-project changes.

## Plan and evidence

- [x] Confirm canonical checkout, dirty-file baseline, available RAM and live deployment identity.
- [x] Restore the fixed local production preview in a user service, independent of the chat process.
- [x] Audit public routes, referenced assets, content API and media byte ranges on production and local.
- [x] Inspect desktop/mobile layouts and representative interactions on the main routes, films and configurators.
- [x] Reproduce failure paths and fix bounded resource/recovery issues.
- [x] Run regression tests, lint, typecheck and an isolated low-memory production build.
- [x] Confirm fixes against the local production build and record remaining limits.
- [ ] Publish the owner-approved change and confirm the exact READY deployment and live checks.

Baseline: Vercel alias serves READY `dpl_GBJSzMRCvUqG8DEi9aNfaJwPyZJH`, application SHA `7463faf7e9c501a11d45ba3277988dceb6491d51`, region `bom1`. The connector returned a team-scope 403; the already-authenticated CLI successfully inspected this exact project and deployment. Local ports were unoccupied. Prior detached shell launches did not remain available; the production launcher now runs under the transient `okno-local-website.service` user unit, with restart-on-failure and the existing `.next-release-mobile-2026-10-16` build for baseline comparison. This does not change automatic login startup.

The owner clarified that lag mainly affects fresh visits. The inspected live Home/Projects/Process/Models/Signature/Forza configurator/Hospitality/Sustainability/Journal/About/Enquiry desktop flows showed no console warnings/errors. At 390 × 844, the inspected Home, Hero V2, Projects, Process, Models, Bespoke, Hospitality, Sustainability, Journal, About and Enquiry pages had no horizontal overflow, visible broken images or alert errors. These are bounded browser checks, not multi-day or physical-device acceptance.

Existing manual/documentation changes are preserved. Impeccable's context launcher was unavailable in this session (`Permission denied`); current project documentation and its optimization/craft references provide the diagnostic context.

## Findings and repairs

1. **Local process lifetime:** there was no listener on either fixed port. The local preview now uses the existing production launcher in a transient, restart-on-failure user service instead of depending on a shell/chat process. It serves `.next-release-reliability-2026-10-18` on 3134; `okno-local-admin.service` runs `npm run admin`, reusing that site on fixed 3140. These services survive the chat during the current login session; they are not boot/login autostart configuration. `systemctl --user stop okno-local-admin okno-local-website` stops this preview. The launcher also now checks the selected `OKNO_BUILD_DIR` rather than unconditionally requiring `.next/BUILD_ID`, and readiness covers all four actual customer configurators (17 entry routes).
2. **Stalled Hero requests:** both image scrubbers previously awaited range fetch/body completion without a deadline. `fetchFrameRange.ts` adds a six-second attempt deadline, one cache-bypassing retry, strict range/body validation, parent cancellation and immediate body cancellation when a server ignores a byte range. The native fallback is reached after bounded failure. Cache caps, real source frames, accepted scrolling and original movies remain unchanged. Disposal also clears request/decode bookkeeping and removes the abort listener.
3. **Stalled publication refresh:** one pending content request previously held the shared fetching flag indefinitely. Refresh now times out after eight seconds and is aborted when the last subscriber leaves; later polls can retry, and source/published values remain visible. The existing fifteen-second interval and preview-origin checks remain intact.
4. **Cold Projects image conversion:** sampled uncached 1920px quality-90 card requests took 1.492s and 1.728s on Vercel; a cover request at 1080px quality 75 took 0.567s. Seven card photographs now have 42 prebuilt WebP sizes at the existing quality 90, totaling 11,471,128 bytes across all sizes. The processing recipe is included in each immutable asset name. `node scripts/prepare-project-covers.mjs` regenerates the manifest and asset inventory. Existing prepared lead photos use the existing loader; unknown/CMS sources retain Next's image fallback. This removes request-time resizing for these known covers; it does not establish a live LCP/INP improvement before release.

The existing sourced Gallery4 and PrismaHero structures, text, crops, animations and controls were preserved; only their image delivery changed. Existing provenance remains in the Projects source comments and Projects documentation. No new 21st.dev component was introduced.

## Verification

- Pre-change production: 34 route/API checks, 117 referenced JS/CSS/static assets and 12 film start/end range checks passed. All 12 byte samples matched their local sources. The requested three-day error-log query returned no entries; this does not guarantee retention or coverage of every historical request.
- Updated local production: 34 route/API checks, 126 referenced assets and 12 source-matching media ranges passed. The standard launcher separately verified 17 entries and 20 stylesheet assets. The fixed admin gateway reused the site successfully.
- Engineering: **115 test files / 455 tests passed**, zero-warning lint, TypeScript and isolated production build passed, and **30 function traces passed** (largest 179.7 MiB; secrets excluded and required customer models/media binaries retained). Additional launcher syntax/scoped lint and all 17 readiness checks passed after its preflight correction. Next's generated temporary TypeScript build-directory includes were removed afterward.
- Build: one CPU worker and a 2304 MiB Node heap setting; elapsed 58.09s, reported maximum resident set 5,995,024 KiB. The heap setting is not a process-tree RSS limit. No parallel heavy build/test process ran.
- All 42 generated cover derivatives decoded with their expected dimensions and matched the public-asset size inventory. Sample served covers returned `public, max-age=31536000, immutable`.
- Browser: live desktop Forza material and lighting changes worked; the local Projects transition revealed its gallery, followed a project link and opened/advanced/closed the lightbox with scroll restored. Local mobile V1 presented the requested 13.0000s pose with ten cached frames, returned Home and reloaded at offset zero with intro playback. V2 selected the mobile bundle and advanced without a film failure. The compiled Kray configurator loaded at 320 × 568, displayed its controls without horizontal overflow and had no console warnings/errors.
- Short local stability sample: 60 requests across six routes over about 30 seconds, all HTTP 200, maximum 0.023s per request, zero service restarts. Cgroup usage was 460.1 → 469.9 MiB (includes charged cache); this short sample neither proves nor disproves a multi-day leak.
- Authenticated local content read remained revision **38**, with zero draft fields/collections. No content was saved, uploaded or published during the audit.

Evidence (HTTP JSON, browser measurements/screenshots, tests/build logs and the short stability sample) is retained in the external `reliability-review-2026-10-18` review directory, outside the canonical release source.

## Remaining limits and release status

The production owner-key content read still returns **503**, explicitly reporting that the existing Blob store is unavailable. Public publication fallback still responds successfully. Billing/storage recovery requires the owner; no replacement store, quota bypass or plan change was attempted. Enquiry delivery remains the owner's previously deferred integration; switching/validating its form is not proof of message delivery.

No three-day soak, physical phone, Safari, measured Lighthouse/Web Vitals or every possible admin/media/content combination is claimed. The deterministic stalled/corrupt request tests validate recovery logic; they are separate from live network measurements.

The owner approved publication of these tested fixes during this review. Deployment and final live acceptance are in progress; the previous READY deployment above remains the verified production baseline until the new release is confirmed.
