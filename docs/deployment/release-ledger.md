# Release decision and evidence ledger

## Latest Process fast-scroll correction — 11 October 2026

| Decision / check | Evidence | Outcome |
| --- | --- | --- |
| Accepted smooth film | Continuous eased playhead and exact original masters retained | Oversized forward/reverse gestures bounded to presented frames; no chapter waits/buttons |
| Timeline UI | Complete phase settling, day/title/copy alignment, tighter introduction and readable mobile rail | 1280×720 and 390×844 live checks; zero horizontal overflow |
| Boundary regressions | 60-second simulated reading pauses and exact observed fractional coordinates | Idle is distinguished from stalled decoding; 1px comparison tolerance prevents inverse entry traps |
| Source gates | 32 targeted tests, lint, TypeScript, final local/cloud builds, 30 function traces | Passed; local largest 179.7 MiB, cloud 177.4 MiB |
| Final runtime | `54e2d0b151b1b42ebabb304b7889188d83a522ba`; READY `dpl_A9sH5P44XkMJAG1DE9RR5mF7EFBY`; canonical alias attached | Same private repo/project; original video hashes unchanged |
| Live inverse | 30-second final-phase pause, inward progression from rounded boundary, all detail phases and full film reverse to time/scroll 0 | Passed; [detailed acceptance and failure provenance](../process-scroll-boundaries-2026-10-11.md) |
| Services / scope | Single 3134 accepted build, reused 3140 gateway; no cloud content/key/store/billing writes | Gateway health verified; no production CMS publication claim |

11 October 2026. Entries distinguish verified facts, planned work and unresolved gates.

## Current Models header and quota correction

See [the header/storage review](../header-storage-review-2026-10-11.md) for the implementation plan, October 7 capsule provenance, three local visual iterations, 13 passing focused tests, lint, production build and trace acceptance. The Models-only nav backdrop is removed; shared geometry and rolling interactions are retained with foreground contrast over the split background. Runtime `0b0cdc636f64c221762437cf496973e682a248e4`, READY deployment `dpl_8PFTmtV1QxmW13GjWi9ftrFwvuLQ`, exact canonical alias/source verified. Live header appearance and About/Models navigation passed; public/admin shell HEADs 200, unauthenticated admin API 401. See the [production evidence](../header-storage-evidence/production-verification.json). No media quality change or CMS write is included.

The unused `okno-homes-demo` cloud project and its six deployments were permanently deleted after explicit user confirmation, preserving local/GitHub source and private metadata backups. Post-delete listing retains only current OKNO and KRNLv3; both canonical sites return 200. KRNL settings and deployments are untouched. The confirmed Blob-only block remains; exact Blob counter and Deployment Storage total still await dashboard 2FA. Team Deployment Storage is shared, so project separation alone does not guarantee quota isolation.

| Step | Decision / evidence | Result |
| --- | --- | --- |
| Source audit | Read WORKING-VERSION.md, docs/README.md, docs/admin-system.md and checkout AGENTS.md | Final Showcase confirmed |
| Platform inventory | Vercel connector lists ten unrelated projects and no OKNO project | No existing project mutated |
| GitHub credential | Preserved PAT checked against `/user`, returned 401 | Browser login being checked |
| Storage audit | `.okno-content/content.json`, filesystem uploads and in-memory FFmpeg jobs | Cloud adaptation required |
| Route decision | User requires typed `/admin`, no public button/link | Same-domain route retained |
| Key decision | User requests working generation and management options | Generation/rotation documentation and checks pending |

| GitHub recovery | Refreshed PAT verified as CodeAcc2007-dev, repo scope; new repository API confirms private=true | Access restored; no token in tracked files |
| Vercel recovery | CLI 63.1.2 verified as codeacc2007-8289 in codeacc2007-8289s-projects; connector belongs to a different account | Use verified CLI exclusively |
| Existing projects | okno-homes-demo and krnlv3 listed before mutations | Preserve both; create isolated release project |
| Release seed | Current revision 11 / draft revision 54, 23 published fields; current uploaded image copied byte-for-byte to versioned content-media | Local snapshot unchanged; drafts/history excluded |
| Cloud architecture | Private Blob snapshot with ETag conditional writes; authenticated direct uploads to uploads/; validated hashed media; synchronous request-bound video preparation | Implemented, verification pending |
| Dependency audit | Installed Next.js 16.3.1 had runtime advisories; updated to 16.4.0 and sharp 0.35.5 | npm audit fix failed inside npm; targeted verification continues |

