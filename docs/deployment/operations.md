# Deployment and operation

## New account deployment — 31 October 2026

Homepage playback follow-up: the existing hero now includes a native progress element beneath its tagline. It reports actual preparation of six opening poses (or the first two buffered seconds for native-video fallback), then displays “Scroll to explore”; failed media offers “Scroll to continue”. Loading never traps document scrolling, and decoded/byte cache limits remain bounded. The existing 21st-derived hero structure is retained. The homepage Forza film now autoplays when visible on mobile and desktop, pauses offscreen, and holds its final frame without controls, looping or replay on re-entry. Reduced-motion visitors retain the poster. Twenty-one focused playback/preparation tests, scoped lint and TypeScript pass; local browser checks verify the bar and control-free Forza presentation.

The user explicitly requested a new deployment in their connected account. The active target for this release is `okno-homes-aryan` (`prj_C6QGXCbhIGWw7P5NQadSz7eAAm1k`) in `aryanchandwani-gmailcoms-projects` (`team_hk3H7bGO5KFS2WnCV30fHHJj`), from `cyberpaapi/okno-homes-deployment`. The historical project below is not being changed. Node.js remains 22.x. This release uses the source defaults reviewed locally; its published fallback contains no legacy CMS overrides. Cloud editing remains unavailable until a private Blob store and server-only owner credential are configured for this new project. Local credentials are not uploaded.

Live URL: https://okno-homes-aryan.vercel.app. Production deployment `dpl_AvMyqoYzWtKJ9JC3y6Bamj36Myeq` is READY at source `5cce5bce53eaecbf8ec87553cd8a512ef4d9c1e1` on `release/aryan-vercel-2026-10-31`. Next.js and its ESLint configuration are patched to 16.4.3. All 459 tests, source lint and TypeScript passed. The Linux production build passed all 30 function traces (largest 177.3 MiB). Eleven public page routes, the admin shell, published-content API and Manrope asset returned 200; the homepage film returned 206 for a range request. Live HTML confirms Manrope and the updated copy. The unconfigured admin API returns 503, as expected. No error/fatal runtime logs were returned by the post-deploy scan. External monitoring/drains were not configured or audited in this release.

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
