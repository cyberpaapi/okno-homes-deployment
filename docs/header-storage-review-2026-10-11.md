# Models header and Vercel storage review — 11 October 2026

## Plan and boundaries

1. Inspect the Models-only header exception and restore the shared navigation silhouette.
2. Verify the authenticated Vercel team, current OKNO project, historical demo, KRNLv3 and connected storage before any cloud mutation.
3. Back up the historical demo's settings/deployment metadata privately, obtain explicit permanent-deletion approval, delete only that cloud project and verify the remaining sites.
4. Separate Deployment Storage from Blob usage and document the actual cross-project risk.
5. Run focused header checks, lint, production build/trace checks, local visual acceptance and a production release verification.

Process, V2, further hero revisions and other project settings are outside this correction. Historical local OKNO source and its GitHub repository must remain intact. No plan purchase, store replacement or KRNL transfer is included.

## Header decision

The 27 September shared-header specification promised the same geometry across marketing routes. The 7 October interaction audit introduced a Models-only `navBackdrop` for links crossing the selector's dark/paper background; its padding, rounded border, blur and shadow created the reported capsule. Audit row M-01 documents the original reason. The new private repository imported that existing source on 11 October; it did not originate the exception.

Remove the `navBackdrop` prop, attribute and CSS from the shared Header and Models wrapper. Keep the shared logo, desktop placement, rolling labels, active-route logic, enquiry action and compact menu. Models may adjust foreground contrast over its existing split background without drawing a navigation container. No new 21st.dev source or page redesign is involved.

## Cloud verification and deletion

Authenticated CLI scope: `codeacc2007-8289s-projects`, team `team_WYCx00nKZCK9KiAyuA2gKpWK`.

| Resource | Verified state and decision |
| --- | --- |
| Current OKNO | `okno-homes-deployment`, `prj_IerXwGshmSnvYnuvQmXuJY5tEb8j`; preserve project, repository, secrets and aliases |
| KRNLv3 | `krnlv3`, `prj_doWy7N4ZMng8inFfaS0t3cQ5T9nZ`; preserve all settings, environment and deployments |
| Historical demo | `okno-homes-demo`, `prj_gCBOHmBp8YAmwW3Eg9styiIGZtBF`; six READY deployments, no environment variables, no connection to the OKNO Blob store |
| Demo authorization | User explicitly answered **Permanently delete okno-homes-demo** after being told that cloud project/deployment history is unrecoverable and source remains preserved |
| Demo result | Exact project DELETE succeeded; subsequent team project listing contains only current OKNO and KRNLv3. Both canonical sites return HTTP 200 afterward |
| Private backup | Settings and six-deployment metadata saved in ignored `.okno-secrets/`; no credential or private account metadata enters this report |

KRNLv3's public sign-in page rendered before deletion. Its environment-variable names contain the frontend API/Supabase configuration and no Blob token. This verifies frontend availability and store separation, not a logged-in KRNL workflow or its backend.

## Which storage limit matters

**Deployment Storage:** Vercel's Hobby allowance is up to **10 GB**. It retains deployment build outputs/static assets, with a separate Functions Storage metric for function bundles. Usage is measured across the team; separate projects in that team do not give independent quotas. OKNO can therefore consume capacity relevant to future KRNL deployments. Deleting the historical demo removes its retained outputs, but no exact reclaimed byte count or immediate meter change has been verified. GB-month accounting includes the billing period's daily maxima, so deletion is not a promise to erase already recorded usage.

The current local `public/` tree occupies approximately 1.2 GB on disk; generated Next static files are approximately 3.5 MB. This establishes that retained copies of OKNO's media are material to capacity planning, but local disk blocks are not the cloud meter and do not establish cloud deduplication or exact Deployment/Functions Storage charges. No media quality reduction was made for this review.