| Project isolation | Created prj_IerXwGshmSnvYnuvQmXuJY5tEb8j in verified team; connected only new private GitHub repo | Existing projects unchanged |
| Production storage | Created private store_1AQc4Grm9lELxTSB in bom1, connected Production only, initialized published revision 11 | Durable seed verified; local snapshot preserved |
| Owner key | npm run admin:key; 256-bit randomness, 0600 file, overwrite refusal and distinct rotation checked; fingerprint 89c68ff262bc | Production secret configured, no secret in Git/logs |
| Source checks | 78 Vitest files / 300 tests passed; TypeScript and zero-warning lint passed; production dependency audit reports zero advisories | Production build pending |
| Initial validation correction | Dependency updates overlapped the first suite; re-ran after installation. Isolated output needed writable tsconfig and ESLint ignore | Corrected; full suite clean |
| Git source audit | 1002 staged files, no actual GitHub/admin secrets and no files above GitHub 100 MiB limit | Credentials, caches and local runtime data excluded |

| Live Blob atomicity | Created a QA-only private object, wrote using its current ETag, then retried the stale ETag | Current write persisted; stale write rejected by BlobPreconditionFailedError |
| Build packaging | Linux media binaries and customer model assets explicitly traced; local content, secrets, env, logs and Git excluded from function tracing | Deployment credential isolation documented |

| Function packaging finding | First trace pulled the entire public media tree into CMS functions (about 1.3 GiB). Added route-specific public-tree exclusions while retaining customer-model assets | Rebuilding to verify functions below Vercel's bundle ceiling |

| Trace matching correction | Next uses contains=true for route patterns, so a bare root slash excluded customer-model assets too. Replaced with a negated customer-model route selector and verified pattern semantics | Final trace validation pending; approved GLB endpoint retained |

| Final production source build | Webpack build passed; 30 final function traces passed, largest 179.7 MiB; no local CMS, secrets or env files; Linux binaries and all four approved GLB variants retained | Source ready to publish; cloud live checks pending |
| Trace regression gate | Added release:check-bundles to Vercel build command | Future application builds fail on private-data inclusion, oversized functions or missing required binaries/models |
| Preserved archive whitespace | Initial git diff check reports incumbent whitespace in retrieved provenance and preserved source | No unrelated whitespace rewrite; scoped lint passes |

| First Git deployment | GitHub main 49cc56a2aab8f6fe61ceff0695134e77867f7f53 pushed; production deployment dpl_Gv6a1LLPrTaUjX6UZzSwNFEknoz3 started from matching SHA | Cloud build in progress |
| Git build-context correction | Vercel applies .vercelignore before the ignored-build command. Excluding .git made the docs-only comparison unavailable. Retain Git build metadata while excluding it from every runtime trace | Configuration follow-up build required; no application/media change |

| Live draft finding | Production GET authentication passed, but draft PATCH returned 409. Blob JSON GET used a compressed weak ETag while head returned its strong validator | No draft/public content changed; request identity encoding and refuse any weak validator before CAS |

| Public cloud smoke | Sixteen main page/API HEADs returned 200; owner key absent from HTML; home has no admin anchor; admin is noindex; public content excludes draft/history data | Passed; live-public-verification.json |
| Approved model recovery | Tengo and Kray negotiated variants returned 200; streamed full model bodies match source byte lengths and SHA-256 hashes | Approved geometry retained; Vercel may negotiate gzip internally and strip HEAD content-length |
| Live media preparation | Scoped owner-authorized private client upload, three prepared outputs, range 206, poster 200 and original byte hash checked | Passed; QA film never staged/published; live-media-verification.json |
| Browser access | Live home visually loaded; /admin Connect accepted the generated owner key; Disconnect cleared it and disabled editing; no error console entries on these two routes | Save/publish live check awaits ETag fix deployment |
| ETag correction validation | Private QA object read with identity encoding yielded a strong validator; current conditional write passed and stale retry failed | New weak-validator regression test added; final source checks running |

| Corrected source checks | 78 files / 301 tests passed after the ETag correction; scoped lint and TypeScript passed | Cloud read now requests identity encoding and rejects weak validators; incidental cloud connection copy corrected |

