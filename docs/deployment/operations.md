# Deployment and operation

## Experience loading presentation — 31 October 2026

At the owner's request, shared film loaders on Home V1, Home V2 and Process now say “Loading experience”. The homepage tagline and loading bar remain hidden and inert throughout the autoplay intro, then fade in over 750 ms when it finishes (or its media error recovery completes). Scrolling waits for both the intro completion and the fully downloaded, decoded journey. Reduced-motion presentation remains immediate.

The existing native progress UI now advances with alternating quick/slow easing, bounded by real received progress; numeric percentages are omitted. It never reaches full completion before decoded readiness, never adds an artificial wait after readiness, resets on retry, and preserves indeterminate downloads. The existing component styling and typography remain unchanged. Verification: 19 focused tests across the two heroes, Process, loading feedback and scroll locks pass; scoped ESLint and TypeScript pass.


## Password-free admin release — 31 October 2026

Live verification: production `dpl_5oyupnkoUQnme5kkT4SmakLRHvQu` is READY at source `f62d84f7c1d5e6a634b26a8b8af6835a9f9a36e4`, with the canonical alias `https://okno-homes-aryan.vercel.app`. The browser opens `/admin` automatically and shows “Editor connected.” with zero password inputs. A password-free same-origin PATCH saved the existing tagline without changing its text; PUT published revision 1, and separate admin/public GETs read revision 1 back with no remaining drafts. Homepage and admin return 200. The production build passed all 30 function traces (largest 177.3 MiB); no error/fatal runtime logs appeared in the post-deploy scan. This verifies content saving/publication; it does not claim a new end-to-end media-upload test.

Private content store: `okno-homes-aryan-content` (`store_2g911aii1mGNP6bz`), connected to Production only. `OKNO_ADMIN_PASSWORDLESS=true` is an explicit owner-requested public-editing exception for this project. Anyone with the admin URL can edit and publish.

## New account deployment — 31 October 2026

Scroll-film reliability correction: the homepage, alternate hero and Process now download the complete compressed media before unlocking document scroll, and only unlock after the first frame is rendered. The shared native progress bar reports actual bytes received, validates EOF and expected asset size, and offers retry on failure. Wheel, touch, keyboard and restored scroll cannot advance during loading. The previous six-pose/two-second readiness shortcut and timed hero-ending skip are removed. Native MP4 fallback uses a fully downloaded Blob URL; a missed native seek notification has a recovery timer. Process cached frames can paint during background decoding, and a stalled hardware decoder falls back to the already-downloaded native video. Memory for decoded frames remains bounded; full compressed bytes are retained only for the mounted sequence.

Process uses its existing responsive pinned scroll sequence on phones as well as desktop, replacing the previous mobile autoplay player. Both hero variants retain reduced-motion stills; connection save-data no longer silently removes the explicitly requested films. Alternate desktop hero delivery preserves all 791 poses at 1280x720 in a quality-84 WebP pack: 41,705,164 bytes versus the archived 384,273,474-byte lossless pack (89.1% smaller). The original archival bytes remain untouched. Mobile uses the existing 13.9 MB pack. The homepage Forza film continues autoplaying once when visible, without controls or looping.

The loader is extracted from the existing 21st-derived hero structure and reused with native progress/button elements; no new visual component or typography is introduced. Verification covers incomplete downloads, byte counts, loading input locks, retry, decoder fallback, missed seek notifications, and forward/reverse rendering without additional network requests. The full suite passed 474 tests across 119 files; an additional decoder-stall regression test also passes; the focused playback suite passes 54 cases. Source lint and TypeScript pass. Local browser checks confirm forward and reverse frame movement on the homepage and alternate hero, plus the Process renderer at desktop and 390px phone width.