**Blob:** the team's only store is private `okno-content-production` (`store_1AQc4Grm9lELxTSB`, Mumbai). Its project connection is only current OKNO. CLI reports 13 objects totaling approximately **4.16 MB** and `limits-exceeded-suspended`, with billing state `suspended`. The team's feature block is `blob`, from 11 October 02:47 UTC until **10 November 2026 02:47 UTC / 08:17 IST**. The inspected account has no account-wide, deployment or soft block. Blob has separate Hobby allowances for stored bytes, read/write operations and transfer. Object bytes alone do not identify which allowance was exhausted.

Deleting the old demo does **not** reset this Blob block. Public OKNO routes retain their verified published-content fallback. Live admin reads/writes fail closed with 503 while the store is suspended; the owner key cannot bypass a storage quota. The two production V1 admin publication cycles remain pending. No replacement store was created to evade a team limit.

**Exact usage boundary:** the Hobby team's CLI billing-cost endpoint cannot return usage data without an active subscription. Dashboard access is still at the user's two-factor verification step. Consequently the exact exhausted Blob counter, current Deployment Storage total and per-project contribution remain unverified; none should be reported as zero or guessed. The existing observed Blob feature block is confirmed separately from the user's 10 GB Deployment Storage warning.

## Keeping other projects protected

- Retain only useful OKNO deployments; the unused historical cloud demo is now removed. Keep the current production and rollback evidence until a deliberate retention decision.
- Existing public-content caching reduces repeated Blob operations; successful Publish/reconnect invalidates the cache. Continue checking the team Usage page with the Projects breakdown after sign-in.
- Separate project names isolate configuration, not team usage. If strict quota isolation is required, move OKNO to an independently metered team/account or another hosting/storage arrangement after agreeing ownership and cost. Do not move KRNL or purchase a plan as a side effect of this review.

## Verification ledger

- Existing focused Header/Models tests: 13 tests in 2 files passed. Whole-project lint passed.
- Initial production build and all 30 function traces passed; largest trace 179.7 MiB, private files excluded.
- Three local production visual passes: clipped-gradient text and nav-child-only blending both left Journal/About unreadable and were rejected before publication. Blending the header's foreground at its stacking context passed over the existing dark/paper split. This changes contrast only and draws no nav container. The compact menu does not receive the desktop blend rule.
- Final production build/TypeScript and all 30 function traces passed; largest trace 179.7 MiB. No media or secret inclusion changes.
- Final local screenshot: `header-storage-evidence/models-local-after.png`; all seven desktop destinations readable. DOM confirms nav padding `0px`, radius `0px`, background `none`, correct seven routes and Models active state. Keyboard Journal-to-About focus, rolled focused About label, About click, return-to-Models click and Enquire click passed on fixed port 3134. Existing test coverage checks the compact menu; this pass does not claim physical mobile/Safari acceptance.
- Production runtime `0b0cdc636f64c221762437cf496973e682a248e4`, READY deployment `dpl_8PFTmtV1QxmW13GjWi9ftrFwvuLQ`. The canonical `okno-homes-deployment.vercel.app` alias resolves to that exact source/project. Build completed in 2m 47s. Live Models screenshot: `header-storage-evidence/models-production-after.png`; nav background `none`, radius/padding `0px`, seven destinations, foreground contrast active. Live About click and return-to-Models click passed. A settled screenshot clears the existing cursor hover lens before capture.
- Post-release HEAD checks: KRNLv3, OKNO home, Models and `/admin` return 200; unauthenticated `/api/admin/content` returns 401. This successful OKNO deployment demonstrates no deployment-wide block for this release; it does not establish the exact shared meter or future capacity.

## Platform references

- [Deployment Storage definitions, GB-month accounting and project breakdown](https://vercel.com/docs/deployment-storage).
- [Hobby Deployment Storage includes up to 10 GB](https://vercel.com/changelog/deployment-storage-keeps-your-deployments-rollback-ready).
- [Blob allowances, operations and Hobby suspension](https://vercel.com/docs/vercel-blob/usage-and-pricing).
- [Hobby deployment retention](https://vercel.com/changelog/hobby-projects-now-retain-fewer-deployments-to-free-up-storage).
- [Team usage and project filtering](https://vercel.com/docs/pricing/manage-and-optimize-usage).