| Final runtime | dpl_FEwsSa5fnzqPhBtKYMUDC5B1JoDq READY; source e8347acd4c8675d29c95caf4a1d6140a88ae4087; production alias https://okno-homes-deployment.vercel.app | Exact source and bom1 functions verified; cloud build 3m 2s plus 30s post-build |
| Final cloud build | Next compile and TypeScript passed; all 30 trace gates passed, largest 177.4 MiB | No local secrets/state/Git in runtime bundles; required binaries/models retained |
| CMS round trip | All 17 live API checks passed: unauthorized/wrong key, owner access, save, draft isolation, stale 409, publish, public propagation, exact restoration and media workflow | live-api-verification.json; original published fields/collections restored, no drafts |
| Final state | Cloud published revision 13 / draft revision 58, 23 published fields; local remains revision 11 / draft revision 54 | Verification advances cloud revisions/history for audit; no verification text remains published |
| Final public routes | Sixteen page/API HEADs all 200; production site-status remains 2026-10-05; zero drafts | live-final-smoke.json; accepted working version preserved |
| Final browser | Fresh /admin build displayed Editor connected. with owner key; Disconnect cleared access; home and admin browser smokes passed | No exhaustive control/device or large-film acceptance inferred |
| Evidence follow-up | Documentation-only commit records verification; ignored-build command must exit 0 and leave the tested runtime alias in place | Will verify Git integration after push before handoff |

| Ignored-build verification | Documentation source 123886bd7ac32f459d6149c62d30a069a026c018, deployment dpl_3NJ7Pfvi88vZ4a9JiFMgwzJRQTuk, was intentionally canceled after the ignored-build command exited 0 | Live Vercel logs confirm docs-only comparison works; production alias still resolves to READY dpl_FEwsSa5fnzqPhBtKYMUDC5B1JoDq |
| Handoff | Runtime stays at tested application source e8347acd4c8675d29c95caf4a1d6140a88ae4087; later commits contain documentation only | All deployment-plan subtasks complete; key remains in owner-only ignored local file and sensitive Production env |

## First optimization release — 11 October 2026

| Decision / check | Evidence | Outcome |
| --- | --- | --- |
| Scope | About, Journal, Hospitality performance and Enquiry padding first; Projects/Hero V1 excluded, Home/Process intensive videos and Sustainability fades later | Accepted visual identity retained; excluded page implementations untouched |
| Image/render work | 196 prepared WebPs from 36 photos; responsive loader on priority pages; seven Hospitality stage photos lazy; Journal shader bounded to about 520k pixels / 24 fps | Production URLs, immutable headers, lazy loading and shader backing dimensions verified |
| Public control defect | Configurator Back to model carried parameters ignored by Signature | Query-aware static-shell client wrapper and stable variant return links added; live Kray 1 BHK and Tengo 3 BHK regressions pass |
| Source checks | Full 78-file / 301-test suite passed before return fix; focused 15 Signature + 3 customer-copy tests passed after; whole-repository lint and final isolated build/TypeScript pass | 30 local function trace guards pass, largest 179.7 MiB |
| Final runtime | Source `3fa5be36fd38315934381c30e67fba4790e7aade`; `dpl_BzKXYyMjC94pQC3TtcmZd2ao9GwP`, READY; production alias attached, bom1 functions | Cloud compile/TypeScript and all 30 trace guards pass (largest 177.4 MiB) |
| Live admin | Browser image upload, text/image Save draft, draft isolation, Publish, public rendering, existing-tab polling and guarded exact restoration | Original published fields/collections restored; revision 17 / draft 65, zero drafts; Disconnect clears owner key; unauthorized access 401 |
| Public acceptance | Primary navigation, footer routes, all six article/contents/related links, galleries, model/plan/view controls, supported 3D configurators, Bespoke stages and Enquiry tabs/fields/actions | Detailed current records in [optimization ledger](../optimization-2026-10-11.md); mobile/physical-device acceptance unconfirmed |
| Enquiry decision | User explicitly chose to defer delivery during this pass | UI and 10px action clearance checked; no message-delivery claim |
| Evidence follow-up | Documentation-only changes record runtime and coverage | Keep this tested runtime when pushing evidence; verify ignored-build result before final handoff |
| Optimization evidence guard | Documentation commit `f6728b6` produced deployment `okno-homes-deployment-6mxbqvvmg`; live logs confirm the ignored-build command returned 0 and intentionally canceled it | Production alias still resolves to READY `dpl_BzKXYyMjC94pQC3TtcmZd2ao9GwP`; evidence updates preserve tested application source |

## Hero V1 and storage recovery — 11 October 2026