The user explicitly requested a new deployment in their connected account. The active target for this release is `okno-homes-aryan` (`prj_C6QGXCbhIGWw7P5NQadSz7eAAm1k`) in `aryanchandwani-gmailcoms-projects` (`team_hk3H7bGO5KFS2WnCV30fHHJj`), from `cyberpaapi/okno-homes-deployment`. The historical project below is not being changed. Node.js remains 22.x. This release uses the source defaults reviewed locally; its published fallback contains no legacy CMS overrides. The owner subsequently requested password-free admin access. A dedicated private Blob store is now connected to Production, and `OKNO_ADMIN_PASSWORDLESS=true` enables public editing on this project. No local owner credential is uploaded. See `docs/admin-system.md` for this explicit exception to the historical key requirement.

Live URL: https://okno-homes-aryan.vercel.app. Production deployment `dpl_H2Xg9UH4CzkViCmB5UTJ4VFjxprP` is READY at source `d90b0d7e8731c1c4d7c17045596ba92aef99d965` on `release/aryan-vercel-2026-10-31`. The Linux production build passed all 30 function traces (largest 177.3 MiB). Homepage, alternate hero, Process and the new optimized frame pack return 200. The live homepage blocks an attempted two-page scroll while downloading (scrollY remains 0), unlocks after readiness, and renders requested positions 9.6667 seconds forward and 5.8333 seconds after reversal. The live Process page also holds scroll at 0 during loading, then recovers a stalled hardware decoder to the complete Blob video; its presented frame follows forward input to 1.3333 seconds and reverses to 0. The alternate hero reports actual download progress (33% observed) while scroll remains locked at 0, then unlocks and paints the exact requested 17.4167-second frame after scrolling. No error/fatal runtime logs were returned by the post-deploy scan. Next.js remains 16.4.3. At that earlier scroll-film release, the admin API was unconfigured; the subsequent password-free admin release above connects its own private store.

## Verified target

- Private repository: `CodeAcc2007-dev/okno-homes-deployment`
- Vercel account: `codeacc2007-8289`
- Team: `codeacc2007-8289s-projects` (`team_WYCx00nKZCK9KiAyuA2gKpWK`)
- Project: `okno-homes-deployment` (`prj_IerXwGshmSnvYnuvQmXuJY5tEb8j`)
- Private production Blob: `okno-content-production` (`store_1AQc4Grm9lELxTSB`), Mumbai (`bom1`)
- Runtime: Node.js 22, Next.js 16.4.0, Fluid Compute, 300-second upload-preparation handler ceiling.

`krnlv3` remains a separate project and must not have its repository link, settings, secrets, domains or storage changed as part of OKNO work. On 11 October the user explicitly authorized permanent deletion of the unused `okno-homes-demo` cloud project and its six deployments. Deletion is verified; historical local source and GitHub remain preserved. See [the storage review](../header-storage-review-2026-10-11.md) for backups, shared-team quota implications and exact-counter limitations.

## Live release

Website: https://okno-homes-deployment.vercel.app; editor: https://okno-homes-deployment.vercel.app/admin. Current verified runtime source is `e01c6a5cdd1a62772e830e4b50c650a1b59005f3`, deployment `dpl_9tCdrYWojKfDW9MxYHak4kGAmrNX`, READY (18 October 2026). The current source includes bounded loading recovery, prepared Projects covers, the supplied configurator and mobile corrections; see the release ledger for live checks. The owner-selected shared key is configured for Production and the fixed local editor, with no expiry or generation/renewal step. [Staff sign-in](../admin/testing-key-quickstart.md) and [acceptance](../admin/fixed-key-acceptance.json) record successful authentication; the existing Blob 503 remains separate. The [admin audit](../admin-audit-2026-10-11.md) records field coverage and the Process footer correction. The [accepted Hero V1 window finish](../hero-v1-window-finish-2026-10-11.md) records the single merged scroll film and actual final still, live endpoint/reverse verification, and continued fixed-key acceptance. Documentation commits can follow without replacing this runtime.

The existing private Blob store is suspended for a usage limit until 10 November 2026 02:47 UTC. Public routes now serve a published-only cache or the verified release publication during an outage; admin reads/writes fail closed with a storage-unavailable 503. The user must unblock the store or change their plan in Vercel. No agent-created replacement store or billing change is authorized by this incident. After recovery, reconnect the owner editor to refresh the public cache and complete the two pending production V1 cycles. A future outage fallback can omit CMS edits newer than this release seed; preserve private publication backups when releasing.

