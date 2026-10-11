# Deployment and operation

## Verified target

- Private repository: `CodeAcc2007-dev/okno-homes-deployment`
- Vercel account: `codeacc2007-8289`
- Team: `codeacc2007-8289s-projects` (`team_WYCx00nKZCK9KiAyuA2gKpWK`)
- Project: `okno-homes-deployment` (`prj_IerXwGshmSnvYnuvQmXuJY5tEb8j`)
- Private production Blob: `okno-content-production` (`store_1AQc4Grm9lELxTSB`), Mumbai (`bom1`)
- Runtime: Node.js 22, Next.js 16.4.0, Fluid Compute, 300-second upload-preparation handler ceiling.

`krnlv3` remains a separate project and must not have its repository link, settings, secrets, domains or storage changed as part of OKNO work. On 11 October the user explicitly authorized permanent deletion of the unused `okno-homes-demo` cloud project and its six deployments. Deletion is verified; historical local source and GitHub remain preserved. See [the storage review](../header-storage-review-2026-10-11.md) for backups, shared-team quota implications and exact-counter limitations.

## Live release

Website: https://okno-homes-deployment.vercel.app; editor: https://okno-homes-deployment.vercel.app/admin. Current verified runtime source is `b64ad37a2f2b44e2e029b2b3469a88b4c1b2722a`, deployment `dpl_FJNdVEP8ALYoZvbhNtr6zQcraVkb`, READY. The owner-selected shared key is configured for Production and the fixed local editor, with no expiry or generation/renewal step. [Staff sign-in](../admin/testing-key-quickstart.md) and [acceptance](../admin/fixed-key-acceptance.json) record successful authentication; the existing Blob 503 remains separate. The [admin audit](../admin-audit-2026-10-11.md) records field coverage and the Process footer correction. The [accepted Hero V1 window finish](../hero-v1-window-finish-2026-10-11.md) records the single merged scroll film and actual final still, live endpoint/reverse verification, and continued fixed-key acceptance. Documentation commits can follow without replacing this runtime.

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