| Decision / check | Evidence | Outcome |
| --- | --- | --- |
| Hero V1 iterations | Six implementation/browser passes; original 1920×1080/24 fps source retained byte-for-byte | Original AVC frame decoding, bounded cache, directional prebuffering and gentler scroll easing; native fallback retained |
| Held opening | Original intro endpoint, actual OKNO Modhomes logo, editable V1-only tagline/still | Intermediate ambient film, fog and fireflies removed; V2/Process unchanged |
| Other scoped fixes | About paper rendering, Bespoke heading, Hospitality stage copy and project-index responsive previews | Existing identity/copy retained; nested editorial scrollers removed and all seven improved previews loaded |
| Local V1 admin | Two draft-isolated browser publish cycles: still/tagline, then V1 duplicate + homepage selector | Already-open public pages updated without reload; original content restored exactly at local revision 15, zero drafts; editor disconnected |
| Production storage incident | Existing store `limits-exceeded-suspended`; account block until 10 November 2026 02:47 UTC | No production V1 QA writes, new store or billing change; user account action required before two production V1 cycles |
| Public content recovery | Published-only 30-minute Data Cache, Publish/reconnect invalidation, verified revision-17 seed fallback; admin fresh reads/CAS unchanged | Public routes remain available during suspension; owner API explicitly returns 503 instead of pretending to save |
| Source gates | 81 files / 314 tests, lint, isolated production build/type checking, 30 traces largest 179.7 MiB | Passed; cloud traces largest 177.4 MiB |
| Runtime | `003ee99ff7fe3a07d522f3eda5295a2fee7f5970`, READY `dpl_3vcbYX4PkNBjoKUvtHuYf4XcFHYD`; canonical alias verified | Same private repository and existing project; other projects untouched |
| Production acceptance | 13 page/API HEADs 200; revision-17 public content exact/private drafts absent; since poll 204, invalid key 401, owner storage 503; five V1 scroll cases | Detailed [V1 ledger](../hero-v1-optimization-2026-10-11.md); production publishing remains explicitly blocked |

## Process chapter playback — 11 October 2026

| Decision / check | Evidence | Outcome |
| --- | --- | --- |
| Motion and quality | Native 1× chapter playback replaces per-scroll seeks; original HQ/mobile SHA-256 unchanged | Six separate holds, including Architecture and Design lock at Days 11–25; fresh gesture resumes |
| Layout and cover | Separate CMS cover, expanding transition, stronger phase/day hierarchy, full-width detail timeline, bounded/paused Silk | Desktop and 390px local/live checks; zero horizontal overflow; other route implementations preserved |
| Source gates | Final build, TypeScript, lint, 46 targeted tests; 30 local traces largest 179.7 MiB | Earlier obsolete CMS field-count failure corrected and relevant 34 tests rerun; see detailed ledger |
| Runtime | `9301ee7dbe553e21ca89c6434218ce170d48161a`; READY `dpl_5RcH7jvcCXVAHMd5hWLSsuf7fgR5`; canonical alias attached | Cloud compile/TypeScript and 30 trace guards passed, largest 177.4 MiB |
| Live playback | Six captured native held frames at 1080p/1×; final release, Continue, narrow initial 720p source and skip/Home verified | [Process evidence and limits](../process-optimization-2026-10-11.md); no physical-device zero-dropped-frame claim |
| CMS / account | Local cover draft privacy/publish/public-update/restoration passed; live public revision 17, owner storage 503 | Blob block remains until 10 November 02:47 UTC; exact usage still awaits browser 2FA; KRNL untouched |

## Process continuous-scroll revision — later 11 October 2026

| Decision / check | Evidence | Outcome |
| --- | --- | --- |
| Latest user direction | Smooth continuous forward/reverse scroll; faster traversal; remove chapter locks and Previous/Continue/View timeline buttons | Replaces the same-day native chapter experiment; accepted cover, layout, typography and lower timeline preserved |
| Rendering / quality | Exact original AVC packets; bounded frame cache; critically damped playhead; native fallback for replacement/unsupported films | Original HQ/mobile byte hashes retained; V1 renderer and other page implementations unchanged |
| Source/local gates | 28 targeted tests across packet, pacing, fallback, V1 regression, Process and registry checks; TypeScript, full lint, build, 30 traces largest 179.7 MiB | All passed; native Home/End, desktop/narrow layout and forward/reverse behavior verified |
| Runtime | `317e8b86fbdfe9dc961a49c286005f4a5ed07667`; READY `dpl_HmeqeFUEFdx5WiUEHwKpZRakHizJ`; canonical alias attached | Cloud compile/TypeScript and 30 trace guards passed, largest 177.4 MiB |
| Live acceptance | Original 1080p/720p frame renderers, actual frame/copy alignment, native exit/restoration, no extra controls, zero horizontal overflow | [Detailed revision and proof](../process-scroll-revision-2026-10-11.md); physical-device/zero-dropped-frame guarantee not asserted |
| Account boundary | Browser still at 2FA; no CMS cloud writes, new store, billing or KRNL changes | Prior exact-usage and Blob-publication blockers remain |