## Deployment

1. Read the plan, working version and admin ledger. Verify local Git state and current project with `vercel project inspect --non-interactive` from the repository root.
2. Install from lockfile (`npm ci`). Run tests, lint, typecheck and production build. For an isolated local build use `OKNO_BUILD_DIR=.next-release npm run build`; keep this variable out of Vercel. Run `npm run release:check-bundles -- .next-release` after an isolated build. Production build also checks tracing for bundle size, private data exclusion and required model/media assets.
   When changing priority-page built-in photographs, run `node scripts/prepare-page-images.mjs` and commit the generated responsive images, page-image manifest and public-asset inventory. New CMS uploads use the existing image fallback and do not require this build-time generation step.
3. Ensure the private production Blob store is connected to Production only and `OKNO_CMS_ADMIN_TOKEN` is a sensitive Production secret. Read [key management](admin-keys.md).
4. Initialize a newly created store once using `node scripts/seed-cloud-content.mjs <ignored-production-env-file>`. The seed includes current published content only and never overwrites an existing store. Its migrated uploaded photo is versioned at `public/content-media/`.
5. Push the reviewed commit to `main`. Vercel's Git integration builds application commits; production follows `main`. Documentation-only follow-up commits are ignored by the build so recording release evidence does not replace the tested runtime. Initial commits always build. Use Git deployment for this media-rich source instead of a CLI source upload.
6. Confirm deployment is READY and the reported source SHA matches the pushed commit. Smoke-test public routes, `/admin`, unauthorized APIs, authenticated drafts/publish and range media. Restore any verification-only content through the CMS and record results.

## Storage behavior

- `cms/content.json` is private and holds current drafts, publication state and retained publication history. Reads bypass stale Blob cache. Writes use ETag conditional updates; initial creation refuses overwrite. Cross-instance collisions return 409 and require reload.
- `/api/site-content` returns published fields and collections only. The editor fetches drafts separately with its owner key. Existing public-tab polling reflects published changes.
- Browser uploads go directly to private `uploads/<uuid>.<extension>` using a five-minute scoped upload authorization with 100 MB/type restrictions. This avoids sending large request bodies through Vercel Functions.
- An authenticated JSON finalize request checks the upload, validates image bytes or probes a video, and writes content-addressed media to `media/<sha256>.<extension>`. Video preparation runs inside that request, using bundled Linux FFmpeg/FFprobe and temporary `/tmp` files; originals and completed derivatives are durable.
- `/api/site-media/<hash>` streams the private media as approved public content with immutable cache headers and byte ranges. Original public assets retain their existing URLs and bytes. Publication checks cloud media existence and a versioned public-asset inventory; it does not bundle the entire public tree into the CMS function.
- Cancelling a cloud upload aborts the browser operation and never stages/publishes a replacement. Cloud conversion progress is indeterminate while preparation runs. If the hosting deadline is exceeded, the original remains retained and the editor reports failure. Long/large films require a dedicated durable conversion worker as future work; no unsupported background queue is promised.

## Preview and rollback

Production storage is not connected to Preview. Do not enable preview editing against the Production store. To add editable previews, create a separate private store and separate owner key. Missing storage fails closed in cloud mode.

Rolling back code does not roll back CMS content. Keep a private backup of `cms/content.json` before changing schemas. Publishing retains a bounded content history, while the editor's Restore controls handle supported content. Media is retained; this release has no automatic destructive garbage collection. For incident response, return the production alias to a known good deployment and separately address content/key state. See the key guide for old-deployment revocation.

## Verification boundaries

Code checks and HTTP/browser smokes are recorded separately in the release ledger. They do not claim every admin control, every arbitrary replacement video, physical-device performance or a working enquiry delivery integration. Optimization follows a separate user request.

Platform references: [Blob conditional writes](https://vercel.com/docs/vercel-blob/using-blob-sdk), [client uploads](https://vercel.com/docs/vercel-blob/client-upload), [private storage](https://vercel.com/docs/vercel-blob/private-storage).
